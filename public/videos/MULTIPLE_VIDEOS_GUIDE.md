# Multiple Videos Per Folder Guide

You can now store **multiple videos in a single folder** with different videoIds, titles, descriptions, and metadata!

## Folder Structure

```
public/videos/
├── tutorial-1/
│   ├── metadata.json           (Single file with array of videos)
│   ├── Reptile_Curssor.mp4     (Video file 1)
│   ├── React_Hooks_101.mp4     (Video file 2)
│   └── MongoDB_Advanced.mp4    (Video file 3)
```

## metadata.json Format

Use an **array of video objects** instead of a single object:

```json
[
  {
    "videoId": "Reptile_Curssor",
    "title": "Web Development Cursor Complete Guide",
    "description": "Learn full-stack web development from scratch",
    "genre": "Tutorial",
    "rating": 9.5,
    "duration": 780
  },
  {
    "videoId": "React_Hooks_101",
    "title": "React Hooks Masterclass",
    "description": "Deep dive into React Hooks with real-world examples",
    "genre": "Tutorial",
    "rating": 9.2,
    "duration": 1200
  },
  {
    "videoId": "MongoDB_Advanced",
    "title": "MongoDB Advanced Query Optimization",
    "description": "Master MongoDB indexing and aggregation",
    "genre": "Tutorial",
    "rating": 8.8,
    "duration": 950
  }
]
```

## Required Fields for Each Video

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `videoId` | String | ✅ Yes | Unique identifier for the video (used in URL) |
| `title` | String | ✅ Yes | Display name of the video |
| `description` | String | No | Detailed description shown in modal |
| `genre` | String | No | Category/type of video |
| `duration` | Number | No | Video length in seconds |
| `rating` | Number | No | Rating from 0-10 (default: 0) |

## Video File Matching

The seed script **automatically matches video files** to metadata using the `videoId`:

1. **Preferred**: Name file as `{videoId}.{extension}`
   - `Reptile_Curssor.mp4` matches `videoId: "Reptile_Curssor"`
   - `React_Hooks_101.mp4` matches `videoId: "React_Hooks_101"`

2. **Alternative**: Any video file in the folder (if only one video or fallback)

Supported extensions: `.mp4`, `.webm`, `.mkv`, `.avi`, `.mov`

## Thumbnail Matching

Similarly, thumbnails can be matched to videos:

1. **Preferred**: Name as `{videoId}-thumb.{ext}` or `{videoId}.{ext}`
   - `Reptile_Curssor-thumb.jpg` for Reptile_Curssor
   - `React_Hooks_101.jpg` for React_Hooks_101

2. **Fallback**: Any image file in folder (if only one image)
   - Supported: `.jpg`, `.jpeg`, `.png`, `.webp`

3. **Auto-generated**: If no thumbnail found, generates placeholder

## Example: Adding a New Video Series

```
public/videos/
├── nodejs-advanced/
│   ├── metadata.json
│   ├── NodeJS_EventLoop.mp4
│   ├── NodeJS_Streams.mp4
│   ├── NodeJS_Clusters.mp4
│   ├── NodeJS_EventLoop.jpg
│   └── NodeJS_Streams.jpg
```

**metadata.json:**
```json
[
  {
    "videoId": "NodeJS_EventLoop",
    "title": "Node.js Event Loop Explained",
    "description": "Understand JavaScript event loop, microtasks, and macrotasks",
    "genre": "Tutorial",
    "rating": 9.3,
    "duration": 890
  },
  {
    "videoId": "NodeJS_Streams",
    "title": "Working with Node.js Streams",
    "description": "Master readable, writable, and transform streams",
    "genre": "Tutorial",
    "rating": 8.9,
    "duration": 720
  },
  {
    "videoId": "NodeJS_Clusters",
    "title": "Node.js Clustering & Load Balancing",
    "description": "Scale Node.js apps across multiple CPU cores",
    "genre": "Tutorial",
    "rating": 8.7,
    "duration": 1050
  }
]
```

## Running the Seed Script

After adding your videos:

```bash
npm run seed:videos
```

Output:
```
✅ Connected to MongoDB (authdb)
📂 Reading videos from folder...
✅ Found 1 video folder(s)

📹 Processing folder: nodejs-advanced
   📺 Video: NodeJS_EventLoop - "Node.js Event Loop Explained"
      ✅ Added: Node.js Event Loop Explained
      📺 Video URL: /videos/nodejs-advanced/NodeJS_EventLoop.mp4
   
   📺 Video: NodeJS_Streams - "Working with Node.js Streams"
      ✅ Added: Working with Node.js Streams
      📺 Video URL: /videos/nodejs-advanced/NodeJS_Streams.mp4
   
   📺 Video: NodeJS_Clusters - "Node.js Clustering & Load Balancing"
      ✅ Added: Node.js Clustering & Load Balancing
      📺 Video URL: /videos/nodejs-advanced/NodeJS_Clusters.mp4

📊 Summary:
   ✅ Added: 3
   🔄 Updated: 0
   ❌ Failed: 0
```

## Backward Compatibility

The seed script still supports **single-video folders**:

```json
{
  "videoId": "single_video",
  "title": "Single Video",
  "description": "...",
  "genre": "Tutorial"
}
```

This is automatically converted to an array internally, so both formats work! ✨

## Tips

- **Update Videos**: Run `npm run seed:videos` again to update existing videos (matches by `videoId`)
- **Delete Videos**: Remove the entry from `metadata.json` and run seed script (old video stays in DB; delete manually if needed)
- **Organize Series**: Use one folder per series/course with all related videos
- **Naming Convention**: Use `PascalCase` or `snake_case` for videoId (no spaces)
- **Check Browser Console**: Open DevTools to see video loading debug logs
