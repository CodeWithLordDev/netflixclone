# 📹 Custom Videos Folder Structure

This folder contains your custom videos that will be automatically loaded into the Netflix Clone database.

## 📁 Folder Structure

```
videos/
├── action-movie-1/
│   ├── metadata.json          (Required - video metadata)
│   ├── thumbnail.jpg          (Optional - cover image)
│   └── video.mp4              (Required - video file)
│
├── tutorial-1/
│   ├── metadata.json
│   ├── thumbnail.png
│   └── lecture.webm
│
└── documentary-1/
    ├── metadata.json
    ├── poster.jpg
    └── episode1.mp4
```

## 📝 File Format

### metadata.json (Required)

Each video folder must contain a `metadata.json` file:

```json
{
  "videoId": "action-movie-1",
  "title": "Amazing Action Adventure",
  "description": "An thrilling action movie with stunning visuals and epic battles",
  "genre": "Action",
  "rating": 8.5,
  "duration": 7200
}
```

**Fields:**
- `videoId` (string, required) - Unique identifier for the video
- `title` (string, required) - Video title
- `description` (string) - Video description
- `genre` (string) - Category (Action, Tutorial, Documentary, etc.)
- `rating` (number) - Rating 0-10
- `duration` (number) - Duration in seconds

### Video File (Required)

Supported formats:
- `.mp4` (Most compatible)
- `.webm` (Web format)
- `.mkv`
- `.avi`
- `.mov`

Place your video file in the same folder as metadata.json. The script will automatically find it.

### Thumbnail Image (Optional)

If you want a custom thumbnail, add an image file:
- `.jpg` / `.jpeg`
- `.png`
- `.webp`

If no thumbnail is provided, a placeholder will be generated.

## 🚀 How to Add Videos

1. **Create a new folder** in the `videos` directory:
   ```bash
   mkdir my-video-1
   ```

2. **Add metadata.json** with video information:
   ```json
   {
     "videoId": "my-video-1",
     "title": "My Awesome Video",
     "description": "Description here",
     "genre": "Action",
     "rating": 8.0,
     "duration": 3600
   }
   ```

3. **Add video file** (mp4, webm, etc.):
   ```bash
   cp /path/to/video.mp4 my-video-1/
   ```

4. **Add thumbnail (optional)**:
   ```bash
   cp /path/to/thumbnail.jpg my-video-1/
   ```

5. **Run the seed script** to import into database:
   ```bash
   npm run seed:videos
   ```

## 📊 Example Videos

### Tutorial Video
```json
{
  "videoId": "react-tutorial",
  "title": "React.js Complete Guide",
  "description": "Learn React from basics to advanced concepts",
  "genre": "Tutorial",
  "rating": 9.5,
  "duration": 14400
}
```

### Action Movie
```json
{
  "videoId": "action-film",
  "title": "Epic Battle Chronicles",
  "description": "An intense action-packed adventure",
  "genre": "Action",
  "rating": 8.5,
  "duration": 7200
}
```

### Documentary
```json
{
  "videoId": "nature-doc",
  "title": "Planet Earth: A Journey",
  "description": "Explore the wonders of our planet",
  "genre": "Documentary",
  "rating": 9.0,
  "duration": 5400
}
```

## 🔄 Seed Script Usage

### Initial Import
```bash
npm run seed:videos
```

This will:
1. Read all video folders in `public/videos`
2. Load metadata from each folder's `metadata.json`
3. Find video and thumbnail files automatically
4. Import/update them in MongoDB
5. Display summary of added, updated, and failed videos

### Update Existing Videos
Simply edit the `metadata.json` file and run the seed script again. Existing videos will be updated.

### Clear All Videos
Edit `scripts/seed-videos.js` and uncomment this line (currently line ~93):
```javascript
// await CustomVideo.deleteMany({});
```

Then run:
```bash
npm run seed:videos
```

## 🎬 Video URL Mapping

Videos are served at:
```
/videos/{folderName}/{filename}
```

Examples:
- `/videos/action-movie-1/video.mp4`
- `/videos/tutorial-1/lecture.webm`
- `/videos/action-movie-1/thumbnail.jpg`

## 📱 Supported Formats

### Video Formats
- **MP4** - Widely compatible (recommended)
- **WebM** - Modern web standard
- **MKV** - High quality (if browser supports)
- **AVI** - Legacy format
- **MOV** - Apple format

### Image Formats
- **JPG/JPEG** - Standard photo format
- **PNG** - Supports transparency
- **WebP** - Modern image format

## ⚠️ Important Notes

1. **File Names**: Keep folder names simple without spaces (use hyphens or underscores)
2. **Video Size**: Consider file size for web streaming (100MB - 1GB recommended)
3. **Duration**: Specified in seconds (e.g., 3600 = 1 hour)
4. **videoId**: Must be unique - don't repeat videoId across folders
5. **Database**: Requires MongoDB connection to import

## 🐛 Troubleshooting

### "No metadata.json found"
- Ensure each video folder has a `metadata.json` file
- Check JSON formatting is valid (use `jsonlint.com` to validate)

### "No video file found"
- Ensure video file is in the correct folder
- Check file extension is supported (.mp4, .webm, etc.)
- Check file extension is lowercase

### "Video won't play"
- Verify video file is not corrupted
- Try re-encoding in a different format
- Check browser console for CORS errors

### Script not running
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable is set
- Run `npm install` to ensure dependencies are installed

## 💡 Tips

1. **Optimize videos** - Compress videos before adding to save space
2. **Use consistent naming** - Makes management easier
3. **Write good descriptions** - Helps with search functionality
4. **Add ratings** - Helps users find quality content
5. **Include thumbnails** - Makes UI more attractive

