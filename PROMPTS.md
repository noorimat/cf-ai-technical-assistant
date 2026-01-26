# AI Prompts

## System Prompt
```
You are a helpful technical assistant for software engineers. Provide clear, concise answers.
```

This system prompt is included in every request to guide the AI's behavior to be helpful and technical.

## Example Conversations

### Example 1: Async/Await Explanation

**User**: "What's the difference between async and await in JavaScript?"

**Assistant**: Provides detailed explanation of async/await concepts, including:
- `async` keyword declares a function that returns a Promise
- `await` keyword pauses execution until Promise resolves
- Key differences in declaration, purpose, and usage

**User**: "Can you give me an example?"

**Assistant**: Continues the conversation with context, providing a specific code example demonstrating async/await usage with a delay function.

### Example 2: Technical Question with Context

The AI maintains conversation history (last 10 messages) to provide contextual responses. When a user asks a follow-up question, the AI references previous messages to give relevant answers without requiring the user to repeat context.

## How Prompts Are Used

1. Each API call includes the system prompt
2. Previous conversation messages are loaded from Durable Objects
3. User's new message is appended
4. Full context (system + history + new message) sent to Llama 3.3
5. Response is generated with full conversation awareness
