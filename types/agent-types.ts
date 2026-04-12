export enum SidebarTab {
  FILES = 'FILES',
  SEARCH = 'SEARCH',
  GIT = 'GIT',
  DEBUG = 'DEBUG',
  EXTENSIONS = 'EXTENSIONS'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface AgentSettings {
  modelName: string;
  temperature: number;
  systemInstruction: string;
  enableSynthID?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export enum TaskCategory {
  UX = 'UX',
  UI = 'UI',
  Bug = 'Bug',
  Feature = 'Feature',
  Performance = 'Performance'
}

export enum ImpactRating {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done'
}

export interface PolishTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  impact: ImpactRating;
  timeEstimate: number;
  status: TaskStatus;
  communityVotes: number;
  createdAt: number;
  completedAt?: number;
}

export interface StatsData {
  completionRate: number;
  completed: number;
  total: number;
  totalTimeInvested: number;
  topCategory: string | null;
}
