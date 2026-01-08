import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { IntervalTimerDoc } from '../../components/timer/timer.types';
import { useAuth } from '@repo/auth-contract';

interface UseTimerActionsResult {
  addTimer: (newTimerData: IntervalTimerDoc) => Promise<string>;
  updateTimer: (timerId: string, updatedData: Partial<IntervalTimerDoc>) => Promise<void>;
  deleteTimer: (timerId: string) => Promise<void>;
};

export const useTimerActions = (): UseTimerActionsResult => {
    const { user, loading: authLoading } = useAuth();

    const checkAuthStatus = () => {
        if (authLoading) {
            throw new Error("Authentication is still loading. Cannot perform this action yet. Please wait.");
        }

        if (!user) {
            throw new Error("User not authenticated. Cannot perform this action.");
        }
    }

    const getUserTimersCollectionRef = () => {
        checkAuthStatus();
        return collection(db, 'users', user!.uid, 'timers');
    };

    const getUserTimerDocRef = (timerId: string) => {
        checkAuthStatus();
        return doc(db, 'users', user!.uid, 'timers', timerId);
    };

    const addTimer = async (newTimerData: IntervalTimerDoc): Promise<string> => {
        try {
            const docRef = await addDoc(getUserTimersCollectionRef(), newTimerData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding timer:", error);
            throw error; // Re-throw to be handled by the calling component
        }
    };

    const updateTimer = async (timerId: string, updatedData: Partial<IntervalTimerDoc>): Promise<void> => {
        try {
            await updateDoc(getUserTimerDocRef(timerId), updatedData);
        } catch (error) {
            console.error("Error updating timer:", error);
            throw error;
        }
    };

    const deleteTimer = async (timerId: string): Promise<void> => {
        try {
            await deleteDoc(getUserTimerDocRef(timerId));
        } catch (error) {
            console.error("Error deleting timer:", error);
            throw error;
        }
    };

    return { addTimer, updateTimer, deleteTimer };
};
