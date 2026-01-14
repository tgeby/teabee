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

    if (loading) return <p className="loading">Loading timers</p>

    if (error) return <p className="error">{error}</p>

    return (
        <div className="mt-4 max-w-3/4 sm:max-w-3/4 bg-brand-primary p-4 rounded-md flex flex-col justify-center gap-4 text-lg sm:text-2xl text-text-bright font-medium">
            <div id="new" className="flex flex-col justify-center">
                <button 
                    onClick = {() => navigate(`/timer/edit/new`)}
                    className="rounded-md transition-colors cursor-pointer px-3 flex items-center gap-2 bg-surface-alt text-text-bright btn-glow h-8 self-center"
                >
                    Create new timer
                </button>
            </div>
            {timers.map((timer) => (
                <div key={timer.id} className="grid grid-cols-4 justify-center gap-4 text-sm sm:text-lg">
                    <p className="line-clamp-2 whitespace-normal text-center col-span-2 max-w-64">{timer.name}</p>
                    <button 
                        onClick={() => navigate(`/timer/edit/${timer.id}`)}
                        className="rounded-md transition-colors cursor-pointer bg-surface-alt text-text-bright btn-glow h-8 text-center px-1 sm:px-2 w-full max-w-32 place-self-center"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => navigate(`/timer/run/${timer.id}`)}
                        className="rounded-md transition-colors cursor-pointer bg-surface-alt text-text-bright btn-glow h-8 text-center px-1 sm:px-2 w-full max-w-32 place-self-center"
                    >
                        Run
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TimerMenu;