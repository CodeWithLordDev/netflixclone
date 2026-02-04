#!/usr/bin/env node
/**
 * Create simple test video files using FFmpeg
 * This creates minimal MP4 files for testing the seed script
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');

// Check if ffmpeg is available
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

// Create a test video file
function createTestVideo(folderPath, filename, videoFormat = 'mp4') {
  const outputPath = path.join(folderPath, filename);
  
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping (already exists): ${filename}`);
    return true;
  }
  
  try {
    console.log(`📹 Creating: ${filename}`);
    
    // Create a 3-second test video with blue color and sine wave audio
    const cmd = `ffmpeg -f lavfi -i color=c=blue:s=640x480:d=3 -f lavfi -i sine=f=1000:d=3 -pix_fmt yuv420p -y "${outputPath}" 2>nul`;
    
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ Created: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🎬 Test Video File Creator\n');
  
  if (!checkFFmpeg()) {
    console.error('❌ ffmpeg not found!');
    console.error('\nPlease install ffmpeg:');
    console.error('  Windows: https://ffmpeg.org/download.html');
    console.error('  Mac: brew install ffmpeg');
    console.error('  Linux: sudo apt-get install ffmpeg');
    console.error('\nOr add video files manually to:');
    console.error(`  ${VIDEOS_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error(`❌ Videos directory not found: ${VIDEOS_DIR}`);
    process.exit(1);
  }
  
  const videos = [
    { folder: 'action-movie-1', file: 'video.mp4' },
    { folder: 'tutorial-1', file: 'video.webm' },
  ];
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log('Creating test videos...\n');
  
  videos.forEach(({ folder, file }) => {
    const folderPath = path.join(VIDEOS_DIR, folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Folder not found: ${folder}`);
      failed++;
      return;
    }
    
    if (createTestVideo(folderPath, file)) {
      created++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (created > 0) {
    console.log('\n✅ Done! Now run: npm run seed:videos');
  }
}

main();
