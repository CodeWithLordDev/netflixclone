// components/CheckInbox.js
import React from 'react';

const CheckInbox = () => {
  return (
    <section className="max-w-md mx-auto p-6 text-center">
      {/* Animated envelope icon */}
      <div className="mb-4 inline-block animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="url(#redGradient)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <radialGradient id="redGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e50914" stopOpacity="1" />
              <stop offset="100%" stopColor="#b0060f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M3 8l7.89 5.26a3 3 0 003.22 0L21 8m0 0v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0L12 13 3 8" />
        </svg>
      </div>

      <p className="text-sm mb-1">Step 1 of 3</p>
      <h2 className="text-xl font-bold mb-3">Check your inbox</h2>
      <p className="mb-6 text-base max-w-xs mx-auto">
        We sent a sign-up link to <strong>ayushtemkar9@gmail.com</strong>. Tap the link in the email to finish setting up your account.
      </p>

      <button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded w-full mb-3"
        onClick={() => alert('Resend link clicked')}
      >
        Resend Link
      </button>
      <button
        className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-3 px-8 rounded w-full"
        onClick={() => alert('Create password clicked')}
      >
        Create Password Instead
      </button>
    </section>
  );
};

export default CheckInbox;
