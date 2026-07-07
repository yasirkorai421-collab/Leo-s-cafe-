# Cloudinary Setup Guide for Leo's Cafe

## Problem
The demo Cloudinary credentials (`demo`, `123456789012345`) don't work in production. Images fail to load and uploads don't work.

## Solution

### Step 1: Create a Free Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email address
4. Log in to your dashboard at https://console.cloudinary.com/

### Step 2: Get Your Credentials
Once logged in, you'll see your dashboard with:
- **Cloud Name** (e.g., `djxyz123`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (click "Reveal" to see it, e.g., `abcDEF123xyz456`)

### Step 3: Update Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Click on your **Leo's Cafe** project
3. Go to **Settings** → **Environment Variables**
4. Update these three variables:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
[Your Cloud Name from Step 2]

CLOUDINARY_API_KEY
[Your API Key from Step 2]

CLOUDINARY_API_SECRET
[Your API Secret from Step 2]
```

5. Click **Save** for each variable

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the **•••** menu on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 5: Configure Upload Presets (Optional but Recommended)
For better security, create an upload preset:

1. In Cloudinary Console, go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `leos_cafe_uploads`
   - **Signing mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `leos-cafe/` (organizes your images)
   - **Access mode**: `Public`
   - **Allowed formats**: `jpg,jpeg,png,webp`
   - **Max file size**: `5 MB`
5. Click **Save**

### Step 6: Test Image Uploads
1. Go to your app: https://your-vercel-url.vercel.app/admin/login
2. Login with admin credentials
3. Try uploading a payment screenshot or menu item image
4. Images should now upload and display correctly

## Free Tier Limits
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

This is sufficient for initial production use. Upgrade if you exceed limits.

## Troubleshooting

### Images Still Not Loading?
1. Check browser console for errors
2. Verify all 3 environment variables are set in Vercel
3. Ensure you redeployed after updating variables
4. Clear browser cache (Ctrl+Shift+R)

### Uploads Failing?
1. Check that Cloud Name matches exactly (case-sensitive)
2. Verify API Key and Secret are correct (no extra spaces)
3. Check Cloudinary dashboard for upload errors
4. Ensure you're not exceeding free tier limits

### Images Show "404 Not Found"?
- Old placeholder images in database still reference `demo` cloud
- Solution: Update images by re-uploading through admin panel

## Security Notes
- ✅ `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is safe to expose (public)
- ⚠️ `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are server-side only
- ✅ Already configured correctly in this project
- ✅ Upload widget uses unsigned presets (secure for client-side)

---

**Need Help?** Contact Cloudinary support or check their docs: https://cloudinary.com/documentation
