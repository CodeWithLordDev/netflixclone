// Sample Custom Videos for Testing
// Copy and paste into your browser console or use these with API calls

const sampleVideos = [
  {
    videoId: "intro_001",
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    genre: "Tutorial",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/ff6b6b?text=Web+Dev+101",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 180,
    rating: 9.5,
  },
  {
    videoId: "react_001",
    title: "React.js Masterclass",
    description: "Complete guide to building modern React applications",
    genre: "Programming",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/4ecdc4?text=React+Master",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 3600,
    rating: 9.2,
  },
  {
    videoId: "node_001",
    title: "Node.js Backend Development",
    description: "Build scalable backend APIs with Node.js and Express",
    genre: "Programming",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/95e1d3?text=Node.js",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 2700,
    rating: 8.8,
  },
  {
    videoId: "design_001",
    title: "UI/UX Design Principles",
    description: "Master the fundamentals of user interface and experience design",
    genre: "Design",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/ffd93d?text=UI+UX+Design",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 2400,
    rating: 8.7,
  },
  {
    videoId: "database_001",
    title: "MongoDB & Database Design",
    description: "Learn NoSQL databases with MongoDB and best practices",
    genre: "Database",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/a8e6cf?text=MongoDB",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 2100,
    rating: 8.9,
  },
  {
    videoId: "auth_001",
    title: "Authentication & Security",
    description: "Implement secure authentication and protect user data",
    genre: "Security",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/ff8b94?text=Security",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 1800,
    rating: 9.1,
  },
  {
    videoId: "deploy_001",
    title: "Deployment & DevOps",
    description: "Deploy applications to production with confidence",
    genre: "DevOps",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/dda0dd?text=DevOps",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 1500,
    rating: 8.6,
  },
  {
    videoId: "testing_001",
    title: "Testing & Quality Assurance",
    description: "Write tests and ensure code quality",
    genre: "Development",
    thumbnail: "https://via.placeholder.com/400x300/1a1a1a/f0a6ca?text=Testing",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 1200,
    rating: 8.4,
  },
];

// Function to add all sample videos
async function addAllSampleVideos() {
  console.log("Starting to add sample videos...");
  let added = 0;
  let failed = 0;

  for (const video of sampleVideos) {
    try {
      const response = await fetch("/api/custom-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(video),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added: ${video.title}`);
        added++;
      } else {
        const error = await response.json();
        console.warn(`❌ Failed to add ${video.title}: ${error.error}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ Error adding ${video.title}:`, err);
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${added} added, ${failed} failed`);
}

// Function to add a single video
async function addCustomVideo(videoData) {
  try {
    const response = await fetch("/api/custom-videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(videoData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Video added successfully:", result);
      return result;
    } else {
      const error = await response.json();
      console.error("❌ Failed to add video:", error);
      return null;
    }
  } catch (err) {
    console.error("❌ Error:", err);
    return null;
  }
}

// Function to search videos
async function searchVideos(query) {
  try {
    const response = await fetch(`/api/custom-videos?search=${encodeURIComponent(query)}`);
    if (response.ok) {
      const videos = await response.json();
      console.log(`🔍 Found ${videos.length} videos matching "${query}":`, videos);
      return videos;
    }
  } catch (err) {
    console.error("❌ Search error:", err);
  }
}

// Function to get all videos
async function getAllVideos() {
  try {
    const response = await fetch("/api/custom-videos");
    if (response.ok) {
      const videos = await response.json();
      console.log(`📺 Total videos: ${videos.length}`, videos);
      return videos;
    }
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
  }
}

// Function to delete a video
async function deleteVideo(videoId) {
  try {
    const response = await fetch(`/api/custom-videos/delete?id=${videoId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log(`✅ Deleted video: ${videoId}`);
      return true;
    } else {
      console.error("❌ Failed to delete video");
      return false;
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// Export for use in scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sampleVideos,
    addAllSampleVideos,
    addCustomVideo,
    searchVideos,
    getAllVideos,
    deleteVideo,
  };
}

// Usage Examples in Browser Console:
/*

1. Add all sample videos:
   addAllSampleVideos()

2. Add a single video:
   addCustomVideo({
     videoId: "my_custom_001",
     title: "My Custom Video",
     description: "My awesome video",
     videoUrl: "https://example.com/video.mp4"
   })

3. Search videos:
   searchVideos("React")

4. Get all videos:
   getAllVideos()

5. Delete a video:
   deleteVideo("intro_001")

*/
