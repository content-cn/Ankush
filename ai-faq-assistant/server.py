"""Flask API for the MERIDIAN SOFTWORKS HR Assistant.

Thin wrapper over the existing RAG pipeline in app.py. One endpoint:
POST /api/chat  ->  { answer, citation, grounded }

Run:  ./venv/bin/python server.py   (listens on http://localhost:5001)
"""

import os

from flask import Flask, jsonify, request

flask_app = Flask(__name__)

# --- Config guard -----------------------------------------------------------
# The RAG module builds the Gemini embeddings client and opens Chroma at import
# time, so a missing key or missing vector store would crash on import. Load it
# behind a check and keep any failure as a readable message for the client.
REQUIRED_KEYS = ("GOOGLE_API_KEY", "ANTHROPIC_API_KEY")


def _load_rag():
    from dotenv import load_dotenv

    load_dotenv()
    missing = [k for k in REQUIRED_KEYS if not os.environ.get(k)]
    if missing:
        return None, (
            f"Configuration error: missing {', '.join(missing)}. "
            "Add the key(s) to your .env file and restart the server."
        )
    try:
        import app as rag
    except SystemExit as exc:  # app.py calls sys.exit() if ./chroma_db is absent
        return None, f"Configuration error: {exc}"
    except Exception as exc:  # noqa: BLE001 - surface anything else cleanly
        return None, f"Configuration error: could not start HR Assistant ({exc})."
    return rag, None


RAG, CONFIG_ERROR = _load_rag()


# --- Chat endpoint ---------------------------------------------------------
# Retrieve top chunks -> generate the answer with history -> decide whether the
# answer is grounded (i.e. not the exact fallback sentence) and attach a source.
@flask_app.route("/api/chat", methods=["POST"])
def chat():
    if CONFIG_ERROR:
        return jsonify({"error": CONFIG_ERROR}), 503

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    history = data.get("history") or []  # [{role: "user"|"assistant", content: str}]
    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    try:
        docs = RAG.retriever.invoke(question)
        answer = RAG.generate_answer(question, docs, history).strip()
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Sorry, something went wrong: {exc}"}), 500

    grounded = answer != RAG.FALLBACK
    citation = RAG.get_citation(docs) if grounded else ""

    return jsonify(
        {
            "answer": answer,
            "citation": citation or None,
            "grounded": bool(grounded and citation),
        }
    )


@flask_app.route("/api/health")
def health():
    return jsonify({"ok": CONFIG_ERROR is None, "error": CONFIG_ERROR})


if __name__ == "__main__":
    # Port 5001, not 5000 — macOS Control Center / AirPlay Receiver squats on
    # :5000 and answers with 403.
    flask_app.run(port=5001, debug=True)
