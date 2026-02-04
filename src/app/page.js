import Image from "next/image";
import Header from "./components/Header";
import Hero from "./components/Hero";
// import Background from "./components/Background";
import TrendingNow from "./components/TrendingNow";
import FeatureSection from "./components/FeatureSection";
export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* <Navbar /> */}
      <Hero />
      <TrendingNow />
      {/* <FeatureSection /> */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
    </main>
  );
}




