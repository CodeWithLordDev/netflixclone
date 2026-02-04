"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";

const ADS = ["/ad/ad1.mp4"];
const AD_INTERVAL = 30;

export default function VideoWithAds({ videoSrc, title, onClose, isPremium }) {
  const videoRef = useRef(null);
  const hideControlsTimeout = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const resumeTimeRef = useRef(0);

  /* ---------------- LOCK BODY SCROLL ---------------- */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ---------------- CONTROLS VISIBILITY ---------------- */
  const handleMouseMove = () => {
    if (isAdPlaying) return; // keep visible during ad

    setShowControls(true);
    clearTimeout(hideControlsTimeout.current);

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(
        () => setShowControls(false),
        3000
      );
    }
  };

  /* ---------------- PLAY / PAUSE ---------------- */
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  /* ---------------- MUTE / VOLUME ---------------- */
  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  /* ---------------- FULLSCREEN ---------------- */
  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  /* ---------------- PROGRESS ---------------- */
  const handleProgressClick = () => {
    if (isAdPlaying) return; // 🚫 no seeking ads
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
    setProgress((videoRef.current.currentTime / duration) * 100);

    if (
      !isPremium &&
      !isAdPlaying &&
      videoRef.current.currentTime - resumeTimeRef.current >= AD_INTERVAL
    ) {
      playAd();
    }
  };

  /* ---------------- AD PLAY ---------------- */
  const playAd = () => {
    if (!videoRef.current) return;

    resumeTimeRef.current = videoRef.current.currentTime;
    setIsAdPlaying(true);
    setShowControls(true);

    videoRef.current.pause();
    videoRef.current.src = ADS[adIndex % ADS.length];

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      setIsPlaying(true);
    };

    setAdIndex((i) => i + 1);
  };

  /* ---------------- RESUME MAIN VIDEO ---------------- */
  const resumeVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    videoRef.current.src = videoSrc;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.currentTime = resumeTimeRef.current;
      videoRef.current.play();
      setIsPlaying(true);
      setIsAdPlaying(false);
    };
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!isPremium) {
      playAd();
    } else if (videoRef.current) {
      videoRef.current.src = videoSrc;
    }
  }, []);

  /* ---------------- END HANDLER ---------------- */
  const handleEnded = () => {
    if (isAdPlaying) resumeVideo();
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <div
        className="w-full h-full relative"
        onMouseMove={handleMouseMove}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-red-600 p-2 rounded-full"
        >
          <X className="text-white" />
        </button>

        {/* Title */}
        <div className="absolute top-4 left-4 z-20 text-white">
          <h2 className="font-bold">{title}</h2>
          {isAdPlaying && (
            <span className="text-xs text-red-500">Advertisement</span>
          )}
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={handleEnded}
          onClick={handlePlayPause}
        />

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <button onClick={handlePlayPause}>
                {isPlaying ? <Pause /> : <Play />}
              </button>

              <button onClick={handleMute}>
                {isMuted ? <VolumeX /> : <Volume2 />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="accent-red-600"
              />

              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button onClick={handleFullscreen}>
              <Maximize />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
