# Deploying Wayne Model to Production

The `wayne-transformed.glb` file is 171MB and too large for Git/Vercel's standard deployment.

## Solution: Host on CDN

### Option 1: GitHub Releases (Recommended - Free)

1. **Create a GitHub Release:**
   ```bash
   # Tag and create release
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Upload the GLB file:**
   - Go to: https://github.com/AirSurfer09/Metahuman_Web/releases/new
   - Create a new release with tag `v1.0.0`
   - Upload `public/Wayne/wayne-transformed.glb` as a release asset
   - Publish the release

3. **Get the download URL:**
   - After publishing, right-click the file and copy the link
   - It will be: `https://github.com/AirSurfer09/Metahuman_Web/releases/download/v1.0.0/wayne-transformed.glb`

4. **Set Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_WAYNE_MODEL_URL` = `https://github.com/AirSurfer09/Metahuman_Web/releases/download/v1.0.0/wayne-transformed.glb`
   - Redeploy

### Option 2: Cloudflare R2 (Free 10GB)

1. Sign up for Cloudflare R2
2. Upload `wayne-transformed.glb`
3. Make it public
4. Get the public URL
5. Set `VITE_WAYNE_MODEL_URL` in Vercel

### Option 3: Vercel Blob Storage

```bash
# Install Vercel CLI
npm i -g vercel

# Upload file
vercel blob put public/Wayne/wayne-transformed.glb --token YOUR_TOKEN

# Copy the URL and set as VITE_WAYNE_MODEL_URL
```

## Local Development

Local development works without any configuration - it uses `/Wayne/wayne-transformed.glb` from the `public` folder.

## How It Works

The code checks for `VITE_WAYNE_MODEL_URL`:
- **If set**: Uses the CDN URL (production)
- **If not set**: Uses local path `/Wayne/wayne-transformed.glb` (development)

```javascript
const modelUrl = import.meta.env.VITE_WAYNE_MODEL_URL || "/Wayne/wayne-transformed.glb";
const { scene } = useGLTF(modelUrl, true);
```
