# 🔍 Complete Database Issues Summary

## Issues Found in Your Database

### ❌ Issue #1: Broken Foreign Keys (3 tables affected)

**Problem:** Three tables have foreign keys that reference `property.prop_id`, but `prop_id` is NOT the primary key in the property table.

**Affected Tables:**
1. ✅ `layouts` table - `prop_id` column
2. ✅ `ug_property_access` table - `prop_id` column  
3. ✅ `user_designs` table - `prop_id` column

**Impact:**
- Database can't verify these relationships
- Data integrity issues (can create invalid references)
- Join queries might fail or return wrong data

**Fix:** Make `property.prop_id` the primary key (this fixes all 3 at once!)

---

### ⚠️ Issue #2: Users Table Primary Key Confusion

**Problem:** Earlier inspection showed both `id` and `email` listed as primary keys in the users table. A table can only have ONE primary key.

**What we need to check:**
- Does the users table actually have an `id` column?
- Is there a duplicate primary key constraint?

**Impact:**
- Could cause insertion/update errors
- Database might reject valid operations

**Fix:** Ensure only `email` is the primary key (remove any primary key on `id` if it exists)

---

### ✅ What's Working Correctly

These foreign keys are **valid** and working:

1. ✅ `layouts.project_id` → `user_projects.id` (valid)
2. ✅ `layouts.user_email` → `users.email` (valid)
3. ✅ `ug_property_access.ug_id` → `ug.ug_id` (valid)
4. ✅ `user_designs.user_email` → `users.email` (valid)
5. ✅ `user_projects.user_email` → `users.email` (valid)
6. ✅ `users.ug_id` → `ug.ug_id` (valid)

---

## Summary

**Total Issues:** 2
- **Critical:** 3 broken foreign keys (all related to property.prop_id)
- **Potential:** Users table primary key confusion (needs verification)

**Fix Priority:**
1. **High Priority:** Fix property.prop_id primary key (fixes 3 foreign keys)
2. **Medium Priority:** Verify and fix users table primary key

---

## Next Steps

1. Run `fix-property-primary-key.sql` - This fixes Issue #1 (all 3 broken foreign keys)
2. Run the users table check from `diagnose-database.sql` to verify Issue #2
3. If Issue #2 exists, we'll create a fix for it

