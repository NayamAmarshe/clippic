import dynamic from "next/dynamic";

const CanvasComponent = dynamic(() => import("../components/Fabric"), {
  ssr: false,
});

export default function Home() {
  return <CanvasComponent />;
}
