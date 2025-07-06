@echo off
echo Starting development environment...

REM Change to the script directory
cd /d "%~dp0"

echo Current directory: %CD%

echo Pulling latest code...
git pull
if errorlevel 1 (
    echo Git pull failed. Continuing anyway...
)

echo Installing/updating dependencies...
call npm install
if errorlevel 1 (
    echo npm install failed!
    echo Please check if Node.js and npm are installed correctly.
    pause
    exit /b 1
)

echo Starting development server...
start "Dev Server" cmd /c "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak

echo Opening browser...
start "" "http://localhost:5173/soul_collection/editor"

echo Opening VS Code...
REM Try common VS Code installation paths
if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
    start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "."
) else if exist "%PROGRAMFILES%\Microsoft VS Code\Code.exe" (
    start "" "%PROGRAMFILES%\Microsoft VS Code\Code.exe" "."
) else if exist "%PROGRAMFILES(X86)%\Microsoft VS Code\Code.exe" (
    start "" "%PROGRAMFILES(X86)%\Microsoft VS Code\Code.exe" "."
) else (
    echo VS Code not found in common locations. Trying code command...
    code "."
    if errorlevel 1 (
        echo VS Code launch failed. You can manually open VS Code in this directory.
    )
)

echo Development environment started!
pause