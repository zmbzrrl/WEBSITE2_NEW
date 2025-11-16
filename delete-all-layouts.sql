-- Delete all layouts from the database
-- WARNING: This will permanently delete ALL layouts for ALL users

DELETE FROM public.layouts;

-- Verify deletion
SELECT COUNT(*) as remaining_layouts FROM public.layouts;

