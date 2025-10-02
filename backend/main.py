# Python imports
# used to handle file paths
import os
# creates the temporary file/folder for storing pdf
import tempfile
# regular expressions used for converting to specific text
import re
# used for code clarity, type hints
from typing import Dict, List, Optional
# for sending emails
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# framework imports
# main app object, used to upload files, accept form data, handles exceptions, db injection sessions aand auth
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
# communicates with frontend and backend
from fastapi.middleware.cors import CORSMiddleware
# sends structure json response to frontend
from fastapi.responses import JSONResponse

# database handles
# sessions helps to connect and talk with postregsql db
from sqlalchemy.orm import Session

# pdf handlers
# this reads and extracts text fom the pdf page by page
import fitz  # PyMuPDF
# used for verctor manipulation
import numpy as np
# high speed similarity search library used for store and search vector embeddings for semantic q and a
import faiss

# LangChain and NLP imports
# used for splitting text to individual charater
from langchain.text_splitter import CharacterTextSplitter
# used for convertings chunks into vector embeddings using pre trained models
from langchain_huggingface import HuggingFaceEmbeddings
# used for huggingface for making model task easy access
from transformers import pipeline

# projec imports
# used for local session creation when we wanted, connect sessions to actual db, class model
from database import SessionLocal, engine, Base
# ORM class that maps pdf table in the db
from models import PDFDocument

# this is SQLAlchemy command to create the tables which are define in the models and make connection to the postgresql
Base.metadata.create_all(bind=engine)

# this function used to make connection to the create db sessions when neede and returns a temorary session and ensures the connection is closed safely without memory leaks
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# the variable for in memory storage with integer key and dictionary as the value containing the chunks,faiss index, embedding, this for avoiding the reprocessing the same pdf again and again
knowledge_bases: Dict[int, Dict] = {}

# creates a object used for defining the routers and working with apis
app = FastAPI()
# used for establishings the connection with frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# created a route which gives a json text on the specified route
@app.get("/")
async def root():
    return {"message": "PDF Chatbot API is running!"}


# ---------------- HELPERS ----------------

def send_session_reminder_email(mentor_email: str, student_email: str, session_time: str):
    """
    Send a Gmail reminder to both mentor and student about the session time.
    """
    sender_email = os.getenv("GMAIL_USER")
    sender_password = os.getenv("GMAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("Gmail credentials not set")
        return

    subject = "Session Reminder"
    body = f"Your session is scheduled at {session_time}."

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = mentor_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, mentor_email, text)
        server.sendmail(sender_email, student_email, text)
        server.quit()
        print("Emails sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")


