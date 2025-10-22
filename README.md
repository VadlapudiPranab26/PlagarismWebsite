# Plagiarism Checker

This is a full-featured plagiarism checker web application that works like Grammarly, capable of detecting copied or similar content from online sources and comparing it with AI-based semantic similarity.

## Setup

### Prerequisites

- Node.js
- MongoDB
- Bing Search API Key
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/plagiarism-checker.git
   cd plagiarism-checker
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Configure backend:**
   - Create a `.env` file in the `backend` directory.
   - Add the following environment variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     BING_API_KEY=your_bing_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Test Case

To test the application, you can use the following text: "To be or not to be, that is the question." This well-known phrase should trigger the plagiarism checker and show multiple sources.
