import { MobileHome } from "@/components/home/mobile/MobileHome";

export function MobileHomeEdition() {
  return (
    <main aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">Words Over Time</h1>
      <MobileHome />
    </main>
  );
}
