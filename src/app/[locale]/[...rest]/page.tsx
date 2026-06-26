import { notFound } from "next/navigation";

// Captura cualquier ruta desconocida bajo un idioma y muestra el 404 localizado.
export default function CatchAllPage() {
  notFound();
}
