export default function Banner({ movie }) {
  return (
    <div
      className="h-[85vh] bg-cover bg-center relative"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
      }}
    >
      <div className="absolute bottom-32 left-12 max-w-xl">
        <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
        <p className="text-sm text-gray-200 line-clamp-3">
          {movie.overview}
        </p>

        <div className="mt-6 flex gap-3">
          <button className="bg-white text-black px-6 py-2 rounded font-semibold">
            ▶ Play
          </button>
          <button className="bg-gray-700 px-6 py-2 rounded">
            ℹ More Info
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black" />
    </div>
  );
}
