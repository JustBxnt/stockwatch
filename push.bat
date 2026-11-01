@echo off
setlocal enabledelayedexpansion
title StockWatch - Git Sync ^& Push
cd /d "%~dp0"

rem Memastikan Git selalu terbaca di sistem (termasuk MinGit portable)
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "PATH=%USERPROFILE%\mingit\cmd;%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\Git\cmd;%PATH%"
)

echo ========================================================
echo        StockWatch OS - Git Auto Commit ^& Push
echo ========================================================
echo.

rem 1. Ambil status perubahan
git status --short
echo.

rem 2. Masukkan file ke staging (otomatis melewati file di .gitignore)
git add .

rem 3. Cek apakah ada perubahan baru untuk di-commit
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    set "commit_arg=%~1"
    if "!commit_arg!"=="" (
        set /p "commit_msg=Masukkan pesan commit (atau tekan Enter untuk default): "
        if "!commit_msg!"=="" (
            set "commit_msg=chore: update stockwatch codebase %date% %time%"
        )
    ) else (
        set "commit_msg=!commit_arg!"
    )
    git commit -m "!commit_msg!"
) else (
    echo Tidak ada perubahan baru yang perlu di-commit.
)

echo.
echo Mengirim (push) perubahan ke repositori GitHub...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUKSES] Seluruh update berhasil ter-push ke GitHub!
) else (
    echo [GAGAL] Terjadi kendala saat push. Pastikan koneksi internet aktif.
)
echo.
pause
