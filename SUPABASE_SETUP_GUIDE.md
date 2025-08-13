# 🚀 Supabase Database Setup Guide

This guide will help you set up a fresh Supabase database and connect it to your panel customizer web app.

## 📋 Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Your React web app (already set up)

## 🔧 Step-by-Step Setup

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `panel-customizer-db` (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the SQL
5. You should see "Database setup complete!" message

### 5. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser's developer console (F12)
3. In the console, run this test:
   ```javascript
   import { runAllTests } from './src/utils/testDatabase.js';
   runAllTests();
   ```

4. You should see all tests pass with ✅ marks

## 🧪 Testing Your Setup

### Quick Test in Browser Console

```javascript
// Test basic connection
import { testBasicConnection } from './src/utils/testDatabase.js';
testBasicConnection().then(console.log);

// Test table structure
import { testTableStructure } from './src/utils/testDatabase.js';
testTableStructure().then(console.log);
```

### Expected Results

✅ **Basic Connection**: Should show "Successfully connected to Supabase!"
✅ **Table Structure**: Should show all 4 tables are accessible
✅ **Sample Data Insertion**: Should create and delete test data successfully

## 🔍 Troubleshooting

### Common Issues

**❌ "Failed to connect to Supabase"**
- Check your API keys in `.env.local`
- Make sure the keys are correct and not truncated
- Verify your Supabase project is active

**❌ "Table not accessible"**
- Run the `supabase-setup.sql` script again
- Check if tables were created in the **Table Editor**
- Verify RLS (Row Level Security) is disabled

**❌ "Permission denied"**
- Make sure you're using the **anon** key, not the service role key
- Check that permissions were granted in the setup script

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Try running the setup SQL script again
4. Check the Supabase logs in your dashboard

## 🎯 Next Steps

Once your database is connected:

1. **Test saving a design** in your app
2. **Test loading saved designs**
3. **Verify data appears** in your Supabase dashboard
4. **Set up authentication** (optional, for user accounts)

## 📊 Database Schema Overview

Your database now has 4 main tables:

- **`user_projects`**: Main project containers
- **`user_designs`**: Individual panel designs
- **`panel_configurations`**: Detailed panel specifications
- **`design_versions`**: Version history for designs

## 🔒 Security Notes

- The current setup disables Row Level Security (RLS) for development
- For production, you should enable RLS and set up proper policies
- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive data

---

🎉 **Congratulations!** Your Supabase database is now connected to your web app!
