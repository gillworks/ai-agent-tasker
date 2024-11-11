export type Project = {
  id: string;
  user_id: string;
  name: string;
  key: string;
  description: string | null;
  github_url: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};
