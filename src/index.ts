import { DurableObject } from "cloudflare:workers";

export interface Env {
  AI: any;
  CHAT_HISTORY: DurableObjectNamespace;
}

interface Message {
  role: string;
  content: string;
}

export class ChatHistory extends DurableObject<Env> {
  async getMessages(): Promise<Message[]> {
    const messages = await this.ctx.storage.get<Message[]>("messages");
    return messages || [];
  }

  async addMessage(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.push(message);
    // Keep only last 10 messages
    const recentMessages = messages.slice(-10);
    await this.ctx.storage.put("messages", recentMessages);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Serve HTML interface
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    // Handle chat API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { message, sessionId } = await request.json() as { message: string; sessionId: string };
      
      // Get Durable Object for this session
      const id = env.CHAT_HISTORY.idFromName(sessionId);
      const stub = env.CHAT_HISTORY.get(id);
      
      // Get chat history
      const history = await stub.getMessages();
      
      // Add user message to history
      await stub.addMessage({ role: "user", content: message });
      
      // Call Llama 3.3
      const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: "You are a helpful technical assistant for software engineers. Provide clear, concise answers." },
          ...history,
          { role: "user", content: message }
        ]
      });
      
      const aiMessage = response.response;
      
      // Save AI response to history
      await stub.addMessage({ role: "assistant", content: aiMessage });
      
      return new Response(JSON.stringify({ response: aiMessage }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response("Not found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;

const HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Technical Assistant</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      text-align: center;
    }
    #chat {
      background: white;
      border: 1px solid #ddd;
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .message {
      margin: 10px 0;
      padding: 10px 15px;
      border-radius: 6px;
      max-width: 80%;
    }
    .user {
      background: #0051ff;
      color: white;
      margin-left: auto;
      text-align: right;
    }
    .assistant {
      background: #f0f0f0;
      color: #333;
    }
    .input-container {
      display: flex;
      gap: 10px;
    }
    #input {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }
    button {
      padding: 12px 24px;
      font-size: 16px;
      background: #0051ff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background: #0041cc;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <h1>AI Technical Assistant</h1>
  <div id="chat"></div>
  <div class="input-container">
    <input id="input" placeholder="Ask a technical question..." />
    <button onclick="sendMessage()" id="sendBtn">Send</button>
  </div>
  
  <script>
    const sessionId = Math.random().toString(36).substring(7);
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    
    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;
      
      addMessage('user', message);
      input.value = '';
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId })
        });
        
        const data = await response.json();
        addMessage('assistant', data.response);
      } catch (error) {
        addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
      }
    }
    
    function addMessage(role, content) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      div.textContent = content;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
    });
  </script>
</body>
</html>
`;
