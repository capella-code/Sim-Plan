@echo off
rem Sim Plan: uygulamayi Microsoft Edge'de ayri bir pencerede acar (internet gerekmez).
rem Veriler Edge'in tarayici hafizasinda saklanir; yedek icin uygulamada Diger > Yedek al.
setlocal
set "HTML=%~dp0sim plan.html"
if not exist "%HTML%" (
  echo "sim plan.html" bu klasorde bulunamadi.
  pause
  exit /b 1
)
for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "[Uri]::new($env:HTML).AbsoluteUri"`) do set "URL=%%U"
start "" msedge --app="%URL%" --window-size=1450,920
if errorlevel 1 start "" "%HTML%"
