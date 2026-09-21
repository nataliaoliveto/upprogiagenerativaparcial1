import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import { MovieCardNode, type MovieNodeData } from "./components/MovieCardNode";
import { WatchlistSidebar } from "./components/WatchlistSidebar";
import { useWatchlist } from "./hooks/useWatchlist";

export interface GraphMovie {
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

export default function App() {
  const [graphNodes, setGraphNodes] = useState<Node<MovieNodeData>[]>([]);
  const [movieEdges, setMovieEdges] = useState<Edge[]>([]);

  const watchlistCtrl = useWatchlist();
  const { syncWatchlistWithGraph } = watchlistCtrl;

  const movieNodeTypes = useMemo(
    () => ({
      movieCard: (props: NodeProps<MovieNodeData>) => (
        <MovieCardNode
          {...props}
          watchlist={watchlistCtrl.watchlist}
          onToggleWatchlist={watchlistCtrl.toggleWatchlist}
        />
      ),
    }),
    [watchlistCtrl.toggleWatchlist, watchlistCtrl.watchlist],
  );

  useEffect(() => {
    const fetchAndUpdateGraph = () => {
      fetch("/src/graph_data.json?t=" + new Date().getTime())
        .then((res) => res.json())
        .then((data: GraphData) => {
          if (!data || !data.nodes) {
            syncWatchlistWithGraph([]);
            return;
          }

          syncWatchlistWithGraph(data.nodes);
          if (data.nodes.length === 0) return;

          const descriptionByTarget = new Map<string, string>();
          const childrenMap = new Map<string, string[]>();

          data.edges.forEach((edge) => {
            if (edge.label) descriptionByTarget.set(edge.target, edge.label);
            if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
            childrenMap.get(edge.source)!.push(edge.target);
          });

          const targets = new Set(data.edges.map((e) => e.target));
          const rootNodes = data.nodes.filter((n) => !targets.has(n.id));
          const startNodes = rootNodes.length > 0 ? rootNodes : [data.nodes[0]];

          const nodeDepths = new Map<string, number>();
          const queue = startNodes.map((r) => ({ id: r.id, depth: 0 }));

          while (queue.length > 0) {
            const curr = queue.shift()!;
            if (!nodeDepths.has(curr.id)) {
              nodeDepths.set(curr.id, curr.depth);
              const children = childrenMap.get(curr.id) || [];
              children.forEach((c) =>
                queue.push({ id: c, depth: curr.depth + 1 }),
              );
            }
          }

          const nodesByDepth = new Map<number, GraphMovie[]>();
          data.nodes.forEach((n) => {
            const depth = nodeDepths.get(n.id) || 0;
            if (!nodesByDepth.has(depth)) nodesByDepth.set(depth, []);
            nodesByDepth.get(depth)!.push(n);
          });

          const NODE_WIDTH = 310;
          const NODE_GAP_X = 120;
          const LEVEL_HEIGHT = 660;
          const layoutCenterX = window.innerWidth / 2;

          const mappedNodes: Node<MovieNodeData>[] = data.nodes.map((movie) => {
            const depth = nodeDepths.get(movie.id) || 0;
            const levelNodes = nodesByDepth.get(depth)!;
            const indexInLevel = levelNodes.findIndex((n) => n.id === movie.id);

            const totalWidth =
              levelNodes.length * NODE_WIDTH +
              Math.max(0, levelNodes.length - 1) * NODE_GAP_X;
            const startX = layoutCenterX - totalWidth / 2;

            const x = startX + indexInLevel * (NODE_WIDTH + NODE_GAP_X);
            const y = 20 + depth * LEVEL_HEIGHT;

            const hasChildren = (childrenMap.get(movie.id)?.length || 0) > 0;
            const isHighlighted = depth === 0 || hasChildren;
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

    fetchAndUpdateGraph();
    const intervalo = setInterval(fetchAndUpdateGraph, 1000);
    return () => clearInterval(intervalo);
  }, [syncWatchlistWithGraph]);

  if (graphNodes.length === 0) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <p style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
          Bienvenida a la búsqueda de recomendaciones de películas
          <br />
          Pídele al agente recomendaciones según alguna película que te haya
          gustado
        </p>
      </div>
    );
  }

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

      <div style={{ position: "relative", flex: 1, width: "100%" }}>
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

        <WatchlistSidebar {...watchlistCtrl} />
      </div>
    </div>
  );
}
