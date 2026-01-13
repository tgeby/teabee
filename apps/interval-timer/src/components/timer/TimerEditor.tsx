import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Interval } from "./timer.types";
import { useTimer } from "@/hooks/timer/useTimer";
import { useTimerActions } from "@/hooks/timer/useTimerActions";

const normalizeDuration = (h: number, m: number, s: number) => {
    m += Math.floor(s / 60);
    s %= 60;

    h += Math.floor(m / 60);
    m %= 60;

    return { h, m, s };
}

interface FormInterval {
    h: number;
    m: number;
    s: number;
    isRest?: boolean;
}

const formIntervalToSeconds = (interval: FormInterval): number => {
    const { h, m, s } = interval;
    return h * 3600 + m * 60 + s;
};

const secondsToFormIntervalDuration = (totalSeconds: number): FormInterval => {
    const t = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return { h, m, s };
};

const TimerEditor = () => {

    const { id } = useParams<{ id: string }>();
    const isNew = id === "new" || id === undefined;

    const { timer, loading, error: useTimerError } = useTimer(isNew ? undefined : id);
    const [name, setName] = useState("");
    const [intervals, setIntervals] = useState<FormInterval[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentInterval, setCurrentInterval] = useState<FormInterval>({
        h: 0,
        m: 0,
        s: 0,
        isRest: false,
    });

    const { addTimer, updateTimer } = useTimerActions();

    const navigate = useNavigate();

    const isAddDisabled = 
        currentInterval.h === 0 &&
        currentInterval.m === 0 &&
        currentInterval.s === 0;

    // Convert the fetched intervals from duration in seconds to hours, minutes, and seconds to work with
    // in the form.
    useEffect(() => {
        if (timer) {
            setName(timer.name);

            const formIntervals: FormInterval[] = timer.intervals.map((interval) => ({
                ...secondsToFormIntervalDuration(interval.duration),
                isRest: interval.isRest,
            }));

            setIntervals(formIntervals);
        }
    }, [timer]);

    const handleNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        setName(value);
    }

    const handleDurationChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;
        const field = name as keyof FormInterval;
        setCurrentInterval(prev => ({
            ...prev,
            [field]: value === "" ? 0 : Number(value),
        }));
    };

    const handleAddInterval = () => {

        setError(null);
        if (formIntervalToSeconds(currentInterval) <= 0) {
            setError("Specify a duration before adding the interval.");
            return;
        }

        const normalized = {
            ...normalizeDuration(currentInterval.h, currentInterval.m, currentInterval.s),
            isRest: currentInterval.isRest,
        };

        setIntervals((prev) => [...prev, normalized]);
        setCurrentInterval({ h: 0, m: 0, s: 0, isRest: false });
    };

    const handleDeleteInterval = (index: number) => {
        setIntervals((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (
            event: React.FormEvent<HTMLFormElement>
        ) => {
        console.log("submitting form");
        event.preventDefault();
        setError(null);

        // Convert the FormIntervals with their durations specified in hours, minutes, and seconds into
        // total durations in seconds to write to the database.
        const reformattedIntervals: Interval[] = intervals.map((interval): Interval => ({
            duration: formIntervalToSeconds(interval),
            isRest: interval.isRest,
        }));

        const payload = { name, intervals: reformattedIntervals };

        try {
            if (isNew) {
                await addTimer(payload);
            } else {
                await updateTimer(id, payload)
            }
            navigate("/timer/menu");
        } catch (e) {
            console.error(e);
            setError("Failed to submit form.");
        }
    };

    if (!isNew && loading) {
        return <p>Loading timer…</p>;
    }

    if (!isNew && useTimerError) {
        return <p>Failed to load timer.</p>;
    }

    if (!isNew && !timer) {
        return <p>Timer not found.</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
                <div className="w-full flex flex-col justify-center items-center gap-2 bg-brand-primary rounded-lg p-4 text-text-bright"> {/*input area*/}
                    <h1 className="text-center w-full text-xl" id="form-title">Timer Editor</h1>

                    <label className="flex flex-col items-center">
                        <p>Timer Name</p>
                        <input 
                            type="text"
                            name="timer-name"
                            value={name}
                            onChange={handleNameChange}
                            className="bg-surface-alt p-2 rounded-sm h-8"
                        />
                    </label>

                    <fieldset>
                        <legend className="sr-only">Duration</legend>

                        <div className="flex flex-col items-left gap-2">
                            <p className="text-center">Duration</p>
                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="h" 
                                    min="0"
                                    max="23"
                                    step="1"
                                    value={currentInterval.h}
                                    onChange={handleDurationChange}
                                    className="bg-surface-alt p-2 rounded-sm w-14 h-8"
                                /> hours
                            </label>

                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="m" 
                                    min="0"
                                    max="59"
                                    step="1"
                                    value={currentInterval.m}
                                    onChange={handleDurationChange}
                                    className="bg-surface-alt p-2 rounded-sm w-14 h-8"
                                /> minutes
                            </label>

                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="s" 
                                    min="0"
                                    max="59"
                                    step="1"
                                    value={currentInterval.s}
                                    onChange={handleDurationChange}
                                    className="bg-surface-alt p-2 rounded-sm w-14 h-8"
                                /> seconds
                            </label>
                        </div>
                    </fieldset>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={currentInterval.isRest || false}
                            onChange={(e) =>
                                setCurrentInterval(prev => ({ ...prev, isRest: e.target.checked }))
                            }
                            className="w-4 h-4"
                        />
                        Rest Interval
                    </label>


                    <button 
                        name="add-current-interval-to-list"
                        disabled={isAddDisabled}
                        onClick={handleAddInterval}
                        className="bg-white/10 cursor-pointer disabled:cursor-not-allowed rounded-md p-1 enabled:hover:bg-white/20 font-bold h-11 px-4"
                    >
                        <span className="text-text-light">Add Interval</span>
                    </button>
                </div>

                <button 
                    className="bg-brand-primary py-4 rounded-md text-text-bright text-xl cursor-pointer disabled:cursor-not-allowed w-full hover:bg-brand-primary/90"
                    disabled={intervals.length === 0}
                    type="submit"
                >
                    Submit Timer
                </button>
                
            </form>

            <ul className="flex flex-col items-left gap-2 bg-brand-primary rounded-md text-text-bright p-2">
                <p className="text-lg text-center">Current Intervals</p>
                {intervals.map((interval, index) => (
                    <li id={`${index}`} key={`${crypto.randomUUID()}`} className="grid grid-cols-4 place-items-center">
                        <button
                            className="bg-white/10 size-8 rounded-full cursor-pointer text-center font-bold hover:bg-white/20"
                            onClick={() => handleDeleteInterval(index)}
                        >
                            X
                        </button>

                        <p className="col-span-2">{`${index+1}) ${interval.h.toString().padStart(2, "0")}:${interval.m.toString().padStart(2, "0")}:${interval.s.toString().padStart(2, "0")}`}</p>
                        {interval.isRest === true && <p>Rest</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TimerEditor;