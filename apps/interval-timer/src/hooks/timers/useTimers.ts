import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { IntervalTimer } from '../../components/timer/timer.types';
import { useAuth } from "@repo/auth-contract";


interface UseTimersResult {
    timers: IntervalTimer[];
    loading: boolean;
    error: string | null;
};

export const useTimers = (): UseTimersResult => {
    const { user, loading: authLoading } = useAuth();
    const [timers, setTimers] = useState<IntervalTimer[]>([]);
    const [timersLoading, setTimersLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            setTimers([]);
            setTimersLoading(true);
            setError(null);
            return;
        }

        if (!user) {
            setTimers([]);
            setTimersLoading(false);
            setError("User not authenticated.");
            return;
        }

        setTimersLoading(true);
        setError(null);

        const userTimersCollectionRef = collection(db, 'users', user.uid, 'timers');
        const q = query(userTimersCollectionRef);

        const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
            const fetchedTimers: IntervalTimer[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as IntervalTimer[];
            setTimers(fetchedTimers);
            setTimersLoading(false);
            setError(null);
        }, (err) => {
            console.error("Firestore onSnapshot error:", err);
            setError("Failed to load timers in real-time.");
            setTimersLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]); // Re-run effect if the user changes

    return { timers, loading: authLoading || timersLoading, error };
};
