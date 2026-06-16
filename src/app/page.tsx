import dynamic from "next/dynamic";

const OrbiApp = dynamic(() => import("@/spa/App"), { ssr: false });

export default function HomePage() {
  return <OrbiApp />;
}
