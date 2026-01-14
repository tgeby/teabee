import { useParams } from "react-router-dom";
import { useState } from "react";
import { IntervalTimer } from "./timer.types";
import { useTimer } from "@/hooks/timer/useTimer";

type TimerStatus = "idle" | "running" | "paused";

const TimerRunner = () => {
    const { id } = useParams<{ id: string }>();
    const { timer, loading, error } = useTimer(id);
    const [status, setStatus] = useState<TimerStatus>("idle");
    const [timerIndex, setTimerIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    if (loading) return <p>Loading timer...</p>;
    if (error || !timer) return <p>Timer not found</p>;

    const start = () => setStatus("running");
    const pause = () => setStatus("paused");
    const reset = () => setStatus("idle");

    return (
        <>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-text-bright line-clamp-2 whitespace-normal max-w-1/2 text-center text-ellipsis">{timer.name}</h2>
            <div className="flex flex-col items-center gap-4 font-medium text-text-bright bg-brand-primary p-6 rounded-lg">
                {status === "idle" && (
                    <button 
                        onClick={start}
                        className="text-xl sm:text-3xl bg-surface-alt p-4 rounded-lg cursor-pointer hover:bg-surface-alt/80 transition"
                    >
                        Start
                    </button>
                )}

                {status !== "idle" && (
                    <>
                        <button onClick={status === "paused" ? start : pause}>
                            {status === "paused" ? "Start" : "Stop"}
                        </button>

                        <button onClick={reset}>
                            Reset
                        </button>
                    
                    </>
                )}
                {/* countdown display */}
                <p>
                    {remainingTime !== null ? `Time Remaining: ${remainingTime} seconds` : "Not started"}
                </p>
                <p>
                    Current Interval: {timerIndex + 1} / {timer.intervals.length}
                </p>
            </div>
        </>
    );
};

export default TimerRunner;