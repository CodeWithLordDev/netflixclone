# Netflix Clone - Custom Video Feature

Complete documentation of the Custom Video feature implementation, including all steps, architecture, bugs fixed, and usage guide.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Feature Evolution](#feature-evolution)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Implementation Steps](#implementation-steps)
5. [Bug Fixes & Debugging](#bug-fixes--debugging)
6. [Current File Structure](#current-file-structure)
7. [How to Add Videos](#how-to-add-videos)
8. [API Endpoints](#api-endpoints)
9. [Running the Application](#running-the-application)
10. [Troubleshooting](#troubleshooting)

---

## 📺 Project Overview

This is a Netflix Clone built with **Next.js 16.1.4** that integrates:
- **TMDB Movies**: Third-party movie data from The Movie Database API
- **Custom Videos**: User's own videos stored locally in folders and MongoDB

### Key Features
✅ Browse TMDB movies with filtering and search  
✅ Upload and manage custom videos  
✅ Full-featured HTML5 video player with controls  
✅ Search across both TMDB and custom videos  
✅ Multiple videos in single folder  
✅ "Featured Content" row for custom videos  
✅ "My List" bookmarking system  

---

## 🔄 Feature Evolution

### Phase 1: Form-Based Approach (❌ Removed)
**Initial Implementation:**
- Created `AddVideoModal.js` component
- Form for users to fill in video details
- Form fields: title, description, genre, rating, video file upload
- Issues:
  - File upload complexity
  - Large video files in database
  - Difficult file management
  - Not scalable

### Phase 2: Folder-Based Approach (✅ Current)
**Current Implementation:**
- Videos stored in `/public/videos/{folderName}/`
- Each folder contains:
  - `metadata.json` - Video information
  - Video files (`.mp4`, `.webm`, etc.)
  - Optional thumbnail images
- Seed script reads folders and imports to MongoDB
- Benefits:
  - Simple file management
  - Videos served directly from `/public`
  - Easy to add/update/remove videos
  - Database stores only metadata
  - Scalable for large video files

---

## 🏗️ Architecture & Tech Stack

### Technology Stack
```
Frontend:
├── React 19.0.0
├── Next.js 16.1.4
├── Tailwind CSS
├── JavaScript

Backend:
├── Node.js
├── Next.js API Routes
├── MongoDB (authdb database)
├── Mongoose ODM

Tools:
├── npm / pnpm (package manager)
├── Seed script (Node.js)
├── MongoDB Atlas or Local MongoDB
```

### Database Schema - CustomVideo Model

**File:** `src/models/CustomVideo.js`

```javascript
{
  _id: ObjectId,                  // MongoDB auto-generated
  videoId: String,                // Unique identifier (required)
  title: String,                  // Video title (required)
  description: String,            // Detailed description
  genre: String,                  // Category (Tutorial, Movie, etc.)
  thumbnail: String,              // Thumbnail image URL
  videoUrl: String,               // Path to video file (required)
  duration: Number,               // Duration in seconds
  rating: Number,                 // Rating 0-10
  views: Number,                  // View count
  isPublic: Boolean,              // Public/Private flag (default: true)
  createdBy: ObjectId,            // User reference (optional)
  createdAt: Date,                // Auto-generated timestamp
  updatedAt: Date,                // Auto-generated timestamp
  __v: Number                     // Version key
}
```

### Component Architecture

```
src/app/
├── browse/page.js              # Main page, displays videos + custom videos
├── components/
│   ├── VideoPlayer.js           # Full-featured video player
│   ├── Header.js                # Navigation header
│   ├── NavBar.js                # Search/filter bar
│   ├── Row.js                   # Movie row display
│   ├── MovieCard.js             # Individual movie/video card
│   ├── MovieDetailModal.js      # Modal for movie details
│   └── ...other components
└── api/
    └── custom-videos/
        └── route.js             # Custom video API endpoints
```

---

## 📝 Implementation Steps

### Step 1: Create CustomVideo Mongoose Model
**File:** `src/models/CustomVideo.js`

```javascript
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
```

### Step 2: Create API Routes
**File:** `src/app/api/custom-videos/route.js`

- **GET** `/api/custom-videos` - Fetch all public videos
- **GET** `/api/custom-videos?search=query` - Search videos by title
- **POST** `/api/custom-videos` - Create new video (future)
- **DELETE** `/api/custom-videos/delete` - Delete video

### Step 3: Build VideoPlayer Component
**File:** `src/app/components/VideoPlayer.js`

Features:
- Play/pause controls
- Volume control with mute button
- Progress bar with seek functionality
- Current time display
- Duration display
- Fullscreen button
- Keyboard shortcuts (spacebar to play/pause)

### Step 4: Create Folder Structure
**Directory:** `public/videos/`

```
public/videos/
├── tutorial-1/
│   ├── metadata.json
│   ├── Reptile_Curssor.mp4
│   ├── 5_Ways_to_use_AI_in_Coding_Copy_these_480P.mp4
│   └── End_of_Web_Development_360P.mp4
└── (add more folders here)
```

### Step 5: Create Seed Script
**File:** `scripts/seed-videos.js`

Functions:
- `connectDB()` - Connect to MongoDB authdb
- `getVideoFolders()` - Read video folders
- `loadVideoMetadata()` - Parse metadata.json (single or array)
- `getVideoFile()` - Find video file by videoId
- `getThumbnailFile()` - Find thumbnail image
- `seedVideos()` - Main function to import all videos

### Step 6: Integrate into Browse Page
**File:** `src/app/browse/page.js`

Updates:
- Add `customVideos` state
- Add `fetchCustomVideos()` function
- Add custom video navigation tab
- Update search to filter custom videos locally
- Handle both TMDB movies (id field) and custom videos (videoId field)
- Support thumbnail URLs for custom videos

---

## 🐛 Bug Fixes & Debugging

### Bug #1: React Ref Error in VideoPlayer
**Problem:**
```
❌ Error: Cannot read property 'currentTime' of undefined
```

**Cause:** Accessing `videoRef.current.currentTime` during render, which is not allowed in React.

**Solution:** Store `currentTime` in state instead of accessing ref during render.

**Code:**
```javascript
const [currentTime, setCurrentTime] = useState(0);

// ❌ Wrong (in render):
const time = videoRef.current.currentTime;

// ✅ Correct (in event handler):
const handleTimeUpdate = () => {
  setCurrentTime(videoRef.current.currentTime);
};
```

---

### Bug #2: Variable Shadowing in Seed Script
**Problem:**
```javascript
let updated = 0;
const updated = await CustomVideo.findOne(...); // ❌ Shadowing!
updated++;  // ❌ Cannot increment object
```

**Cause:** Variable name reuse (`updated` for both counter and database record).

**Solution:** Rename database variable.

**Code:**
```javascript
let added = 0;
let updated = 0;
let failed = 0;

// ✅ Correct:
const existingRecord = await CustomVideo.findOne({ videoId: videoData.videoId });
if (existingRecord) {
  const updatedRecord = await CustomVideo.findOneAndUpdate(...);
  updated++;
}
```

**Commit:**
- Line 202 in seed-videos.js fixed

---

### Bug #3: ⚠️ CRITICAL - Database Connection Mismatch
**Problem:**
```
❌ API Returns: "All videos in DB: 0"
✅ Seed Script Shows: "✅ Updated: 1"
```

Both operations claimed success but:
- Seed script was saving to database: `mongodb://localhost:27017/netflix-clone`
- API was querying database: `mongodb://localhost:27017/authdb`

**Root Cause:** Two different database names in the same MongoDB server.

**Solution:** Update seed script to use same database as API.

**Files Changed:**

1. **scripts/seed-videos.js** - Line 16
```javascript
// ❌ Before:
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix-clone';

// ✅ After:
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin%4009%24code@cluster0.lvbkyrh.mongodb.net/authdb';
```

2. **scripts/seed-videos.js** - connectDB function
```javascript
// ✅ After:
await mongoose.connect(MONGO_URI, {
  dbName: "authdb",
  bufferCommands: false,
});
```

**Debugging Steps Taken:**
1. Added console.log to API endpoint to show video count
2. Added console.log to browse page to show fetched videos
3. Ran seed script and saw database save confirmation
4. Checked API response - saw empty array
5. Examined seed script MONGO_URI - found mismatch
6. Fixed both MONGO_URI default and dbName parameter
7. Re-ran seed script - videos now save to correct database

---

### Bug #4: Videos Not Appearing in UI
**Problem:**
```
❌ "Featured Content" row doesn't show
❌ Custom videos don't appear in search
❌ Debug: "Custom Videos Loaded: 0"
```

**Cause:** Chain reaction from Bug #3 - videos in wrong database.

**Solution:** Fixed with Bug #3 fix + browse page integration.

**Related Changes in browse/page.js:**
```javascript
// Added:
const [customVideos, setCustomVideos] = useState([]);

// New function:
const fetchCustomVideos = async () => {
  const response = await fetch(`/api/custom-videos`);
  const data = await response.json();
  setCustomVideos(data);
  console.log(`✅ Fetched custom videos - Count: ${data.length}`);
};

// Updated MovieRow/MovieGrid:
const movieId = movie.videoId || movie.id;
const posterPath = movie.thumbnail || `/images/tmdb_${movie.id}.jpg`;
```

---

## 📁 Current File Structure

### Core Files Created/Modified

```
d:\Sigma web\Project\Websites\Netflix_Clone\Frontend\my-app\

├── scripts/
│   └── seed-videos.js                    # ✅ Seed script for importing videos

├── src/
│   ├── models/
│   │   └── CustomVideo.js                # ✅ Mongoose schema for videos
│   ├── app/
│   │   ├── api/
│   │   │   └── custom-videos/
│   │   │       └── route.js              # ✅ API endpoints
│   │   ├── components/
│   │   │   ├── VideoPlayer.js            # ✅ Video player component
│   │   │   └── (other components)
│   │   └── browse/
│   │       └── page.js                   # ✅ Main page with custom video integration
│   └── lib/
│       └── mongodb.js                    # Database connection config

├── public/
│   └── videos/
│       └── tutorial-1/
│           ├── metadata.json             # ✅ Video metadata (array)
│           ├── Reptile_Curssor.mp4
│           ├── 5_Ways_to_use_AI_in_Coding_Copy_these_480P.mp4
│           └── End_of_Web_Development_360P.mp4

├── package.json                          # ✅ Added seed:videos script
├── README.md                             # Original readme
└── README_CUSTOM_VIDEOS.md               # This file
```

---

## 🎬 How to Add Videos

### Method 1: Add to Existing Folder (tutorial-1)

**Step 1:** Create your video files
- Place in `public/videos/tutorial-1/`
- Name format: `{videoId}.mp4`

**Step 2:** Update metadata.json
```json
[
  {
    "videoId": "MyNewVideo",
    "title": "My New Video Title",
    "description": "Detailed description",
    "genre": "Tutorial",
    "rating": 9.0,
    "duration": 600
  },
  // ... other videos
]
```

**Step 3:** Run seed script
```bash
npm run seed:videos
```

### Method 2: Create New Folder

**Step 1:** Create folder structure
```
public/videos/
├── nodejs-series/
│   ├── metadata.json
│   ├── EventLoop.mp4
│   ├── Streams.mp4
│   └── Clusters.mp4
```

**Step 2:** Create metadata.json with array
```json
[
  {
    "videoId": "EventLoop",
    "title": "Node.js Event Loop",
    "description": "...",
    "genre": "Tutorial",
    "rating": 9.5,
    "duration": 890
  },
  {
    "videoId": "Streams",
    "title": "Node.js Streams",
    "description": "...",
    "genre": "Tutorial",
    "rating": 9.2,
    "duration": 720
  },
  {
    "videoId": "Clusters",
    "title": "Node.js Clusters",
    "description": "...",
    "genre": "Tutorial",
    "rating": 8.9,
    "duration": 1050
  }
]
```

**Step 3:** Run seed script
```bash
npm run seed:videos
```

---

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/api/custom-videos
```

### Endpoints

#### 1. Get All Videos
```http
GET /api/custom-videos
```

**Response:**
```json
[
  {
    "_id": "697ba7553d369521cc863198",
    "videoId": "Reptile_Curssor",
    "title": "Web Development Cursor Complete Guide",
    "description": "Learn full-stack...",
    "genre": "Tutorial",
    "thumbnail": "https://...",
    "videoUrl": "/videos/tutorial-1/Reptile_Curssor.mp4",
    "duration": 780,
    "rating": 9.5,
    "views": 0,
    "isPublic": true,
    "createdAt": "2026-01-29T18:27:24.823Z",
    "updatedAt": "2026-01-29T18:27:24.823Z"
  },
  // ... more videos
]
```

---

#### 2. Search Videos
```http
GET /api/custom-videos?search=react
```

**Response:** Filtered by title/description/genre

---

#### 3. Create Video (POST)
```http
POST /api/custom-videos
Content-Type: application/json

{
  "videoId": "new_video",
  "title": "New Video",
  "description": "...",
  "videoUrl": "/videos/folder/video.mp4",
  "duration": 600
}
```

**Response:** Created video document with ObjectId

---

#### 4. Delete Video
```http
DELETE /api/custom-videos/delete?videoId=Reptile_Curssor
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "deletedCount": 1
}
```

---

## 🚀 Running the Application

### Prerequisites
```bash
# Node.js 18+
# npm or pnpm
# MongoDB (local or Atlas)
```

### Setup

**1. Install Dependencies**
```bash
npm install
# or
pnpm install
```

**2. Configure Environment Variables**

Create `.env.local`:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/authdb

# TMDB API Key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret
```

**3. Add Videos**

Place videos in `public/videos/{folderName}/` with `metadata.json`

**4. Seed Database**
```bash
npm run seed:videos
```

**Output should show:**
```
✅ Connected to MongoDB (authdb)
📂 Reading videos from folder...
✅ Found 1 video folder(s)

📹 Processing folder: tutorial-1
   📺 Video: Reptile_Curssor - "Web Development Cursor Complete Guide"
      ✅ Updated: Web Development Cursor Complete Guide
```

**5. Run Development Server**
```bash
npm run dev
```

**6. Open in Browser**
```
http://localhost:3000/browse
```

---

## 🔍 Troubleshooting

### Issue: Videos Not Appearing

**Check 1: API Response**
```bash
curl http://localhost:3000/api/custom-videos
```

Should return array of videos. If empty:

**Check 2: Database Connection**
```bash
# Verify MongoDB is running
mongosh

# Check database name
show databases

# Check authdb
use authdb
db.customvideos.find()
```

**Check 3: Seed Script Output**
```bash
npm run seed:videos
```

Look for:
- ✅ Connected to MongoDB (authdb)
- ✅ Found X video folder(s)
- ✅ Updated/Added X videos

**Check 4: File Paths**
- Videos in `public/videos/{folderName}/`
- metadata.json exists
- Video files have correct extensions (.mp4, .webm, etc.)

---

### Issue: Videos Fail to Seed

**Error: "No metadata.json found"**
- Ensure `metadata.json` exists in folder
- Validate JSON syntax (use jsonlint.com)

**Error: "No video file found"**
- Ensure video file name matches `videoId`
- Or place video file with supported extension (.mp4, .webm, .mkv, .avi, .mov)

**Error: "Connection refused"**
```bash
# Start MongoDB
mongod

# Or verify Atlas connection string in .env.local
```

---

### Issue: "EADDRINUSE: address already in use :::3000"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

### Issue: Videos Show But Don't Play

**Check 1: Video URL in browser console**
- Should be `/videos/{folderName}/{videoName}.mp4`
- Should not be 404

**Check 2: CORS Issues**
- Videos served from `/public` - no CORS needed

**Check 3: Browser console errors**
- Open DevTools (F12)
- Check Console tab for JavaScript errors

---

## ✨ Summary: What Was Built

### Phase 1: Initial Setup ✅
- ✅ Created CustomVideo MongoDB model
- ✅ Created API endpoints for CRUD operations
- ✅ Created VideoPlayer React component with full controls
- ✅ Created folder structure for videos

### Phase 2: Core Functionality ✅
- ✅ Integrated custom videos into browse page
- ✅ Added "Featured Content" row for custom videos
- ✅ Implemented search across custom videos
- ✅ Created seed script to import videos from folders
- ✅ Added support for multiple videos per folder

### Phase 3: Bug Fixes ✅
- ✅ Fixed React ref error in VideoPlayer (currentTime state)
- ✅ Fixed variable shadowing in seed script (updated counter)
- ✅ Fixed critical database connection mismatch (authdb)
- ✅ Fixed videos not appearing in UI (result of above)
- ✅ Enhanced error handling in seed script

### Features Available Now ✅
- ✅ Browse TMDB movies + custom videos
- ✅ Search both video sources
- ✅ Full-featured video player
- ✅ Multiple videos in single folder
- ✅ Auto metadata parsing from JSON
- ✅ Auto video/thumbnail file matching
- ✅ Add/update videos via seed script
- ✅ Delete videos via API

---

## 📞 Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Seed videos from folders to database
npm run seed:videos

# Build for production
npm run build

# Start production server
npm start

# Check for linting errors
npm run lint

# Format code
npm run format
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Mongoose Guide](https://mongoosejs.com)
- [HTML5 Video API](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [TMDB API Documentation](https://developer.themoviedb.org)

---

**Last Updated:** January 30, 2026  
**Version:** 1.0 (Custom Videos Feature Complete)  
**Status:** Production Ready ✅
