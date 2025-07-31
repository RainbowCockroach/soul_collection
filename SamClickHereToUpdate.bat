@echo off
cd /d "%~dp0"
git add src/data/*
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"
git pull origin sam
git commit -m "sam update content %datestamp%"
git push origin sam
if %errorlevel% neq 0 (
    echo Push to sam branch failed. Stopping here.
    pause
    exit /b 1
)
git checkout main
git pull origin main
git merge sam
git push origin main
git checkout sam

echo *************DONE*************
pause