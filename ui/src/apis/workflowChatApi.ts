import { config } from '../config'
import { fetchApi } from "../Api";
import { Message, ChatResponse, OptimizedWorkflowRequest, OptimizedWorkflowResponse } from "../types/types";

const BASE_URL = config.apiBaseUrl

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
    const response = await fetch(`${BASE_URL}/api/chat/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        session_id: sessionId,
        prompt: prompt,
        mock: false
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

  export async function getOptimizedWorkflow(
    workflowId: number, 
    prompt: string
  ): Promise<OptimizedWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/get_optimized_workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          prompt: prompt
        } as OptimizedWorkflowRequest),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to get optimized workflow');
      }

      return result.data as OptimizedWorkflowResponse;
    } catch (error) {
      console.error('Error getting optimized workflow:', error);
      throw error;
    }
  }
}

  

