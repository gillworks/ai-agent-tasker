export type Task = {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "complete";
  priority: "low" | "medium" | "high";
  project: string;
  agent: string;
  team: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};
