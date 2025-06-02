# 📘 PDF Chatbot App – Local Setup Guide

This README provides a comprehensive guide to set up and run the **PDF Chatbot Application** locally, covering both backend and frontend parts. It also explains key concepts from the backend code.

---

## 🧱 Project Structure

```
blogcreater/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── ...
├── frontend/
│   ├── src/
\      ├──components
\        ├──ChatBot.jsx
\        ├──Header.jsx
\        ├──InputBox.jsx
│   ├── public/
│   ├── App.jsx
```

---

## ⚙️ Backend Setup

### 1. Create a virtual environment

```bash
cd backend
python -m venv env
source env/bin/activate  # Linux/macOS
# OR
env\Scripts\activate  # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up PostgreSQL

Create a database and update your `.env` or environment variable:

```
DATABASE_URL=postgresql://username:password@localhost/dbname
```
### 4. Run the FastAPI server

```bash
uvicorn main:app --reload
```

> The backend will be live at: `http://127.0.0.1:8000`

---

## 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> The frontend will be live at: `http://localhost:5173` (or similar)

---


This backend enables a chatbot that can answer questions based on uploaded PDF documents. It extracts text, embeds it using MiniLM embeddings, stores/retrieves document chunks with FAISS, and uses T5 or GPT-2 to generate answers.






## 🧪 API Endpoints

### 1. `POST /upload-pdf/`

Upload and process a PDF. Text is extracted, split into chunks, embedded, and stored in a FAISS index.

#### Request (form-data)

* `file`: PDF file to upload

#### Response

```json
{
  "message": "PDF uploaded and processed successfully",
  "doc_id": 1
}
```

### 2. `POST /ask-question/`

Ask a question about an uploaded PDF. Retrieves chunks using FAISS and returns an answer from the LLM.

#### Request (JSON)

```json
{
  "doc_id": 1,
  "question": "What is the main idea?"
}
```

#### Response

```json
{
  "answer": "The main idea is ..."
}
```

## ✅ Features Implemented

* PDF upload and text extraction with PyMuPDF
* Chunking and FAISS index generation
* Embedding via `all-MiniLM-L6-v2`
* Q\&A with T5-small and GPT-2 fallback
* PostgreSQL storage for PDFs and Q\&A
* Stateless API using in-memory FAISS index

## 🔒 Notes

* FAISS is in-memory only per run — persistence is not implemented.
* LLM responses are not streamed — full reply returned.


## 🛠 Dependencies

* **FastAPI** – API framework
* **SQLAlchemy** – ORM
* **FAISS** – Fast similarity search
* **PyMuPDF** – PDF parsing
* **HuggingFace Transformers** – LLM and embeddings
* **LangChain** – Text splitting, prompts

---
# Images Walkthrough

## Image 1
![ss1](https://github.com/user-attachments/assets/0451d778-545f-4202-954e-59a501d23956)

## Image 2
![ss2](https://github.com/user-attachments/assets/e5a8da27-bf2a-4775-b180-46e8c47401b3)

## Image 3
![ss3](https://github.com/user-attachments/assets/f9e8a2d0-acff-4015-ae8b-8d4aad12c86f)


## 🧠 Future Improvements

* Streamlit or React-based frontend integration
* PDF section highlighting
* Improved embedding model
* GPT-based summarization

