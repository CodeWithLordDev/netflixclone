export default function MovieCard({ movie }) {
  return (
    <img
      className="w-[180px] rounded transition-transform duration-300 hover:scale-110 cursor-pointer"
      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
      alt={movie.title}
    />
  );
}
