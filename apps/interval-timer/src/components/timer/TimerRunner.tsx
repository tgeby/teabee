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
    const audioRef = useRef(new Audio("/notificationSound.mp3"));

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
        
        const timeout = setTimeout(() => {
            tick();
            
        }, 1000 - (Date.now() % 1000));

        return () => {
            clearTimeout(timeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [status, timer]);

    const advanceInterval = () => {
        const nextIndex = timerIndexRef.current + 1;

        if (!timer || nextIndex >= timer.intervals.length) {
            setStatus("idle");
            setTimeRemainingMilliseconds(null);
            currentDurationRefMilliseconds.current = null;
            startTimeRefMilliseconds.current = null;
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
        if (audioRef.current) {
            try {
                // Reset to start before playing in case it was played before
                audioRef.current.currentTime = 0; 
                await audioRef.current.play();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Playback failed during timer tick:", error.message);
                }
            }
    }
    };

    const handleStart = () => {
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }).catch((error) => {
                if (error instanceof Error) {
                    console.error("Audio failed to unlock");
                }
            });
        }

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

    const handlePlay = () => {
        if (currentDurationRefMilliseconds.current === null || status !== "paused") return; // Should add some error handling here
        
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

    const handleReset = () => {
        startTimeRefMilliseconds.current = null;
        timerIndexRef.current = 0;
        setTimerIndex(0);
        setTimeRemainingMilliseconds(null);
        setStatus("idle");
        currentDurationRefMilliseconds.current = null;
    }

    const { h: remainingHours, m: remainingMinutes, s: remainingSeconds } = timeRemainingMilliseconds !== null ? msToHoursMinutesSeconds(timeRemainingMilliseconds) : { h: 0, m: 0, s: 0 }; 


    return (
        <div className="py-8 flex flex-col items-center w-full">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-text-bright line-clamp-2 whitespace-normal max-w-1/2 text-center text-ellipsis">{timer.name}</h2>
            <div className="flex flex-col sm:px-24 items-center gap-4 font-medium text-text-bright p-6 rounded-lg text-lg sm:text-xl">
                {status === "idle" && (
                    <button 
                        onClick={handleStart}
                        className="text-xl sm:text-3xl bg-surface-alt p-4 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition btn-glow"
                    >
                        Start
                    </button>
                )}

                {status !== "idle" && (
                    <div className="flex flex-col gap-2 justify-center text-center">
                        <button 
                            onClick={status === "paused" ? handlePlay : handlePause}
                            className="text-xl sm:text-3xl bg-surface-alt p-4 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition btn-glow mx-8"
                        >
                            {status === "paused" ? "Start" : "Stop"}
                        </button>

                        {/* countdown display */}
                        <p>
                            {timeRemainingMilliseconds !== null ? `Time Remaining: ${String(remainingHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}` : "Not started"}
                        </p>
                        <p>
                            Current Interval: {timerIndex + 1} / {timer.intervals.length}
                        </p>

                        <button 
                            onClick={handleReset}
                            className="text-xl sm:text-3xl bg-red-800 p-4 rounded-lg cursor-pointer hover:bg-red-900 transition btn-glow mx-8"
                        >
                            Reset
                        </button>
                    
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimerRunner;