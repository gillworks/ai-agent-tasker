export type Task = {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  description: string;
  status: "draft" | "pending" | "in-progress" | "complete";
  priority: "low" | "medium" | "high";
  project_id: string;
  project: string;
  agent_id: string | null;
  team: string;
  feature_branch: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};
