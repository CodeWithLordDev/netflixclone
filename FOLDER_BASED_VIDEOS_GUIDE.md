# 🎬 Folder-Based Videos Implementation Guide

## Overview

This Netflix Clone now uses a **folder-based system** for custom videos. Instead of adding videos through a form UI, you:

1. **Create folders** in `public/videos/` with your videos
2. **Add metadata.json** describing each video
3. **Run a seed script** to import into MongoDB
4. **Videos appear** in your Netflix Clone alongside TMDB movies

## ✨ Key Features

✅ **No UI form needed** - Organize videos in folders
✅ **Automatic thumbnail handling** - Uses provided or generates placeholder
✅ **Bulk import** - Import multiple videos at once
✅ **Easy updates** - Edit metadata and re-run seed script
✅ **Merged search** - Search custom videos + TMDB movies together
✅ **Full-featured player** - Play custom videos with controls
✅ **Mobile responsive** - Works on all devices

## 📂 Project Structure

```
my-app/
├── public/
│   └── videos/                    ← Add your videos here
│       ├── action-movie-1/
│       │   ├── metadata.json
│       │   ├── video.mp4
│       │   └── thumbnail.jpg
│       └── tutorial-1/
│           ├── metadata.json
│           └── lecture.webm
│
├── scripts/
│   └── seed-videos.js             ← Seed script
│
├── src/
│   ├── models/
│   │   └── CustomVideo.js         ← Database model
│   └── app/
│       ├── api/
│       │   └── custom-videos/     ← API endpoints
│       └── components/
│           └── VideoPlayer.js     ← Video player
│
└── package.json                   ← Has "seed:videos" script
```

## 🚀 Quick Start

### Step 1: Create Video Folder

```bash
mkdir public/videos/my-awesome-video
cd public/videos/my-awesome-video
```

### Step 2: Add metadata.json

```json
{
  "videoId": "my-awesome-video",
  "title": "My Awesome Video",
  "description": "A description of my video",
  "genre": "Action",
  "rating": 8.5,
  "duration": 3600
}
```

### Step 3: Add Video File

```bash
# Copy your video to the folder
cp /path/to/video.mp4 .

# Optionally add thumbnail
cp /path/to/thumbnail.jpg .
```

### Step 4: Run Seed Script

```bash
npm run seed:videos
```

Output will be like:
```
✅ Connected to MongoDB
📂 Reading videos from folder...
✅ Found 2 video folder(s)

📹 Processing: action-movie-1
   ✅ Added: Amazing Action Adventure
   📺 Video URL: /videos/action-movie-1/video.mp4
   🖼️  Thumbnail: /videos/action-movie-1/thumbnail.jpg

📹 Processing: tutorial-1
   ✅ Added: Web Development Complete Guide
   📺 Video URL: /videos/tutorial-1/lecture.webm
   🖼️  Thumbnail: (placeholder)

📊 Summary:
   ✅ Added: 2
   🔄 Updated: 0
   ❌ Failed: 0
```

### Step 5: View in App

Your videos now appear:
- **Home page** - "Featured Content" section
- **Search** - Search by title, description, or genre
- **My Videos tab** - Browse all custom videos

## 📝 metadata.json Format

```json
{
  "videoId": "unique-video-id",
  "title": "Video Title",
  "description": "Video description",
  "genre": "Action|Tutorial|Documentary|etc",
  "rating": 8.5,
  "duration": 7200
}
```

**Field Details:**

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| videoId | string | ✅ | "movie_001" | Unique identifier - can't repeat |
| title | string | ✅ | "Amazing Movie" | Video title for display |
| description | string | ❌ | "An awesome film" | Searchable description |
| genre | string | ❌ | "Action" | Category for organization |
| rating | number | ❌ | 8.5 | Score 0-10 |
| duration | number | ❌ | 3600 | Length in seconds (1 hour = 3600) |

## 🎥 Supported Video Formats

**Recommended:** `.mp4` (works everywhere)

**Other supported:**
- `.webm` - Modern web standard
- `.mkv` - High quality
- `.avi` - Older format
- `.mov` - Apple format

## 🖼️ Thumbnail Images

**Supported formats:**
- `.jpg` / `.jpeg`
- `.png`
- `.webp`

If no thumbnail is provided, a placeholder is automatically generated.

## 📊 Example Videos to Add

### Example 1: Action Movie
```
public/videos/action-film/
├── metadata.json
├── movie.mp4
└── poster.jpg
```

metadata.json:
```json
{
  "videoId": "action-film",
  "title": "Epic Adventure",
  "description": "An intense action-packed movie",
  "genre": "Action",
  "rating": 8.5,
  "duration": 7200
}
```

### Example 2: Tutorial
```
public/videos/web-dev-tutorial/
├── metadata.json
├── full-course.webm
└── thumbnail.png
```

