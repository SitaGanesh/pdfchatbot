import React, { useState } from 'react';
import Header from './components/Header';
import ChatBot from './components/ChatBot';
import InputBox from './components/InputBox';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Backend API base URL - hardcoded for FastAPI default
const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  // Chat history
  const [messages, setMessages] = useState([]);
  // Track current document ID
  const [documentId, setDocumentId] = useState(null);
  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  // Uploaded file name for UI
  const [uploadedFileName, setUploadedFileName] = useState('');

  /** Handle file upload */
  const handleUpload = async (file) => {
    if (!file) {
      toast.error('Please select a file.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size === 0) {
      toast.error('Empty files are not allowed.');
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const loadingToastId = toast.loading('Uploading and processing PDF...');

    try {
      const response = await fetch(`${API_BASE_URL}/upload-pdf/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { document_id } = data;
      setDocumentId(document_id);
      setUploadedFileName(file.name);

      toast.dismiss(loadingToastId);
      toast.success('PDF uploaded and processed successfully!', { autoClose: 3000 });
      
      // Clear previous chat when new PDF is uploaded
      setMessages([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss(loadingToastId);
      toast.error(`Upload failed: ${error.message}`, { autoClose: 5000 });
      setDocumentId(null);
      setUploadedFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  /** Handle sending a question */
  const handleSend = async (question) => {
    if (!question || !question.trim()) {
      toast.warn('Please enter a question.');
      return;
    }
    if (!documentId) {
      toast.warn('Please upload a PDF before asking questions.');
      return;
    }

    const trimmedQuestion = question.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: trimmedQuestion }]);
    setIsAsking(true);

    try {
      const formData = new FormData();
      formData.append('document_id', documentId);
      formData.append('question', trimmedQuestion);

      const response = await fetch(`${API_BASE_URL}/ask-question/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get answer';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.answer) {
        throw new Error('Invalid response from server - missing answer');
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (error) {
      console.error('Ask error:', error);
      const errorMessage = error.message || 'Error occurred while getting answer.';
      setMessages((prev) => [...prev, { sender: 'bot', text: `Error: ${errorMessage}` }]);
      toast.error(`Error: ${errorMessage}`, { autoClose: 5000 });
    } finally {
      setIsAsking(false);
    }
  };

  /** Reset the application state */
  const handleReset = () => {
    setDocumentId(null);
    setUploadedFileName('');
    setMessages([]);
    toast.info('Application reset. You can upload a new PDF.', { autoClose: 3000 });
  };

  return (
    <div className="flex flex-col h-screen ">
      <Header
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadedFileName={uploadedFileName}
        onReset={handleReset}
      />

      <ChatBot 
        messages={messages} 
        isAsking={isAsking} 
        uploadedFileName={uploadedFileName} 
      />

      <InputBox 
        onSend={handleSend} 
        disabled={!documentId || isAsking} 
        isAsking={isAsking} 
      />
    </div>
  );
}