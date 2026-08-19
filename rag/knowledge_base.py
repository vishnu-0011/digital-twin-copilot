"""
RAG Knowledge Base
===================
Ingests maintenance SOPs / equipment manuals into a local ChromaDB
collection and exposes a simple retrieve() function. This is what grounds
the Diagnosis Agent's explanations in actual procedure text instead of
letting the LLM guess at root causes and recommended actions.

Swap the embedding function for `voyage-3` or `text-embedding-3-large` in
production; the default sentence-transformers model here keeps the project
runnable with zero API keys for local development.
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


class TfidfEmbeddingFunction:
    """Self-contained embedding function — no model download, no API key,
    runs fully offline. Good enough for a small, domain-specific SOP corpus
    like this one.

    SWAP THIS IN PRODUCTION: for a real deployment with a larger, more
    varied document set, replace with Voyage AI's `voyage-3` or OpenAI's
    `text-embedding-3-large` for real semantic (not just lexical) matching.
    This class exists purely so the project runs end-to-end without
    external network calls or API keys during development.
    """

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
            # Bootstrap on first call if not pre-fitted (e.g. at query time
            # before any ingestion happened in this process).
            self.vectorizer.fit(input)
            self._fitted = True
        return self.vectorizer.transform(input).toarray().tolist()

    def name(self) -> str:
        return "tfidf_local"


def _chunk_markdown(text: str, max_chars: int = 800) -> list[str]:
    """Chunks on markdown headings first (keeps SOP sections intact), then
    hard-splits any oversized section. Simple on purpose — swap for a real
    chunker (e.g. the `chunky` toolkit) if documents get more complex."""
    sections = []
    current = []
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
        # Fit the vectorizer's vocabulary on the whole corpus up front, so
        # document embeddings and later query embeddings live in the same
        # vector space. Re-fitting on every process start is intentional —
        # it keeps this class dependency-free (no vocab file to manage).
        md_files = glob.glob(os.path.join(docs_dir, "*.md"))
        corpus = [open(p).read() for p in md_files]
        self.embed_fn = TfidfEmbeddingFunction(corpus=corpus if corpus else ["placeholder"])

        self.client = chromadb.PersistentClient(path=persist_dir)
        # Fresh collection each init since embedding dimensionality can
        # shift if the document corpus changes between runs.
        try:
            self.client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        # NOTE: embeddings are computed explicitly (self.embed_fn(...)) and
        # passed in on add/query below, rather than relying on chromadb's
        # embedding_function auto-dispatch — this keeps us decoupled from
        # whichever EmbeddingFunction interface version chromadb expects.
        self.collection = self.client.get_or_create_collection(COLLECTION_NAME)

    def ingest_directory(self, docs_dir: str = DOCS_DIR):
        """Reads every .md file in docs_dir, chunks it, and upserts into
        the vector store. Idempotent — re-running just re-upserts."""
        md_files = glob.glob(os.path.join(docs_dir, "*.md"))
        for path in md_files:
            with open(path, "r") as f:
                text = f.read()
            chunks = _chunk_markdown(text)
            ids = [str(uuid.uuid5(uuid.NAMESPACE_URL, f"{path}-{i}")) for i in range(len(chunks))]
            metadatas = [{"source": os.path.basename(path), "chunk_index": i} for i in range(len(chunks))]
            embeddings = self.embed_fn(chunks)
            self.collection.upsert(documents=chunks, ids=ids, metadatas=metadatas, embeddings=embeddings)
        return len(md_files)

    def retrieve(self, query: str, machine_type: str | None = None, k: int = 3) -> list[dict]:
        """Returns top-k relevant SOP chunks for a query. Optionally biases
        the query text with machine_type so retrieval favors the right SOP
        document (e.g. don't surface CNC guidance for a press anomaly)."""
        search_query = f"{machine_type + ': ' if machine_type else ''}{query}"
        query_embedding = self.embed_fn([search_query])
        results = self.collection.query(query_embeddings=query_embedding, n_results=k)
        out = []
        for doc, meta, dist in zip(
            results["documents"][0], results["metadatas"][0], results["distances"][0]
        ):
            out.append({"text": doc, "source": meta["source"], "relevance_distance": dist})
        return out


if __name__ == "__main__":
    kb = MaintenanceKnowledgeBase()
    n = kb.ingest_directory()
    print(f"Ingested {n} SOP documents.")

    results = kb.retrieve(
        "vibration and temperature both elevated, wear level 0.9",
        machine_type="HYDRAULIC_PRESS",
    )
    for r in results:
        print(f"\n--- {r['source']} (dist={r['relevance_distance']:.3f}) ---")
        print(r["text"][:200])
