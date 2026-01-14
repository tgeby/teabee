import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Interval } from "./timer.types";
import { useTimer } from "@/hooks/timer/useTimer";
import { useTimerActions } from "@/hooks/timer/useTimerActions";
import { normalizeDuration, secondsToHoursMinutesSeconds, formIntervalToSeconds } from "@/hooks/timer/intervalConversions";

interface FormInterval {
    h: number;
    m: number;
    s: number;
    isRest?: boolean;
}

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
                ...secondsToHoursMinutesSeconds(interval.duration),
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

    const handleDurationFocus = (
        event: React.FocusEvent<HTMLInputElement>
    ) => {
        event.target.select();

        document.body.style.overflow = "hidden";
    };

    const handleDurationBlur = () => {
        document.body.style.overflow = "";
    };

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

    const handleEnterToNext = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key !== "Enter") return;

        e.preventDefault(); 

        const form = e.currentTarget.form;
        if (!form) return;

        const elements = Array.from(
            form.querySelectorAll<HTMLInputElement>(
                'input, button, select, textarea'
                )
        ).filter(el => !el.disabled && el.type !== "hidden");

        const index = elements.indexOf(e.currentTarget);
        const next = elements[index + 1];

        next?.focus();
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
        return <p className="loading">Loading timer…</p>;
    }

    if (!isNew && useTimerError) {
        return <p className="error">Failed to load timer.</p>;
    }

    if (!isNew && !timer) {
        return <p className="error">Timer not found.</p>;
    }

    return (
        <div className="flex flex-col max-w-[500px] gap-4 text-lg sm:text-2xl font-medium p-4">
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col justify-center items-center gap-4 bg-brand-primary rounded-lg p-4 text-text-bright"> {/*input area*/}
                    <h1 className="text-center w-full text-2xl sm:text-3xl" id="form-title">Timer Editor</h1>

                    <label className="flex gap-2">
                        Name:
                        <input 
                            type="text"
                            name="timer-name"
                            value={name}
                            onChange={handleNameChange}
                            className="bg-surface-alt p-2 rounded-sm h-8 w-full"
                            onKeyDown={handleEnterToNext}
                        />
                    </label>

                    <p className="text-center" id="interval-label">Current Interval</p>
                    <fieldset aria-labelledby="interval-label">
                        <legend className="sr-only">Current Interval Input Area</legend>
                        <div className="flex gap-1 flex-row items-center">
                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="h" 
                                    min="0"
                                    max="23"
                                    step="1"
                                    inputMode="numeric"
                                    onFocus={handleDurationFocus}
                                    onBlur={handleDurationBlur}
                                    value={currentInterval.h}
                                    onChange={handleDurationChange}
                                    className={`bg-surface-alt rounded-sm w-10 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:cursor-ns-resize`}
                                    onKeyDown={handleEnterToNext}
                                />
                                <span className="flex items-center pb-1 text-text-bright self-center">:</span>
                            </label>

                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="m" 
                                    min="0"
                                    max="59"
                                    step="1"
                                    inputMode="numeric"
                                    onFocus={handleDurationFocus}
                                    onBlur={handleDurationBlur}
                                    value={currentInterval.m}
                                    onChange={handleDurationChange}
                                    className={`bg-surface-alt rounded-sm w-10 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:cursor-ns-resize`}
                                    onKeyDown={handleEnterToNext}
                                />
                                <span className="flex items-center pb-1 text-text-bright self-center">:</span>
                            </label>

                            <label className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    name="s" 
                                    min="0"
                                    max="59"
                                    step="1"
                                    inputMode="numeric"
                                    onFocus={handleDurationFocus}
                                    onBlur={handleDurationBlur}
                                    value={currentInterval.s}
                                    onChange={handleDurationChange}
                                    className={`bg-surface-alt rounded-sm w-10 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:cursor-ns-resize`}
                                    onKeyDown={handleEnterToNext}
                                />
                                <div className="w-[2px] h-6 bg-text-bright mx-1 self-center" aria-hidden="true" />
                            </label>

                            <button 
                                type="button"
                                className={"rounded-md transition-colors cursor-pointer px-3 flex items-center gap-2 bg-surface-alt text-text-bright btn-glow h-8"}
                                onClick={() => setCurrentInterval(prev => ({ ...prev, isRest: !prev.isRest }))}
                            >
                                <span className={`w-2 h-2 rounded-full ${currentInterval.isRest ? "bg-white" : "bg-black/20"}`}></span>

                                Rest
                            </button>
                        </div>
                    </fieldset>


                    <button 
                        name="add-current-interval-to-list"
                        disabled={isAddDisabled}
                        onClick={handleAddInterval}
                        className="bg-surface-alt cursor-pointer disabled:cursor-not-allowed rounded-md p-1 btn-glow font-bold px-4"
                    >
                        <span className="text-text-light">Add Interval</span>
                    </button>
                </div>
                
                <div className="flex flex-col bg-brand-primary text-text-bright rounded-md">
                    <p className="text-2xl sm:text-3xl text-center bg-surface-alt rounded-t-md">Current Intervals</p>
                    {intervals.length === 0 && 
                        <p className="text-center text-sm">None</p>
                    }
                    <ul className="flex flex-col items-left gap-2 p-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                        {intervals.map((interval, index) => (
                            <li id={`${index}`} key={`${index}`} className="grid grid-cols-4 place-items-center">
                                <button
                                    className="bg-surface-alt size-8 rounded-full cursor-pointer text-center font-bold btn-glow"
                                    onClick={() => handleDeleteInterval(index)}
                                >
                                    X
                                </button>

                                <p className="col-span-2">{`${index+1}) ${interval.h.toString().padStart(2, "0")}:${interval.m.toString().padStart(2, "0")}:${interval.s.toString().padStart(2, "0")}`}</p>
                                {interval.isRest === true && <p className="bg-white/10 rounded-md px-2">Rest</p>}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                    className="bg-surface-alt border-16 border-brand-primary py-2 rounded-md text-text-bright text-2xl sm:text-3xl cursor-pointer disabled:cursor-not-allowed w-full enabled:hover:bg-surface-alt/80 flex flex-col gap-2 font-bold shadow-xl hover:brightness-90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    disabled={intervals.length === 0}
                    type="submit"
                >
                    Submit Timer
                    {intervals.length === 0 && <p className="text-sm font-medium">Add intervals above to submit</p>}
                </button>
                
            </form>
        </div>
    );
};

export default TimerEditor;