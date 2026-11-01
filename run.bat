@echo off
setlocal enabledelayedexpansion

title StockWatch OS
cd /d "%~dp0"

echo StockWatch OS Launcher
echo ---------------------
echo.

rem Verifikasi ketersediaan Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak ditemukan di PATH sistem.
    echo Unduh dan instal Node.js terlebih dahulu melalui https://nodejs.org/
    echo.
    pause
    exit /b 1
)

rem Verifikasi ketersediaan npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm tidak ditemukan di PATH sistem.
    echo.
    pause
    exit /b 1
)

rem Verifikasi dependensi proyek
if not exist "node_modules\next\" (
    echo Dependensi belum terpasang lengkap. Menjalankan npm install...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Gagal memasang dependensi proyek.
        echo.
        pause
        exit /b 1
    )
    echo Dependensi berhasil dipasang.
    echo.
)

rem Verifikasi file environment
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo File .env.local tidak ditemukan. Menyalin dari .env.local.example...
        copy ".env.local.example" ".env.local" >nul
        echo File .env.local berhasil dibuat.
        echo.
    )
)

rem Tangani opsi bantuan dan pemeriksaan
if /i "%~1"=="--help" goto show_help
if /i "%~1"=="-h" goto show_help
if /i "%~1"=="check" (
    echo Seluruh pengecekan lingkungan sistem dan dependensi selesai tanpa kendala.
    exit /b 0
)
if /i "%~1"=="build" (
    echo Menjalankan production build...
    call npm run build
    exit /b %ERRORLEVEL%
)

rem Buka browser di latar belakang setelah jeda inisialisasi server
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

rem Jalankan server
if /i "%~1"=="prod" (
    if not exist ".next\BUILD_ID" (
        echo Menyiapkan production build terlebih dahulu...
        call npm run build
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Proses build gagal.
            echo.
            pause
            exit /b 1
        )
    )
    echo Menjalankan production server di http://localhost:3000...
    echo Tekan Ctrl + C untuk menghentikan server.
    echo.
    call npm run start
) else (
    echo Menjalankan development server di http://localhost:3000...
    echo Tekan Ctrl + C untuk menghentikan server.
    echo.
    call npm run dev
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server berhenti dengan kode status: %ERRORLEVEL%
    pause
)
exit /b 0

:show_help
echo Penggunaan:
echo   run.bat          Menjalankan server development (default)
echo   run.bat prod     Menjalankan server production (otomatis build bila belum ada)
echo   run.bat build    Melakukan proses build Next.js
echo   run.bat check    Memeriksa kesiapan sistem tanpa menyalakan server
echo.
exit /b 0
