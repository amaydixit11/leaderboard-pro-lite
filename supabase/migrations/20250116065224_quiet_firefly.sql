/*
  # Update schema for Codeforces integration

  1. Changes
    - Drop existing tables and recreate with new schema
    - Create users table with name and codeforces_handle
    - Create problems table with link and date
    - Create submissions table for tracking solutions
    - Set up RLS policies for public access

  2. Security
    - Enable RLS on all tables
    - Create policies for public access
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS users;

-- Create users table with new schema
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  codeforces_handle text UNIQUE NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create problems table with new schema
CREATE TABLE problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link text NOT NULL,
  date date UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  problem_id uuid REFERENCES problems(id),
  solved boolean NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public read problems" ON problems
  FOR SELECT USING (true);

CREATE POLICY "Public insert problems" ON problems
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read submissions" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Public insert submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Function to update points when a submission is made
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.solved THEN
    UPDATE users
    SET points = points + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update points on submission
CREATE TRIGGER update_points_on_submission
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();