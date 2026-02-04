import { fetchTMDB } from "@/lib/tmdb";

export async function GET() {
  const data = await fetchTMDB("/movie/popular?page=1");

  if (!data) {
    return Response.json(
      { error: "Failed to fetch movies" },
      { status: 502 }
    );
  }

  return Response.json(data);
}
