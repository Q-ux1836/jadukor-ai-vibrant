
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const { isMathProblem, solveMathProblem } = require('./mathOperations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store conversation history (in production, use a database)
let conversationHistory = [];

// AI Service configurations
const AI_SERVICES = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    model: 'gpt-3.5-turbo'
  },
  gemini: {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'জাদুকর (JADOOKOR) - The Mystical AI Assistant Backend',
    status: 'running',
    version: '1.0.0'
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, model = 1 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Received prompt: ${prompt}`);

    // Check if this is a math problem we can solve locally
    if (isMathProblem(prompt)) {
      const localSolution = solveMathProblem(prompt);
      if (localSolution) {
        console.log('Solved math problem locally');
        return res.json({ 
          reply: localSolution,
          model: 'local-math',
          solved_locally: true
        });
      }
    }

    // Choose AI service based on model parameter
    const useOpenAI = model === 1;
    let reply;

    if (useOpenAI && process.env.OPENAI_API_KEY) {
      reply = await queryOpenAI(prompt);
    } else if (process.env.GEMINI_API_KEY) {
      reply = await queryGemini(prompt);
    } else {
      reply = "I apologize, but I cannot access the mystical realm at the moment. Please ensure the API keys are properly configured.";
    }

    // Store conversation
    conversationHistory.push({ prompt, reply, timestamp: new Date() });

    res.json({ 
      reply,
      model: useOpenAI ? 'openai' : 'gemini',
      solved_locally: false
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while consulting the ancient texts',
      details: error.message 
    });
  }
});

async function queryOpenAI(prompt) {
  try {
    const response = await axios.post(AI_SERVICES.openai.url, {
      model: AI_SERVICES.openai.model,
      messages: [
        {
          role: "system",
          content: "You are জাদুকর (JADOOKOR), a mystical AI assistant with ancient wisdom. Respond in a wise and mystical manner while being helpful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: AI_SERVICES.openai.headers
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message);
    throw new Error('Failed to consult OpenAI oracle');
  }
}

async function queryGemini(prompt) {
  try {
    const response = await axios.post(AI_SERVICES.gemini.url, {
      contents: [{
        parts: [{
          text: `You are জাদুকর (JADOOKOR), a mystical AI assistant with ancient wisdom. Respond in a wise and mystical manner while being helpful. User query: ${prompt}`
        }]
      }]
    }, {
      headers: AI_SERVICES.gemini.headers
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini error:', error.response?.data || error.message);
    throw new Error('Failed to consult Gemini oracle');
  }
}

// Get conversation history
app.get('/api/history', (req, res) => {
  res.json({ history: conversationHistory });
});

// Clear conversation history
app.delete('/api/history', (req, res) => {
  conversationHistory = [];
  res.json({ message: 'Conversation history cleared' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`জাদুকর (JADOOKOR) backend server running on port ${PORT}`);
  console.log(`Access the API at: http://localhost:${PORT}`);
});
