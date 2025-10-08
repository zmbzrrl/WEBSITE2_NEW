-- Check the exact column names in layouts table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'layouts'
ORDER BY ordinal_position;
