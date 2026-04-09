/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const VisitorContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function VisitorProvider({ children }) {
    // Initialize from localStorage if available
    const [hasPass, setHasPass] = useState(() => {
        return localStorage.getItem('xenova_hasPass') === 'true';
    });
    
    const [visitorName, setVisitorName] = useState(() => {
        return localStorage.getItem('xenova_visitorName') || 'ANONYMOUS';
    });

    const [decodedCodexEntries, setDecodedCodexEntries] = useState(() => {
        const name = localStorage.getItem('xenova_visitorName') || 'ANONYMOUS';
        const saved = localStorage.getItem(`xenova_decoded_${name}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const [visitedPlanets, setVisitedPlanets] = useState(() => {
        const name = localStorage.getItem('xenova_visitorName') || 'ANONYMOUS';
        const saved = localStorage.getItem(`xenova_visited_${name}`);
        return saved ? new Set(JSON.parse(saved)) : new Set([1]); // KetharaMap defaults to 1
    });

    const [viewedRelics, setViewedRelics] = useState(() => {
        const name = localStorage.getItem('xenova_visitorName') || 'ANONYMOUS';
        const saved = localStorage.getItem(`xenova_relics_${name}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const prevNameRef = useRef(visitorName);

    // Sync to local storage
    useEffect(() => {
        if (visitorName !== prevNameRef.current) {
            // User changed — load their data from local storage
            const savedDecoded = localStorage.getItem(`xenova_decoded_${visitorName}`);
            setDecodedCodexEntries(savedDecoded ? new Set(JSON.parse(savedDecoded)) : new Set());

            const savedVisited = localStorage.getItem(`xenova_visited_${visitorName}`);
            setVisitedPlanets(savedVisited ? new Set(JSON.parse(savedVisited)) : new Set([1]));

            const savedRelics = localStorage.getItem(`xenova_relics_${visitorName}`);
            setViewedRelics(savedRelics ? new Set(JSON.parse(savedRelics)) : new Set());
            
            prevNameRef.current = visitorName;
            
            localStorage.setItem('xenova_hasPass', hasPass);
            localStorage.setItem('xenova_visitorName', visitorName);
        } else {
            // Same user — save their progress
            localStorage.setItem('xenova_hasPass', hasPass);
            localStorage.setItem('xenova_visitorName', visitorName);
            localStorage.setItem(`xenova_decoded_${visitorName}`, JSON.stringify([...decodedCodexEntries]));
            localStorage.setItem(`xenova_visited_${visitorName}`, JSON.stringify([...visitedPlanets]));
            localStorage.setItem(`xenova_relics_${visitorName}`, JSON.stringify([...viewedRelics]));
        }
    }, [hasPass, visitorName, decodedCodexEntries, visitedPlanets, viewedRelics]);

    // Helpers
    const addDecodedEntry = (id) => setDecodedCodexEntries(prev => new Set([...prev, id]));
    const addVisitedPlanet = (id) => setVisitedPlanets(prev => new Set([...prev, id]));
    const addViewedRelic = (id) => setViewedRelics(prev => new Set([...prev, id]));

    const logout = () => {
        setHasPass(false);
        setVisitorName('ANONYMOUS');
    };

    return (
        <VisitorContext.Provider value={{
            hasPass, setHasPass,
            visitorName, setVisitorName,
            decodedCodexEntries, addDecodedEntry,
            visitedPlanets, addVisitedPlanet,
            viewedRelics, addViewedRelic,
            logout
        }}>
            {children}
        </VisitorContext.Provider>
    );
}

export function useVisitor() {
    return useContext(VisitorContext);
}
