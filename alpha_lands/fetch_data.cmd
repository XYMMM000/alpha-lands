@echo off
setlocal
"%~dp0..\.venv-pandadata\Scripts\python.exe" "%~dp0tools\fetch_pandadata.py" %*
set "fetch_result=%errorlevel%"
pause
exit /b %fetch_result%
