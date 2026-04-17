# GigShield - Deployment Guide

---

## 🚀 Quick Deploy

### Method 1: Commit Message (Quick)

```bash
git add .
git commit -m "deploy"
git push
```

### Method 2: Deploy Hook (No Git)

Open this URL in browser:

```
https://api.vercel.com/v1/integrations/deploy/prj_IGBjjwIWj873Llg5mqlyDIqUAZMd/ClZ9NyVVCp
```

### Method 3: Vercel CLI (Recommended)

```bash
vercel --prod
```

---

## 📋 Detailed Instructions

### Method 1: Commit Message

**Setup**: The repository is configured to deploy ONLY when commit message contains "deploy".

```bash
# Make your changes
git add .
git commit -m "deploy"
git push
```

✅ Triggers deployment automatically  
❌ Any other commit message will NOT deploy

---

### Method 2: Deploy Hook

**Setup**: A pre-configured deploy hook exists.

**URL**:

```
https://api.vercel.com/v1/integrations/deploy/prj_IGBjjwIWj873Llg5mqlyDIqUAZMd/ClZ9NyVVCp
```

**Usage**: Simply open this URL in your browser to trigger deployment.

✅ No Git required  
✅ Works instantly  
✅ Great for quick testing

---

### Method 3: Vercel CLI

**Install CLI** (if not installed):

```bash
npm i -g vercel
```

**Deploy to Production**:

```bash
vercel --prod
```

✅ Most professional workflow  
✅ Full control over deployment  
✅ No commit message restrictions

---

## 🔄 Deployment Workflow

### Standard Workflow

```bash
# 1. Make code changes
# ... edit files ...

# 2. Commit (will NOT deploy)
git add .
git commit -m "Your feature description"

# 3. When ready to deploy
git commit --amend -m "deploy"
git push
# OR use Method 2/3
```

### Production Deployment Checklist

- [ ] Code changes complete
- [ ] Tested locally (`npm run dev`)
- [ ] No TypeScript errors
- [ ] README updated (if needed)
- [ ] Deploy using preferred method
- [ ] Verify on production URL

---

## 🌐 Production URL

```
https://guidewire.vercel.app
```

---

## ⚙️ Vercel Configuration

### Project Settings

- **Framework**: Next.js
- **Root Directory**: `.` (project root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Environment Variables

None required for demo (using in-memory store).

---

## 🔧 Local Development

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npx tsc --noEmit
```

---

## 📁 File Structure

```
F:\Projects\Guidewire\
├── src/                    # Next.js app
├── public/                 # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🔒 Security Notes

### Current Setup

- In-memory data store (resets on server restart)
- No production database
- Simulated payment processing

### For Production

- Add database (PostgreSQL/MongoDB)
- Implement real payment gateway
- Add authentication
- Set up environment variables

---

## ❓ Troubleshooting

### Deployment Failed

1. Check build errors: `npm run build`
2. Check TypeScript: `npx tsc --noEmit`
3. Verify imports and dependencies

### Data Not Persisting

- Normal behavior (in-memory store)
- Data resets on every deployment
- For persistence, add database

### API Routes Not Working

1. Verify Next.js version compatibility
2. Check route file structure
3. Test locally first

---

## 📞 Vercel Support

- **Docs**: https://vercel.com/docs
- **Dashboard**: https://vercel.com/dashboard
- **Support**: https://vercel.com/help

---

_Last Updated: March 20, 2026_
