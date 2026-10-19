@echo off
title StockWatch OS - Local Server
color 0A

echo =======================================================
echo         StockWatch OS - Kulkas Pintar & AI Vision
echo =======================================================
echo.
echo [1/3] Menuju direktori proyek...
cd /d "%~dp0"

echo.
echo [2/3] Membuka browser ke http://localhost:3000 ...
start http://localhost:3000

echo.
echo [3/3] Menjalankan server Next.js lokal...
echo Tekan Ctrl + C di jendela ini jika ingin menghentikan server.
echo =======================================================
echo.

npm run start
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server production belum di-build, menjalankan mode development...
    npm run dev
)

pause
