@echo off
cd /d "%~dp0"
git add src/data/*
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"
git commit -m "sam update content %datestamp%"
git push origin sam
echo Creating pull request from sam to main...
gh pr create --base main --head sam --title "Sam content update %datestamp%" --body "Automated content update from Sam on %datestamp%"
echo *************DONE*************
pause