def pdf_to_text(path: str) -> str:
    """
    Extract all text from the PDF at `path` using PyMuPDF.
    """
    try:
        doc = fitz.open(path)
        all_text: List[str] = []
        for page in doc:
            all_text.append(page.get_text())
        doc.close()
        return "\n".join(all_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting PDF text: {e}")


def parse_sections(raw_text: str) -> Dict[str, str]:
    """
    Scan the raw_text line by line. Every line that ends with ":" (e.g. "Education:")
    is treated as a new section heading. We store section_text until the next heading or EOF.
    Returns a dict mapping lowercase_heading → full_section_text.
    """
    lines = raw_text.splitlines()
    sections: Dict[str, str] = {}
    current_heading: Optional[str] = None
    buffer: List[str] = []

    for line in lines:
        # Detect a heading: any line that ends with ':' but is not just empty
        if re.match(r"^\s*[^:\s].*:\s*$", line):
            # If we were buffering a previous section, save it
            if current_heading:
                sections[current_heading.lower()] = "\n".join(buffer).strip()
                buffer = []

            current_heading = line.strip().rstrip(":")
            continue

        # If we're currently inside a section, accumulate lines
        if current_heading:
            buffer.append(line)

    # Save the last buffered section
    if current_heading and buffer:
        sections[current_heading.lower()] = "\n".join(buffer).strip()

    return sections


def build_faiss_index(text: str) -> Dict:
    """
    1) Split `text` into ~1 000‑character chunks (200‑char overlap).
    2) Embed each chunk with HuggingFaceEmbeddings.
    3) Build and return a FAISS index + chunk list + embeddings object.
    """
    splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = splitter.split_text(text)

    try:
        hf_embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        # embed_documents returns List[List[float]]
        chunk_embeddings = hf_embeddings.embed_documents(chunks)
        embeddings_matrix = np.vstack(
            [np.array(vec, dtype=np.float32) for vec in chunk_embeddings]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error embedding chunks locally: {e}")

    d = embeddings_matrix.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings_matrix)

    return {
        "index": index,
        "chunks": chunks,
        "embeddings": hf_embeddings
    }


def save_faiss_to_disk(doc_id: int, faiss_dict: Dict):
    """
    Persist FAISS index + chunk list to disk under ./faiss_indices/doc_{doc_id}.
    """
    base_folder = f"./faiss_indices/doc_{doc_id}"
    os.makedirs(base_folder, exist_ok=True)

    # 1) Save FAISS index
    faiss_path = os.path.join(base_folder, "index.faiss")
    faiss.write_index(faiss_dict["index"], faiss_path)

    # 2) Save chunks as a .txt (one chunk per block, separated by "<CHUNK_SEP>")
    chunks_path = os.path.join(base_folder, "chunks.txt")
    with open(chunks_path, "w", encoding="utf-8") as f:
        for c in faiss_dict["chunks"]:
            safe_chunk = c.replace("\n", "<NEWLINE>")
            f.write(safe_chunk + "\n<CHUNK_SEP>\n")


def load_faiss_from_disk(doc_id: int) -> Dict:
    """
    Load FAISS index + chunks from disk for given doc_id, and reinstantiate the embeddings model.
    """
    base_folder = f"./faiss_indices/doc_{doc_id}"
    index_path = os.path.join(base_folder, "index.faiss")
    chunks_path = os.path.join(base_folder, "chunks.txt")

    if not os.path.isfile(index_path) or not os.path.isfile(chunks_path):
        raise FileNotFoundError(f"No FAISS index on disk for document {doc_id}")

    index = faiss.read_index(index_path)

    chunks: List[str] = []
    with open(chunks_path, "r", encoding="utf-8") as f:
        raw = f.read().split("\n<CHUNK_SEP>\n")
        for part in raw:
            if part.strip() == "":
                continue
            chunk = part.replace("<NEWLINE>", "\n")
            chunks.append(chunk.rstrip())

    hf_embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return {
        "index": index,
        "chunks": chunks,
        "embeddings": hf_embeddings
    }


def answer_question_faiss(kb: Dict, question: str, top_k: int = 3) -> str:
    """
    Embed `question`, query FAISS, and return the top‑k chunk excerpts
    as a single string. (We will feed this into the LLM below.)
    """
    try:
        q_vec = np.array(
            kb["embeddings"].embed_query(question),
            dtype=np.float32
        ).reshape(1, -1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error embedding question: {e}")

    distances, indices = kb["index"].search(q_vec, top_k)
    idx_list = indices[0].tolist()

    retrieved_texts: List[str] = []
    for idx in idx_list:
        if 0 <= idx < len(kb["chunks"]):
            retrieved_texts.append(kb["chunks"][idx])

    if not retrieved_texts:
        return "No relevant content found in the document."

    return "\n\n".join(retrieved_texts)


def detect_explanation_style(question: str) -> str:
    """
    Detect if the user wants a simplified explanation based on their question.
    """
    question_lower = question.lower()
    simple_patterns = [
        "explain like i'm 5", "eli5", "explain like im 5", 
        "simple explanation", "in simple terms", "simply explain",
        "easy explanation", "basic explanation", "for beginners"
    ]
    
    for pattern in simple_patterns:
        if pattern in question_lower:
            return "simple"
    
    return "normal"


def create_explanation_prompt(context: str, question: str, style: str) -> str:
    """
    Create appropriate prompt based on the explanation style requested.
    """
    if style == "simple":
        return f"""Based on the following context from a document, provide a simple explanation that a 5-year-old could understand. Use simple words, short sentences, and avoid technical jargon.

Context: {context}

Question: {question}

Provide a simple, easy-to-understand explanation:"""
    else:
        return f"""Based on the following context from a document, provide a clear and accurate answer to the question.

Context: {context}

Question: {question}

Answer:"""


# ---------------- PROMPT TEMPLATES ----------------

from langchain.prompts import PromptTemplate

qa_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a helpful assistant. Use the following context from a PDF to answer the question.\n"
        "If the question asks to explain, summarize, or clarify, do so in plain language.\n\n"
        "CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\n"
        "Answer in a concise, accurate way."
    )
)

# Initialize a local LLM using HuggingFace Transformers with correct pipeline
# Using text2text-generation for T5 models OR switching to a causal LM model
try:
    # Option 1: Use T5 with text2text-generation pipeline
    qa_pipeline = pipeline(
        "text2text-generation",
        model="google/flan-t5-small",
        max_new_tokens=200,
        do_sample=True,
        temperature=0.3
    )
    pipeline_type = "text2text"
