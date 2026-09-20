import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

interface MovieNodeData {
  title: string;
  poster: string;
  description?: string;
  genres?: string[];
}

interface WatchlistItem {
  id: string;
  title: string;
  poster: string;
  genres?: string[];
  status?: "pending" | "completed";
}

interface GraphMovie {
  id: string;
  title: string;
  poster: string;
  description?: string;
  genres?: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface GraphData {
  nodes: GraphMovie[];
  edges: GraphEdge[];
}

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

const MovieCardNode = ({
  id,
  data,
  watchlist,
  onToggleWatchlist,
}: NodeProps<MovieNodeData> & {
  watchlist: WatchlistItem[];
  onToggleWatchlist: (movie: WatchlistItem) => void;
}) => {
  const isFavorite = watchlist.some((item) => item.id === String(id));

  const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const nextMovie: WatchlistItem = {
      id: String(id),
      title: data.title,
      poster: data.poster,
      genres: data.genres ?? [],
      status: "pending",
    };

    onToggleWatchlist(nextMovie);
  };

  return (
    <div
      style={{
        width: 310,
        minHeight: 500,
        background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: 18,
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.42)",
        padding: "16px 16px 14px",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        type="button"
        aria-label={
          isFavorite ? "Quitar de la watchlist" : "Agregar a la watchlist"
        }
        className="nodrag nopan"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDownCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={handleToggleFavorite}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "1px solid rgba(250, 204, 21, 0.5)",
          background: isFavorite
            ? "rgba(250, 204, 21, 0.2)"
            : "rgba(15, 23, 42, 0.7)",
          color: isFavorite ? "#facc15" : "#e2e8f0",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 0 0 1px rgba(148, 163, 184, 0.12)",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#38bdf8",
          border: "none",
          width: 10,
          height: 10,
          top: -5,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#38bdf8",
          border: "none",
          width: 10,
          height: 10,
          bottom: -5,
        }}
      />

