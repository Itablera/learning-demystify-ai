I need to create a chat interface for an AI assistant application. The backend uses a RESTful API with the following endpoints:

## API Endpoints

### Conversation Management

- `POST /conversations` - Create a new conversation
- `GET /conversations` - List all conversations
- `GET /conversations/:id` - Get a specific conversation
- `DELETE /conversations/:id` - Delete a conversation
- `GET /conversations/:id/messages` - Get messages from a conversation
- `POST /conversations/:id/messages` - Add a message to a conversation

### Chat Completion

- `POST /conversations/:id/completions` - Get AI completions (supports streaming)
- `POST /documents` - Add documents to the knowledge base for RAG
- `POST /simple-chat` - Test endpoint for simple chat interactions
- `GET /hi` - Test endpoint that returns a greeting

## Request/Response Examples

### Create a new conversation

```json
// POST /conversations
// Request
{
  "title": "New AI Discussion"
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "conv123",
    "title": "New AI Discussion",
    "createdAt": "2025-05-02T10:15:30Z",
    "updatedAt": "2025-05-02T10:15:30Z",
    "messages": []
  }
}
```

Add message to conversation

```json
// POST /conversations/conv123/messages
// Request
{
  "content": "How does neural network training work?",
  "role": "user"
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "msg456",
    "role": "user",
    "content": "How does neural network training work?",
    "createdAt": "2025-05-02T10:16:45Z"
  }
}
```

Generate AI completion

```json
// POST /conversations/conv123/completions
// Request
{
  "message": "Explain quantum computing in simple terms"
}

// Response (200) - Non-streaming
{
  "success": true,
  "data": [
    {
      "id": "msg456",
      "role": "user",
      "content": "Explain quantum computing in simple terms",
      "createdAt": "2025-05-02T10:18:22Z"
    },
    {
      "id": "msg457",
      "role": "assistant",
      "content": "Quantum computing is like having a super-powerful calculator...",
      "createdAt": "2025-05-02T10:18:25Z"
    }
  ]
}
```

Streaming response format
For streaming responses, the client should set Accept: text/event-stream header. The server will send Server-Sent Events (SSE) in this format:

```text
data: {"id":"conv123","content":"Quantum","done":false}

data: {"id":"conv123","content":" computing","done":false}

data: {"id":"conv123","content":" is","done":false}

...

data: {"id":"resultMessageId","content":"","done":true}
```

Add document for RAG

```json
// POST /documents
// Request
{
  "content": "Artificial intelligence (AI) is intelligence demonstrated by machines...",
  "metadata": {
    "title": "Introduction to AI",
    "source": "Wikipedia",
    "date": "2025-05-01"
  }
}

// Response (200)
{
  "success": true,
  "data": {
    "id": "doc789"
  }
}
```

Please create a modern, responsive chat interface with the following features:

1. Ability to create, list, and switch between conversations
2. Message history display with user and AI messages properly styled
3. Message input area with send button
4. Support for streaming responses (showing AI responses as they're generated)
5. Loading states for all API interactions
6. Error handling with user-friendly messages
