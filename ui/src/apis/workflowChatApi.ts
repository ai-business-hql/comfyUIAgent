import { config } from '../config'
import { fetchApi } from "../Api";
import { Message, ChatResponse, OptimizedWorkflowRequest, OptimizedWorkflowResponse, Node, ExtItem } from "../types/types";
import { generateUUID } from '../utils/uuid';

const BASE_URL = config.apiBaseUrl

const getApiKey = () => {
    const apiKey = localStorage.getItem('chatApiKey');
    if (!apiKey) {
        throw new Error('API key is required. Please set your API key first.');
    }
    return apiKey;
};

export namespace WorkflowChatAPI {

  export async function* streamInvokeServer(sessionId: string, prompt: string, images: File[] = [], intent: string | null = null, ext: any | null = null): AsyncGenerator<ChatResponse> {
    try {
      const apiKey = getApiKey();
      
      // Convert images to base64
      const imagePromises = images.map(file => 
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
      
      const base64Images = await Promise.all(imagePromises);
      
      const response = await fetch(`${BASE_URL}/api/chat/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Authorization': `Bearer ${apiKey}`,
          'trace-id': generateUUID(),
        },
        body: JSON.stringify({
          session_id: sessionId,
          prompt: prompt,
          mock: false,
          intent: intent,
          ext: ext,
          images: base64Images.map((base64, index) => ({
            filename: images[index].name,
            data: base64
          }))
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
    } catch (error) {
      console.error('Error in streamInvokeServer:', error);
      throw error;
    }
  }

  export async function getOptimizedWorkflow(
    workflowId: number, 
    prompt: string
  ): Promise<OptimizedWorkflowResponse> {
    try {
      const apiKey = getApiKey();
      
      const response = await fetch(`${BASE_URL}/api/chat/get_optimized_workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Authorization': `Bearer ${apiKey}`,
          'trace-id': generateUUID(),
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

  export async function batchGetNodeInfo(nodeTypes: string[]): Promise<any> {
    const apiKey = getApiKey();
    const response = await fetch(`${BASE_URL}/api/chat/get_node_info_by_types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'trace-id': generateUUID(),
      },
      body: JSON.stringify({ node_types: nodeTypes }),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to get node info by types');
    }
    return result.data as Node[];
  }

  export async function fetchMessages(sessionId: string): Promise<Message[]> {
    try {
      const apiKey = getApiKey();
      const response = await fetch(`${BASE_URL}/api/chat/get_messages_by_session_id?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'trace-id': generateUUID(),
        }
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch messages');
      }

      return result.data.map((msg: any) => {
        console.log("msg.ext", msg.ext);
        return {
          id: msg.id.toString(),
          content: msg.role === 'ai' ? JSON.stringify({
            session_id: sessionId,
            text: msg.content,
            finished: msg.finished || false,
            format: msg.format || 'markdown',
            ext: msg.ext
          }) : msg.content,
          role: msg.role,
          name: msg.role === 'ai' ? 'Assistant' : undefined,
          format: msg.format || 'markdown',
          finished: msg.finished
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}

  

