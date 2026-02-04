#!/usr/bin/env node
/**
 * Video Seeding Script
 * Reads videos and thumbnails from public/videos folder and stores them in MongoDB
 * 
 * Folder Structure:
 * public/videos/
 * ├── video1/
 * │   ├── video.mp4
 * │   └── thumbnail.jpg
 * ├── video2/
 * │   ├── video.mp4
 * │   └── thumbnail.jpg
 * └── ...
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/lib/mongodb.js';
import CustomVideo from './src/models/CustomVideo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_FOLDER = path.join(__dirname, 'public', 'videos');

async function seedVideos() {
  try {
    console.log('🚀 Starting video seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if videos folder exists
    if (!fs.existsSync(VIDEOS_FOLDER)) {
      console.log('📁 Videos folder does not exist yet. Creating structure...');
      fs.mkdirSync(VIDEOS_FOLDER, { recursive: true });
      console.log(`📁 Created: ${VIDEOS_FOLDER}`);
      return;
    }

    // Read all folders in videos directory
    const videoFolders = fs.readdirSync(VIDEOS_FOLDER);
    
    if (videoFolders.length === 0) {
      console.log('📭 No videos found in public/videos folder');
      console.log('📖 Please add video folders with this structure:');
      console.log('   public/videos/video1/video.mp4');
      console.log('   public/videos/video1/thumbnail.jpg');
      return;
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const folderName of videoFolders) {
      const folderPath = path.join(VIDEOS_FOLDER, folderName);
      
      // Skip if not a directory
      if (!fs.statSync(folderPath).isDirectory()) {
        continue;
      }

      // Check for video file
      const videoFiles = fs.readdirSync(folderPath).filter(file => 
        /\.(mp4|webm|avi|mov)$/i.test(file)
      );

      if (videoFiles.length === 0) {
        console.log(`⚠️  Skipped "${folderName}": No video file found`);
        skippedCount++;
        continue;
      }

      const videoFile = videoFiles[0];
      const videoPath = path.join(folderPath, videoFile);

      // Check for thumbnail
      const thumbnailFiles = fs.readdirSync(folderPath).filter(file =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
      const thumbnailFile = thumbnailFiles.length > 0 ? thumbnailFiles[0] : null;

      // Read metadata.json if exists
      const metadataPath = path.join(folderPath, 'metadata.json');
      let metadata = {};
      
      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        } catch (err) {
          console.warn(`⚠️  Could not parse metadata.json in "${folderName}"`);
        }
      }

      // Generate video ID from folder name
      const videoId = folderName.toLowerCase().replace(/\s+/g, '_');

      // Check if video already exists
      const existingVideo = await CustomVideo.findOne({ videoId });
      if (existingVideo) {
        console.log(`⏭️  Skipped "${folderName}": Already exists (videoId: ${videoId})`);
        skippedCount++;
        continue;
      }

      // Get video file size for duration estimation
      const videoStats = fs.statSync(videoPath);
      const videoSizeGB = videoStats.size / (1024 * 1024 * 1024);

      // Create video document
      const videoDoc = new CustomVideo({
        videoId,
        title: metadata.title || folderName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: metadata.description || '',
        genre: metadata.genre || 'Custom',
        thumbnail: thumbnailFile ? `/videos/${folderName}/${thumbnailFile}` : '/videos/default-thumbnail.jpg',
        videoUrl: `/videos/${folderName}/${videoFile}`,
        duration: metadata.duration || Math.round(videoSizeGB * 3600), // Rough estimate
        rating: metadata.rating || 0,
        views: 0,
        isPublic: metadata.isPublic !== false, // Default true
      });

      await videoDoc.save();
      console.log(`✅ Added: "${videoDoc.title}" (${videoFile})`);
      processedCount++;
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Processed: ${processedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log('🎉 Video seeding complete!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seeding
seedVideos().then(() => process.exit(0));
