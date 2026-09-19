import { useState, useEffect } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import myData from "./graph_data.json";

// MALA PRÁCTICA 1: Componente en el mismo archivo, sin interfaces, usando 'any'
const ComponenteFeo = (props: any) => {
  return (
    // MALA PRÁCTICA 2: Estilos en línea horribles, sin clases, diseño espantoso
    <div
      style={{
        background: "yellow",
        border: "5px dashed red",
        padding: "5px",
        width: 120,
      }}
    >
      <h3 style={{ color: "magenta", fontSize: "12px", margin: 0 }}>
        {props.data.title}
      </h3>
      <img
        src={props.data.poster}
        style={{ width: "100%", height: 80, marginTop: "5px" }}
        alt="img"
      />
    </div>
  );
};

// MALA PRÁCTICA 3: Objeto global suelto
const tipos = { feo: ComponenteFeo };

export default function App() {
  // MALA PRÁCTICA 4: Nombres de variables sin sentido
  const [x, setX] = useState<any>([]);
  const [y, setY] = useState<any>([]);

  // MALA PRÁCTICA 5: Lógica de negocio mezclada con la vista en un useEffect sucio
  useEffect(() => {
    const nodosMapeados = myData.nodes.map((item: any, i: any) => {
      return {
        id: item.id,
        type: "feo",
        position: { x: i * 200 + 50, y: i * 150 + 50 }, // Posicionamiento en diagonal rígido
        data: { title: item.title, poster: item.poster },
      };
    });
    setX(nodosMapeados);
    setY(myData.edges);
  }, [myData]);

  return (
    // MALA PRÁCTICA 6: Fondo cyan que rompe los ojos
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "cyan" }}>
      <ReactFlow nodes={x} edges={y} nodeTypes={tipos} />
    </div>
  );
}
