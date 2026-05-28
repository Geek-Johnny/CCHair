import Header from "@/components/header";
import MainPanel from "@/components/main-panel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <MainPanel />
      </main>
    </div>
  );
}
