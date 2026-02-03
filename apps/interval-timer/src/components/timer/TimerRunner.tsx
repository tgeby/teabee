import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTimer } from "@/hooks/timer/useTimer";
import { msToHoursMinutesSeconds } from "@/hooks/timer/useIntervalConversions";

type TimerStatus = "idle" | "running" | "paused";

const TimerRunner = () => {
    const { id } = useParams<{ id: string }>();
    const { timer, loading, error } = useTimer(id);
    const [status, setStatus] = useState<TimerStatus>("idle");
    const statusRef = useRef<TimerStatus>(status);
    const [timerIndex, setTimerIndex] = useState(0);
    const timerIndexRef = useRef(0);
    const currentDurationRefMilliseconds = useRef<number | null>(null);
    const startTimeRefMilliseconds = useRef<number | null>(null);
    const [timeRemainingMilliseconds, setTimeRemainingMilliseconds] = useState<number | null>(null);
    const tickIntervalRef = useRef<number | null>(null);
    const persistIntervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showInteractionNeeded, setShowInteractionNeeded] = useState(false);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        if (status !== "running") return;
        if (!timer) return;
        
        const tick = () => {
            if (startTimeRefMilliseconds.current === null || currentDurationRefMilliseconds.current === null) return;

            const elapsedMs = Date.now() - startTimeRefMilliseconds.current;
            const remainingMs = Math.max(0, currentDurationRefMilliseconds.current - elapsedMs);            
            setTimeRemainingMilliseconds(remainingMs);

            if (remainingMs === 0) {
                startTimeRefMilliseconds.current = null;
                playAudio();
                advanceInterval();
            }
        }

        tick();
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = window.setInterval(tick, 200);

        return () => {
            if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current);
                tickIntervalRef.current = null;
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

    const playAudio = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.currentTime = 0;
        audio.muted = false;
        audio.play().catch((e) => console.error("Audio playback failed:", e));
    };

    const initAndUnlockAudio = async () => {
        setShowInteractionNeeded(false);
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
    
    useEffect(() => {
        if (id) {
            readFromLocalStorage();
        }
    }, [id]);

    useEffect(() => {
        if (status === "idle")
            return;
        if (status === "paused") {
            if (persistIntervalRef.current) {
                clearInterval(persistIntervalRef.current);
                persistIntervalRef.current = null;
            }
            writeToLocalStorage();
            return;
        }

        if (persistIntervalRef.current) clearInterval(persistIntervalRef.current);
        persistIntervalRef.current = window.setInterval(writeToLocalStorage, 2000);
        return () => {
            if (persistIntervalRef.current) {
                clearInterval(persistIntervalRef.current);
                persistIntervalRef.current = null;
            }
        }
    }, [status]);

    if (!id) {
        return <p className="loading">Loading timer...</p>;
    }

    const storageKey = `timer-runner-state-${id}`;

    type timerRunnerStateType = {
        writeTime: number;
        timerIndex: number;
        status: TimerStatus;
        startTime: number | null;
        currentDuration: number;
    }

    const writeToLocalStorage = () => {
        if (currentDurationRefMilliseconds.current === null || !id || statusRef.current === "idle")
            return;
        const timerRunnerState: timerRunnerStateType = {
            writeTime: Date.now(),
            timerIndex: timerIndexRef.current,
            status: statusRef.current,
            startTime: startTimeRefMilliseconds.current,
            currentDuration: currentDurationRefMilliseconds.current
        };
        localStorage.setItem(storageKey, JSON.stringify(timerRunnerState));
    };

    const readFromLocalStorage = () => {
        const timerRunnerStateRaw = localStorage.getItem(storageKey);
        if (!timerRunnerStateRaw || !id)
            return;
        try {
            const timerRunnerStateParsed: timerRunnerStateType = JSON.parse(timerRunnerStateRaw);
            const writeTime = timerRunnerStateParsed.writeTime;
            const elapsedTimeMs = Date.now() - writeTime;
            if (timerRunnerStateParsed.status === "running" && elapsedTimeMs > 60 * 1000) {
                // Only intended to prevent page reloads from resetting the timer,
                // so 1 minute is more than enough time. 
                localStorage.removeItem(storageKey);
                return;
            }
            const retrievedIndex = timerRunnerStateParsed.timerIndex;
            const retrievedStatus = timerRunnerStateParsed.status;
            const retrievedStartTime = timerRunnerStateParsed.startTime;
            const retrievedCurrentDuration = timerRunnerStateParsed.currentDuration;
            if (retrievedStatus !== "idle" && retrievedCurrentDuration != 0) {
                setTimerIndex(retrievedIndex);
                timerIndexRef.current = retrievedIndex;
                setStatus(retrievedStatus);
                startTimeRefMilliseconds.current = retrievedStartTime;
                currentDurationRefMilliseconds.current = retrievedCurrentDuration;
                if (retrievedStartTime) {
                    const elapsed = Date.now() - retrievedStartTime;
                    const timeRemaining = Math.max(0, retrievedCurrentDuration - elapsed);
                    setTimeRemainingMilliseconds(timeRemaining);
                } else {
                    setTimeRemainingMilliseconds(retrievedCurrentDuration);
                }
                if (retrievedStatus === "running") {
                    setShowInteractionNeeded(true);
                }
            }
        } catch (error) {
            console.error("Failed to parse stored timer runner state: ", error);
        }
    };

    if (loading) return <p className="loading">Loading timer...</p>;
    if (error || !timer) return <p className="error">Timer not found</p>;

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
        setShowInteractionNeeded(false);
        if (currentDurationRefMilliseconds.current === null || status !== "running" || startTimeRefMilliseconds.current === null) return;
        
        const elapsedMs = Date.now() - startTimeRefMilliseconds.current;
        currentDurationRefMilliseconds.current = Math.max(0, currentDurationRefMilliseconds.current - elapsedMs); // Upon pausing, store how much time remains
        startTimeRefMilliseconds.current = null;
        setStatus("paused");

        if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
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
        localStorage.removeItem(storageKey);
        if (tickIntervalRef.current) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
        }
        if (persistIntervalRef.current) {
            clearInterval(persistIntervalRef.current);
            persistIntervalRef.current = null;
        }
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

                        {showInteractionNeeded && 
                        <button
                            onClick={() => {
                                void initAndUnlockAudio();
                            }}
                                className="bg-surface-alt p-4 mt-2 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition btn-glow mx-4"
                            >
                                Timer state was restored after a page refresh. Please click this button to activate the notification sound.
                            </button>
                        }

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
                <p className="text-sm text-left max-w-[400px] pt-4">Notes: <br />-This timer only runs while this browser window is active. <br />-If the window is minimized, the timer may stall at the end of the current interval. <br />-You can place other windows in front of it without affecting the timer.</p>
            </div>
        </div>
    );
};

export default TimerRunner;