## 🔗 Integration with TMDB

Your custom videos will:
- ✅ Appear in "Featured Content" section
- ✅ Be searchable alongside TMDB movies
- ✅ Play with full-featured video player
- ✅ Support add to "My List"
- ✅ Track view count

## 📚 Next Steps

1. Add your videos to folders
2. Create metadata.json for each
3. Run `npm run seed:videos`
4. Videos appear in your Netflix Clone!

Enjoy! 🎬

### Step 1: Create a Folder
Create a new folder for each video. Use descriptive names:
```
public/videos/action_movie_2024/
public/videos/tutorial_web_dev/
public/videos/documentary_nature/
```

### Step 2: Add Video File
Add a video file to the folder. Supported formats:
- `.mp4` (recommended)
- `.webm`
- `.avi`
- `.mov`

**File should be named:** `video.mp4` (or with extension of your format)

### Step 3: Add Thumbnail (Optional)
Add a thumbnail image for the video poster. Supported formats:
- `.jpg` / `.jpeg` (recommended)
- `.png`
- `.webp`

**File should be named:** `thumbnail.jpg` (or with your image name)

### Step 4: Add Metadata (Optional)
Create a `metadata.json` file in the same folder:

```json
{
  "title": "Action Movie 2024",
  "description": "An epic action-packed adventure",
  "genre": "Action",
  "duration": 7200,
  "rating": 8.5,
  "isPublic": true
}
```

**Metadata Fields:**
- `title` (string) - Video title (auto-generated from folder name if not provided)
- `description` (string) - Video description
- `genre` (string) - Video category
- `duration` (number) - Video length in seconds
- `rating` (number) - Rating from 0-10
- `isPublic` (boolean) - Whether to show in browse page (default: true)

## Examples

### Example 1: Simple Video
```
public/videos/my_first_video/
├── video.mp4
└── thumbnail.jpg
```
→ Title will be auto-generated as "My First Video"

### Example 2: Complete Setup
```
public/videos/tutorial_react/
├── video.mp4
├── thumbnail.jpg
└── metadata.json
```

`metadata.json`:
```json
{
  "title": "React Tutorial for Beginners",
  "description": "Learn React from scratch in 2 hours",
  "genre": "Tutorial",
  "duration": 7200,
  "rating": 9.5,
  "isPublic": true
}
```

## Running the Seed Script

After adding videos to the folder, run the seeding script to load them into the database:

### Using npm (Recommended)
```bash
npm run seed:videos
```

### Using node directly
```bash
node scripts/seedVideos.js
```

## Output Example

```
🚀 Starting video seeding...
✅ Connected to database
✅ Added: "React Tutorial for Beginners" (video.mp4)
✅ Added: "My First Video" (video.mp4)
⏭️  Skipped "empty_folder": No video file found

📊 Seeding Summary:
   ✅ Processed: 2
   ⏭️  Skipped: 1
🎉 Video seeding complete!
```

## Troubleshooting

### Videos not appearing after seeding?
1. **Run the seed script:** `npm run seed:videos`
2. **Check console output** for errors
3. **Verify MongoDB connection** is working
4. **Restart the application** to see changes

### Thumbnails not showing?
1. **Check file format** - Use .jpg or .png
2. **Verify file path** - Should be `/videos/folder_name/thumbnail.jpg`
3. **Clear browser cache** - Ctrl+Shift+Delete

### Video won't play?
1. **Check video format** - Browser supports mp4, webm
2. **Verify video file size** - Large files may need streaming
3. **Check CORS settings** - Local videos should work fine

## File Size Guidelines

- **Thumbnail:** 300x200px - 500KB (recommended)
- **Video:** Keep under 500MB for best performance
- **Large videos:** Consider compressing or using streaming services

## Supported Video Formats

| Format | Extension | Browser Support | Recommended |
|--------|-----------|-----------------|-------------|
| MP4    | .mp4      | All browsers    | ✅ Yes      |
| WebM   | .webm     | Chrome, Firefox | ✅ Yes      |
| AVI    | .avi      | Some browsers   | ❌ No       |
| MOV    | .mov      | Safari, Chrome  | ⚠️ Maybe    |

## Automatic Title Generation

If you don't provide metadata, the title will be auto-generated from the folder name:

```
Folder Name          → Generated Title
my_video             → My Video
action_movie_2024    → Action Movie 2024
tutorial_web_dev     → Tutorial Web Dev
```

## Video Removal

To remove a video from the browse page:

### Option 1: Delete the folder
Remove the folder from `public/videos/`

### Option 2: Hide from browse
Set `isPublic: false` in metadata.json, then run seed script again

## Integration with TMDB

Your custom videos will:
- ✅ Appear on the Home page
- ✅ Appear in "My Videos" tab
- ✅ Show in search results alongside TMDB movies
- ✅ Play with the same video player as TMDB content
- ✅ Be merged seamlessly in browse experience

## Tips & Best Practices

1. **Use descriptive folder names** - They become video titles
2. **Optimize thumbnails** - Use consistent aspect ratio (16:9)
3. **Compress videos** - Reduce file size for faster loading
4. **Test locally** - Run seed script after adding videos
5. **Use metadata.json** - Provide full details for better display
6. **Organize by genre** - Create folders: `tutorials/`, `movies/`, `documentaries/`

## Performance Notes

- First seed might take a moment if you have many videos
- Videos are cached by browser, clearing cache refreshes them
- Large video files should be compressed before adding
- Thumbnails load first, then videos on demand

Need help? Check CUSTOM_VIDEOS_GUIDE.md for more details!
