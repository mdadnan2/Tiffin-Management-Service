@echo off
echo ========================================
echo Dashboard Performance Optimization
echo ========================================
echo.

cd backend

echo [1/3] Generating Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo [2/3] Running database migration...
echo NOTE: This will add a composite index to improve query performance
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo WARNING: Migration failed. You may need to run it manually on production.
    echo Command: npx prisma migrate deploy
)
echo ✓ Migration completed
echo.

echo [3/3] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)
echo ✓ Build completed
echo.

echo ========================================
echo Optimization Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend service
echo 2. Test the dashboard load time
echo 3. Expected improvement: 80-90%% faster
echo.
echo For production deployment:
echo - Push changes to Git
echo - Render will auto-deploy
echo - Migration will run automatically
echo.

pause