metadata.json:
```json
{
  "videoId": "web-dev-101",
  "title": "Web Development 101",
  "description": "Learn HTML, CSS, JavaScript from scratch",
  "genre": "Tutorial",
  "rating": 9.0,
  "duration": 14400
}
```

### Example 3: Documentary
```
public/videos/nature-doc/
├── metadata.json
└── episode1.mp4
```

metadata.json:
```json
{
  "videoId": "nature-001",
  "title": "Planet Earth",
  "description": "Explore Earth's natural wonders",
  "genre": "Documentary",
  "rating": 9.5,
  "duration": 5400
}
```

## 🔄 Seed Script Commands

### Import Videos
```bash
npm run seed:videos
```

This:
1. Reads all folders in `public/videos/`
2. Finds `metadata.json` in each folder
3. Finds video and thumbnail files
4. Imports/updates in MongoDB
5. Shows summary

### Update Videos
- Edit `metadata.json` files
- Run `npm run seed:videos` again
- Existing videos are updated

### Clear Database
Edit `scripts/seed-videos.js` line ~93:
```javascript
// Uncomment to delete all videos
await CustomVideo.deleteMany({});
```

Then run:
```bash
npm run seed:videos
```

## 🔍 How Videos Appear

### Featured Content (Home Page)
Your videos show in "Featured Content" row, merged with TMDB movies.

### Search
Type in search bar to find:
- Video title
- Description
- Genre

Results show both custom videos and TMDB movies together.

### My Videos Tab
All your custom videos in one place.

## 🎮 Video Player Controls

When playing a custom video:

| Control | Action |
|---------|--------|
| Click video | Play/Pause |
| Progress bar | Seek to time |
| Volume slider | Adjust volume |
| Mute button | Toggle sound |
| Fullscreen | Expand to full screen |
| X button | Exit player |

## 📱 Video URLs

Custom videos are served at:

```
http://localhost:3000/videos/{folderName}/{filename}
```

Examples:
- `/videos/action-movie-1/video.mp4`
- `/videos/tutorial-1/lecture.webm`
- `/videos/action-movie-1/thumbnail.jpg`

## ⚙️ Database Integration

**Model:** CustomVideo in MongoDB

**Stored fields:**
- videoId (unique)
- title
- description
- genre
- thumbnail URL
- videoUrl
- duration
- rating
- views (auto-tracked)
- isPublic (always true)
- createdAt/updatedAt

## 🐛 Troubleshooting

### Script says "No metadata.json found"
**Fix:**
- Ensure folder has `metadata.json`
- Check JSON syntax is valid
- Use online JSON validator

### "No video file found"
**Fix:**
- Ensure video file is in the folder
- Check extension is .mp4, .webm, etc.
- Try lowercase extension

### Video won't play
**Fix:**
- Check video file isn't corrupted
- Try different format (MP4 most compatible)
- Check browser console for errors

### MongoDB connection error
**Fix:**
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable
- Run `npm install`

### No videos appear after seed
**Fix:**
- Check seed output shows "Added" count
- Refresh browser
- Check browser Network tab for errors

## 💡 Best Practices

1. **Organize folders** - Use clear folder names
   ```
   ✅ action-movie-1
   ✅ web-dev-tutorial
   ❌ video_1 (unclear)
   ❌ My Video (has spaces)
   ```

2. **Optimize videos** - Compress before adding
   - Use FFmpeg or HandBrake
   - Target 50-500 MB for web
   - MP4 is most compatible

3. **Good metadata** - Helps users find content
   - Clear title
   - Descriptive text
   - Accurate duration
   - Fair rating

4. **Consistent naming** - Use lowercase
   - video.mp4 (✅)
   - Thumbnail.jpg (❌ inconsistent)

5. **Add thumbnails** - Makes UI better
   - 400x300px recommended
   - PNG or JPG
   - Relevant to content

## 🚀 Next Steps

1. Create `public/videos/my-video-1/` folder
2. Add `metadata.json` with video info
3. Add video.mp4 file
4. Add thumbnail.jpg (optional)
5. Run `npm run seed:videos`
6. Refresh app - videos appear!

## 📚 File Reference

**Key Files:**
- `public/videos/` - Your video folders
- `scripts/seed-videos.js` - Import script
- `src/models/CustomVideo.js` - Database model
- `src/app/api/custom-videos/route.js` - API
- `src/app/components/VideoPlayer.js` - Player UI

**Related Docs:**
- `public/videos/README.md` - Folder structure guide
- `CUSTOM_VIDEOS_GUIDE.md` - Full feature guide

## ✅ Checklist

Before running seed script:

- [ ] MongoDB is running
- [ ] Created `public/videos/` folders
- [ ] Added `metadata.json` to each folder
- [ ] Added video file (.mp4, .webm, etc.)
- [ ] (Optional) Added thumbnail image
- [ ] Checked JSON is valid
- [ ] Set `MONGODB_URI` if needed
- [ ] Run `npm run seed:videos`

Enjoy your custom video library! 🎬🍿
