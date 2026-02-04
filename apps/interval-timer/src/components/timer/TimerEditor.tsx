import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import type { Interval, IntervalTimer, IntervalTimerDoc } from "./timer.types";
import { useTimer } from "@/hooks/timer/useTimer";
import { useTimerActions } from "@/hooks/timer/useTimerActions";
import { normalizeDuration, secondsToHoursMinutesSeconds, formIntervalToSeconds } from "@/hooks/timer/useIntervalConversions";
import type { FormInterval } from "@/hooks/timer/useIntervalConversions";
import type { TimerState } from "@/hooks/timer/useTimer";

const TimerEditor = () => {

    const { id } = useParams<{ id: string }>();
    const isNew = id === "new" || id === undefined;

    const [refreshKey, setRefreshKey] = useState(0);
    const [hasDraft, setHasDraft] = useState(false);
    const [name, setName] = useState("");
    const [intervals, setIntervals] = useState<FormInterval[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentInterval, setCurrentInterval] = useState<FormInterval>({
        h: 0,
        m: 0,
        s: 0,
        isRest: false,
    });

    const { addTimer, updateTimer, deleteTimer } = useTimerActions();
    const navigate = useNavigate();
    const { timer, loading, error: useTimerError } = useTimer(id, refreshKey);

    const isAddDisabled = 
        currentInterval.h === 0 &&
        currentInterval.m === 0 &&
        currentInterval.s === 0;

    const storageKey = `timer-state:${id}`;

    useEffect(() => {
        if (localStorage.getItem(storageKey) !== null) {
            setHasDraft(true);
        }
    }, [storageKey])

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
        } else {
            setName("");
            setIntervals([]);
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

    const writeToStorage = (nextIntervals: FormInterval[]) => {
        if (!id) return;

        const intervalsState = nextIntervals.map((interval: FormInterval): Interval => (
            {
                duration: formIntervalToSeconds(interval),
                isRest: interval.isRest
            }
        ));

        const timerState: IntervalTimer = {
            id,
            name,
            intervals: intervalsState
        };

        const state: TimerState = {
            timer: timerState,
            timestamp: Date.now()
        };
        setHasDraft(true);
        localStorage.setItem(storageKey, JSON.stringify(state));
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

        const nextIntervals = [...intervals, normalized];

        setIntervals(nextIntervals);
        writeToStorage(nextIntervals);

        setCurrentInterval({ h: 0, m: 0, s: 0, isRest: false });
    };

    const handleDeleteInterval = (index: number) => {
        const nextIntervals = intervals.filter((_, i) => i !== index);

        writeToStorage(nextIntervals);
        setIntervals(nextIntervals);
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

        const payload: IntervalTimerDoc = { name, intervals: reformattedIntervals };

        try {
            if (isNew) {
                await addTimer(payload);
            } else {
                await updateTimer(id, payload)
            }
            localStorage.removeItem(storageKey);
            navigate("/timer/menu");
        } catch (e) {
            console.error(e);
            setError("Failed to submit form.");
        }
    };

    const handleClearDraft = () => {
        localStorage.removeItem(storageKey);
        setRefreshKey(prev => prev + 1);
        setHasDraft(false);
    };

    const handleDeleteTimer = async() => {
        if (window.confirm("Are you sure you want to delete this timer?") && id != undefined) {
            localStorage.removeItem(storageKey);
            await deleteTimer(id);
            navigate("/timer/menu");
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
                                <div className="w-0.5 h-6 bg-text-bright mx-1 self-center" aria-hidden="true" />
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

                    <button
                        onClick={handleClearDraft}
                        className="bg-red-900 cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md p-1 btn-glow font-bold px-4"
                        type="button"
                        disabled={!hasDraft}
                    >
                        Clear Draft
                    </button>
                </div>
                
                <button 
                    className="bg-surface-alt border-16 border-brand-primary py-2 rounded-md text-text-bright text-2xl sm:text-3xl cursor-pointer disabled:cursor-not-allowed w-full flex flex-col gap-2 font-bold btn-glow"
                    disabled={intervals.length === 0 || name.length < 1}
                    type="submit"
                >
                    Submit Timer
                    {intervals.length === 0 && <p className="text-sm font-medium">Add intervals above to submit</p>}
                </button>

                {/*Hint*/}
                <p className="text-text-bright text-lg">Hint: Your timer can repeat automatically, so you may only need one work interval and one rest interval.</p>

                <div className="flex flex-col bg-brand-primary text-text-bright rounded-md pb-4">
                    <p className="text-2xl sm:text-3xl text-center bg-surface-alt rounded-t-md">Current Intervals</p>
                    {intervals.length === 0 && 
                        <p className="text-center mt-2">None</p>
                    }
                    <ul className="flex flex-col items-left gap-2 p-2 mt-2 h-[200px] overflow-y-auto custom-scrollbar">
                        {intervals.map((interval, index) => (
                            <li id={`${index}`} key={`${index}`} className="grid grid-cols-4 place-items-center">
                                <button
                                    className="bg-surface-alt size-8 rounded-full cursor-pointer text-center font-bold btn-glow"
                                    onClick={() => handleDeleteInterval(index)}
                                    type="button"
                                >
                                    X
                                </button>

                                <p className="col-span-2 text-left">{`${index+1}) ${interval.h.toString().padStart(2, "0")}:${interval.m.toString().padStart(2, "0")}:${interval.s.toString().padStart(2, "0")}`}</p>
                                {interval.isRest === true && <p className="bg-white/10 rounded-md px-2">Rest</p>}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <button
                    className="bg-red-900 disabled:bg-gray-700 py-2 rounded-md text-text-bright text-2xl sm:text-3xl cursor-pointer disabled:cursor-not-allowed w-full flex flex-col gap-2 font-bold btn-glow"
                    onClick={handleDeleteTimer}
                    type="button"
                    disabled={id === undefined || id === "new"}
                >
                    Delete Timer
                </button>
            </form>
        </div>
    );
};

export default TimerEditor;