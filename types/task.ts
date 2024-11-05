export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: string;
  agent: string;
  team: string;
  tags: string[];
  description: string;
}
