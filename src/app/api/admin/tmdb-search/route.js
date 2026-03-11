import { requireAnyPermission } from "@/lib/auth/guard";
import { Permissions } from "@/lib/auth/permissions";
import { apiError, apiOk } from "@/lib/api";

export async function GET(request) {
  const gate = await requireAnyPermission([Permissions.CONTENT_VIEW, Permissions.CONTENT_MANAGE]);
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return apiOk({ results: [] });

  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return apiOk({ results: [], error: "TMDB_MISSING" });
  }

  const endpoint = `/search/multi?query=${encodeURIComponent(q)}&include_adult=false&page=1`;
  const url = token
    ? `https://api.themoviedb.org/3${endpoint}`
    : `https://api.themoviedb.org/3${endpoint}&api_key=${encodeURIComponent(apiKey)}`;

  let data = null;
  try {
    const res = await fetch(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : {
            Accept: "application/json",
          },
      cache: "no-store",
    });
    if (!res.ok) {
      return apiOk({ results: [], error: "TMDB_HTTP" });
    }
    data = await res.json();
  } catch (error) {
    console.error("TMDB SEARCH FAILED:", error);
    return apiOk({ results: [], error: "TMDB_UNREACHABLE" });
  }

  if (!data || !Array.isArray(data.results)) {
    return apiOk({ results: [], error: "TMDB_INVALID" });
  }

  const results = data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv");
  return apiOk({ results });
}
