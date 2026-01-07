export type Interval = {
    duration: number;
    isRest?: boolean;
}

export type IntervalTimerDoc = {
    name: string;
    intervals: Interval[];
}

export type IntervalTimer = IntervalTimerDoc & {
    id: string;
}