import StreamFlixLogo from "./StreamFlixLogo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-12 py-4 bg-black/80">
      <StreamFlixLogo className="h-[6rem] w-auto" />
    </nav>
  );
}
