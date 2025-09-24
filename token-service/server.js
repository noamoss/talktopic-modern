import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://noamoss.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key']
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'TalkToPic Token Service',
    timestamp: new Date().toISOString()
  });
});

// Generate ephemeral token endpoint
app.post('/generate-token', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        details: 'Please provide your Gemini API key'
      });
    }

    // Generate ephemeral token using the provided API key
    const tokenResponse = await fetch('https://generativelanguage.googleapis.com/v1alpha/ephemeralTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        // Token configuration for Live API
        'ttlSeconds': 3600, // 1 hour expiration
        'scopes': ['https://www.googleapis.com/auth/generativelanguage.liveapi']
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to generate ephemeral token:', errorText);

      return res.status(tokenResponse.status).json({
        error: 'Failed to generate ephemeral token',
        details: 'Please check your API key and try again',
        status: tokenResponse.status
      });
    }

    const tokenData = await tokenResponse.json();

    // Return the ephemeral token to the client
    res.json({
      success: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt || new Date(Date.now() + 3600000).toISOString()
    });

  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to generate token due to server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TalkToPic Token Service running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Token endpoint: http://localhost:${PORT}/generate-token`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});