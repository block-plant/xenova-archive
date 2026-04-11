import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const VisitorContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function VisitorProvider({ children }) {
    // resets on refresh so the archive is always a clean slate
    const [hasPass, setHasPass] = useState(false);
    const [visitorName, setVisitorName] = useState('ANONYMOUS');
    const [decodedCodexEntries, setDecodedCodexEntries] = useState(new Set());
    const [visitedPlanets, setVisitedPlanets] = useState(new Set([1])); 
    const [viewedRelics, setViewedRelics] = useState(new Set());

    // progress trackers
    const addDecodedEntry = (id) => setDecodedCodexEntries(prev => new Set([...prev, id]));
    const addVisitedPlanet = (id) => setVisitedPlanets(prev => new Set([...prev, id]));
    const addViewedRelic = (id) => setViewedRelics(prev => new Set([...prev, id]));

    // skip the whole process for judging/testing
    const bypassForJudge = () => {
        const ALL_PLANET_IDS = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
        const ALL_RELIC_IDS  = new Set([1,2,3,4,5,6,7,8]);
        const ALL_CODEX_IDS  = new Set(['CE-001','CE-002','CE-003','CE-004','CE-005','CE-006','CE-007','CE-008']);
        setVisitedPlanets(ALL_PLANET_IDS);
        setViewedRelics(ALL_RELIC_IDS);
        setDecodedCodexEntries(ALL_CODEX_IDS);
        setHasPass(true);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // github accounts are auto-verified
                if (user.emailVerified || (user.providerData && user.providerData.some(p => p.providerId === 'github.com'))) {
                    setHasPass(true);
                    setVisitorName(user.displayName || user.email.split('@')[0].toUpperCase());
                } else {
                    setHasPass(false);
                    setVisitorName('ANONYMOUS');
                    // leaving them logged in so the UI can catch the unverified state and show the error message
                }
            } else {
                setHasPass(false);
                setVisitorName('ANONYMOUS');
            }
        });
        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setHasPass(false);
            setVisitorName('ANONYMOUS');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <VisitorContext.Provider value={{
            hasPass, setHasPass,
            visitorName, setVisitorName,
            decodedCodexEntries, addDecodedEntry, setDecodedCodexEntries,
            visitedPlanets, addVisitedPlanet, setVisitedPlanets,
            viewedRelics, addViewedRelic, setViewedRelics,
            logout,
            bypassForJudge
        }}>
            {children}
        </VisitorContext.Provider>
    );
}

export function useVisitor() {
    return useContext(VisitorContext);
}
