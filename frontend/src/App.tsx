import { useEffect, useState } from "react";
import ReactFlow, {
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

interface MovieNodeData {
  title: string;
  poster: string;
  description?: string;
  genres?: string[];
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

const MovieCardNode = ({ data }: { data: MovieNodeData }) => {
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
              marginBottom: "4px",
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

const nodeTypes = {
  movieCard: MovieCardNode,
} as const;

export default function App() {
  const [movieNodes, setMovieNodes] = useState<Node<MovieNodeData>[]>([]);
  const [movieEdges, setMovieEdges] = useState<Edge[]>([]);

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

          setMovieNodes(mappedNodes);
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

      <ReactFlow
        nodes={movieNodes}
        edges={movieEdges}
        nodeTypes={nodeTypes}
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
    </div>
  );
}
