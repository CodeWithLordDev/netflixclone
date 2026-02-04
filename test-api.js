// Test script to verify TMDB API connectivity
const apiKey = "48ed6cdf6b400404f38c7a47b5cf6bca";
const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

console.log("Testing TMDB API connectivity...");
console.log("URL:", url.replace(apiKey, "***hidden***"));

fetch(url)
  .then(res => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("✅ Success! Got", data.results?.length, "movies");
    console.log("First movie:", data.results?.[0]?.title);
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
    console.error("Full error:", err);
  });