except Exception as e:
    # Option 2: Fallback to a smaller causal LM if T5 fails
    print(f"T5 model failed, falling back to GPT-2: {e}")
    qa_pipeline = pipeline(
        "text-generation", 
        model="gpt2", 
        max_new_tokens=200,
        do_sample=True,
        temperature=0.3,
        pad_token_id=50256
    )
    pipeline_type = "text-generation"

# ---------------- UPLOAD ENDPOINT ----------------

@app.post("/upload-pdf/")
def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    1. Validate PDF
    2. Save to temp
    3. Extract text
    4. Insert PDFDocument(filename, content=text) into DB → get new_doc.id
    5. Build FAISS index on the text
    6. Parse all section headings into a dict
    7. Save FAISS index & chunks to disk under ./faiss_indices/doc_{id}
    8. Cache in memory
    9. Cleanup temp
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    temp_path = None
    try:
        # Save PDF to a temporary file
        suffix = os.path.splitext(file.filename)[1] or ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content_bytes = file.file.read()
            tmp.write(content_bytes)
            temp_path = tmp.name

        # 1) Extract all text from the PDF
        text = pdf_to_text(temp_path)

        # 2) Save a new PDFDocument record
        new_doc = PDFDocument(filename=file.filename, content=text)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        # 3) Build a FAISS index (with smaller chunks)
        kb = build_faiss_index(text)

        # 4) Parse out all "Section: ..." headings in one pass
        sections = parse_sections(text)

        # 5) Persist FAISS index + chunks to disk
        save_faiss_to_disk(new_doc.id, kb)

        # 6) Cache the KB + sections in memory
        knowledge_bases[new_doc.id] = {
            "index": kb["index"],
            "chunks": kb["chunks"],
            "embeddings": kb["embeddings"],
            "sections": sections
        }

        # 7) Cleanup the temporary file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

        return JSONResponse(
            status_code=200,
            content={
                "message": "PDF uploaded and processed successfully",
                "document_id": new_doc.id
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e}")


# ---------------- ASK‑QUESTION ENDPOINT ----------------

@app.post("/ask-question/")
def ask_question(
    document_id: int = Form(...),
    question: str = Form(...),
    db: Session = Depends(get_db)
):
    doc_record = db.query(PDFDocument).filter(PDFDocument.id == document_id).first()
    if not doc_record:
        raise HTTPException(status_code=404, detail="Document not found")

    raw_text = doc_record.content

    # Load or rebuild knowledge base
    if document_id not in knowledge_bases:
        try:
            faiss_dict = load_faiss_from_disk(document_id)
            sections = parse_sections(raw_text)
            knowledge_bases[document_id] = {
                "index": faiss_dict["index"],
                "chunks": faiss_dict["chunks"],
                "embeddings": faiss_dict["embeddings"],
                "sections": sections
            }
        except FileNotFoundError:
            new_kb = build_faiss_index(raw_text)
            save_faiss_to_disk(document_id, new_kb)
            sections = parse_sections(raw_text)
            knowledge_bases[document_id] = {
                "index": new_kb["index"],
                "chunks": new_kb["chunks"],
                "embeddings": new_kb["embeddings"],
                "sections": sections
            }

    kb_entry = knowledge_bases[document_id]
    sections_map = kb_entry["sections"]
    
    # Check for direct section matches first
    question_lc = question.lower()
    context = None
    for heading_lc, section_text in sections_map.items():
        if heading_lc in question_lc:
            context = section_text
            break

    if context is None:
        # Use FAISS for semantic search
        retrieved_chunks = answer_question_faiss(kb_entry, question, top_k=3)
        context = retrieved_chunks[:1500]  # Limit context length

    # Detect explanation style
    style = detect_explanation_style(question)
    prompt_text = create_explanation_prompt(context, question, style)

    try:
        if pipeline_type == "text2text":
            # For T5 models using text2text-generation
            output = qa_pipeline(prompt_text, max_length=200, do_sample=True, temperature=0.3)[0]['generated_text']
        else:
            # For causal LM models using text-generation
            full_output = qa_pipeline(prompt_text, max_new_tokens=150, do_sample=True, temperature=0.3)[0]['generated_text']
            # Extract only the generated part (remove the prompt)
            output = full_output[len(prompt_text):].strip()
        
        return JSONResponse(status_code=200, content={"answer": output.strip()})
    except Exception as e:
        # Fallback to retrieved chunks if LLM fails
        fallback_answer = f"Based on the document: {retrieved_chunks[:500]}..."
        return JSONResponse(status_code=200, content={"answer": fallback_answer})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)