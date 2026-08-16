import { MobileAbout } from "@/components/about/mobile/MobileAbout";

export function MobileAboutEdition() {
  return (
    <main aria-labelledby="about-title">
      <h1 id="about-title" className="sr-only">About Words Over Time</h1>
      <MobileAbout />
    </main>
  );
}
