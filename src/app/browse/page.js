"use client";
import { useState, useEffect } from "react";
import { Play, Info, Search, ChevronLeft, ChevronRight } from "lucide-react";
import MovieDetailModal from "../components/MovieDetailModal";
import VideoPlayer from "../components/VideoPlayer";
import VideoWithAds from "../components/VideoWithAds";

// MovieRow component defined outside
const MovieRow = ({ title, movies, rowId, onMovieClick, myList, onAddToMyList, onRemoveFromMyList }) => {
  const scrollRow = (direction, rowId) => {
    const element = document.getElementById(rowId);
    if (element) {
      const scrollAmount = 400;
      if (direction === "left") {
        element.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-6 px-4 md:px-12">
        {title}
      </h2>
      <div className="relative group px-4 md:px-12">
        <button
          onClick={() => scrollRow("left", rowId)}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div
          id={rowId}
          className="flex overflow-x-scroll scrollbar-hide space-x-4 px-4 md:px-12 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie, index) => {
            const movieId = movie.id || movie.videoId;
            const isInMyList = myList.some((m) => (m.id || m.videoId) === movieId);
            const movieKey = `${movie.isCustom ? "custom" : "tmdb"}-${String(movieId)}-${index}`;
            return (
              <div
                key={movieKey}
                className="flex-none w-40 md:w-48 lg:w-56 group/movie relative transition-transform duration-300 hover:scale-110 hover:z-20"
              >
                <img
                  src={
                    movie.thumbnail
                      ? movie.thumbnail
                      : movie.backdrop_path
                      ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                      : movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://via.placeholder.com/300x169/1a1a1a/666?text=No+Image"
                  }
                  alt={movie.title}
                  className="w-full h-24 md:h-28 lg:h-32 object-cover rounded-lg shadow-lg hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => onMovieClick(movie)}
                />
                <p className="text-white text-xs md:text-sm mt-3 line-clamp-1">
                  {movie.title}
                </p>

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/movie:opacity-100 transition-opacity rounded flex flex-col items-center justify-center space-y-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovieClick(movie);
                    }}
                    className="bg-white text-black px-4 py-2 rounded font-semibold text-sm hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isInMyList
                        ? onRemoveFromMyList(movie.id || movie.videoId)
                        : onAddToMyList(movie);
                    }}
                    className={`px-4 py-2 rounded font-semibold text-sm transition ${
                      isInMyList
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {isInMyList ? "✓ My List" : "+ My List"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => scrollRow("right", rowId)}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/70"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

// MovieGrid component defined outside
const MovieGrid = ({ title, movies, gridId, onMovieClick, myList, onAddToMyList, onRemoveFromMyList }) => (
  <div className="mb-12">
    <h2 className="text-white text-xl md:text-2xl font-semibold mb-6 px-4 md:px-12">
      {title}
    </h2>
    <div
      id={gridId}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 md:px-12"
    >
      {movies.map((movie, index) => {
        const movieId = movie.id || movie.videoId;
        const isInMyList = myList.some((m) => (m.id || m.videoId) === movieId);
        const movieKey = `${movie.isCustom ? "custom" : "tmdb"}-${String(movieId)}-${index}`;
        return (
          <div
            key={movieKey}
            className="group/movie relative transition-transform duration-300 hover:scale-110 hover:z-20"
          >
            <img
              src={
                movie.thumbnail
                  ? movie.thumbnail
                  : movie.backdrop_path
                  ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                  : movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/300x169/1a1a1a/666?text=No+Image"
              }
              alt={movie.title}
              className="w-full h-32 md:h-40 object-cover rounded-lg shadow-lg hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => onMovieClick(movie)}
            />
            <p className="text-white text-xs md:text-sm mt-3 line-clamp-2">
              {movie.title}
            </p>

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/movie:opacity-100 transition-opacity rounded flex flex-col items-center justify-center space-y-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMovieClick(movie);
                }}
                className="bg-white text-black px-3 py-2 rounded font-semibold text-xs hover:bg-gray-200 flex items-center space-x-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isInMyList
                    ? onRemoveFromMyList(movie.id || movie.videoId)
                    : onAddToMyList(movie);
                }}
                className={`px-3 py-2 rounded font-semibold text-xs transition ${
                  isInMyList
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {isInMyList ? "✓" : "+"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function NetflixMovieBrowser() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [customVideos, setCustomVideos] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [myList, setMyList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showAd, setShowAd] = useState(false);
const [pendingVideo, setPendingVideo] = useState(null);

  // Replace with your actual TMDB API key
  const TMDB_API_KEY = "48ed6cdf6b400404f38c7a47b5cf6bca";
  const BASE_URL = "https://api.themoviedb.org/3";

  const fetchMovies = async (endpoint) => {
    try {
      const response = await fetch(
        `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`,
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching:", error);
      return [];
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      loadInitialData();
      return;
    }
    try {
      // Search both TMDB and custom videos
      const [tmdbResponse, customResponse] = await Promise.all([
        fetch(
          `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
        ),
        fetch(`/api/custom-videos?search=${encodeURIComponent(query)}`),
      ]);

      const tmdbData = await tmdbResponse.json();
      const customData = await customResponse.json();

      // Combine results with custom videos marked
      const combinedResults = [
        ...customData.map(v => ({ ...v, isCustom: true })),
        ...(tmdbData.results || [])
      ];
      
      setMovies(combinedResults);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    // console.log("🚀 Starting loadInitialData...");
    const [popularMovies, trendingMovies, topRatedMovies, upcomingMovies, customVids] =
      await Promise.all([
        fetchMovies("/movie/popular"),
        fetchMovies("/trending/movie/week"),
        fetchMovies("/movie/top_rated"),
        fetchMovies("/movie/upcoming"),
        fetchCustomVideos(),
      ]);

    // console.log("📊 Data loaded:");
    // console.log("  - Popular:", popularMovies.length);
    // console.log("  - Trending:", trendingMovies.length);
    // console.log("  - Top Rated:", topRatedMovies.length);
    // console.log("  - Upcoming:", upcomingMovies.length);
    // console.log("  - Custom Videos:", customVids ? customVids.length : 0);
    // console.log("  - Custom Videos Array:", customVids);
    
    setMovies(popularMovies);
    setTrending(trendingMovies);
    setTopRated(topRatedMovies);
    setUpcoming(upcomingMovies);
    setCustomVideos(customVids || []);
    
    // Set a random featured movie on each refresh
    const randomIndex = Math.floor(Math.random() * popularMovies.length);
    setFeatured(popularMovies[randomIndex]);
    setLoading(false);
  };

  const fetchCustomVideos = async () => {
    try {
      const response = await fetch("/api/custom-videos");
      // console.log("API Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        // console.log("✅ Fetched custom videos - Raw data:", data);
        // console.log("✅ Is array:", Array.isArray(data));
        // console.log("✅ Length:", Array.isArray(data) ? data.length : "Not an array");
        
        // Handle if data is an object with results property
        const videos = Array.isArray(data) ? data : (data.videos || data.results || []);
        // console.log("✅ Processed videos:", videos);
        return videos;
      } else {
        console.error("API returned status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching custom videos:", error);
    }
    return [];
  };

  const loadMyList = async () => {
    try {
      const response = await fetch("/api/movies/mylist");
      if (response.ok) {
        const data = await response.json();
        const list = data.myList || [];
        setMyList(list);
        return list;
      }
    } catch (error) {
      console.error("Error loading my list:", error);
    }
    return [];
  };

  const addToMyList = async (movie) => {
    try {
      // console.log("Adding movie to list:", movie);
      const response = await fetch("/api/movies/mylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("Updated myList after adding:", data.myList);
        setMyList(data.myList || []);
        // If user is currently on mylist tab, also update movies display
        if (activeNav === "mylist") {
          setMovies(data.myList || []);
        }
      } else if (response.status === 409) {
        // console.log("Movie already in list");
      }
    } catch (error) {
      console.error("Error adding to my list:", error);
    }
  };

  const removeFromMyList = async (movieId) => {
    try {
      const response = await fetch(`/api/movies/mylist/${encodeURIComponent(movieId)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setMyList(data.myList || []);
        // If user is currently on mylist tab, also update movies display
        if (activeNav === "mylist") {
          setMovies(data.myList || []);
        }
      }
    } catch (error) {
      console.error("Error removing from my list:", error);
    }
  };

const handleMovieClick = (movie) => {
  // Custom video → play directly
  if (movie.isCustom || movie.videoUrl) {
    setPlayingVideo(movie);
    return;
  }

  // TMDB movie → open modal
  setSelectedMovie(movie);
  setShowMovieDetail(true);
};


const handleAdFinished = () => {
  setShowAd(false);

  if (pendingVideo) {
    setPlayingVideo(pendingVideo);
    setPendingVideo(null);
  }
};


  const handleCloseModal = () => {
    setShowMovieDetail(false);
    setSelectedMovie(null);
  };


  const handleNavigation = async (nav) => {
    setActiveNav(nav);
    setSearchQuery("");     // Reset search
    setShowSearch(false);   // Close search box
    setLoading(true);

    if (nav === "home") {
      await loadInitialData();
    } else if (nav === "tv") {
      const tvShows = await fetchMovies("/tv/popular");
      setMovies(tvShows);
      setTrending([]);
      setTopRated([]);
      setUpcoming([]);
      setFeatured(tvShows[0]);
    } else if (nav === "movies") {
      const allMovies = await fetchMovies("/movie/popular");
      setMovies(allMovies);
      setTrending([]);
      setTopRated([]);
      setUpcoming([]);
      setFeatured(allMovies[0]);
    } else if (nav === "latest") {
      const latestMovies = await fetchMovies("/movie/upcoming");
      setMovies(latestMovies);
      setTrending([]);
      setTopRated([]);
      setUpcoming([]);
      setFeatured(latestMovies[0]);
    } else if (nav === "custom") {
      const customVids = await fetchCustomVideos();
      setMovies(customVids);
      setCustomVideos(customVids);
      setTrending([]);
      setTopRated([]);
      setUpcoming([]);
      setFeatured(customVids[0] || null);
    } else if (nav === "mylist") {
      // Load myList from API
      try {
        const response = await fetch("/api/movies/mylist");
        if (response.ok) {
          const data = await response.json();
          const list = data.myList || [];
          // console.log("Loaded myList:", list);
          setMyList(list);
          setMovies(list);
          setTrending([]);
          setTopRated([]);
          setUpcoming([]);
          setFeatured(list[0] || null);
        } else {
          console.error("Failed to load myList:", response.status);
          setMovies([]);
          setMyList([]);
          setFeatured(null);
        }
      } catch (error) {
        console.error("Error loading my list:", error);
        setMovies([]);
        setMyList([]);
        setFeatured(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchCurrentUser();
      await loadMyList();
      await loadInitialData();
    };
    initializeData();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      // Filter based on active tab
      if (activeNav === "custom") {
        // Search in custom videos
        const filtered = customVideos.filter(video =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          (video.description && video.description.toLowerCase().includes(query.toLowerCase())) ||
          (video.genre && video.genre.toLowerCase().includes(query.toLowerCase()))
        );
        setMovies(filtered);
      } else if (activeNav === "mylist") {
        // Search in my list
        const filtered = myList.filter(movie =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          (movie.overview && movie.overview.toLowerCase().includes(query.toLowerCase()))
        );
        setMovies(filtered);
      } else {
        // Search TMDB and custom videos
        searchMovies(query);
      }
    } else {
      // Reset to default
      if (activeNav === "custom") {
        setMovies(customVideos);
      } else if (activeNav === "mylist") {
        setMovies(myList);
      } else {
        loadInitialData();
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Netflix-style Header */}
      {/* Netflix Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 md:px-12 h-16">
          {/* LEFT */}
          <div className="flex items-center space-x-8">
            <h1 className="text-red-600 text-2xl font-bold tracking-wide cursor-pointer">
              NETFLIX
            </h1>

            <nav className="hidden md:flex items-center space-x-5 text-sm text-gray-200">
              <span
                onClick={() => handleNavigation("home")}
                className={`cursor-pointer transition-colors ${activeNav === "home" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                Home
              </span>
              <span
                onClick={() => handleNavigation("tv")}
                className={`cursor-pointer transition-colors ${activeNav === "tv" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                TV Shows
              </span>
              <span
                onClick={() => handleNavigation("movies")}
                className={`cursor-pointer transition-colors ${activeNav === "movies" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                Movies
              </span>
              <span
                onClick={() => handleNavigation("latest")}
                className={`cursor-pointer transition-colors ${activeNav === "latest" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                Latest
              </span>
              <span
                onClick={() => handleNavigation("custom")}
                className={`cursor-pointer transition-colors ${activeNav === "custom" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                My Videos {customVideos.length > 0 && `(${customVideos.length})`}
              </span>
              <span
                onClick={() => handleNavigation("mylist")}
                className={`cursor-pointer transition-colors ${activeNav === "mylist" ? "font-semibold text-white" : "hover:text-gray-400"}`}
              >
                My List {myList.length > 0 && `(${myList.length})`}
              </span>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-5 text-white">
            {/* SEARCH */}
            <div className="relative flex items-center">
              {showSearch && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Titles, people, genres"
                  className="bg-black border border-white/70 text-sm text-white px-3 py-1 w-64 focus:outline-none transition-all"
                  autoFocus
                />
              )}

              <button
                onClick={() => setShowSearch(!showSearch)}
                className="ml-2 hover:text-gray-400"
              >
                <Search size={20} />
              </button>
            </div>

            {/* CHILDREN */}
            <span className="hidden md:block text-sm hover:text-gray-400 cursor-pointer">
              CHILDREN
            </span>

            {/* BELL */}
            <button className="hover:text-gray-400">🔔</button>

            {/* PROFILE */}
            <div className="relative">
              <div
                className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-blue-700"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                title={currentUser?.name || "Profile"}
              >
                {currentUser?.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </div>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-black/95 border border-gray-700 rounded shadow-lg py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-white text-sm font-semibold">
                      {currentUser?.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Plan Info */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Plan
                    </p>
                    <p className="text-white text-sm font-semibold capitalize">
                      {currentUser?.plan || "Free"}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-900 transition text-sm font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Hero Section */}
      {featured && !searchQuery && activeNav === "home" && (
        <div
          className="relative h-screen"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute bottom-32 left-4 md:left-12 max-w-2xl">
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
              {featured.title}
            </h1>
            <p className="text-white text-sm md:text-lg mb-6 line-clamp-3">
              {featured.overview}
            </p>
            <div className="flex space-x-4">
              <button className="bg-white text-black px-8 py-3 rounded flex items-center space-x-2 font-semibold hover:bg-gray-200 transition">
                <Play className="w-6 h-6 fill-current" />
                <span>Play</span>
              </button>
              <button className="bg-gray-500/70 text-white px-8 py-3 rounded flex items-center space-x-2 font-semibold hover:bg-gray-500/50 transition">
                <Info className="w-6 h-6" />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movie Rows */}
      <div
        className={`relative z-10 ${activeNav === "home" && !searchQuery ? "-mt-32" : "pt-4"}`}
      >
        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="px-4 md:px-12 mb-4 text-xs text-gray-500">
            {/* <p>Custom Videos Loaded: {customVideos.length}</p> */}
          </div>
        )}
        {searchQuery ? (
          <MovieGrid 
            title="Search Results" 
            movies={movies} 
            gridId="search"
            onMovieClick={handleMovieClick}
            myList={myList}
            onAddToMyList={addToMyList}
            onRemoveFromMyList={removeFromMyList}
          />
        ) : activeNav === "home" ? (
          <>
            {customVideos.length > 0 && (
              <MovieRow 
                title="Featured Content" 
                movies={customVideos} 
                rowId="custom"
                onMovieClick={handleMovieClick}
                myList={myList}
                onAddToMyList={addToMyList}
                onRemoveFromMyList={removeFromMyList}
              />
            )}
            <MovieRow
              title="Popular on Netflix"
              movies={movies}
              rowId="popular"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
            <MovieRow 
              title="Trending Now" 
              movies={trending} 
              rowId="trending"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
            <MovieRow 
              title="Top Rated" 
              movies={topRated} 
              rowId="toprated"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
            <MovieRow 
              title="Coming Soon" 
              movies={upcoming} 
              rowId="upcoming"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
          </>
        ) : activeNav === "tv" ? (
          <MovieGrid 
            title="Popular TV Shows" 
            movies={movies} 
            gridId="tv"
            onMovieClick={handleMovieClick}
            myList={myList}
            onAddToMyList={addToMyList}
            onRemoveFromMyList={removeFromMyList}
          />
        ) : activeNav === "movies" ? (
          <MovieGrid 
            title="Popular Movies" 
            movies={movies} 
            gridId="movies"
            onMovieClick={handleMovieClick}
            myList={myList}
            onAddToMyList={addToMyList}
            onRemoveFromMyList={removeFromMyList}
          />
        ) : activeNav === "latest" ? (
          <MovieGrid 
            title="Latest Releases" 
            movies={movies} 
            gridId="latest"
            onMovieClick={handleMovieClick}
            myList={myList}
            onAddToMyList={addToMyList}
            onRemoveFromMyList={removeFromMyList}
          />
        ) : activeNav === "custom" ? (
          movies.length > 0 ? (
            <MovieGrid 
              title="Featured Content" 
              movies={movies} 
              gridId="custom"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                No videos available. Add videos to the videos folder and run the seed script.
              </p>
            </div>
          )
        ) : activeNav === "mylist" ? (
          movies.length > 0 ? (
            <MovieGrid 
              title="My List" 
              movies={movies} 
              gridId="mylist"
              onMovieClick={handleMovieClick}
              myList={myList}
              onAddToMyList={addToMyList}
              onRemoveFromMyList={removeFromMyList}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                Your list is empty. Add movies to get started!
              </p>
            </div>
          )
        ) : null}
      </div>

      {/* API Key Warning */}
      {TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE" && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded shadow-lg max-w-sm">
          <strong>⚠️ Setup Required:</strong> Replace
          &apos;YOUR_TMDB_API_KEY_HERE&apos; with your TMDB API key
        </div>
      )}

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={showMovieDetail}
        onClose={handleCloseModal}
        isInMyList={
          selectedMovie &&
          myList.some(
            (m) =>
              String(m.id ?? m.videoId) ===
              String(selectedMovie.id ?? selectedMovie.videoId)
          )
        }
        onAddToMyList={addToMyList}
        onRemoveFromMyList={removeFromMyList}
        
      />

      {/* Video Player */}
      {/* {playingVideo && (
        <VideoPlayer
          videoUrl={playingVideo.videoUrl}
          title={playingVideo.title}
          onClose={() => setPlayingVideo(null)}
        />
      )} */}
      {playingVideo && (
  <VideoWithAds
    videoSrc={playingVideo.videoUrl}
    isPremium={currentUser?.plan === "premium"}
    onClose={() => setPlayingVideo(null)}
    title={playingVideo.title}
  />
)}


      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
