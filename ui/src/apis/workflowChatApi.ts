import { fetchApi } from "../Api";
import { Message, ChatResponse } from "../types/types";

export namespace WorkflowChatAPI {
  export async function fetchMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await fetchApi(`/workspace/fetch_messages_by_id?session_id=${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  export async function* streamMessage(sessionId: string, message: string): AsyncGenerator<ChatResponse> {
    const response = await fetchApi('/workspace/workflow_gen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message
      }),
    });

    const reader = response.body!.getReader();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          yield JSON.parse(line) as ChatResponse;
        }
      }
    }

    if (buffer.trim()) {
      yield JSON.parse(buffer) as ChatResponse;
    }
  }

  export async function* streamInvokeServer(sessionId: string, prompt: string): AsyncGenerator<ChatResponse> {
    const response = await fetch('http://localhost:8000/api/chat/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        session_id: sessionId,
        prompt: prompt,
        mock: true
      }),
    });

    const reader = response.body!.getReader();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          yield JSON.parse(line) as ChatResponse;
        }
      }
    }

    if (buffer.trim()) {
      yield JSON.parse(buffer) as ChatResponse;
    }
  }
}

  

