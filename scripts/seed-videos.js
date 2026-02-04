#!/usr/bin/env node

/**
 * Seed Script - Load Videos from Folder Structure
 * 
 * This script reads video metadata from the public/videos folder
 * and imports them into MongoDB database.
 * 
 * Usage: npm run seed:videos
 */

const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const VIDEOS_FOLDER = path.join(__dirname, '..', 'public', 'videos');
// Match the API's database name "authdb"
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin%4009%24code@cluster0.lvbkyrh.mongodb.net/authdb';

// Define CustomVideo schema inline
const customVideoSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    genre: String,
    thumbnail: String,
    videoUrl: {
      type: String,
      required: true,
    },
    duration: Number,
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const CustomVideo = mongoose.models.CustomVideo || mongoose.model('CustomVideo', customVideoSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "authdb",
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB (authdb)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function getVideoFolders() {
  try {
    const items = await fs.readdir(VIDEOS_FOLDER, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory())
      .map(item => item.name);
  } catch (error) {
    console.error('❌ Error reading videos folder:', error.message);
    return [];
  }
}

async function loadVideoMetadata(folderName) {
  try {
    const metadataPath = path.join(VIDEOS_FOLDER, folderName, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    // If metadata is an array, return it (multiple videos in one folder)
    // If metadata is an object, return as array with single item (single video)
    return Array.isArray(metadata) ? metadata : [metadata];
  } catch (error) {
    console.warn(`⚠️  No metadata.json found for ${folderName}`);
    return null;
  }
}

async function getVideoFile(folderName, videoId = null) {
  try {
    const folderPath = path.join(VIDEOS_FOLDER, folderName);
    const files = await fs.readdir(folderPath);
    
    // Look for common video file extensions
    const videoExtensions = ['.mp4', '.webm', '.mkv', '.avi', '.mov'];
    
    // If videoId provided, look for {videoId}.{ext} pattern first
    if (videoId) {
      const matchingFile = files.find(file => {
        const nameWithoutExt = path.parse(file).name;
        return nameWithoutExt === videoId && 
               videoExtensions.some(ext => file.toLowerCase().endsWith(ext));
      });
      if (matchingFile) return `/videos/${folderName}/${matchingFile}`;
    }
    
    // Fallback: find any video file
    const videoFile = files.find(file => 
      videoExtensions.some(ext => file.toLowerCase().endsWith(ext)) &&
      file !== 'metadata.json'
    );
    
    return videoFile ? `/videos/${folderName}/${videoFile}` : null;
  } catch (error) {
    console.error(`❌ Error reading video files from ${folderName}:`, error.message);
    return null;
  }
}

async function getThumbnailFile(folderName, videoId = null) {
  try {
    const folderPath = path.join(VIDEOS_FOLDER, folderName);
    const files = await fs.readdir(folderPath);
    
    // Look for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // If videoId provided, look for {videoId}-thumb.{ext} or {videoId}.{ext} pattern
    if (videoId) {
      const matchingFile = files.find(file => {
        const nameWithoutExt = path.parse(file).name;
        return (nameWithoutExt === `${videoId}-thumb` || nameWithoutExt === videoId) && 
               imageExtensions.some(ext => file.toLowerCase().endsWith(ext));
      });
      if (matchingFile) return `/videos/${folderName}/${matchingFile}`;
    }
    
    // Fallback: find any image file
    const imageFile = files.find(file => 
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    
    return imageFile ? `/videos/${folderName}/${imageFile}` : null;
  } catch (error) {
    console.warn(`⚠️  No thumbnail found for ${folderName}`);
    return null;
  }
}

async function seedVideos() {
  await connectDB();
  
  console.log('\n📂 Reading videos from folder...');
  const folderNames = await getVideoFolders();
  
  if (folderNames.length === 0) {
    console.log('⚠️  No video folders found in public/videos/');
    mongoose.disconnect();
    return;
  }
  
  console.log(`✅ Found ${folderNames.length} video folder(s)\n`);
  
  let added = 0;
  let updated = 0;
  let failed = 0;
  
  // Clear existing videos (optional - comment out to keep existing)
  // await CustomVideo.deleteMany({});
  // console.log('🗑️  Cleared existing videos\n');
  
  for (const folderName of folderNames) {
    try {
      console.log(`📹 Processing folder: ${folderName}`);
      
      // Load metadata (can be single object or array of videos)
      const metadataList = await loadVideoMetadata(folderName);
      if (!metadataList) {
        console.log(`   ⚠️  Skipping - no metadata.json\n`);
        failed++;
        continue;
      }

      // Ensure it's an array
      const videos = Array.isArray(metadataList) ? metadataList : [metadataList];
      
      // Process each video in the folder
      for (const metadata of videos) {
        try {
          console.log(`   📺 Video: ${metadata.videoId} - "${metadata.title}"`);
          
          // Get video file
          const videoUrl = await getVideoFile(folderName, metadata.videoId);
          if (!videoUrl) {
            console.log(`      ⚠️  Skipping - no video file found\n`);
            failed++;
            continue;
          }
          
          // Get thumbnail
          const thumbnail = await getThumbnailFile(folderName, metadata.videoId);
          
          // Prepare video data
          const videoData = {
            videoId: metadata.videoId || folderName,
            title: metadata.title,
            description: metadata.description || '',
            genre: metadata.genre || '',
            thumbnail: thumbnail || `https://via.placeholder.com/400x300/1a1a1a/666?text=${encodeURIComponent(metadata.title)}`,
            videoUrl: videoUrl,
            duration: metadata.duration || 0,
            rating: metadata.rating || 0,
            isPublic: true,
          };
          
          // Check if video already exists
          const existing = await CustomVideo.findOne({ videoId: videoData.videoId });
          
          if (existing) {
            // Update existing
            try {
              const updatedRecord = await CustomVideo.findOneAndUpdate(
                { videoId: videoData.videoId },
                videoData,
                { new: true }
              );
              console.log(`      ✅ Updated: ${videoData.title}`);
              updated++;
            } catch (err) {
              console.error(`      ❌ Update Error:`, err.message);
              failed++;
            }
          } else {
            // Create new
            try {
              const newVideo = new CustomVideo(videoData);
              const savedVideo = await newVideo.save();
              console.log(`      ✅ Added: ${videoData.title}`);
              added++;
            } catch (err) {
              console.error(`      ❌ Save Error:`, err.message);
              failed++;
            }
          }
          
          console.log(`      📺 Video URL: ${videoUrl}`);
          console.log(`      🖼️  Thumbnail: ${videoData.thumbnail}\n`);
          
        } catch (error) {
          console.error(`      ❌ Error: ${error.message}\n`);
          failed++;
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Added: ${added}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}\n`);
  
  mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB\n');
}

// Run seed
seedVideos().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
