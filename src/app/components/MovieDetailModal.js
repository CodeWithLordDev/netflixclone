"use client";
import { useState, useEffect } from "react";
import { Play, X, Plus, Check } from "lucide-react";

export default function MovieDetailModal({ movie, isOpen, onClose, isInMyList, onAddToMyList, onRemoveFromMyList }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [currentIsInMyList, setCurrentIsInMyList] = useState(isInMyList);

  const TMDB_API_KEY = "48ed6cdf6b400404f38c7a47b5cf6bca";
  const BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    setCurrentIsInMyList(isInMyList);
  }, [isInMyList]);

  useEffect(() => {
    if (isOpen && movie) {
      fetchMovieDetails();
    }
  }, [isOpen, movie]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMyList = async () => {
    setIsAdding(true);
    try {
      if (currentIsInMyList) {
        await onRemoveFromMyList(movie.id);
        setCurrentIsInMyList(false);
      } else {
        await onAddToMyList(movie);
        setCurrentIsInMyList(true);
      }
    } catch (error) {
      console.error("Error updating my list:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen || !movie) return null;

  const backdropImage = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie.poster_path
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
    : "https://via.placeholder.com/1280x720/1a1a1a/666?text=No+Image";

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Movie Backdrop */}
        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-t-lg">
          <img
            src={backdropImage}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900" />
        </div>

        {/* Content */}
        <div className="px-6 md:px-8 py-6">
          {/* Title and Year */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {movie.title}
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            Released On: {releaseDate}
          </p>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
            {movie.overview || details?.overview || "No description available"}
          </p>

          {/* Rating and Info */}
          {details && (
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Rating: </span>
                <span className="text-yellow-400 font-semibold">
                  {details.vote_average?.toFixed(1)}/10
                </span>
              </div>
              {details.runtime && (
                <div>
                  <span className="text-gray-400">Duration: </span>
                  <span>{details.runtime} minutes</span>
                </div>
              )}
              {details.genres && details.genres.length > 0 && (
                <div>
                  <span className="text-gray-400">Genres: </span>
                  <span>{details.genres.map(g => g.name).join(", ")}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition flex items-center gap-2 text-sm md:text-base">
              <Play className="w-5 h-5 fill-current" />
              Play
            </button>
            <button
              onClick={handleAddToMyList}
              disabled={isAdding}
              className={`px-6 py-3 rounded font-semibold transition flex items-center gap-2 text-sm md:text-base ${
                currentIsInMyList
                  ? "bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                  : "border-2 border-white text-white hover:bg-white/10 disabled:opacity-50"
              }`}
            >
              {currentIsInMyList ? (
                <>
                  <Check className="w-5 h-5" />
                  {isAdding ? "Updating..." : "Added to My List"}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {isAdding ? "Adding..." : "Add to My List"}
                </>
              )}
            </button>
          </div>

          {/* Additional Details */}
          {details?.credits && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              {details.credits.cast && details.credits.cast.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-400 text-sm font-semibold mb-2">
                    Cast:
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {details.credits.cast
                      .slice(0, 5)
                      .map(actor => actor.name)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
