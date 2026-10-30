"""Build the persistent vector knowledge base for the HR assistant.

Run:  python ingest.py
Reads every file in knowledge_base/, chunks it, embeds it with Gemini,
and writes a Chroma store to ./chroma_db.
"""

import re
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.document_loaders import (
    Docx2txtLoader,
    PyPDFLoader,
    TextLoader,
)
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

KNOWLEDGE_BASE = Path("knowledge_base")
PERSIST_DIR = "./chroma_db"

# Map file extension -> the LangChain loader that understands it.
LOADERS = {
    ".pdf": PyPDFLoader,
    ".docx": Docx2txtLoader,
    ".md": TextLoader,
    ".txt": TextLoader,
}


# --- Step 1: load .env and every supported document in knowledge_base/ ---
# Unknown extensions are skipped with a warning instead of crashing the run.
load_dotenv()

source_docs = []  # one entry per source file: (filename, [pages/Documents])
for path in sorted(KNOWLEDGE_BASE.iterdir()):
    if not path.is_file():
        continue
    loader_cls = LOADERS.get(path.suffix.lower())
    if loader_cls is None:
        print(f"WARNING: skipping unsupported file type: {path.name}")
        continue
    pages = loader_cls(str(path)).load()
    for page in pages:
        page.metadata["source"] = path.name
    source_docs.append((path.name, pages))

if not source_docs:
    raise SystemExit(f"No supported documents found in {KNOWLEDGE_BASE}/")


# --- Step 2: hybrid structure-aware split ---
# If the file uses Markdown "##" headers, split on them and keep the section
# name in metadata['section']. Otherwise keep PyPDF's per-page split and its
# page number in metadata['page'].
md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("##", "section")],
    strip_headers=False,
)

structured_chunks = []
for name, pages in source_docs:
    full_text = "\n".join(p.page_content for p in pages)
    has_md_headers = re.search(r"(?m)^##\s", full_text) is not None

    if has_md_headers:
        for chunk in md_splitter.split_text(full_text):
            chunk.metadata["source"] = name
            structured_chunks.append(chunk)
    else:
        # No headers: keep each page as-is. PyPDFLoader already put the page
        # number under metadata['page']; make sure the key exists for others.
        for page in pages:
            page.metadata.setdefault("page", page.metadata.get("page"))
            structured_chunks.append(page)


# --- Step 3: size-bound every chunk, carrying step-2 metadata forward ---
# split_documents() copies each parent chunk's metadata onto its sub-chunks.
char_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
chunks = char_splitter.split_documents(structured_chunks)


# --- Step 4: Gemini embeddings, tuned for indexing document content ---
# task_type=RETRIEVAL_DOCUMENT is Google's setting for text that will be
# searched over (the query side uses RETRIEVAL_QUERY instead).
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    task_type="RETRIEVAL_DOCUMENT",
)


# --- Step 5: persist chunks + embeddings + metadata to Chroma ---
Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=PERSIST_DIR,
)


# --- Summary for a quick sanity check ---
# Show a chunk that actually carries structure metadata (section or page) so
# it's clear which path each split took, not just chunks[0].
with_section = [c for c in chunks if c.metadata.get("section")]
with_page = [c for c in chunks if c.metadata.get("page") is not None]
sample = (with_section or with_page or chunks)[0]

print("\n--- ingest complete ---")
print(f"source documents loaded:  {len(source_docs)}")
print(f"chunks created:           {len(chunks)}")
print(f"chunks with section meta: {len(with_section)}")
print(f"chunks with page meta:    {len(with_page)}")
print(f"example chunk metadata:   {sample.metadata}")
