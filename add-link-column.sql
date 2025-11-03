-- Add link column to users table
-- Execute this in Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS link TEXT;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
