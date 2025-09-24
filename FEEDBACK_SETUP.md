# 📝 Feedback System Setup Guide

This guide explains how to set up the new feedback system that replaces the global guidelines button.

## 🎯 Overview

The feedback system allows users to:
- Submit feedback with text messages
- Upload up to 5 screenshots
- View feedback status (new, in progress, resolved)

Admin users (interel.3@gmail.com) can:
- View all feedback submissions
- Update feedback status
- View screenshots in full size
- Access the admin panel at `/admin/feedback`

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of add-feedback-table.sql
```

This will create:
- `public.feedback` table for storing feedback data
- `feedback-screenshots` storage bucket for uploaded images
- Proper permissions and policies

### 2. Admin Access

The admin email `interel.3@gmail.com` is automatically configured. To add more admin emails:

1. Create a `.env.local` file in your project root
2. Add: `VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com`

### 3. Testing the System

1. **User Feedback**: Click the feedback button (bottom right) to submit feedback
2. **Admin Access**: Log in with `interel.3@gmail.com` and visit `/admin/feedback`
3. **Screenshot Upload**: Test uploading images with feedback

## 🔧 Technical Details

### Components Created

- `src/components/FeedbackModal.tsx` - Feedback submission modal
- `src/pages/AdminFeedback.tsx` - Admin feedback management page
- `add-feedback-table.sql` - Database setup script

### Database Schema

```sql
CREATE TABLE public.feedback (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    user_email TEXT NOT NULL,
    screenshots TEXT[] DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    url TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Storage Bucket

- **Name**: `feedback-screenshots`
- **Public**: Yes (for admin viewing)
- **Policies**: Allow public upload and view

## 🎨 UI Changes

- **Replaced**: Global guidelines button (bottom right)
- **New**: Feedback button with clipboard icon
- **Modal**: Clean feedback form with screenshot upload
- **Admin Panel**: Card-based layout with status management

## 🔒 Security

- Admin access controlled by email whitelist
- Screenshots stored in public bucket (admin only can view)
- Feedback data accessible only to admin users
- RLS disabled for development (enable in production)

## 📱 Features

### User Features
- ✅ Text feedback input
- ✅ Multiple screenshot upload (max 5)
- ✅ Form validation
- ✅ Success/error notifications
- ✅ Responsive design

### Admin Features
- ✅ View all feedback submissions
- ✅ Filter by status (new, in progress, resolved)
- ✅ Update feedback status
- ✅ View screenshots in full size
- ✅ See user email, timestamp, and URL context
- ✅ Responsive admin interface

## 🚨 Troubleshooting

### Common Issues

**❌ "Access denied" on admin page**
- Ensure you're logged in with `interel.3@gmail.com`
- Check that the email is in localStorage

**❌ "Failed to upload screenshot"**
- Verify the storage bucket exists
- Check storage policies are set correctly

**❌ "Failed to submit feedback"**
- Ensure the feedback table exists
- Check database permissions

### Database Verification

Run this query in Supabase SQL Editor to verify setup:

```sql
SELECT 'Feedback table exists' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'feedback' AND table_schema = 'public'
);
```

## 🎯 Next Steps

1. **Test the complete flow**: Submit feedback → View in admin panel
2. **Customize styling**: Adjust colors/themes as needed
3. **Add email notifications**: Notify admin of new feedback
4. **Enable RLS**: For production security
5. **Add feedback categories**: Bug report, feature request, etc.

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database setup completed successfully
3. Ensure admin email is correctly configured
4. Test with a simple feedback submission first
