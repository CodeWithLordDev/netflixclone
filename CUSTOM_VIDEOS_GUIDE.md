# Custom Video Implementation Guide

## Overview
Your Netflix Clone now supports adding, storing, and playing custom videos with full search functionality!

## Features Added

### 1. **Custom Video Database Model** (`src/models/CustomVideo.js`)
Stores video metadata:
- `videoId` - Unique identifier for the video
- `title` - Video title
- `description` - Video description
- `genre` - Video genre/category
- `thumbnail` - Thumbnail image URL
- `videoUrl` - URL to the video file (mp4, webm, or streaming URL)
- `duration` - Video duration in seconds
- `rating` - User rating (0-10)
- `views` - View count
- `isPublic` - Visibility flag

### 2. **API Routes**

#### `POST /api/custom-videos` - Add New Video
**Request:**
```json
{
  "videoId": "my_video_001",
  "title": "My Awesome Video",
  "description": "Video description here",
  "genre": "Action",
  "thumbnail": "https://example.com/thumb.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 3600,
  "rating": 8.5
}
```

#### `GET /api/custom-videos` - Get All Videos
Returns list of all public custom videos.

#### `GET /api/custom-videos?search=keyword` - Search Videos
Searches videos by title, description, or genre.

#### `GET /api/custom-videos?id=VIDEO_ID` - Get Specific Video
Retrieves a single video and increments view count.

#### `DELETE /api/custom-videos/delete?id=VIDEO_ID` - Delete Video
Deletes a video by its ID.

### 3. **UI Components**

#### **VideoPlayer** (`src/app/components/VideoPlayer.js`)
Full-featured video player with:
- Play/Pause controls
- Volume control with mute
- Progress bar with seek functionality
- Time display (current / duration)
- Fullscreen support
- Keyboard-friendly controls

#### **AddVideoModal** (`src/app/components/AddVideoModal.js`)
Modal form to add custom videos with:
- Validation for required fields
- Error handling and success messages
- Auto-close after successful submission
- Form field for all video metadata

### 4. **Integration in Browse Page**

The browse page now includes:
- **"My Videos" navigation** - View all custom videos
- **Custom videos section** on home page
- **Add Video button** in header
- **Enhanced search** - Searches both TMDB and custom videos
- **Video player** - Plays custom videos directly

## How to Use

### Adding a Custom Video

1. **Click the "Add Video" button** in the top-right of the browse page
2. **Fill in the form:**
   - **Video ID** (required) - Unique identifier (e.g., "video_001")
   - **Title** (required) - Video name
   - **Description** - Optional video description
   - **Genre** - Optional category
   - **Thumbnail URL** - Optional cover image
   - **Video URL** (required) - Link to your video file
   - **Duration** - Video length in seconds
   - **Rating** - Score from 0-10

3. **Click "Add Video"** and it will be saved to database

### Playing Custom Videos

1. **From Home Page** - Custom videos appear in "Your Custom Videos" row
2. **From "My Videos" Tab** - View all your custom videos
3. **From Search** - Search for custom videos by title, genre, or description
4. **Direct Click** - Click any custom video thumbnail to start playing

### Using the Video Player

- **Play/Pause** - Click center button or play button in controls
- **Seek** - Click on progress bar to jump to that time
- **Volume** - Use volume slider or mute button
- **Fullscreen** - Click fullscreen button for full-screen playback
- **Close** - Click X button to exit player

## Example Videos to Add

Here are some example custom videos you can test with:

```json
{
  "videoId": "tutorial_001",
  "title": "Web Development Tutorial",
  "description": "Learn modern web development with React and Node.js",
  "genre": "Tutorial",
  "thumbnail": "https://via.placeholder.com/300x200/1a1a1a/666?text=Web+Dev",
  "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4",
  "duration": 120,
  "rating": 9
}
```

Or use any publicly available video URL (mp4, webm, etc.).

## Video URL Sources

You can use:
- **Local files** - Upload to a hosting service and use the URL
- **YouTube** - Use embedding URLs (if configured)
- **Vimeo** - Use embedding URLs (if configured)
- **AWS S3** - Host videos on cloud storage
- **Public video URLs** - Any direct mp4/webm link

## Database Schema

The CustomVideo model is stored in MongoDB with the following structure:

```javascript
{
  _id: ObjectId,
  videoId: String (unique),
  title: String (required),
  description: String,
  genre: String,
  thumbnail: String,
  videoUrl: String (required),
  duration: Number,
  rating: Number (0-10),
  views: Number,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Features

✅ Add unlimited custom videos
✅ Search by title, description, or genre
✅ Full-featured video player
✅ View count tracking
✅ Rating system
✅ Public/Private videos
✅ Responsive design
✅ Mobile friendly

## Future Enhancements

Consider adding:
- Video upload functionality (instead of just URLs)
- Edit video metadata
- Delete videos from UI
- Video playlists
- Comments/ratings
- Recommendations based on viewing history
- Social sharing
- Download option

## Troubleshooting

**Video won't play:**
- Check if videoUrl is a direct link to the video file
- Ensure CORS is enabled on the video hosting server
- Try a different video URL

**Search not working:**
- Make sure MongoDB is connected
- Check browser console for errors
- Verify video was saved successfully

**Modal won't open:**
- Clear browser cache
- Check console for JavaScript errors
- Refresh the page

## API Testing

You can test the API using this curl command:

```bash
# Add a video
curl -X POST http://localhost:3000/api/custom-videos \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "test_001",
    "title": "Test Video",
    "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
  }'

# Get all videos
curl http://localhost:3000/api/custom-videos

# Search videos
curl http://localhost:3000/api/custom-videos?search=test

# Get specific video
curl http://localhost:3000/api/custom-videos?id=test_001
```

Enjoy your custom video feature!
