"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Settings,
  Loader2,
} from "lucide-react";

const QUALITY_LEVELS = [144, 360, 480, 720, 1080];
const PLAN_LIMITS = {
  basic: 480,
  standard: 720,
  premium: 1080,
};
const VIDEO_QUALITY_LIMITS = {
  SD: 480,
  HD: 720,
  FHD: 1080,
  "4K": 2160,
};

function formatTime(time) {
  if (!time || Number.isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizePlan(plan) {
  if (!plan) return "basic";
  const value = String(plan).trim().toLowerCase();
  if (value.includes("premium")) return "premium";
  if (value.includes("standard")) return "standard";
  if (value.includes("basic")) return "basic";
  return "basic";
}

function getAllowedQualities(limit, sources) {
  const max = Number.isFinite(limit) ? limit : PLAN_LIMITS.basic;
  const available = sources
    ? QUALITY_LEVELS.filter((q) => Boolean(sources[q]))
    : [];
  return available.filter((q) => q <= max);
}

export default function VideoPlayer({ videoUrl, sources, title, onClose }) {
  const videoRef = useRef(null);
  const hideControlsTimeout = useRef(null);
  const pendingSeekRef = useRef(null);
  const resumePlayRef = useRef(false);
  const upgradeTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const [planKey, setPlanKey] = useState("basic");
  const [planLimit, setPlanLimit] = useState(PLAN_LIMITS.basic);
  const [selectedQuality, setSelectedQuality] = useState(null);

  const hasQualitySelector = Boolean(sources && Object.keys(sources).length > 0);

  const allowedQualities = useMemo(
    () => (hasQualitySelector ? getAllowedQualities(planLimit, sources) : []),
    [planLimit, sources, hasQualitySelector]
  );

  const activeSource = useMemo(() => {
    if (hasQualitySelector) {
      if (selectedQuality && sources[selectedQuality]) {
        return sources[selectedQuality];
      }
      const fallback =
        allowedQualities.length > 0
          ? allowedQualities[allowedQualities.length - 1]
          : QUALITY_LEVELS.find((q) => sources[q]) || null;
      return fallback ? sources[fallback] : videoUrl;
    }
    return videoUrl;
  }, [hasQualitySelector, selectedQuality, sources, allowedQualities, videoUrl]);

  useEffect(() => {
    let active = true;
    const applyPlanLimit = (limitValue, fallbackPlan) => {
      const normalized = normalizePlan(fallbackPlan);
      const maxLimit = Number.isFinite(limitValue)
        ? limitValue
        : PLAN_LIMITS[normalized] || PLAN_LIMITS.basic;
      if (active) {
        setPlanKey(normalized);
        setPlanLimit(maxLimit);
      }
    };

    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        if (res.ok) {
          const subscription = await res.json();
          const plan = subscription?.planId || {};
          const planQuality = plan?.videoQuality;
          const planLimitFromQuality = VIDEO_QUALITY_LIMITS[planQuality] || null;
          const planName = plan?.name;
          applyPlanLimit(planLimitFromQuality, planName);
          return;
        }
      } catch (error) {
        // fall through to user profile
      }

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const user = await res.json();
        applyPlanLimit(null, user?.subscriptionPlan || user?.plan);
      } catch (error) {
        // Default to basic if request fails
      }
    };

    fetchPlan();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasQualitySelector) return;
    if (allowedQualities.length === 0) return;
    if (!selectedQuality || !allowedQualities.includes(selectedQuality)) {
      setSelectedQuality(allowedQualities[allowedQualities.length - 1]);
    }
  }, [allowedQualities, hasQualitySelector, selectedQuality]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
    };
  }, []);

  const showUpgrade = (message) => {
    setUpgradeMessage(message);
    if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
    upgradeTimerRef.current = setTimeout(() => setUpgradeMessage(""), 2500);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    if (videoRef.current.duration) {
      setProgress((time / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    setIsLoading(false);
    setIsBuffering(false);
    if (pendingSeekRef.current !== null) {
      videoRef.current.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    }
    if (resumePlayRef.current) {
      videoRef.current.play();
      resumePlayRef.current = false;
      setIsPlaying(true);
    }
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const nextTime = Number(e.target.value);
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    if (duration > 0) setProgress((nextTime / duration) * 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleQualitySelect = (quality) => {
    if (!hasQualitySelector) return;
    if (!allowedQualities.includes(quality)) {
      showUpgrade("Upgrade your plan to unlock higher quality.");
      return;
    }
    if (quality === selectedQuality) {
      setShowSettings(false);
      return;
    }
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    pendingSeekRef.current = current;
    resumePlayRef.current = !videoRef.current.paused;
    setIsLoading(true);
    setIsBuffering(true);
    setSelectedQuality(quality);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div
        className="w-full h-full relative bg-black flex flex-col"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close player"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div
          className={`absolute top-4 left-4 z-20 transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-white text-lg font-semibold drop-shadow-lg">
            {title}
          </h2>
        </div>

        {upgradeMessage && (
          <div className="absolute top-16 left-4 z-30 bg-black/80 text-white text-sm px-4 py-2 rounded-full border border-white/10">
            {upgradeMessage}
          </div>
        )}

        <div className="flex-1 relative w-full">
          <video
            ref={videoRef}
            src={activeSource}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handlePlayPause}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            className="w-full h-full object-contain absolute inset-0"
          />

          {(isLoading || isBuffering) && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">
                  {isLoading ? "Loading video..." : "Buffering..."}
                </span>
              </div>
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-all duration-300 ${
              showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full accent-red-500 mb-4"
            />

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="hover:text-red-500 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMute}
                    className="hover:text-red-500 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 rounded cursor-pointer accent-red-500"
                  />
                </div>

                <span className="text-sm tabular-nums text-white/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {hasQualitySelector && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings((prev) => !prev)}
                      className="hover:text-red-500 transition-colors"
                      aria-label="Quality settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {showSettings && (
                      <div className="absolute right-0 bottom-10 bg-black/90 border border-white/10 rounded-lg p-2 w-32 shadow-lg">
                        <p className="text-xs text-white/70 mb-1 px-2">
                          Quality
                        </p>
                        {QUALITY_LEVELS.filter((q) => sources?.[q]).map(
                          (quality) => {
                            const disabled = !allowedQualities.includes(quality);
                            const active = quality === selectedQuality;
                            return (
                              <button
                                key={quality}
                                onClick={() => handleQualitySelect(quality)}
                                disabled={disabled}
                                className={`w-full text-left px-2 py-1 rounded text-sm transition ${
                                  active
                                    ? "bg-white/10 text-white"
                                    : "text-white/80 hover:bg-white/10"
                                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                {quality}p
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleFullscreen}
                  className="hover:text-red-500 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {!isPlaying && !isLoading && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 transition-all"
              aria-label="Play"
            >
              <div className="bg-white/10 rounded-full p-4 backdrop-blur-md hover:scale-110 transition-all">
                <Play className="w-16 h-16 fill-current" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
