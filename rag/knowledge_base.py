"""
RAG Knowledge Base
===================
Ingests maintenance SOPs into ChromaDB and exposes retrieve(). Each SOP
document is tagged with which machine_type it applies to at ingestion time
(via SOP_FILENAME_TO_MACHINE_TYPE below). When retrieve() is called with a
machine_type, it filters to ONLY that machine's SOP chunks before ranking
by similarity — it does not rely on similarity search alone to keep, say,
a conveyor's SOP out of a press's diagnosis.

WHY THIS MATTERS: with a small offline TF-IDF embedding and only a few
short SOP documents, pure similarity ranking can let irrelevant chunks
sneak into the top-k (e.g. conveyor_sop.md showing up for a press query).
Since machine_type is already known at query time, filtering first is a
strictly more correct and free defense — no embedding-model upgrade needed
to fix this specific problem, though swapping in a real semantic embedding
model is still recommended for genuinely fuzzy/free-text queries.

Swap the embedding function for `voyage-3` or `text-embedding-3-large` in
production for better free-text semantic matching; the default TF-IDF
model here keeps the project runnable with zero API keys for local dev.
"""
from __future__ import annotations

import glob
import os
import uuid

import chromadb
from sklearn.feature_extraction.text import TfidfVectorizer

DOCS_DIR = os.path.join(os.path.dirname(__file__), "documents")
DB_DIR = os.path.join(os.path.dirname(__file__), ".chroma")
COLLECTION_NAME = "maintenance_sops"

# Maps each SOP filename to the machine_type it applies to. Extend this
# when you add new SOP documents for new machine types.
SOP_FILENAME_TO_MACHINE_TYPE = {
    "cnc_mill_sop.md": "CNC_MILL",
    "hydraulic_press_sop.md": "HYDRAULIC_PRESS",
    "conveyor_sop.md": "CONVEYOR",
}


class TfidfEmbeddingFunction:
    """Self-contained embedding function — no model download, no API key,
    runs fully offline. SWAP THIS IN PRODUCTION for `voyage-3` or
    `text-embedding-3-large` if you need real semantic (not lexical)
    matching over free-text queries."""

    def __init__(self, corpus: list[str] | None = None, max_features: int = 512):
        self.vectorizer = TfidfVectorizer(max_features=max_features, stop_words="english")
        self._fitted = False
        if corpus:
            self.fit(corpus)

    def fit(self, corpus: list[str]):
        self.vectorizer.fit(corpus)
        self._fitted = True
        return self

    def __call__(self, input: list[str]) -> list[list[float]]:
        if not self._fitted:
            self.vectorizer.fit(input)
            self._fitted = True
        return self.vectorizer.transform(input).toarray().tolist()


def _chunk_markdown(text: str, max_chars: int = 800) -> list[str]:
    sections, current = [], []
    for line in text.splitlines():
        if line.startswith("## ") and current:
            sections.append("\n".join(current))
            current = [line]
        else:
            current.append(line)
    if current:
        sections.append("\n".join(current))

    chunks = []
    for section in sections:
        if len(section) <= max_chars:
            chunks.append(section)
        else:
            for i in range(0, len(section), max_chars):
                chunks.append(section[i:i + max_chars])
    return [c.strip() for c in chunks if c.strip()]


class MaintenanceKnowledgeBase:
    def __init__(self, persist_dir: str = DB_DIR, docs_dir: str = DOCS_DIR):
        md_files = glob.glob(os.path.join(docs_dir, "*.md"))
        corpus = [open(p).read() for p in md_files]
        self.embed_fn = TfidfEmbeddingFunction(corpus=corpus if corpus else ["placeholder"])

        self.client = chromadb.PersistentClient(path=persist_dir)
        try:
            self.client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(COLLECTION_NAME)

    def ingest_directory(self, docs_dir: str = DOCS_DIR):
        """Chunks and upserts every .md file, tagging each chunk with the
        machine_type it applies to (from SOP_FILENAME_TO_MACHINE_TYPE, or
        "GENERAL" if the filename isn't in that map — general chunks are
        still returned as a fallback when no machine-specific match exists)."""
        md_files = glob.glob(os.path.join(docs_dir, "*.md"))
        for path in md_files:
            filename = os.path.basename(path)
            machine_type = SOP_FILENAME_TO_MACHINE_TYPE.get(filename, "GENERAL")

            with open(path, "r") as f:
                text = f.read()
            chunks = _chunk_markdown(text)
            ids = [str(uuid.uuid5(uuid.NAMESPACE_URL, f"{path}-{i}")) for i in range(len(chunks))]
            metadatas = [
                {"source": filename, "chunk_index": i, "machine_type": machine_type}
                for i in range(len(chunks))
            ]
            embeddings = self.embed_fn(chunks)
            self.collection.upsert(documents=chunks, ids=ids, metadatas=metadatas, embeddings=embeddings)
        return len(md_files)

    def retrieve(self, query: str, machine_type: str | None = None, k: int = 3) -> list[dict]:
        """Returns top-k relevant SOP chunks. If machine_type is given,
        filters to that machine's tagged chunks (plus any "GENERAL" chunks)
        BEFORE ranking — this is a hard filter, not a similarity nudge, so
        a press query can never surface a conveyor's SOP text."""
        query_embedding = self.embed_fn([query])

        where_filter = None
        if machine_type:
            where_filter = {"machine_type": {"$in": [machine_type, "GENERAL"]}}

        results = self.collection.query(
            query_embeddings=query_embedding, n_results=k, where=where_filter
        )

        # Fallback: if filtering to this machine_type produced nothing
        # (e.g. no SOP exists yet for this machine type), search unfiltered
        # rather than returning an empty result.
        if machine_type and not results["documents"][0]:
            results = self.collection.query(query_embeddings=query_embedding, n_results=k)

        out = []
        for doc, meta, dist in zip(
            results["documents"][0], results["metadatas"][0], results["distances"][0]
        ):
            out.append({"text": doc, "source": meta["source"], "relevance_distance": dist})
        return out