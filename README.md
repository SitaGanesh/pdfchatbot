# PDF Chatbot Application

## Overview
This is an AI-powered PDF Chatbot application that allows users to upload PDF documents and ask questions about their content. The chatbot uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware answers based on the uploaded documents.

## Features
- **PDF Upload**: Upload PDF files through an intuitive web interface.
- **Intelligent Q&A**: Ask questions in natural language and receive answers extracted from the PDF content.
- **RAG Technology**: Uses FAISS vector search and embeddings for efficient document retrieval.
- **Real-time Chat**: Interactive chat interface for seamless conversation.
- **Persistent Storage**: SQLite database for storing chat history and document metadata.
- **Containerized Deployment**: Fully containerized with Docker for easy deployment and scaling.

## Technologies Used
- **Frontend**: React with Vite for fast development and building.
- **Backend**: FastAPI for high-performance API endpoints.
- **AI/ML**: FAISS for vector similarity search, sentence transformers for embeddings.
- **Database**: SQLite for lightweight, file-based storage.
- **Deployment**: Docker and Docker Compose for containerization.
- **Hosting**: Ready for deployment on cloud platforms like Railway (free tier).

## Project Structure
- `frontend/`: React app source code and Dockerfile for frontend container.
- `backend/`: FastAPI backend source code and Dockerfile for backend container.
- `docker-compose.yml`: Defines multi-container setup for frontend and backend.
- `TODO.md`: Deployment instructions for hosting on Railway (free tier).

## Prerequisites
- Docker and Docker Compose installed
- GitHub account (for deployment)
- Railway account (optional, for free hosting)

## How to Use
1. **Upload a PDF**: Click the upload button and select a PDF file from your device.
2. **Ask Questions**: Type your questions in the chat input and press send.
3. **Get Answers**: The chatbot will analyze the PDF content and provide relevant answers based on the document.

## Development Setup
1. Clone the repository.
2. Run `docker-compose up --build` to start frontend and backend in development mode.
3. Frontend runs on `http://localhost:5173` (Vite dev server).
4. Backend runs on `http://localhost:8000` with Swagger docs at `/docs`.

## Production Setup
1. The frontend Dockerfile builds the React app and serves it with Nginx on port 80.
2. The backend Dockerfile runs FastAPI without reload on port 8000.
3. `docker-compose.yml` is configured for production ports and environment.
4. Run `docker-compose up --build` to start production containers locally.

## Deployment
Refer to `TODO.md` for detailed steps to deploy the app on Railway, a free cloud hosting platform supporting Docker Compose.

## Environment Variables
- `DATABASE_URL`: SQLite database URL for backend.
- `VITE_API_URL`: API URL for frontend to communicate with backend.

## Testing
- Frontend and backend can be tested locally using Docker Compose.
- API docs available at `http://localhost:8000/docs`.

## Troubleshooting
- Check Docker logs with `docker-compose logs`.
- Ensure ports 80 and 8000 are free before starting containers.
- For deployment issues, verify environment variables and Dockerfile configurations.

