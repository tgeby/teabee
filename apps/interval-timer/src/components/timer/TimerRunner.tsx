import { useParams } from "react-router-dom";
import { useState } from "react";
import { IntervalTimer } from "./timer.types";
import { useTimer } from "@/hooks/timer/useTimer";

type TimerStatus = "idle" | "running" | "paused";

const TimerRunner = () => {
    const { id } = useParams<{ id: string }>();
    const { timer, loading, error } = useTimer(id);
    const [status, setStatus] = useState<TimerStatus>("idle");

    if (loading) return <p>Loading timer...</p>;
    if (error || !timer) return <p>Timer not found</p>;

    const start = () => setStatus("running");
    const pause = () => setStatus("paused");
    const reset = () => setStatus("idle");

    return (
        <div>
            <h1>Timer Runner</h1>
            
             {status === "idle" && (
                <button onClick={start}>Start</button>
            )}

            {status !== "idle" && (
                <>
                    <button onClick={status === "paused" ? start : pause}>
                        {status === "paused" ? "Start" : "Stop"}
                    </button>

                    <button onClick={reset}>
                        Reset
                    </button>

                    <p>
                        {/* countdown display */}
                    </p>
                </>
            )}
        </div>
    );
};

export default TimerRunner;