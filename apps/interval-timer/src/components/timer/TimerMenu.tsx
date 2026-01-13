import { useNavigate } from "react-router-dom";
import type { IntervalTimer } from "./timer.types";
import { useTimers } from "@/hooks/timer/useTimers";

const TimerMenu = () => {

    const navigate = useNavigate();
    const { timers, loading, error } = useTimers();
    const timersMock: IntervalTimer[] = [
        {name: "timer1", intervals: [{duration: 10}, {duration: 5}, {duration: 10}], id: "alskdj"},
        {name: "timer2", intervals: [{duration: 15}, {duration: 5}, {duration: 15}], id: "alskdq"}
    ];

    if (loading) return <p>Loading timers</p>

    if (error) return <p>{error}</p>

    return (
        <div className="w-1/4">
            <div id="new" className="w-full">
                <button 
                    onClick = {() => navigate(`/timer/edit/new`)}
                    className="cursor-pointer bg-surface-alt w-full rounded-full"
                >
                    Create new timer
                </button>
            </div>
            {timers.map((timer) => (
                <div key={timer.id} className="flex gap-2">
                    <p>{timer.name}</p>
                    <button 
                        onClick={() => navigate(`/timer/edit/${timer.id}`)}
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => navigate(`/timer/run/${timer.id}`)}
                    >
                        Run
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TimerMenu;