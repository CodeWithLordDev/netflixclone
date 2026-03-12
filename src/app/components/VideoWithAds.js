"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";

const AD_INTERVAL = 30;

export default function VideoWithAds({ videoSrc, title, onClose }) {
  const videoRef = useRef(null);
  const hideControlsTimeout = useRef(null);
  const resumeTimeRef = useRef(0);
  const lastAdTimeRef = useRef(0);

  const [ads, setAds] = useState([]);
  const [showAds, setShowAds] = useState(false);
  const [adsReady, setAdsReady] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  const [currentAdId, setCurrentAdId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadAds = async () => {
      try {
        const res = await fetch("/api/ads", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setShowAds(Boolean(data?.showAds));
        setAds(Array.isArray(data?.ads) ? data.ads : []);
      } catch (error) {
        setShowAds(false);
        setAds([]);
      } finally {
        if (active) setAdsReady(true);
      }
    };
    loadAds();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!adsReady) return;
    if (showAds && ads.length > 0) {
      playAd(true);
    } else if (videoRef.current) {
      videoRef.current.src = videoSrc;
    }
  }, [adsReady, showAds, ads.length, videoSrc]);

  const handleMouseMove = () => {
    if (isAdPlaying) return;

    setShowControls(true);
    clearTimeout(hideControlsTimeout.current);

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

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

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const handleProgressClick = () => {
    if (isAdPlaying) return;
  };

  const recordAdView = async (adId) => {
    if (!adId) return;
    try {
      await fetch("/api/ads/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
    } catch (error) {
      // silent
    }
  };

  const playAd = (isPreRoll = false) => {
    if (!videoRef.current || ads.length === 0) return;

    resumeTimeRef.current = isPreRoll ? 0 : videoRef.current.currentTime;
    setIsAdPlaying(true);
    setShowControls(true);

    const nextAd = ads[adIndex % ads.length];
    setCurrentAdId(nextAd.id);

    videoRef.current.pause();
    videoRef.current.src = nextAd.videoUrl;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      setIsPlaying(true);
    };

    setAdIndex((i) => i + 1);
  };

  const resumeVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    videoRef.current.src = videoSrc;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.currentTime = resumeTimeRef.current;
      lastAdTimeRef.current = resumeTimeRef.current;
      videoRef.current.play();
      setIsPlaying(true);
      setIsAdPlaying(false);
      setCurrentAdId(null);
    };
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
    setProgress((videoRef.current.currentTime / duration) * 100);

    if (showAds && !isAdPlaying && ads.length > 0) {
      if (videoRef.current.currentTime - lastAdTimeRef.current >= AD_INTERVAL) {
        playAd(false);
      }
    }
  };

  const handleEnded = () => {
    if (isAdPlaying) {
      recordAdView(currentAdId);
      resumeVideo();
    }
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <div className="w-full h-full relative" onMouseMove={handleMouseMove}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-red-600 p-2 rounded-full"
        >
          <X className="text-white" />
        </button>

        <div className="absolute top-4 left-4 z-20 text-white">
          <h2 className="font-bold">{title}</h2>
          {isAdPlaying && <span className="text-xs text-red-500">Advertisement</span>}
        </div>

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={handleEnded}
          onClick={handlePlayPause}
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <button onClick={handlePlayPause}>
                {isPlaying ? <Pause /> : <Play />}
              </button>

              <button onClick={handleMute}>{isMuted ? <VolumeX /> : <Volume2 />}</button>

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
