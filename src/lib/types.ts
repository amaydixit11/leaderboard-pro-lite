export type User = {
  id: string;
  name: string;
  codeforces_handle: string;
  points: number;
};

export type Problem = {
  id: string;
  link: string;
  date: string;
};

export type Submission = {
  id: string;
  user_id: string;
  problem_id: string;
  solved: boolean;
  submitted_at: string;
  user?: User;
  problem?: Problem;
};