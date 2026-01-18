import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase'; 
import { useAuth } from "@repo/auth-contract";
import type { IntervalTimer } from '@/components/timer/timer.types';

interface UseTimerResult {
    timer: IntervalTimer | null;
    loading: boolean;
    error: string | null;
};

export interface TimerState {
    timer: IntervalTimer;
    timestamp: number;
}

export const useTimer = (timerId: string | null | undefined, refreshKey?: number): UseTimerResult => {
    const { user, loading: authLoading } = useAuth();
    const [timer, setTimer] = useState<IntervalTimer | null>(null);
    const [timerLoading, setTimerLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!timerId) {
            setTimer(null);
            setTimerLoading(false);
            setError(null);
            return;
        }

        // Check localStorage
        // NOTE:
        // This is only intended to prevent an accidental page reload or navigation in the TimerEditor
        // from wiping the user's changes.
        const storageKey = `timer-state:${timerId}`;
        const timerState = localStorage.getItem(storageKey);
        if (timerState) {
            try {
                const parsed: TimerState = JSON.parse(timerState);
                const timestamp: number = parsed.timestamp;    
                if (parsed?.timer && parsed.timer.id === timerId && typeof timestamp === "number") {
                    const age = Date.now() - timestamp;
                    if (age <= 60 * 60 * 1000) { // Restore draft less than an hour old
                        setTimer(parsed.timer);
                        setTimerLoading(false);
                        setError(null);
                        return;
                    } else {    // Remove expired draft
                        localStorage.removeItem(storageKey);
                    }
                }
            } catch (error: any) {
                console.log("Failed to parse stored timer state: ", error);
            }
        }

        if (authLoading) {
            setTimer(null);
            setTimerLoading(true);
            setError(null);
            return;
        }
        
        if (!user || !timerId) {
            setTimer(null);
            setTimerLoading(false);
            setError(user ? "No timer ID provided." : "User not authenticated.");
            return;
        }

        setTimerLoading(true);
        setError(null);

        const timerDocRef = doc(db, 'users', user.uid, 'timers', timerId);

        const unsubscribe = onSnapshot(timerDocRef, (docSnapshot: DocumentSnapshot<DocumentData>) => {
                if (docSnapshot.exists()) {
                    setTimer({ id: docSnapshot.id, ...docSnapshot.data() } as IntervalTimer);
                    setError(null);
                } else {
                    setTimer(null);
                    setError("Timer not found.");
                }
                setTimerLoading(false);
            }, (err) => {
                console.error("Firestore onSnapshot error for single timer:", err);
                setError("Failed to load timer in real-time.");
                setTimerLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, authLoading, timerId, refreshKey]); // Re-run effect if user or timerId changes

    return { timer, loading: timerLoading || authLoading, error };
};
