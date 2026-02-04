import React from 'react'
import { Plus, X, ChevronDown } from "lucide-react";
const Footer = () => {
  return (
    <div>
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
            Account
          </a>
          <a href="#" className="underline hover:text-white transition">
            Media Centre
          </a>

          <a href="#" className="underline hover:text-white transition">
            Investor Relations
          </a>
          <a href="#" className="underline hover:text-white transition">
            Jobs
          </a>
          <a href="#" className="underline hover:text-white transition">
            Ways to Watch
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
          <a href="#" className="underline hover:text-white transition">
            Contact Us
          </a>

          <a href="#" className="underline hover:text-white transition">
            Speed Test
          </a>
          <a href="#" className="underline hover:text-white transition">
            Legal Notices
          </a>
          <a href="#" className="underline hover:text-white transition">
            Only on Netflix
          </a>
        </div>

        {/* Language Dropdown */}
        <div className="relative inline-block mb-6">
          <button className="flex items-center gap-2 border border-neutral-600 px-4 py-2 text-white bg-black rounded-sm">
            🌐 English
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Region Text */}
        <p className="text-sm mb-5">Netflix India</p>

        {/* Bottom Disclaimer */}
        <p className="text-xs max-w-xl leading-relaxed text-neutral-500">
          This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
          <a href="#" className="text-blue-400 underline">
            Learn more
          </a>
          .
        </p>
    </div>
  )
}

export default Footer
