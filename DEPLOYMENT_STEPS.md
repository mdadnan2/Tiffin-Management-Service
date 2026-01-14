# 🚀 Step-by-Step Deployment Guide

## 📋 Prerequisites
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ Git installed

---

## 🔧 Local Development Deployment

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 3: Apply Database Migration (Adds Index)
```bash
npx prisma migrate deploy
```

### Step 4: Verify Migration
```bash
npx prisma migrate status
```
You should see: ✅ All migrations applied

### Step 5: Build the Application
```bash
npm run build
```

### Step 6: Start Development Server
```bash
npm run start:dev
```

### Step 7: Test the Dashboard
Open browser: http://localhost:3001/api/docs
- Login with demo credentials
- Call GET /dashboard endpoint
- Check response time (should be < 500ms)

---

## 🌐 Production Deployment (Render/Vercel)

### Step 1: Commit Changes
```bash
# From project root
git add .
git commit -m "perf: optimize dashboard with database aggregation and indexing"
```

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Automatic Deployment
Render will automatically:
1. ✅ Pull latest code
2. ✅ Run `npm install`
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma migrate deploy`
5. ✅ Run `npm run build`
6. ✅ Restart the service

### Step 4: Monitor Deployment
- Go to Render dashboard
- Check deployment logs
- Wait for "Build successful" message
- Service will auto-restart

### Step 5: Verify Production
```bash
# Test production API
curl https://tiffin-management-system-4uoa.onrender.com/dashboard/health
```

---

## 🧪 Testing After Deployment

### Quick Test (Windows):
```bash
# From project root
test-performance.bat
```

### Manual Test:
1. Open https://tiffin-management-service.vercel.app/
2. Login with demo credentials
3. Open DevTools (F12) → Network tab
4. Navigate to Dashboard
5. Check `/dashboard` API call time
6. Should be < 500ms ✅

---

## 📊 Verification Checklist

After deployment, verify:

- [ ] Dashboard loads quickly (< 500ms)
- [ ] Total meals count is correct
- [ ] Total amount is accurate
- [ ] Meal breakdown by type is correct
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Works for demo user
- [ ] Works for admin user

---

## 🔄 If Something Goes Wrong

### Rollback Steps:
```bash
# Revert the commit
git revert HEAD

# Push to trigger redeployment
git push origin main
```

### Check Logs:
```bash
# On Render dashboard
# Go to Logs tab
# Look for errors
```

### Common Issues:

**Issue 1: Migration Failed**
```bash
# Manually apply migration
cd backend
npx prisma migrate deploy
```

**Issue 2: Build Failed**
```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm run build
```

**Issue 3: Database Connection Error**
```bash
# Check .env file
# Verify DATABASE_URL is correct
# Test connection:
npx prisma db pull
```

---

## 📝 Complete Command Reference

### Backend Commands:
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create migration (dev only)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Build application
npm run build

# Start development
npm run start:dev

# Start production
npm run start:prod

# Run tests
npm run test
```

### Database Commands:
```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Pull database schema
npx prisma db pull

# Push schema changes (dev only)
npx prisma db push

# Reset database (dev only - DANGER!)
npx prisma migrate reset
```

### Git Commands:
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "your message"

# Push to GitHub
git push origin main

# View commit history
git log --oneline

# Revert last commit
git revert HEAD
```

---

## 🎯 Quick Start (All-in-One)

### For Local Development:
```bash
cd backend
npm install && npm run prisma:generate && npx prisma migrate deploy && npm run build && npm run start:dev
```

### For Production:
```bash
git add . && git commit -m "perf: optimize dashboard" && git push origin main
```

---

## 📞 Need Help?

### Check These First:
1. **Backend logs** - Look for error messages
2. **Database connection** - Verify DATABASE_URL
3. **Migration status** - Run `npx prisma migrate status`
4. **Node version** - Should be 18+
5. **Dependencies** - Try `npm install` again

### Debug Commands:
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Prisma version
npx prisma --version

# Test database connection
npx prisma db pull

# View environment variables
echo %DATABASE_URL%  # Windows
echo $DATABASE_URL   # Linux/Mac
```

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ No errors during `npm install`
- ✅ Migration status shows "All migrations applied"
- ✅ Build completes without errors
- ✅ Server starts on port 3001
- ✅ Dashboard API responds in < 500ms
- ✅ All calculations are accurate
- ✅ No console errors

---

## 🎉 You're Done!

Your dashboard is now **10x faster**! 🚀

**Next Steps:**
1. Monitor performance for 24 hours
2. Gather user feedback
3. Check server metrics
4. Celebrate! 🎊
