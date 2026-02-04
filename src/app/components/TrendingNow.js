"use client";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Plus, X, ChevronDown } from "lucide-react";
import Footer from  "./Footer"
export default function TrendingNow() {
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const trending = [
    {
      id: 1,
      title: "Idli Kadai",
      img: "/Assets/Trending_images/idli_kadai.png",
    },
    { id: 2, title: "Narasimha", img: "/Assets/Trending_images/narsimha.png" },
    {
      id: 3,
      title: "The Witcher",
      img: "/Assets/Trending_images/the_witcher.png",
    },
    { id: 4, title: "Saiyaara", img: "/Assets/Trending_images/saiyaara.png" },
    {
      id: 5,
      title: "Baap of Bollywood",
      img: "/Assets/Trending_images/the_ba_ds.png",
    },
    { id: 6, title: "War 2", img: "/Assets/Trending_images/war_2.png" },
    {
      id: 7,
      title: "Kurukshetra",
      img: "/Assets/Trending_images/kurukshetra.png",
    },
    { id: 8, title: "OG", img: "/Assets/Trending_images/they_call_him.png" },
    { id: 9, title: "Wednesday", img: "/Assets/Trending_images/wednesday.png" },
    {
      id: 10,
      title: "Baramulla",
      img: "/Assets/Trending_images/baramulla.png",
    },
  ];

  const reasons = [
    {
      title: "Enjoy on your TV",
      desc: "Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.",
      icon: "📺",
    },
    {
      title: "Download your shows to watch offline",
      desc: "Save your favourites easily and always have something to watch.",
      icon: "⬇️",
    },
    {
      title: "Watch everywhere",
      desc: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.",
      icon: "📱",
    },
    {
      title: "Create profiles for kids",
      desc: "Send kids on adventures in a space just for them — free with your membership.",
      icon: "🎭",
    },
  ];

  const faqData = [
    {
      question: "What is Netflix?",
      answer:
        "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries and more – on thousands of internet-connected devices.\n\nYou can watch as much as you want, whenever you want, without a single ad – all for one low monthly price. There's always something new to discover, and new TV shows and movies are added every week!",
    },
    {
      question: "How much does Netflix cost?",
      answer:
        "Watch Netflix on your smartphone, tablet, smart TV, laptop, or streaming device for one fixed monthly fee. Plans range to fit your budget.",
    },
    {
      question: "Where can I watch?",
      answer:
        "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal device.",
    },
    {
      question: "How do I cancel?",
      answer:
        "Netflix is flexible. There are no annoying contracts and no commitments. Cancel online anytime.",
    },
    {
      question: "What can I watch on Netflix?",
      answer:
        "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more.",
    },
    {
      question: "Is Netflix good for kids?",
      answer:
        "Netflix Kids experience is designed to give parents control and kids a safe space to enjoy family-friendly content.",
    },
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ---- ARC Behind Trending ---- */}
      <div className="relative w-full flex justify-center mt-10">
        <div
          className="absolute z-10 top-0 w-[80%] h-40 
          bg-gradient-to-b from-[#ff0055]/30 to-transparent 
          rounded-b-[100%] blur-3xl opacity-80"
        ></div>
      </div>

      {/* ---- TRENDING SECTION ---- */}
      <div className="w-[80%] mx-auto relative z-20">
        <h2 className="text-3xl font-bold mt-10">Trending Now</h2>

        <div className="relative mt-6">
          {/* ---- LEFT ARROW ---- */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-2 rounded-full"
            >
              <FaChevronLeft size={30} />
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-scroll no-scrollbar space-x-8 scroll-smooth px-16"
          >
            {trending.map((movie, index) => (
              <div key={movie.id} className="relative min-w-[220px]">
                {/* Bigger Card */}
                <img
                  src={movie.img}
                  className="rounded-xl w-[220px] h-[320px] object-cover 
    shadow-lg
    transition-all duration-300 ease-in-out
    hover:scale-110 hover:shadow-2xl "
                />

                {/* Bigger Index Number */}
                <span
                  className="absolute -left-8 bottom-5 
            text-8xl font-extrabold opacity-90 drop-shadow-xl"
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </div>

          {/* ---- RIGHT ARROW ---- */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-2 rounded-full"
            >
              <FaChevronRight size={30} />
            </button>
          )}
        </div>
      </div>

      {/* ---- MORE REASONS TO JOIN ---- */}
      <div className="w-[80%] mx-auto mt-14">
        <h2 className="text-3xl font-bold mb-6">More reasons to join</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reasons.map((item, i) => (
            <div
              key={i}
              className="bg-[#120f23] border border-gray-700 
                rounded-xl p-6 hover:bg-[#1c162f] transition"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl h-[75vh] mx-auto text-white mt-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Frequently Asked Questions
        </h2>

        {faqData.map((item, index) => (
          <div key={index} className="mb-2">
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full bg-[#2d2d2d] hover:bg-[#3a3a3a] p-5 flex justify-between items-center text-left text-xl transition-all duration-300"
            >
              <span>{item.question}</span>

              {openIndex === index ? (
                <X size={30} className="text-white" />
              ) : (
                <Plus size={30} className="text-white" />
              )}
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-500 bg-[#2d2d2d] ${
                openIndex === index ? "max-h-[500px] p-5" : "max-h-0 p-0"
              }`}
            >
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full bg-black text-neutral-400 px-6 md:px-24 py-10 mt-10">
        {/* Top Email Section */}
        <div className="text-center mb-10">
          <p className="text-sm md:text-base mb-4">
            Ready to watch? Enter your email to create or restart your
            membership.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full md:w-[380px] px-4 py-3 bg-transparent border border-neutral-600 rounded-sm text-white placeholder-neutral-400 focus:outline-none"
            />

            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-sm text-lg font-medium flex items-center gap-2 transition">
              Get Started
              <span className="text-xl">›</span>
            </button>
          </div>
        </div>

        {/* Contact */}
        <Footer/>
      </div>
    </div>
  );
}
