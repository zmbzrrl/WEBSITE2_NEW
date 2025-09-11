# 🔄 Database Flow Example

## How Data Flows Through Your Database

### Example: Creating a User for Marriott Dubai

**Step 1: Create Property**
```sql
INSERT INTO api.property (region, property_name) 
VALUES ('Dubai', 'Marriott Palm Jumeirah');
-- Result: id = "abc123-def456-ghi789"
```

**Step 2: Create User Group**
```sql
INSERT INTO api.ug (id, ug, prop_id) 
VALUES ('UG001_abc123', 'UG001', 'abc123-def456-ghi789');
-- Result: 
--   id = "UG001_abc123" (composite key)
--   ug = "UG001" (clean UG value)
--   prop_id = "abc123-def456-ghi789" (references property)
```

**Step 3: Create User**
```sql
INSERT INTO api.users (email, ug_id) 
VALUES ('admin@marriott.com', 'UG001');
-- Result: ug_id references the clean "UG001" value from UG.ug field
```

## The Magic of JOINs

When you want to see the full picture, you use JOINs:

```sql
SELECT 
    u.email,           -- From users table
    u.ug_id,           -- From users table  
    ug.ug,             -- From ug table (the clean UG value)
    p.property_name    -- From property table
FROM api.users u
LEFT JOIN api.ug ON u.ug_id = api.ug.ug      -- Connect users to ug
LEFT JOIN api.property p ON ug.prop_id = p.id -- Connect ug to property
```

**Result:**
```
email: admin@marriott.com
ug_id: UG001
ug: UG001  
property_name: Marriott Palm Jumeirah
```

## Why This Structure is Powerful

1. **Clean References**: Users reference clean "UG001" values, not messy composite keys
2. **Flexible**: You can have multiple user groups per property
3. **Scalable**: Easy to add new properties, user groups, and users
4. **Queryable**: Easy to ask questions like "Show me all users in Dubai properties"

## Real-World Example

**Question**: "Show me all users who work at Marriott properties"

**Query**:
```sql
SELECT u.email, p.property_name, p.region
FROM api.users u
LEFT JOIN api.ug ON u.ug_id = api.ug.ug
LEFT JOIN api.property p ON api.ug.prop_id = p.id
WHERE p.property_name LIKE '%Marriott%';
```

**Result**:
```
admin@marriott.com | Marriott Palm Jumeirah | Dubai
manager@marriott.com | Marriott Palm Jumeirah | Dubai
```
