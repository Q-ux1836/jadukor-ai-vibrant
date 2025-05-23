
# জাদুকর (JADOOKOR) Backend Server

The mystical AI assistant backend server with local math computation capabilities.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=5000
     ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

- `POST /api/chat` - Send a message to জাদুকর
- `GET /api/history` - Get conversation history
- `DELETE /api/history` - Clear conversation history
- `GET /health` - Health check

## Features

- **Local Math Processing:** Solves basic math problems without API calls
- **Dual AI Support:** OpenAI and Gemini integration
- **Mystical Responses:** Themed responses as জাদুকর
- **CORS Enabled:** Ready for web integration

## Deployment

You can deploy this to platforms like:
- Heroku
- Railway
- Vercel
- Digital Ocean
- AWS

Make sure to set your environment variables in your deployment platform.
