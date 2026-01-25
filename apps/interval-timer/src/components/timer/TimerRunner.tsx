import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTimer } from "@/hooks/timer/useTimer";
import { msToHoursMinutesSeconds } from "@/hooks/timer/useIntervalConversions";

type TimerStatus = "idle" | "running" | "paused";

const TimerRunner = () => {
    const { id } = useParams<{ id: string }>();
    const { timer, loading, error } = useTimer(id);
    const [status, setStatus] = useState<TimerStatus>("idle");
    const [timerIndex, setTimerIndex] = useState(0);
    const timerIndexRef = useRef(0);
    const currentDurationRefMilliseconds = useRef<number | null>(null);
    const startTimeRefMilliseconds = useRef<number | null>(null);
    const [timeRemainingMilliseconds, setTimeRemainingMilliseconds] = useState<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (status !== "running") return;
        if (!timer) return;
        
        const tick = () => {
            if (startTimeRefMilliseconds.current === null || currentDurationRefMilliseconds.current === null) return;

            const ellapsedMs = Date.now() - startTimeRefMilliseconds.current;
            const remainingMs = Math.max(0, currentDurationRefMilliseconds.current - ellapsedMs);            
            setTimeRemainingMilliseconds(remainingMs);

            if (remainingMs === 0) {
                playAudio();
                advanceInterval();
            }
        }

        tick();
        intervalRef.current = window.setInterval(tick, 200);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [status, timer]);

    const advanceInterval = () => {
        const nextIndex = timerIndexRef.current + 1;

        if (!timer || nextIndex >= timer.intervals.length) {
            handleReset();
            return;
        }

        timerIndexRef.current = nextIndex;
        setTimerIndex(nextIndex);
        
        const nextDuration = timer.intervals[nextIndex]?.duration;
        if (!nextDuration) return;

        const nextDurationMs = nextDuration * 1000;
        currentDurationRefMilliseconds.current = nextDurationMs;
        startTimeRefMilliseconds.current = Date.now();
        setTimeRemainingMilliseconds(nextDurationMs);
    };

    if (loading) return <p className="loading">Loading timer...</p>;
    if (error || !timer) return <p className="error">Timer not found</p>;

    const playAudio = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 0;
        audio.muted = false;
        audio.play().catch((e) => console.error("Audio playback failed:", e));
    };

    const initAndUnlockAudio = async () => {
        
        if (!audioRef.current) {
            audioRef.current = new Audio("/notificationSoundTrimmed.m4a");
            audioRef.current.load();
        }

        const audio = audioRef.current;
        audio.muted = true;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(e => console.error("Audio unlock failed:", e));
    };

    const handleStart = async () => {
        await initAndUnlockAudio();
        if (timer && timer.intervals[0]?.duration) {
            timerIndexRef.current = 0;
            setTimerIndex(0);
            setStatus("running");
            const firstIntervalDurationSeconds = timer.intervals[0].duration;
            const firstIntervalDurationMs = firstIntervalDurationSeconds * 1000;
            currentDurationRefMilliseconds.current = firstIntervalDurationMs;
            setTimeRemainingMilliseconds(firstIntervalDurationMs);
            startTimeRefMilliseconds.current = Date.now();
        }
    };

    const handlePlay = async () => {
        if (currentDurationRefMilliseconds.current === null || status !== "paused") return; // Should add some error handling here
        await initAndUnlockAudio();
        setStatus("running");
        setTimeRemainingMilliseconds(currentDurationRefMilliseconds.current);
        startTimeRefMilliseconds.current = Date.now();
    };

    const handlePause = () => {
        if (currentDurationRefMilliseconds.current === null || status !== "running" || startTimeRefMilliseconds.current === null) return;
        
        const ellapsedMs = Date.now() - startTimeRefMilliseconds.current;
        currentDurationRefMilliseconds.current = Math.max(0, currentDurationRefMilliseconds.current - ellapsedMs); 
        startTimeRefMilliseconds.current = null;
        setStatus("paused");

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const title = "Interval Timer";

    const handleReset = () => {
        startTimeRefMilliseconds.current = null;
        timerIndexRef.current = 0;
        setTimerIndex(0);
        setTimeRemainingMilliseconds(null);
        setStatus("idle");
        currentDurationRefMilliseconds.current = null;
        document.title = title;
    }

    const { h: remainingHours, m: remainingMinutes, s: remainingSeconds } = timeRemainingMilliseconds !== null ? msToHoursMinutesSeconds(timeRemainingMilliseconds) : { h: 0, m: 0, s: 0 }; 
    
    if (status != "idle") {
        document.title = title + ` ${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    return (
        <div className="py-8 flex flex-col items-center w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-bright line-clamp-2 whitespace-normal max-w-1/2 text-center text-ellipsis">{timer.name}</h2>
            <div className="flex flex-col sm:px-24 items-center gap-4 font-medium text-text-bright p-4 rounded-lg text-lg sm:text-xl">
                {status === "idle" && (
                    <button 
                        onClick={handleStart}
                        className="text-xl sm:text-2xl bg-surface-alt p-4 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition btn-glow"
                    >
                        Start
                    </button>
                )}

                {status !== "idle" && (
                    <div className="flex flex-col sm:items-center justify-center text-center text-xl sm:text-2xl ">
                        <p>
                            {timeRemainingMilliseconds !== null ? `Time Remaining: ${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}` : "Not started"}
                        </p>

                        <div className="flex py-4">
                            <button 
                                onClick={status === "paused" ? handlePlay : handlePause}
                                className="bg-surface-alt p-4 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition btn-glow mx-4"
                            >
                                {status === "paused" ? "Start" : "Stop"}
                            </button>
                            <button 
                                onClick={handleReset}
                                className="bg-red-800 p-4 rounded-lg cursor-pointer hover:bg-red-900 transition btn-glow mx-4"
                            >
                                Reset
                            </button>
                        </div>
                        <p>
                            Current Interval: {timerIndex + 1} / {timer.intervals.length}
                        </p>
                    </div>
                )}
                <p className="text-sm text-left max-w-[400px] pt-4">Notes: <br />-This timer only runs while this browser window is open and visible. <br />-If the window is minimized, the timer may stall at the end of the current interval. <br />-You can place other windows in front of it without affecting the timer.<br />-In the current verison, refreshing your page will wipe the timer state.</p>
            </div>
        </div>
    );
};

export default TimerRunner;