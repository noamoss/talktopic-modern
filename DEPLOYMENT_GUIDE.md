# TalkToPic Deployment Guide

This guide provides comprehensive instructions for deploying the TalkToPic application to various hosting platforms.

## 🚀 GitHub Pages Deployment (Recommended)

GitHub Pages is the recommended deployment method as it's free, reliable, and integrates seamlessly with the repository.

### Automatic Deployment Setup

The repository is already configured with GitHub Actions for automatic deployment. Here's how to enable it:

#### Step 1: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch and **/ (root)** folder
6. Click **Save**

#### Step 2: Verify Deployment
1. GitHub will automatically build and deploy your site
2. The deployment URL will be: `https://yourusername.github.io/talktopic-modern/`
3. It may take a few minutes for the site to become available

### Manual GitHub Pages Deployment

If automatic deployment doesn't work, you can deploy manually:

```bash
# 1. Build the application
pnpm run build

# 2. Create and switch to gh-pages branch
git checkout --orphan gh-pages

# 3. Remove all files except dist
git rm -rf .
cp -r dist/* .

# 4. Add and commit the built files
git add .
git commit -m "Deploy to GitHub Pages"

# 5. Push to GitHub
git push origin gh-pages --force
```

### Custom Domain Setup (Optional)

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to your repository root with your domain name
2. Configure your domain's DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

## 🌐 Alternative Hosting Platforms

### Netlify Deployment

Netlify offers excellent support for React applications:

#### Method 1: Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm run build`
3. Set publish directory: `dist`
4. Deploy automatically on every push

#### Method 2: Manual Upload
1. Run `pnpm run build` locally
2. Drag and drop the `dist` folder to Netlify's deploy interface
3. Your site will be live immediately

### Vercel Deployment

Vercel provides seamless React deployment:

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow the prompts to configure deployment
```

#### Using Vercel Dashboard
1. Import your GitHub repository
2. Vercel automatically detects the React/Vite setup
3. Deploy with default settings

### Firebase Hosting

Firebase offers fast global CDN hosting:

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Build and deploy
pnpm run build
firebase deploy
```

#### Configuration
Create `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### AWS S3 + CloudFront

For enterprise-grade hosting:

#### S3 Setup
1. Create an S3 bucket with static website hosting enabled
2. Upload the contents of `dist` folder
3. Configure bucket policy for public read access

#### CloudFront Setup
1. Create a CloudFront distribution
2. Point origin to your S3 bucket
3. Configure custom error pages for SPA routing

## 🔧 Build Configuration

### Environment Variables

For different deployment environments, you can configure:

```bash
# Development
VITE_API_BASE_URL=http://localhost:5173

# Production
VITE_API_BASE_URL=https://yourdomain.com
```

### Vite Configuration

The `vite.config.js` is already configured for GitHub Pages:

```javascript
export default defineConfig({
  base: '/talktopic-modern/', // Change this for other platforms
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

For other platforms, set `base: '/'` or remove the base property.

## 🔍 Deployment Verification

After deployment, verify these features work correctly:

### Functional Tests
- [ ] API key input and validation
- [ ] Image upload and analysis
- [ ] Live video streaming
- [ ] Voice input and output
- [ ] Responsive design on mobile

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Image processing responsiveness
- [ ] Video frame capture smoothness
- [ ] Voice recognition accuracy

### Browser Compatibility
- [ ] Chrome (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## 🚨 Common Deployment Issues

### Issue: Site Not Loading
**Symptoms**: 404 error or blank page
**Solutions**:
- Check if GitHub Pages is enabled in repository settings
- Verify the correct branch is selected (gh-pages)
- Ensure index.html exists in the deployed files

### Issue: Assets Not Loading
**Symptoms**: CSS/JS files return 404
**Solutions**:
- Check the `base` configuration in `vite.config.js`
- Ensure relative paths are used for assets
- Verify build output includes all necessary files

### Issue: Camera/Microphone Not Working
**Symptoms**: Permissions denied or features unavailable
**Solutions**:
- Ensure deployment uses HTTPS (required for media access)
- Check browser compatibility
- Verify permissions are requested correctly

### Issue: API Calls Failing
**Symptoms**: Gemini API errors or network issues
**Solutions**:
- Verify API key is correctly entered
- Check CORS configuration if using custom domain
- Ensure API quotas are not exceeded

## 📊 Performance Optimization

### Bundle Size Optimization
```bash
# Analyze bundle size
pnpm run build
npx vite-bundle-analyzer dist

# Optimize imports
# Use dynamic imports for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Caching Strategy
- Static assets are automatically cached by most CDNs
- API responses can be cached client-side for better performance
- Service worker can be added for offline functionality

### Image Optimization
- Compress uploaded images before processing
- Use WebP format when supported
- Implement lazy loading for better performance

## 🔐 Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement key rotation policies

### Content Security Policy
Add CSP headers for enhanced security:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: blob:;
               connect-src 'self' https://generativelanguage.googleapis.com;">
```

### HTTPS Enforcement
- Always deploy with HTTPS enabled
- Use HSTS headers for additional security
- Implement proper CORS policies

## 📈 Monitoring and Analytics

### Error Tracking
Consider integrating error tracking services:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- User interaction analytics

## 🔄 Continuous Deployment

### GitHub Actions Workflow
The repository includes a GitHub Actions workflow for automatic deployment:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ master ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deployment Pipeline Best Practices
1. **Automated Testing**: Run tests before deployment
2. **Staging Environment**: Test in production-like environment
3. **Rollback Strategy**: Keep previous versions for quick rollback
4. **Health Checks**: Verify deployment success automatically

---

## 📞 Support

For deployment-specific issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Create an issue with deployment logs and error messages
4. Include platform, browser, and configuration details

**Happy Deploying! 🚀**

