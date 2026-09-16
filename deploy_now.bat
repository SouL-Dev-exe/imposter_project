@echo off
echo ========================================================
echo Pushing Imposter Project to GitHub & Deploying Live Site
echo ========================================================
echo.
git push -u origin main
echo.
echo Deploying to GitHub Pages...
npm run deploy
echo.
echo ========================================================
echo Done! Check your live site at:
echo https://SouL-Dev-exe.github.io/imposter_project/
echo ========================================================
pause
