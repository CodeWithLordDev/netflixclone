#!/usr/bin/env node

/**
 * Seed Script - Load Videos from Folder Structure
 * Usage: npm run seed:videos
 */

const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");
const { pathToFileURL } = require("url");

const PROJECT_ROOT = path.join(__dirname, "..");
loadEnvConfig(PROJECT_ROOT);

const VIDEOS_FOLDER = path.join(PROJECT_ROOT, "public", "videos");
const MONGO_URI = process.env.MONGODB_URI;

async function getCustomVideoModel() {
  const modelPath = path.join(PROJECT_ROOT, "src", "models", "CustomVideo.js");
  const modelModule = await import(pathToFileURL(modelPath).href);
  return modelModule.default;
}

async function connectDB() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is missing. Set it in .env.local");
    }

    await mongoose.connect(MONGO_URI, {
      dbName: "authdb",
      bufferCommands: false,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

async function getVideoFolders() {
  try {
    const items = await fs.readdir(VIDEOS_FOLDER, { withFileTypes: true });
    return items.filter((item) => item.isDirectory()).map((item) => item.name);
  } catch (error) {
    console.error("Error reading videos folder:", error.message);
    return [];
  }
}

async function loadVideoMetadata(folderName) {
  try {
    const metadataPath = path.join(VIDEOS_FOLDER, folderName, "metadata.json");
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);
    return Array.isArray(metadata) ? metadata : [metadata];
  } catch {
    return null;
  }
}

async function getVideoFile(folderName, videoId = null) {
  try {
    const folderPath = path.join(VIDEOS_FOLDER, folderName);
    const files = await fs.readdir(folderPath);
    const videoExtensions = [".mp4", ".webm", ".mkv", ".avi", ".mov"];

    if (videoId) {
      const matchingFile = files.find((file) => {
        const nameWithoutExt = path.parse(file).name;
        return (
          nameWithoutExt === videoId &&
          videoExtensions.some((ext) => file.toLowerCase().endsWith(ext))
        );
      });
      if (matchingFile) return `/videos/${folderName}/${matchingFile}`;
    }

    const videoFile = files.find(
      (file) =>
        videoExtensions.some((ext) => file.toLowerCase().endsWith(ext)) &&
        file !== "metadata.json"
    );

    return videoFile ? `/videos/${folderName}/${videoFile}` : null;
  } catch (error) {
    console.error(`Error reading video files from ${folderName}:`, error.message);
    return null;
  }
}

async function getThumbnailFile(folderName, videoId = null) {
  try {
    const folderPath = path.join(VIDEOS_FOLDER, folderName);
    const files = await fs.readdir(folderPath);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (videoId) {
      const matchingFile = files.find((file) => {
        const nameWithoutExt = path.parse(file).name;
        return (
          (nameWithoutExt === `${videoId}-thumb` || nameWithoutExt === videoId) &&
          imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
        );
      });
      if (matchingFile) return `/videos/${folderName}/${matchingFile}`;
    }

    const imageFile = files.find((file) =>
      imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    return imageFile ? `/videos/${folderName}/${imageFile}` : null;
  } catch {
    return null;
  }
}

function resolveThumbnailFromMetadata(folderName, thumbnailValue) {
  if (!thumbnailValue || typeof thumbnailValue !== "string") return null;

  // Absolute URL
  if (/^https?:\/\//i.test(thumbnailValue)) {
    return thumbnailValue;
  }

  // Already a public path
  if (thumbnailValue.startsWith("/")) {
    return thumbnailValue;
  }

  // Filename inside the same video folder
  return `/videos/${folderName}/${thumbnailValue}`;
}

async function seedVideos() {
  await connectDB();
  const CustomVideo = await getCustomVideoModel();
  const folderNames = await getVideoFolders();

  if (folderNames.length === 0) {
    await mongoose.disconnect();
    return;
  }

  let added = 0;
  let updated = 0;
  let failed = 0;

  for (const folderName of folderNames) {
    try {
      const metadataList = await loadVideoMetadata(folderName);
      if (!metadataList) {
        failed++;
        continue;
      }

      const videos = Array.isArray(metadataList) ? metadataList : [metadataList];

      for (const metadata of videos) {
        try {
          const videoDataId = metadata.videoId || folderName;
          const videoUrl = await getVideoFile(folderName, videoDataId);
          if (!videoUrl) {
            failed++;
            continue;
          }

          const metadataThumbnail = resolveThumbnailFromMetadata(
            folderName,
            metadata.thumbnail
          );
          const detectedThumbnail = await getThumbnailFile(folderName, videoDataId);

          const videoData = {
            videoId: videoDataId,
            title: metadata.title,
            description: metadata.description || "",
            genre: metadata.genre || "",
            thumbnail:
              metadataThumbnail ||
              detectedThumbnail ||
              `https://via.placeholder.com/400x300/1a1a1a/666?text=${encodeURIComponent(metadata.title)}`,
            videoUrl,
            duration: metadata.duration || 0,
            rating: metadata.rating || 0,
            isPublic: true,
          };

          const existing = await CustomVideo.findOne({ videoId: videoData.videoId });

          if (existing) {
            await CustomVideo.findOneAndUpdate({ videoId: videoData.videoId }, videoData, {
              new: true,
            });
            updated++;
          } else {
            await CustomVideo.create(videoData);
            added++;
          }
        } catch (error) {
          console.error(`Error processing ${folderName}:`, error.message);
          failed++;
        }
      }
    } catch (error) {
      console.error(`Folder error ${folderName}:`, error.message);
      failed++;
    }
  }

  // console.log(`Added: ${added}, Updated: ${updated}, Failed: ${failed}`);
  await mongoose.disconnect();
}

seedVideos().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
