# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

## Step-by-Step Setup

### 1. Environment Variables

Create `.env.local` file in the root directory with the following:

```env
# MongoDB Atlas
# Replace <password> with your actual MongoDB password
MONGODB_URI=mongodb+srv://Joshua:<password>@mymongodb.hteve5f.mongodb.net/inventory?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_URL=cloudinary://235891436339543:aiN4IFap0xskLTaGe0lpl9OLPPg@dpvrptzkw
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpvrptzkw
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=inventory-upload

# NextAuth
# Generate using: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Generate NextAuth Secret

Run this command in PowerShell:

```powershell
# Using OpenSSL (if installed)
openssl rand -base64 32

# Alternative: Using PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### 3. Configure Cloudinary Upload Preset

1. Go to https://cloudinary.com/console
2. Navigate to **Settings** → **Upload**
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Set:
   - **Preset name**: `inventory-upload`
   - **Signing mode**: `Unsigned`
   - **Folder**: `inventory` (optional)
6. Click **Save**

### 4. Update MongoDB Password

1. Go to MongoDB Atlas dashboard
2. Navigate to **Database Access**
3. Find user "Joshua" and click **Edit**
4. Update password or copy existing password
5. Replace `<password>` in `.env.local` with actual password

### 5. Install Dependencies

```powershell
npm install
```

### 6. Seed Database

This creates the admin user (username: admin, password: admin):

```powershell
npm run seed
```

### 7. Run Development Server

```powershell
npm run dev
```

Visit http://localhost:3000

## Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin`

⚠️ **IMPORTANT**: Change these credentials in production!

## Testing Checklist

- [ ] Landing page loads with hero banner placeholder
- [ ] Admin login works with admin/admin
- [ ] Can create categories (3 levels)
- [ ] Can upload images via Cloudinary
- [ ] Can create products with categories and images
- [ ] Stock adjustment creates history entries
- [ ] Product filters work by all 3 category levels
- [ ] Product detail page shows carousel
- [ ] Can update hero banner in admin settings

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production domain
5. Deploy

### Environment Variables for Production

Update these in your hosting platform:

- `MONGODB_URI` - Same as development
- `CLOUDINARY_URL` - Same as development
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Same as development
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Same as development
- `NEXTAUTH_SECRET` - Generate new secret for production
- `NEXTAUTH_URL` - Your production domain (e.g., https://yourdomain.com)

## Troubleshooting

### MongoDB Connection Issues

- Ensure IP address is whitelisted in MongoDB Atlas (or allow all: 0.0.0.0/0)
- Verify password doesn't contain special characters that need URL encoding
- Check cluster name matches in connection string

### Cloudinary Upload Fails

- Verify upload preset exists and is set to "Unsigned"
- Check cloud name is correct
- Ensure NEXT_PUBLIC_ variables are set (required for client-side)

### NextAuth Errors

- Verify NEXTAUTH_SECRET is set and not empty
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Images Not Loading

- Check Cloudinary credentials are correct
- Verify images were uploaded successfully (check Cloudinary console)
- Ensure Next.js image domains are configured in next.config.ts

## Security Recommendations

1. **Change Default Admin Credentials**
   - Go to MongoDB Atlas → Collections → users
   - Update admin password hash or create new admin user

2. **Use Strong Secrets**
   - Generate unique NEXTAUTH_SECRET for production
   - Never commit .env.local to version control

3. **Enable IP Whitelisting**
   - In MongoDB Atlas, restrict access to known IPs
   - Remove 0.0.0.0/0 in production

4. **Environment Variables**
   - Keep production secrets separate from development
   - Use hosting platform's secret management

## Support

If you encounter issues:

1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure database seed script ran successfully
