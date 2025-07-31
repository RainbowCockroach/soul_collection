@echo off
cd /d "%~dp0"
git add src/data/*
git pull origin sam
git commit -m "sam update content"
git push origin sam
git stash
git checkout main
git pull origin main
git merge sam
git push origin main
git checkout sam
git pull origin sam
git stash pop

echo *************DONE*************
pause