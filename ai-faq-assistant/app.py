"""HR Assistant — RAG retrieval + answer generation.

Loads the Chroma store built by ingest.py and exposes `retriever`,
`generate_answer()`, and `get_citation()`.
"""

import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_anthropic import ChatAnthropic

PERSIST_DIR = "./chroma_db"

# Load API keys from .env.
load_dotenv()

# Bail early with a helpful message if the store hasn't been built yet.
if not Path(PERSIST_DIR).exists():
    sys.exit(f"No vector store at {PERSIST_DIR}. Run `python ingest.py` first.")

# Query-side embeddings: same model as ingest.py (must match exactly or
# similarity search returns garbage), but task_type=RETRIEVAL_QUERY so Gemini
# embeds the incoming question rather than a stored document.
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    task_type="RETRIEVAL_QUERY",
)

# Open the existing persisted Chroma store and make a top-3 retriever.
vectorstore = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# Answer model. Note: claude-sonnet-5 rejects the `temperature` parameter with
# a 400, so it can't be pinned to 0 here; the model is already low-variance and
# the "answer only from context" system rule does the rest.
llm = ChatAnthropic(model="claude-sonnet-5")

# Exact sentence the model must return when the context can't answer the
# question. The API layer compares against this to decide `grounded`.
FALLBACK = "I don't have that information in our HR policies — please contact HR directly."

SYSTEM_INSTRUCTION = (
    "You are the HR Assistant for this company. Follow these rules:\n"
    "- Whenever asked to describe yourself, your role, or how you behave, "
    "identify as this company's HR Assistant, never as a generic AI assistant.\n"
    "- Answer strictly using the context provided below. Never use outside "
    "knowledge or make assumptions beyond what is in the context.\n"
    "- If the provided context does not contain enough information to answer "
    "the question, respond with exactly this sentence and nothing else: "
    f'"{FALLBACK}" Do not attempt to answer using outside knowledge in that '
    "case, and do not partially answer using unrelated context."
)


def get_citation(retrieved_docs):
    """Build a short 'Leave Policy, Payments' citation line from chunk metadata:
    section name if present, else 'Page X', de-duplicated in first-seen order."""
    labels = []
    for doc in retrieved_docs:
        meta = doc.metadata
        if meta.get("section"):
            label = meta["section"]
        elif meta.get("page") is not None:
            label = f"Page {meta['page']}"
        else:
            continue
        if label not in labels:
            labels.append(label)
    return ", ".join(labels)


def generate_answer(question, retrieved_docs, chat_history):
    """Build one prompt (system rules, context, history, question) and return
    only the text of Claude's reply."""
    context = "\n\n".join(doc.page_content for doc in retrieved_docs)

    # chat_history: list of {"role": "user"|"assistant", "content": str}
    role_label = {"user": "Human", "assistant": "Assistant"}
    history = "\n".join(
        f"{role_label.get(m['role'], m['role'])}: {m['content']}"
        for m in chat_history
    )

    prompt = (
        f"{SYSTEM_INSTRUCTION}\n\n"
        f"Context:\n{context}\n\n"
        f"Conversation so far:\n{history}\n\n"
        f"Current question: {question}"
    )
    # `.text` (not `.content`) always returns a plain string — `.content` can be
    # a list of content blocks when the model emits more than one text block.
    return llm.invoke(prompt).text
