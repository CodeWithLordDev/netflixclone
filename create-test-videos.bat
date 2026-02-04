@echo off
REM Create test video files for each folder
setlocal enabledelayedexpansion

set "VIDEOS_DIR=D:\Sigma web\Project\Websites\Netflix_Clone\Frontend\my-app\public\videos"

echo Creating test video files...

REM Check if ffmpeg exists
where ffmpeg >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ ffmpeg found, creating test videos...
    
    REM Create test video for action-movie-1
    cd /d "%VIDEOS_DIR%\action-movie-1"
    ffmpeg -f lavfi -i color=c=red:s=640x480:d=3 -f lavfi -i sine=f=1000:d=3 -pix_fmt yuv420p video.mp4 -y
    
    REM Create test video for tutorial-1
    cd /d "%VIDEOS_DIR%\tutorial-1"
    ffmpeg -f lavfi -i color=c=blue:s=640x480:d=3 -f lavfi -i sine=f=1000:d=3 -pix_fmt yuv420p video.webm -y
    
    echo ✅ Test videos created!
) else (
    echo ❌ ffmpeg not found
    echo Please either:
    echo   1. Install ffmpeg: https://ffmpeg.org/download.html
    echo   2. Add your own video files to the folders manually
)

pause
