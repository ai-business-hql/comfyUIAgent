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

export interface Node {
  name: string;
  description: string;
  image: string;
  github_url: string;
  from_index: number;
  to_index: number;
}

export interface NodeInfo {
  existing_nodes: Node[];
  missing_nodes: Node[];
}

export interface Workflow {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
  workflow?: string;
}

export interface ChatResponse {
  session_id: string;
  text?: string;
  finished: boolean;
  recommend_workflows: Workflow[];
  type: string;
  format: string;
  node_info?: NodeInfo;
  guides: string[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai' | 'tool';
  name?: string;
  type?: string;
  format?: string;
  finished?: boolean;
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
