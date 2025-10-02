# Hosting PDF Chatbot Application on Railway (Free Tier)

## Prerequisites
- GitHub account
- Railway account (free at railway.app)

## Steps to Deploy

1. **Push Code to GitHub**
   - Commit all changes (Dockerfiles, docker-compose.yml)
   - Push to a public GitHub repository

2. **Deploy on Railway**
   - Go to railway.app and sign up/login
   - Click "New Project" > "Deploy from GitHub repo"
   - Connect your GitHub account and select the repository
   - Railway will detect docker-compose.yml and deploy both services

3. **Configure Environment Variables (if needed)**
   - In Railway dashboard, go to project settings
   - Set any required env vars (e.g., if API_URL needs adjustment)
   - For free tier, volumes are supported but limited

4. **Access the Application**
   - Once deployed, Railway provides a public URL for the frontend (port 80)
   - Backend is internal, accessible via frontend

5. **Test the Deployment**
   - Visit the provided URL
   - Upload a PDF and test the chatbot

## Notes
- Free tier includes $5/month credit, sufficient for low-traffic apps
- Apps may sleep after inactivity, causing slight delay on first load
- For persistent data (SQLite, FAISS indices), Railway provides volumes

## Troubleshooting
- Check Railway logs for build/deploy errors
- Ensure docker-compose.yml is valid
- If issues with service communication, adjust VITE_API_URL
