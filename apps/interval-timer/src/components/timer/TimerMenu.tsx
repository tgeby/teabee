import { useNavigate } from "react-router-dom";
import { IntervalTimer } from "./timer.types";

const TimerMenu = () => {

    const navigate = useNavigate();
    const timers: IntervalTimer[] = [
        {name: "timer1", intervals: [{duration: 10}, {duration: 5}, {duration: 10}], id: "alskdj"},
        {name: "timer2", intervals: [{duration: 15}, {duration: 5}, {duration: 15}], id: "alskdq"}
    ];

    return (
        <div>
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