"use client";
import StreamFlixLogo from "./StreamFlixLogo";

export default function Navbar() {
  return (
    <header className="relative z-20 flex items-center border-b-2 border-[#676060] justify-between px-40 py-8">
      <div className="flex items-center">
        <StreamFlixLogo className="h-[6rem] w-auto" />
      </div>

      <div className="flex items-center gap-4">
        
        <button className=" hover:bg-gray-300 hover:underline text-black font-semibold px-4 py-1 rounded text-sm font-semibold">
          Sign In
        </button>
      </div>
    </header>
  );
}
