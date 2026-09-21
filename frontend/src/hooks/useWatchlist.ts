import { useState, useMemo, useCallback } from "react";
import type { WatchlistItem } from "../components/MovieCardNode.tsx";

const WATCHLIST_STORAGE_KEY = "watchlist";

const readWatchlistFromStorage = (): WatchlistItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WatchlistItem =>
      Boolean(
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.poster === "string" &&
        (item.genres === undefined || Array.isArray(item.genres)) &&
        (item.status === undefined ||
          item.status === "pending" ||
          item.status === "completed"),
      ),
    );
  } catch {
    return [];
  }
};

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() =>
    readWatchlistFromStorage(),
  );
  const [watchlistSort, setWatchlistSort] = useState<"asc" | "desc">("asc");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const availableGenres = useMemo(() => {
    const unique = new Set<string>();
    watchlist.forEach((movie) => {
      (movie.genres ?? []).forEach((genre) => {
        if (genre) unique.add(genre);
      });
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [watchlist]);

  const sortedWatchlist = useMemo(() => {
    const copy = [...watchlist];
    copy.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return watchlistSort === "asc" ? comparison : -comparison;
    });
    if (selectedGenre === "all") return copy;
    return copy.filter((movie) =>
      (movie.genres ?? []).some((genre) => genre === selectedGenre),
    );
  }, [selectedGenre, watchlist, watchlistSort]);

  const pendingWatchlist = useMemo(
    () => sortedWatchlist.filter((movie) => movie.status !== "completed"),
    [sortedWatchlist],
  );

  const completedWatchlist = useMemo(
    () => sortedWatchlist.filter((movie) => movie.status === "completed"),
    [sortedWatchlist],
  );

  const toggleWatchlist = useCallback((movie: WatchlistItem) => {
    setWatchlist((current) => {
      const exists = current.some((item) => item.id === movie.id);
      const next = exists
        ? current.filter((item) => item.id !== movie.id)
        : [...current, movie];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          WATCHLIST_STORAGE_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const toggleMovieStatus = useCallback((movieId: string) => {
    setWatchlist((current) => {
      const next: WatchlistItem[] = current.map((movie) => {
        if (movie.id !== movieId) return movie;

        const nextStatus: WatchlistItem["status"] =
          movie.status === "completed" ? "pending" : "completed";

        return {
          ...movie,
          status: nextStatus,
        };
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          WATCHLIST_STORAGE_KEY,
          JSON.stringify(next),
        );
      }
      return next;
    });
  }, []);

  const syncWatchlistWithGraph = useCallback(
    (currentGraphNodes: { id: string }[]) => {
      setWatchlist((current) => {
        const synced = current.filter((movie) =>
          currentGraphNodes.some((node) => node.id === movie.id),
        );
        if (synced.length !== current.length && typeof window !== "undefined") {
          window.localStorage.setItem(
            WATCHLIST_STORAGE_KEY,
            JSON.stringify(synced),
          );
        }
        return synced;
      });
    },
    [],
  );

  return {
    watchlist,
    watchlistSort,
    setWatchlistSort,
    selectedGenre,
    setSelectedGenre,
    availableGenres,
    sortedWatchlist,
    pendingWatchlist,
    completedWatchlist,
    toggleWatchlist,
    toggleMovieStatus,
    syncWatchlistWithGraph,
  };
};
