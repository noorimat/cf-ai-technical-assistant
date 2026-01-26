# AI Technical Assistant - Cloudflare Workers AI

A simple AI-powered technical assistant built on Cloudflare Workers using Llama 3.3.

## Live Demo

https://cf-ai-technical-assistant.noorrimat.workers.dev

## Components

- **LLM**: Llama 3.3 on Workers AI (@cf/meta/llama-3.3-70b-instruct-fp8-fast)
- **Workflow/Coordination**: Cloudflare Workers handling API requests
- **User Input**: Simple web-based chat interface
- **Memory/State**: Durable Objects storing conversation history (last 10 messages)

## Features

- Real-time AI responses to technical questions
- Maintains conversation context within a session
- Simple, clean web interface
- Fully serverless architecture

## Architecture

1. User submits question via web interface
2. Worker creates/retrieves Durable Object for session
3. Conversation history loaded from Durable Object
4. Question + history sent to Llama 3.3
5. AI response stored in Durable Object
6. Response returned to user

## Running Locally
```bash
npm install
npm run dev
```

## Deployment
```bash
npm run deploy
```

## Technology Stack

- Cloudflare Workers (serverless compute)
- Cloudflare Durable Objects (stateful storage)
- Workers AI (Llama 3.3)
- TypeScript
