@echo off
setlocal
set "ROOT=%~dp0.."
node "%ROOT%\cli\dist\cli.js" %*