      <div
        style={{
          width: "100%",
          height: 250,
          borderRadius: 10,
          overflow: "hidden",
          background: "transparent",
          marginBottom: 0,
        }}
      >
        <img
          src={data.poster}
          alt={data.title}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            objectPosition: "center",
            background: "transparent",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
          justifyContent: "flex-start",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: 1.25,
            color: "#f8fafc",
            wordBreak: "break-word",
            letterSpacing: "0.08px",
          }}
        >
          {data.title}
        </h3>

        {data.description && (
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              lineHeight: 1.5,
              color: "#cbd5e1",
              wordBreak: "break-word",
            }}
          >
            {data.description}
          </p>
        )}
        {data.genres && data.genres.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "4px",
              width: "100%",
            }}
          >
            {data.genres.map((genre, idx) => (
              <span
                key={idx}
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#7dd3fc",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  letterSpacing: "0.5px",
                }}
              >
                {genre.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [graphNodes, setGraphNodes] = useState<Node<MovieNodeData>[]>([]);
  const [movieEdges, setMovieEdges] = useState<Edge[]>([]);
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
      const next: WatchlistItem[] = current.map(
        (movie): WatchlistItem =>
          movie.id === movieId
            ? {
                ...movie,
                status: movie.status === "completed" ? "pending" : "completed",
              }
            : movie,
      );

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          WATCHLIST_STORAGE_KEY,
          JSON.stringify(next),
        );
      }

      return next;
    });
  }, []);

  const movieNodeTypes = useMemo(
    () => ({
      movieCard: (props: NodeProps<MovieNodeData>) => (
        <MovieCardNode
          {...props}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
        />
      ),
    }),
    [toggleWatchlist, watchlist],
  );

  useEffect(() => {
    const fetchAndUpdateGraph = () => {
      fetch("/src/graph_data.json?t=" + new Date().getTime())
        .then((res) => res.json())
        .then((data: GraphData) => {
          if (!data || !data.nodes || data.nodes.length === 0) return;

          const descriptionByTarget = new Map<string, string>();
          const childrenMap = new Map<string, string[]>();

          // 1. Mapeamos las descripciones y quién es padre de quién
          data.edges.forEach((edge) => {
            if (edge.label) descriptionByTarget.set(edge.target, edge.label);

            if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
            childrenMap.get(edge.source)!.push(edge.target);
          });

          // 2. Encontramos la(s) película(s) principal(es) (Raíz: las que no tienen flechas apuntándoles)
          const targets = new Set(data.edges.map((e) => e.target));
          const rootNodes = data.nodes.filter((n) => !targets.has(n.id));
          const startNodes = rootNodes.length > 0 ? rootNodes : [data.nodes[0]];

          // 3. Calculamos en qué "nivel" o profundidad va cada tarjeta
          const nodeDepths = new Map<string, number>();
          const queue = startNodes.map((r) => ({ id: r.id, depth: 0 }));

          while (queue.length > 0) {
            const curr = queue.shift()!;
            if (!nodeDepths.has(curr.id)) {
              nodeDepths.set(curr.id, curr.depth);
              const children = childrenMap.get(curr.id) || [];
              // Los hijos van un nivel más abajo
              children.forEach((c) =>
                queue.push({ id: c, depth: curr.depth + 1 }),
              );
            }
          }

          // 4. Agrupamos los nodos por nivel para centrarlos en la pantalla
          const nodesByDepth = new Map<number, GraphMovie[]>();
          data.nodes.forEach((n) => {
            const depth = nodeDepths.get(n.id) || 0;
            if (!nodesByDepth.has(depth)) nodesByDepth.set(depth, []);
            nodesByDepth.get(depth)!.push(n);
          });

          // Constantes de diseño
          const NODE_WIDTH = 310;
          const NODE_GAP_X = 120; // Espacio horizontal entre tarjetas
          const LEVEL_HEIGHT = 660; // Qué tan abajo aparece cada nueva "tanda"
          const layoutCenterX = window.innerWidth / 2;

          // 5. Asignamos la posición final (X, Y) y el brillo
          const mappedNodes: Node<MovieNodeData>[] = data.nodes.map((movie) => {
            const depth = nodeDepths.get(movie.id) || 0;
            const levelNodes = nodesByDepth.get(depth)!;
            const indexInLevel = levelNodes.findIndex((n) => n.id === movie.id);

            // Matemáticas para centrar la fila de tarjetas
            const totalWidth =
              levelNodes.length * NODE_WIDTH +
              Math.max(0, levelNodes.length - 1) * NODE_GAP_X;
            const startX = layoutCenterX - totalWidth / 2;

            const x = startX + indexInLevel * (NODE_WIDTH + NODE_GAP_X);
            const y = 20 + depth * LEVEL_HEIGHT; // Cada nivel baja 660px

            // Lógica del Brillo: Brilla si es raíz o si tiene hijos
            const hasChildren = (childrenMap.get(movie.id)?.length || 0) > 0;
            const isRoot = depth === 0;
            const isHighlighted = isRoot || hasChildren;

            const desc = descriptionByTarget.get(movie.id) || movie.description;

            return {
              id: movie.id,
              type: "movieCard",
              position: { x, y },
              data: {
                title: movie.title,
                poster: movie.poster,
                description: desc,
                genres: movie.genres,
              },
              style: isHighlighted
                ? {
                    boxShadow:
                      "0 0 0 1px rgba(125, 211, 252, 0.55), 0 0 24px rgba(59, 130, 246, 0.42)",
                  }
                : {},
            };
          });

          const mappedEdges: Edge[] = data.edges.map((edge) => ({
            id: edge.id,
            source: String(edge.source),
            target: String(edge.target),
            animated: true,
            type: "smoothstep",
            style: { stroke: "#7dd3fc", strokeWidth: 1.5, opacity: 0.85 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#7dd3fc",
              width: 12,
              height: 12,
            },
            sourceHandle: "bottom",
            targetHandle: "top",
          }));

          setGraphNodes(mappedNodes);
          setMovieEdges(mappedEdges);
        })
        .catch((err) => console.log("Esperando datos...", err));
    };

    // Primera ejecución inmediata
    fetchAndUpdateGraph();

    // Bucle de consulta cada 1 segundo
    const intervalo = setInterval(fetchAndUpdateGraph, 1000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        background: "#0f172a",
        color: "#f8fafc",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px 24px 12px",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "0.2px",
          color: "#f8fafc",
          background: "#0f172a",
          width: "100%",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        Recomendaciones similares de películas
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
        }}
      >
        <ReactFlow
          nodes={graphNodes}
          edges={movieEdges}
          nodeTypes={movieNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.45, minZoom: 0.65, maxZoom: 1.2 }}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          minZoom={0.6}
          maxZoom={1.5}
          style={{ background: "#0f172a", width: "100%", height: "100%" }}
        />

        <aside
          style={{
            position: "absolute",
            right: 18,
            top: 18,
            width: 260,
            maxHeight: "calc(100% - 36px)",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.42)",
            padding: 14,
            boxSizing: "border-box",
            overflowY: "auto",
            zIndex: 5,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#f8fafc",
              }}
            >
              Watchlist
            </h4>
            <span
              style={{
                fontSize: 12,
                color: "#facc15",
                background: "rgba(250, 204, 21, 0.12)",
                border: "1px solid rgba(250, 204, 21, 0.2)",
                borderRadius: 999,
                padding: "4px 8px",
              }}
            >
              {watchlist.length}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() =>
                setWatchlistSort((current) =>
                  current === "asc" ? "desc" : "asc",
                )
              }
              style={{
                flex: 1,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(56, 189, 248, 0.18)",
                color: "#f8fafc",
                borderRadius: 8,
                padding: "6px 8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {watchlistSort === "asc" ? "A–Z" : "Z–A"}
            </button>
          </div>

          {availableGenres.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedGenre("all")}
                style={{
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  background:
                    selectedGenre === "all"
                      ? "rgba(250, 204, 21, 0.18)"
                      : "rgba(15, 23, 42, 0.8)",
                  color: "#f8fafc",
                  borderRadius: 999,
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                Todas
              </button>
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  style={{
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    background:
                      selectedGenre === genre
                        ? "rgba(56, 189, 248, 0.18)"
                        : "rgba(15, 23, 42, 0.8)",
                    color: selectedGenre === genre ? "#7dd3fc" : "#e2e8f0",
                    borderRadius: 999,
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {watchlist.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              No hay películas guardadas todavía.
            </p>
          ) : sortedWatchlist.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: "#cbd5e1",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              No hay películas para este género.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <h5
                  style={{
                    margin: "0 0 8px",
                    color: "#f8fafc",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Pendientes
                </h5>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {pendingWatchlist.map((movie) => (
                    <div
                      key={movie.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid rgba(100, 116, 139, 0.35)",
                        borderRadius: 12,
                        padding: 8,
                      }}
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: 42,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            color: "#f8fafc",
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {movie.title}
                        </span>
                        {movie.genres && movie.genres.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                              marginTop: 2,
                            }}
                          >
                            {movie.genres.map((genre) => (
                              <span
                                key={`${movie.id}-${genre}`}
                                style={{
                                  color: "#7dd3fc",
                                  background: "rgba(56, 189, 248, 0.12)",
                                  border: "1px solid rgba(125, 211, 252, 0.22)",
                                  borderRadius: 999,
                                  fontSize: 8,
                                  letterSpacing: "0.4px",
                                  padding: "1px 5px",
                                  lineHeight: 1.4,
                                  textTransform: "uppercase",
                                }}
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMovieStatus(movie.id)}
                        aria-label={`Marcar como vista: ${movie.title}`}
                        style={{
                          border: "1px solid rgba(34, 197, 94, 0.4)",
                          background: "rgba(34, 197, 94, 0.12)",
                          color: "#86efac",
                          borderRadius: 999,
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5
                  style={{
                    margin: "0 0 8px",
                    color: "#f8fafc",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Vistas
                </h5>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {completedWatchlist.map((movie) => (
                    <div
                      key={movie.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "rgba(22, 101, 52, 0.25)",
                        border: "1px solid rgba(34, 197, 94, 0.35)",
                        borderRadius: 12,
                        padding: 8,
                      }}
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: 42,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            color: "#f8fafc",
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {movie.title}
                        </span>
                        {movie.genres && movie.genres.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                              marginTop: 2,
                            }}
                          >
                            {movie.genres.map((genre) => (
                              <span
                                key={`${movie.id}-${genre}`}
                                style={{
                                  color: "#86efac",
                                  background: "rgba(34, 197, 94, 0.12)",
                                  border: "1px solid rgba(134, 239, 172, 0.2)",
                                  borderRadius: 999,
                                  fontSize: 8,
                                  letterSpacing: "0.4px",
                                  padding: "1px 5px",
                                  lineHeight: 1.4,
                                  textTransform: "uppercase",
                                }}
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMovieStatus(movie.id)}
                        aria-label={`Marcar como pendiente: ${movie.title}`}
                        style={{
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#fca5a5",
                          borderRadius: 999,
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
