import { useEffect, useState } from "react";
import ReactFlow, { Handle, Position, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import graphData from "./graph_data.json";

interface MovieNodeData {
  title: string;
  poster: string;
  description?: string;
}

interface GraphMovie {
  id: string;
  title: string;
  poster: string;
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

const data = graphData as GraphData;
const DEFAULT_MAIN_MOVIE_ID = "157336";

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
      </div>
    </div>
  );
};

const nodeTypes = {
  movieCard: MovieCardNode,
} as const;

const CARD_WIDTH = 190;
const CARD_HEIGHT = 300;

export default function App() {
  const [movieNodes, setMovieNodes] = useState<Node<MovieNodeData>[]>([]);
  const [movieEdges, setMovieEdges] = useState<Edge[]>([]);
  const [mainMovieTitle, setMainMovieTitle] = useState<string>(
    "la película principal",
  );

  useEffect(() => {
    const mainMovieId = DEFAULT_MAIN_MOVIE_ID;
    const mainMovie =
      data.nodes.find((movie) => movie.id === mainMovieId) ?? data.nodes[0];
    const secondaryMovies = data.nodes.filter(
      (movie) => movie.id !== mainMovie.id,
    );
    const descriptionByTarget = new Map<string, string>();

    data.edges.forEach((edge) => {
      if (edge.label) {
        descriptionByTarget.set(edge.target, edge.label);
      }
    });

    const mainNodeWidth = 310;
    const secondaryStartY = 660;
    const secondaryGapX = 430;
    const layoutCenterX = window.innerWidth / 2;
    const secondaryTotalWidth =
      Math.max(0, secondaryMovies.length - 1) * secondaryGapX + mainNodeWidth;
    const secondaryStartX = layoutCenterX - secondaryTotalWidth / 2;
    const mainNodeX = layoutCenterX - mainNodeWidth / 2;
    const mainNodeY = 20;

    const mappedNodes: Node<MovieNodeData>[] = data.nodes.map((movie) => {
      const isMainMovie = movie.id === mainMovie.id;

      if (isMainMovie) {
        return {
          id: movie.id,
          type: "movieCard",
          position: { x: mainNodeX, y: mainNodeY },
          data: {
            title: movie.title,
            poster: movie.poster,
            description:
              "Un grupo de exploradores usan un agujero de gusano para viajar mucho más allá de las limitaciones del espacio y del tiempo.",
          },
          style: {
            boxShadow:
              "0 0 0 1px rgba(125, 211, 252, 0.55), 0 0 24px rgba(59, 130, 246, 0.42)",
          },
        };
      }

      const relatedIndex = secondaryMovies.findIndex(
        (secondaryMovie) => secondaryMovie.id === movie.id,
      );
      const nodeX = secondaryStartX + relatedIndex * secondaryGapX;

      return {
        id: movie.id,
        type: "movieCard",
        position: {
          x: nodeX,
          y: secondaryStartY,
        },
        data: {
          title: movie.title,
          poster: movie.poster,
          description: descriptionByTarget.get(movie.id),
        },
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
        type: "arrowclosed",
        color: "#7dd3fc",
        width: 12,
        height: 12,
      },
      sourceHandle: "bottom",
      targetHandle: "top",
    }));

    setMainMovieTitle(mainMovie.title);
    setMovieNodes(mappedNodes);
    setMovieEdges(mappedEdges);
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
        Recomendaciones similares a {mainMovieTitle}
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
