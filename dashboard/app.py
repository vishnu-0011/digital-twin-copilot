"""
Streamlit Dashboard
=====================
A visual front-end for the digital twin copilot. Talks to the FastAPI
backend (api/main.py) over HTTP — run that first, then run this.

Run:
    uvicorn api.main:app --reload --port 8000     # terminal 1
    streamlit run dashboard/app.py                 # terminal 2

Then open the URL Streamlit prints (usually http://localhost:8501).
"""
from __future__ import annotations

import os
import pandas as pd
import requests
import streamlit as st

API_BASE = os.environ.get("API_BASE_URL", "http://localhost:8000")

STATUS_COLORS = {
    "healthy": "🟢",
    "degrading": "🟡",
    "warning": "🟠",
    "critical": "🔴",
    "failed": "⚫",
    "in_maintenance": "🔧",
}

URGENCY_COLORS = {"high": "🔴", "medium": "🟠", "low": "🟢"}

st.set_page_config(page_title="Digital Twin Copilot", page_icon="🏭", layout="wide")


def api_get(path: str, timeout: int = 30):
    try:
        r = requests.get(f"{API_BASE}{path}", timeout=timeout)
        r.raise_for_status()
        return r.json(), None
    except Exception as e:
        return None, str(e)


def api_post(path: str, json_body: dict = None, timeout: int = 60):
    try:
        r = requests.post(f"{API_BASE}{path}", json=json_body or {}, timeout=timeout)
        r.raise_for_status()
        return r.json(), None
    except Exception as e:
        return None, str(e)


# -- Sidebar: connection + controls -----------------------------------------
st.sidebar.title("🏭 Digital Twin Copilot")
st.sidebar.caption(f"Backend: {API_BASE}")

health, health_err = api_get("/health")
if health_err:
    st.sidebar.error(f"Backend unreachable: {health_err}")
    st.error(
        "Can't reach the API. Make sure it's running:\n\n"
        "```\nuvicorn api.main:app --reload --port 8000\n```"
    )
    st.stop()
else:
    st.sidebar.success("Backend connected ✅")
    sources = health.get("data_sources") or {}
    if sources:
        st.sidebar.caption(
            f"Anomaly model: **{sources.get('anomaly', '?')}**  \n"
            f"RUL model: **{sources.get('rul', '?')}**"
        )

st.sidebar.divider()
st.sidebar.subheader("Advance simulation")
duration = st.sidebar.slider("Seconds to simulate", 300, 10000, 1800, step=300)
if st.sidebar.button("▶️ Advance twin", use_container_width=True):
    with st.spinner(f"Simulating {duration}s..."):
        result, err = api_post("/simulate", {"duration_s": duration})
    if err:
        st.sidebar.error(err)
    else:
        st.sidebar.success("Simulation advanced.")
        st.rerun()

st.sidebar.divider()
run_check = st.sidebar.button("🔍 Run monitor check", type="primary", use_container_width=True)

st.sidebar.divider()
if st.sidebar.button("🔄 Refresh fleet view", use_container_width=True):
    st.rerun()


# -- Main: fleet state --------------------------------------------------------
st.title("Fleet Status")

fleet, fleet_err = api_get("/fleet")
if fleet_err:
    st.error(f"Couldn't load fleet state: {fleet_err}")
    st.stop()

machines = fleet.get("machines", [])
if not machines:
    st.info("No telemetry yet — click **Advance twin** in the sidebar to generate some.")
else:
    df = pd.DataFrame(machines)

    cols = st.columns(len(machines))
    for col, m in zip(cols, machines):
        with col:
            icon = STATUS_COLORS.get(m["status"], "⚪")
            st.metric(
                label=f"{icon} {m['machine_id']}",
                value=f"{m['wear_level']*100:.1f}% worn",
                delta=m["status"].upper(),
                delta_color="off",
            )
            st.caption(
                f"Vibration: {m['vibration_rms']} | Temp: {m['temperature_c']}°C | "
                f"Cycles: {m['cycle_count']}"
            )

    st.divider()
    st.subheader("Wear level by machine")
    chart_df = df.set_index("machine_id")[["wear_level"]]
    st.bar_chart(chart_df, height=250)

    with st.expander("Raw telemetry table"):
        st.dataframe(
            df[["machine_id", "status", "wear_level", "vibration_rms", "temperature_c", "cycle_count"]],
            use_container_width=True,
            hide_index=True,
        )


# -- Monitor check results -----------------------------------------------------
st.divider()
st.title("Agent Monitoring Cycle")

if run_check:
    with st.spinner("Running Monitor → Diagnosis → Scheduler agents..."):
        result, err = api_post("/monitor/check")
    if err:
        st.error(f"Monitor check failed: {err}")
    else:
        st.session_state["last_result"] = result

result = st.session_state.get("last_result")

if not result:
    st.info("Click **Run monitor check** in the sidebar to run the agent pipeline.")
else:
    flagged = result.get("flagged_machine_ids", [])
    if not flagged:
        st.success("✅ No anomalies detected — all machines operating normally.")
    else:
        st.warning(f"⚠️ {len(flagged)} machine(s) flagged")
        decisions_by_machine = {d["machine_id"]: d for d in result.get("maintenance_decisions", [])}

        for diagnosis in result.get("diagnoses", []):
            mid = diagnosis["machine_id"]
            decision = decisions_by_machine.get(mid, {})
            urgency_icon = URGENCY_COLORS.get(diagnosis.get("urgency", ""), "⚪")

            with st.container(border=True):
                header_col, badge_col = st.columns([4, 1])
                with header_col:
                    st.markdown(f"### {urgency_icon} {mid} — {diagnosis['machine_type']}")
                with badge_col:
                    if decision.get("scheduled"):
                        st.markdown("🔧 **Maintenance triggered**")

                st.markdown(f"**Cause:** {diagnosis.get('likely_cause', 'n/a')}")
                st.markdown(f"**Recommended action:** {diagnosis.get('recommended_action', 'n/a')}")

                meta_col1, meta_col2, meta_col3 = st.columns(3)
                meta_col1.caption(f"Urgency: **{diagnosis.get('urgency', 'n/a')}**")
                meta_col2.caption(f"Confidence: **{diagnosis.get('confidence', 'n/a')}**")
                meta_col3.caption(f"Decision: **{decision.get('action', 'n/a')}**")

                sources = diagnosis.get("sop_sources", [])
                if sources:
                    st.caption(f"📄 Grounded in: {', '.join(set(sources))}")