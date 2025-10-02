# Hosting PDF Chatbot Application on Render (Free Tier)

## Prerequisites
- GitHub account
- Render account (free at render.com)

## Steps to Deploy

1. **Push Code to GitHub**
   - Commit all changes (Dockerfiles, docker-compose.yml)
   - Push to a public GitHub repository

2. **Deploy Backend on Render**
   - Go to render.com and sign up/login
   - Click "New" > "Web Service"
   - Connect your GitHub account and select the repository
   - Set the following:
     - **Name**: pdfchatbot-backend
     - **Environment**: Docker
     - **Branch**: main (or your branch)
     - **Build Command**: (leave default)
     - **Start Command**: (leave default, uses Dockerfile CMD)
   - Add environment variable: `DATABASE_URL=sqlite:///./fastapi_app.db`
   - Click "Create Web Service"

3. **Deploy Frontend on Render**
   - Click "New" > "Static Site"
   - Connect the same GitHub repository
   - Set the following:
     - **Name**: pdfchatbot-frontend
     - **Branch**: main
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-service.onrender.com`
     (Replace with the actual backend URL from step 2)
   - Click "Create Static Site"

4. **Update Frontend API URL**
   - After backend is deployed, copy its URL
   - Go to frontend static site settings and update `VITE_API_URL`

5. **Access the Application**
   - Frontend URL: Provided by Render static site
   - Backend URL: Provided by Render web service

6. **Test the Deployment**
   - Visit the frontend URL
   - Upload a PDF and test the chatbot

## Notes
- Render free tier includes 750 hours/month for web services and unlimited static sites
- Apps may sleep after inactivity, causing slight delay on first load
- For persistent data, consider using Render's managed databases (paid) or cloud storage

## Troubleshooting
- Check Render logs for build/deploy errors
- Ensure Dockerfile CMD is correct
- Verify environment variables are set correctly
- If CORS issues, check backend CORS settings
