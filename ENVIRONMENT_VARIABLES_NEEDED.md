# 🔐 Environment Variables You Need to Transfer

## ⚠️ IMPORTANT: Save These Before Moving to New Laptop

Before switching laptops, you need to save these environment variables. They are NOT stored in the code and must be manually transferred.

## Backend Environment Variables

Create a file: `backend/.env`

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
```

### How to Find These Values:

1. **SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY**:
   - Go to [supabase.com](https://supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** → `SUPABASE_URL`
     - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

2. **JWT_SECRET**:
   - This is a random string you created
   - Check if you have it saved somewhere
   - If lost, you can generate a new one (but existing tokens will be invalid)

3. **FRONTEND_ORIGIN & PORT**:
   - These have defaults, but check your current setup

## Frontend Environment Variables (Optional)

Only needed if frontend connects directly to Supabase.

Create a file: `.env.local` (in project root)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### How to Find:
- Same Supabase dashboard → **Settings** → **API**
- Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 📝 Action Items

1. **On Current Laptop**:
   - [ ] Check if `backend/.env` exists and copy its contents
   - [ ] Check if `.env.local` exists and copy its contents
   - [ ] Save these values securely (password manager, encrypted note, etc.)

2. **On New Laptop**:
   - [ ] Create `backend/.env` with the saved values
   - [ ] Create `.env.local` if needed (with saved values)
   - [ ] Never commit these files to Git!

## 🔒 Security Notes

- These files contain sensitive credentials
- Never share them publicly
- Never commit to version control (already in .gitignore)
- Store in a password manager for safekeeping

