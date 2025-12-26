# 🚀 Quick Setup Guide for New Laptop

## Prerequisites
- Node.js v18+ installed
- npm installed (comes with Node.js)

## Quick Start (5 Steps)

### 1. Transfer Project
Since your project is in OneDrive, it should sync automatically. If not, copy the `WEBSITE2_NEW` folder to your new laptop.

### 2. Create Backend Environment File
Create `backend/.env` with these variables:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
```

**⚠️ Important**: Get these values from your current laptop's `backend/.env` file or your password manager.

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Verify Everything Works
- Backend should show: `[backend] Auth server listening on port 4000`
- Frontend should open at `http://localhost:3000`
- Test database connection by using the app

## Environment Variables Reference

### Backend (`backend/.env`)
Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase dashboard
- `JWT_SECRET` - A random secret string for JWT tokens
- `FRONTEND_ORIGIN` - Frontend URL (default: http://localhost:3000)
- `PORT` - Backend port (default: 4000)

### Frontend (`.env.local` - optional)
Only needed if frontend connects directly to Supabase:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anon/public key from Supabase dashboard

## Where to Find Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY` (if needed)

## Troubleshooting

**"Missing SUPABASE_URL" error**
→ Create `backend/.env` file with all required variables

**"Cannot find module" errors**
→ Run `npm install` in both root and `backend/` folders

**Port already in use**
→ Change `PORT` in `backend/.env` to a different port

**Database connection fails**
→ Verify Supabase credentials are correct and project is active

## ✅ Success Checklist

- [ ] Backend starts on port 4000
- [ ] Frontend starts on port 3000
- [ ] No error messages in console
- [ ] Can access the application in browser
- [ ] Database operations work (login, save data, etc.)

---

**Remember**: Your database is cloud-hosted (Supabase), so all your data is already accessible. You just need to configure the connection!

