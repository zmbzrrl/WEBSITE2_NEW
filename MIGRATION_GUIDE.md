# 🚀 Migration Guide: Moving to a New Laptop

This guide will help you transfer your project to a new laptop while preserving all backend, frontend, and database configurations.

## ✅ What's Already Preserved (No Action Needed)

- **Database (Supabase)**: Your database is cloud-hosted and accessible from anywhere. No migration needed!
- **Code**: All your source code is in this project folder

## 📋 Pre-Migration Checklist (On Current Laptop)

### Step 1: Save Your Environment Variables

You need to copy your environment variables. Check if you have these files:
- `.env` (in project root)
- `.env.local` (in project root)
- `backend/.env` (in backend folder)

**Action Required**: Copy the contents of these files to a secure location (password manager, encrypted note, etc.)

### Step 2: Document Your Current Setup

Note down:
- Backend port (default: 4000)
- Frontend port (default: 5173)
- Any custom configurations

## 🚀 Migration Steps (On New Laptop)

### Step 1: Transfer the Project Folder

**Option A: Using OneDrive (Recommended - Already in OneDrive)**
1. The project is already in OneDrive, so it should sync automatically
2. If not synced, copy the entire `WEBSITE2_NEW` folder to your new laptop
3. Ensure all files are synced before proceeding

**Option B: Using External Drive/USB**
1. Copy the entire `WEBSITE2_NEW` folder to an external drive
2. Copy it to your new laptop

**Option C: Using Git (Recommended for Future)**
1. Initialize Git (see "Setting Up Git" section below)
2. Push to GitHub/GitLab
3. Clone on new laptop

### Step 2: Install Prerequisites

On your new laptop, install:

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

### Step 3: Restore Environment Variables

1. **Backend Environment Variables**
   - Navigate to `backend/` folder
   - Create a `.env` file
   - Add your environment variables (from Step 1 above):
   ```env
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   JWT_SECRET=your_jwt_secret_here
   FRONTEND_ORIGIN=http://localhost:5173
   PORT=4000
   ```

2. **Frontend Environment Variables** (if needed)
   - In project root, create `.env.local` file
   - Add (if your frontend uses Supabase directly):
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 4: Install Dependencies

1. **Install Frontend Dependencies**
   ```bash
   cd WEBSITE2_NEW
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

### Step 5: Verify Database Connection

Your Supabase database is cloud-hosted, so it should work immediately. To verify:

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
   - Should see: `[backend] Auth server listening on port 4000`

2. Start the frontend (in a new terminal):
   ```bash
   cd WEBSITE2_NEW
   npm run dev
   ```
   - Should open at `http://localhost:5173`

3. Test the connection:
   - Open the app in browser
   - Try logging in or accessing database features
   - Check browser console for errors

## 🔧 Troubleshooting

### Issue: "Missing SUPABASE_URL" error
**Solution**: Make sure `backend/.env` file exists and has all required variables

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in both root and `backend/` folders

### Issue: Port already in use
**Solution**: 
- Change `PORT` in `backend/.env` to a different port (e.g., 4001)
- Update `FRONTEND_ORIGIN` if you change the frontend port

### Issue: Database connection fails
**Solution**: 
- Verify your Supabase credentials are correct
- Check Supabase dashboard to ensure project is active
- Verify network connection

## 🔐 Security Reminders

- **Never commit `.env` files** to version control
- Store environment variables securely (password manager)
- Use different JWT_SECRET for production vs development
- Keep your Supabase service role key secret

## 📦 Setting Up Git (Optional but Recommended)

To prevent future migration issues, set up version control:

1. **Initialize Git** (on current laptop):
   ```bash
   cd WEBSITE2_NEW
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/WEBSITE2_NEW.git
   git branch -M main
   git push -u origin main
   ```

4. **On New Laptop**:
   ```bash
   git clone https://github.com/yourusername/WEBSITE2_NEW.git
   cd WEBSITE2_NEW
   # Then follow steps 3-5 above
   ```

## ✅ Verification Checklist

After migration, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can connect to Supabase database
- [ ] Can log in (if authentication is set up)
- [ ] Can save/load data from database
- [ ] All features work as expected

## 🆘 Need Help?

If you encounter issues:
1. Check the error messages in terminal/console
2. Verify all environment variables are set correctly
3. Ensure Node.js version is compatible (v18+)
4. Check that all dependencies installed successfully

---

**Note**: Since your database is on Supabase (cloud), your data is already preserved and accessible from any device. You only need to transfer the code and configure environment variables.

