"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FastForward,
  Gauge,
  Loader2,
  Maximize,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  buildAdSchedule,
  getAdPolicy,
  normalizeViewerPlan,
} from "@/lib/ad-policy";

const QUALITY_LEVELS = [144, 360, 480, 720, 1080];
const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];
const PLAN_LIMITS = {
  free: 480,
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
  const value = String(plan || "").trim().toLowerCase();

  if (!value) return "basic";
  if (value.includes("premium")) return "premium";
  if (value.includes("standard")) return "standard";
  if (value.includes("basic")) return "basic";
  if (value.includes("free")) return "basic";

  return "basic";
}

function getAllowedQualities(limit, sources) {
  const max = Number.isFinite(limit) ? limit : PLAN_LIMITS.basic;
  const available = sources
    ? QUALITY_LEVELS.filter((quality) => Boolean(sources[quality]))
    : [];

  return available.filter((quality) => quality <= max);
}

function shuffleList(items = []) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildAdQueue(schedule, ads) {
  if (!schedule.length || !ads.length) return [];

  const pool = shuffleList(ads);

  return schedule.map((time, slotIndex) => {
    const ad = pool[slotIndex % pool.length];

    return {
      ...ad,
      slotIndex,
      startTime: time,
    };
  });
}

export default function VideoWithAds({ videoSrc, sources, title, onClose }) {
  const videoRef = useRef(null);
  const adVideoRef = useRef(null);
  const hideControlsTimeout = useRef(null);
  const pendingSeekRef = useRef(null);
  const resumePlayRef = useRef(false);
  const upgradeTimerRef = useRef(null);
  const playedSlotsRef = useRef(new Set());
  const wasPlayingBeforeAdRef = useRef(false);
  const adCountdownRef = useRef(null);
  const adImageTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [playbackRate, setPlaybackRate] = useState(1);

  const [planKey, setPlanKey] = useState("basic");
  const [planLimit, setPlanLimit] = useState(PLAN_LIMITS.basic);
  const [selectedQuality, setSelectedQuality] = useState(null);

  const [showAds, setShowAds] = useState(false);
  const [adInventory, setAdInventory] = useState([]);
  const [adPlan, setAdPlan] = useState("free");
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(0);

  const hasQualitySelector = Boolean(sources && Object.keys(sources).length > 0);

  const adPolicy = useMemo(() => getAdPolicy(adPlan), [adPlan]);

  const allowedQualities = useMemo(
    () => (hasQualitySelector ? getAllowedQualities(planLimit, sources) : []),
    [hasQualitySelector, planLimit, sources]
  );

  const effectiveQuality = useMemo(() => {
    if (!hasQualitySelector || allowedQualities.length === 0) {
      return selectedQuality;
    }

    if (selectedQuality && allowedQualities.includes(selectedQuality)) {
      return selectedQuality;
    }

    return allowedQualities[allowedQualities.length - 1];
  }, [allowedQualities, hasQualitySelector, selectedQuality]);

  const activeSource = useMemo(() => {
    if (!hasQualitySelector) return videoSrc;

    if (effectiveQuality && sources[effectiveQuality]) {
      return sources[effectiveQuality];
    }

    const fallback =
      allowedQualities.length > 0
        ? allowedQualities[allowedQualities.length - 1]
        : QUALITY_LEVELS.find((quality) => sources[quality]) || null;

    return fallback ? sources[fallback] : videoSrc;
  }, [allowedQualities, effectiveQuality, hasQualitySelector, sources, videoSrc]);

  const adTimes = useMemo(() => {
    if (!showAds || !adInventory.length || !Number.isFinite(duration) || duration <= 0) {
      return [];
    }

    return buildAdSchedule(duration, adPlan);
  }, [adInventory.length, adPlan, duration, showAds]);

  const adQueue = useMemo(() => buildAdQueue(adTimes, adInventory), [adInventory, adTimes]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAds() {
      try {
        const res = await fetch("/api/ads", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;

        setShowAds(Boolean(data?.showAds));
        setAdInventory(Array.isArray(data?.ads) ? data.ads : []);
        setAdPlan(normalizeViewerPlan(data?.viewerPlan));
      } catch {
        if (!active) return;
        setShowAds(false);
        setAdInventory([]);
        setAdPlan("premium");
      }
    }

    loadAds();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    function applyPlanLimit(limitValue, fallbackPlan) {
      const normalized = normalizePlan(fallbackPlan);
      const maxLimit = Number.isFinite(limitValue)
        ? limitValue
        : PLAN_LIMITS[normalized] || PLAN_LIMITS.basic;

      if (!active) return;
      setPlanKey(normalized);
      setPlanLimit(maxLimit);
    }

    async function fetchPlan() {
      try {
        const res = await fetch("/api/subscription", { cache: "no-store" });
        if (res.ok) {
          const subscription = await res.json();
          const plan = subscription?.planId || {};
          const planQuality = plan?.videoQuality;
          const planLimitFromQuality = VIDEO_QUALITY_LIMITS[planQuality] || null;
          applyPlanLimit(planLimitFromQuality, plan?.name);
          return;
        }
      } catch {}

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const user = await res.json();
        applyPlanLimit(null, user?.subscriptionPlan || user?.plan);
      } catch {}
    }

    fetchPlan();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    playedSlotsRef.current = new Set();
  }, [adQueue]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
      if (adCountdownRef.current) clearInterval(adCountdownRef.current);
      if (adImageTimerRef.current) clearTimeout(adImageTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const adPlayer = adVideoRef.current;
    if (!adPlayer) return;

    adPlayer.volume = volume;
    adPlayer.muted = isMuted;
  }, [isMuted, volume, currentAd]);

  useEffect(() => {
    if (!isAdPlaying || !currentAd?.videoUrl || !adVideoRef.current) return;

    const adPlayer = adVideoRef.current;
    adPlayer.currentTime = 0;
    adPlayer.volume = volume;
    adPlayer.muted = isMuted;

    const playAd = async () => {
      try {
        await adPlayer.play();
      } catch {}
    };

    playAd();
  }, [currentAd, isAdPlaying, isMuted, volume]);

  function clearAdTimers() {
    if (adCountdownRef.current) clearInterval(adCountdownRef.current);
    if (adImageTimerRef.current) clearTimeout(adImageTimerRef.current);
  }

  function scheduleSkipUnlock(adDuration) {
    const unlockIn = Math.max(
      0,
      Math.min(adPolicy.skipAfter || 5, Math.floor(Number(adDuration) || 0))
    );

    setSkipAvailable(unlockIn === 0);
    setSkipCountdown(unlockIn);

    if (unlockIn === 0) return;

    if (adCountdownRef.current) clearInterval(adCountdownRef.current);
    adCountdownRef.current = setInterval(() => {
      setSkipCountdown((current) => {
        if (current <= 1) {
          clearInterval(adCountdownRef.current);
          setSkipAvailable(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  async function recordAdView(adId, meta = {}) {
    if (!adId) return;

    try {
      await fetch("/api/ads/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, ...meta }),
      });
    } catch {}
  }

  function startAdBreak(slot) {
    if (!videoRef.current || !slot || isAdPlaying || playedSlotsRef.current.has(slot.slotIndex)) {
      return;
    }

    playedSlotsRef.current.add(slot.slotIndex);
    wasPlayingBeforeAdRef.current = !videoRef.current.paused;

    videoRef.current.pause();
    setIsPlaying(false);
    setIsAdPlaying(true);
    setCurrentAd(slot);
    setShowControls(true);
    setShowSettings(false);
    setShowSpeedMenu(false);

    scheduleSkipUnlock(slot.duration);

    if (!slot.videoUrl) {
      if (adImageTimerRef.current) clearTimeout(adImageTimerRef.current);
      adImageTimerRef.current = setTimeout(() => {
        finishAd("completed");
      }, (Number(slot.duration) || 0) * 1000);
    }
  }

  function finishAd(reason = "completed") {
    const activeAd = currentAd;

    clearAdTimers();
    setSkipAvailable(false);
    setSkipCountdown(0);
    setCurrentAd(null);
    setIsAdPlaying(false);

    if (activeAd?.id) {
      recordAdView(activeAd.id, {
        reason,
        slotIndex: activeAd.slotIndex,
        scheduledAt: activeAd.startTime,
      });
    }

    if (videoRef.current && wasPlayingBeforeAdRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function handleMouseMove() {
    if (isAdPlaying) return;

    setShowControls(true);
    clearTimeout(hideControlsTimeout.current);

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }

  function handlePlayPause() {
    if (!videoRef.current || isAdPlaying) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    videoRef.current.pause();
    setIsPlaying(false);
  }

  function handleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    if (adVideoRef.current) {
      adVideoRef.current.muted = !isMuted;
    }
    setIsMuted((current) => !current);
  }

  function handleVolumeChange(event) {
    const nextVolume = parseFloat(event.target.value);
    setVolume(nextVolume);

    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
    if (adVideoRef.current) {
      adVideoRef.current.volume = nextVolume;
      adVideoRef.current.muted = nextVolume === 0;
    }

    setIsMuted(nextVolume === 0);
  }

  function handleFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  function handleProgressChange(event) {
    if (!videoRef.current || isAdPlaying) return;

    const nextTime = Number(event.target.value);
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);

    if (duration > 0) {
      setProgress((nextTime / duration) * 100);
    }
  }

  function showUpgrade(message) {
    setUpgradeMessage(message);

    if (upgradeTimerRef.current) clearTimeout(upgradeTimerRef.current);
    upgradeTimerRef.current = setTimeout(() => {
      setUpgradeMessage("");
    }, 2500);
  }

  function handleQualitySelect(quality) {
    if (!hasQualitySelector || isAdPlaying) return;

    if (!allowedQualities.includes(quality)) {
      showUpgrade("Upgrade your plan to unlock higher quality.");
      return;
    }

    if (quality === selectedQuality) {
      setShowSettings(false);
      return;
    }

    if (!videoRef.current) return;

    pendingSeekRef.current = videoRef.current.currentTime;
    resumePlayRef.current = !videoRef.current.paused;
    setIsLoading(true);
    setIsBuffering(true);
    setSelectedQuality(quality);
    setShowSettings(false);
  }

  function handleSkip(direction) {
    if (!videoRef.current || isAdPlaying) return;

    const delta = direction === "back" ? -10 : 10;
    const target = Math.min(
      Math.max(0, videoRef.current.currentTime + delta),
      duration || videoRef.current.duration || 0
    );

    videoRef.current.currentTime = target;
    setCurrentTime(target);
  }

  function handlePlaybackRate(rate) {
    if (!videoRef.current || isAdPlaying) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }

  function maybeTriggerNextAd(nextTime) {
    if (!showAds || isAdPlaying || !adQueue.length) return;

    const nextSlot = adQueue.find(
      (slot) =>
        !playedSlotsRef.current.has(slot.slotIndex) &&
        nextTime >= slot.startTime
    );

    if (nextSlot) {
      startAdBreak(nextSlot);
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current || isAdPlaying) return;

    const nextTime = videoRef.current.currentTime;
    setCurrentTime(nextTime);

    if (duration > 0) {
      setProgress((nextTime / duration) * 100);
    }

    maybeTriggerNextAd(nextTime);
  }

  function handleLoadedMetadata() {
    if (!videoRef.current) return;

    setDuration(videoRef.current.duration || 0);
    setIsLoading(false);
    setIsBuffering(false);
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;

    if (pendingSeekRef.current !== null) {
      videoRef.current.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    }

    if (resumePlayRef.current) {
      videoRef.current.play().catch(() => {});
      resumePlayRef.current = false;
      setIsPlaying(true);
    }
  }

  const adLabel = currentAd
    ? `Ad ${currentAd.slotIndex + 1} of ${adQueue.length}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      <div className="relative h-full w-full" onMouseMove={handleMouseMove}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 rounded-full bg-red-600 p-2"
        >
          <X className="text-white" />
        </button>

        <div className="absolute left-4 top-4 z-30 text-white">
          <h2 className="font-bold">{title}</h2>
          {adTimes.length > 0 && !isAdPlaying && showAds && (
            <span className="text-xs text-white/70">
              {adPlan === "free" ? "Free plan" : "Basic plan"} • {adTimes.length} scheduled ads
            </span>
          )}
          {isAdPlaying && (
            <span className="text-xs text-red-400">
              {adLabel} • Advertisement
            </span>
          )}
        </div>

        {upgradeMessage && (
          <div className="absolute left-4 top-14 z-30 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs text-white">
            {upgradeMessage}
          </div>
        )}

        <video
          ref={videoRef}
          src={activeSource}
          className="h-full w-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onEnded={() => setIsPlaying(false)}
        />

        {isAdPlaying && currentAd && (
          <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {currentAd.videoUrl ? (
                <video
                  ref={adVideoRef}
                  src={currentAd.videoUrl}
                  className="h-full w-full object-contain"
                  autoPlay
                  playsInline
                  onEnded={() => finishAd("completed")}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#831843,#020617_55%)]">
                  {currentAd.imageUrl ? (
                    <div className="relative h-[72vh] w-[72vw] overflow-hidden rounded-3xl shadow-2xl">
                      <Image
                        src={currentAd.imageUrl}
                        alt={currentAd.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-12 text-center text-white shadow-2xl">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Sponsored
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold">{currentAd.title}</h3>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-white">
              {adLabel}
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-white">
                {skipAvailable ? "You can skip now" : `Skip in ${skipCountdown}s`}
              </div>
              <button
                onClick={() => finishAd("skipped")}
                disabled={!skipAvailable}
                className={`rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition ${
                  skipAvailable
                    ? "bg-black/65 text-white hover:bg-black/80"
                    : "cursor-not-allowed bg-black/35 text-white/50"
                }`}
                style={{ position: "relative" }}
              >
                Skip Ad
              </button>
            </div>

            <div className="absolute bottom-6 left-6 rounded-3xl border border-white/10 bg-black/70 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Now Playing
              </p>
              <h3 className="mt-2 text-xl font-semibold">{currentAd.title}</h3>
              <p className="mt-1 text-sm text-white/70">
                Main video resumes automatically when this ad finishes.
              </p>
            </div>
          </div>
        )}

        {(isLoading || isBuffering) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                {isLoading ? "Loading video..." : "Buffering..."}
              </span>
            </div>
          </div>
        )}

        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-4 transition-opacity ${
            showControls || !isPlaying || isAdPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleProgressChange}
              disabled={isAdPlaying}
              className="w-full accent-red-500"
            />
            {adTimes.map((time, index) => (
              <span
                key={`${time}-${index}`}
                className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-amber-400"
                style={{
                  left: `${duration > 0 ? (time / duration) * 100 : 0}%`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSkip("back")}
                className="transition-colors hover:text-red-500"
                disabled={isAdPlaying}
                aria-label="Rewind 10 seconds"
              >
                <Rewind className="h-5 w-5" />
              </button>

              <button onClick={handlePlayPause} disabled={isAdPlaying}>
                {isPlaying ? <Pause /> : <Play />}
              </button>

              <button
                onClick={() => handleSkip("forward")}
                className="transition-colors hover:text-red-500"
                disabled={isAdPlaying}
                aria-label="Forward 10 seconds"
              >
                <FastForward className="h-5 w-5" />
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

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((current) => !current)}
                  className="transition-colors hover:text-red-500"
                  aria-label="Playback speed"
                  disabled={isAdPlaying}
                >
                  <Gauge className="h-5 w-5" />
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-28 rounded-lg border border-white/10 bg-black/90 p-2 shadow-lg">
                    <p className="mb-1 px-2 text-xs text-white/70">Speed</p>
                    {PLAYBACK_RATES.map((rate) => {
                      const active = rate === playbackRate;

                      return (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRate(rate)}
                          className={`w-full rounded px-2 py-1 text-left text-sm transition ${
                            active
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/10"
                          }`}
                        >
                          {rate}x
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {hasQualitySelector && !isAdPlaying && (
                <div className="relative">
                  <button onClick={() => setShowSettings((current) => !current)}>
                    <Settings />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-10 right-0 w-32 rounded-lg border border-white/10 bg-black/90 p-2 shadow-lg">
                      <p className="mb-1 px-2 text-xs text-white/70">
                        Quality
                      </p>
                      {QUALITY_LEVELS.filter((quality) => sources?.[quality]).map(
                        (quality) => {
                          const disabled = !allowedQualities.includes(quality);
                              const active = quality === effectiveQuality;

                          return (
                            <button
                              key={quality}
                              onClick={() => handleQualitySelect(quality)}
                              disabled={disabled}
                              className={`w-full rounded px-2 py-1 text-left text-sm transition ${
                                active
                                  ? "bg-white/10 text-white"
                                  : "text-white/80 hover:bg-white/10"
                              } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
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

              <button onClick={handleFullscreen}>
                <Maximize />
              </button>
            </div>
          </div>

          {!isAdPlaying && showAds && adPolicy.enabled && (
            <div className="mt-3 text-xs text-white/60">
              Plan: {adPlan} • Ad policy: {adPolicy.minAds}-{adPolicy.maxAds} ads •
              Skip after {adPolicy.skipAfter}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
