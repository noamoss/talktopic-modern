# TalkToPic Token Service

Express.js service for generating Gemini Live API ephemeral tokens.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Deployment to Railway

1. Connect your GitHub repository to Railway
2. Select the `token-service` folder as the root directory
3. Railway will automatically detect the Node.js project
4. Set environment variables in Railway dashboard if needed

## API Endpoints

### POST /generate-token
Generates an ephemeral token for Gemini Live API.

**Request:**
```json
{
  "apiKey": "your-gemini-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "token": "ephemeral-token-here",
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "TalkToPic Token Service",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```