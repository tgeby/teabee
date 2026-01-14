export interface FormInterval {
    h: number;
    m: number;
    s: number;
    isRest?: boolean;
}

export const normalizeDuration = (h: number, m: number, s: number) => {
    m += Math.floor(s / 60);
    s %= 60;

    h += Math.floor(m / 60);
    m %= 60;

    return { h, m, s };
};

export const formIntervalToSeconds = (interval: FormInterval): number => {
    const { h, m, s } = interval;
    return h * 3600 + m * 60 + s;
};

export const secondsToHoursMinutesSeconds = (totalSeconds: number): FormInterval => {
    const t = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return { h, m, s };
};

export const msToHoursMinutesSeconds = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
};