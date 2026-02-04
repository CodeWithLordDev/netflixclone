import React from "react";
import Navbar from "./Header";
import { Plus, X, ChevronDown } from "lucide-react";

const page = () => {
  return (
    <div className="bg-white w-screen min-h-screen">
      <Navbar />
      <div className="w-[37rem] relative top-10 mx-auto p-6">
        {/* Icons */}
        <div className="flex  text-red-600 mb-4 justify-start flex-col gap-6 ">
          <img
            src="/Assets/Images/picture_laptop.png"
            alt="Picture of laptop mobile dekstop"
            height={70}
            width={300}
          />
        </div>

        {/* Step */}
        <p className="text-sm mb-1">Step 1 of 3</p>

        {/* Heading */}
        <h1 className="text-4xl font-bold mb-2">
          Finish setting up your account
        </h1>

        {/* Description */}
        <p className="mb-6 text-base">
          We will send a sign-up link to <strong>ayushtemkar9@gmail.com</strong>{" "}
          so you can use Netflix without a password on any device at any time.
        </p>

        {/* Button */}
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 w-full rounded">
          Send Link
        </button>
      </div>
      <div className=" bottom-0 w-full pt-[8rem]">
        <div className="container mx-auto p-10">
          <div className="mb-8">
            <p className="text-sm">
              Questions? Call{" "}
              <a href="#" className="underline hover:text-white transition">
                000-800-919-1743
              </a>
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
            <a href="#" className="underline hover:text-white transition">
              FAQ
            </a>
            <a href="#" className="underline hover:text-white transition">
              Help Centre
            </a>
            <a href="#" className="underline hover:text-white transition">
              Terms of Use
            </a>

            <a href="#" className="underline hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="underline hover:text-white transition">
              Cookie Preferences
            </a>
            <a href="#" className="underline hover:text-white transition">
              Corporate Information
            </a>
          </div>

          {/* Language Dropdown */}
          <div className="relative inline-block mb-6">
            <button className="flex items-center gap-2 border border-neutral-600 px-4 py-2 text-white bg-black rounded-sm">
              🌐 English
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
