# Hosting PDF Chatbot Application

## Frontend Deployment (Already on Render)
- Frontend is deployed on Render as a static site.
- URL: https://pdfchatbot-frontend.onrender.com

## Backend Deployment on Hugging Face Spaces (Free, ML-Supported)

### Prerequisites
- Hugging Face account (free at huggingface.co)
- GitHub account

### Steps to Deploy Backend

1. **Prepare Backend for Spaces**
   - Create a new file `backend/app.py` with the FastAPI app code (copy from `backend/main.py`)
   - Ensure requirements.txt includes all dependencies (transformers, torch, etc.)

2. **Create a Hugging Face Space**
   - Go to huggingface.co/spaces
   - Click "Create new Space"
   - Choose "Docker" as SDK (since you have Dockerfile)
   - Name your space (e.g., pdf-chatbot-backend)
   - Make it public

3. **Connect to GitHub**
   - In your Space settings, connect to your GitHub repo
   - Point to the `backend/` folder or adjust paths

4. **Deploy**
   - Push changes to GitHub
   - Spaces will auto-deploy using your Dockerfile
   - Spaces provides persistent storage for models/indices

5. **Configure Frontend**
   - Update `frontend/.env` or Render env vars: `VITE_API_URL=https://your-username-pdf-chatbot-backend.hf.space`
   - Redeploy frontend on Render

6. **Test**
   - Test API endpoints via the Spaces URL
   - Ensure frontend communicates with backend

### Notes
- Free tier: Unlimited Spaces, 16GB RAM, 2 CPUs
- Supports ML libraries natively
- Apps may have cold starts

### Troubleshooting
- Check Spaces build logs
- Ensure Dockerfile is optimized for Spaces (use python:3.9-slim or similar)
- For large models, consider model caching
