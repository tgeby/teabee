import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { useAuth } from "@repo/auth-contract";
import { IntervalTimer } from '../../components/timer/timer.types';

interface UseTimerResult {
    timer: IntervalTimer | null;
    loading: boolean;
    error: string | null;
};

export const useTimer = (timerId: string | null): UseTimerResult => {
    const { user, loading: authLoading } = useAuth();
    const [timer, setTimer] = useState<IntervalTimer | null>(null);
    const [timerLoading, setTimerLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
    }, [user, authLoading, timerId]); // Re-run effect if user or timerId changes

    return { timer, loading: timerLoading || authLoading, error };
};
