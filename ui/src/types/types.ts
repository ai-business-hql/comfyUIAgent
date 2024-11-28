import { EWorkflowPrivacy } from "./dbTypes";

export type WorkspaceRoute =
  | "root"
  | "customNodes"
  | "recentFlows"
  | "gallery"
  | "versionHistory"
  | "saveAsModal"
  | "modelList"
  | "spotlightSearch"
  | "downloadSpaceJson"
  | "installModels"
  | "share";

export type Session = {
  username: string | null;
  shareKey: string;
};

export type ShareWorkflowData = {
  version: {
    name: string;
    json: string;
  };
  workflow: {
    name: string;
    cloudID?: string | null;
  };
  nodeDefs: Object;
  privacy: EWorkflowPrivacy;
};

export interface Message {
  id: string;
  content: string;
  role: string;
  name?: string;
  toolCalls?: any;
  type?: 'message' | 'workflow_option' | 'node_search' | 'downstream_node_recommend';
  is_chunk?: boolean;
  format?: 'markdown' | 'text';
}

export interface ToolCall {
  toolCallId: string
  name: string
  args: {}
  result?: {} | []
}

export interface ComponentConfig {
  id: string
  name: string
  type: string
  props: any
  children: ComponentConfig[]
}

export interface WorkflowOption {
  name: string;
  description: string;
  thumbnail: string;
  dir: string;
  workflow: string;
}

export interface MessageContent {
  ai_message: string;
  options?: string[] | WorkflowOption[];
}
