-- Supabase Diagnostic Script
-- Run this to see what's actually in your project

-- Check what schemas exist
SELECT schema_name FROM information_schema.schemata;

-- Check what tables exist in public schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if our table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_designs'
) as table_exists;

-- Check current user and permissions
SELECT current_user, current_database();

-- Check if we can create tables
SELECT has_table_privilege('anon', 'user_designs', 'SELECT') as anon_select,
       has_table_privilege('authenticated', 'user_designs', 'SELECT') as auth_select;

-- Try to create a simple test table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- Insert test data
INSERT INTO test_table (name) VALUES ('test');

-- Check if it worked
SELECT * FROM test_table;

-- Clean up
DROP TABLE test_table;
