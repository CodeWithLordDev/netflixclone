const BASE_URL = "https://api.themoviedb.org/3";

export const fetchTMDB = async (endpoint) => {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`TMDB Error: ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("TMDB FETCH FAILED:", err);
    return null;
  }
};
