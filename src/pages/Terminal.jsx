import React, { useState, useEffect, useRef } from 'react';

// --- STYLES ---
const terminalStyles = `
@keyframes flicker {
  0% { opacity: 0.9; text-shadow: 0 0 4px #00FFD1; }
  5% { opacity: 0.8; text-shadow: 0 0 2px #00FFD1; }
  10% { opacity: 0.9; text-shadow: 0 0 5px #00FFD1; }
  15% { opacity: 1; text-shadow: 0 0 8px #00FFD1; }
  25% { opacity: 0.8; text-shadow: 0 0 3px #00FFD1; }
  35% { opacity: 0.95; text-shadow: 0 0 5px #00FFD1; }
  100% { opacity: 1; text-shadow: 0 0 4px #00FFD1; }
}

@keyframes scanline {
  0% { transform: translateY(-10px); }
  100% { transform: translateY(110vh); }
}

@keyframes blinkCursor {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes pulseText {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.terminal-container {
  height: 100vh;
  width: 100vw;
  background-color: #030507;
  color: #00FFD1;
  font-family: 'Courier New', Courier, monospace;
  padding: 80px 40px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.terminal-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
    linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 4px, 6px 100%;
  pointer-events: none;
  z-index: 50;
}

.terminal-container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20vh;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(0, 255, 209, 0.05) 50%,
    rgba(255,255,255,0)
  );
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 51;
}

.terminal-glow {
  text-shadow: 0 0 5px rgba(0, 255, 209, 0.6), 0 0 10px rgba(0, 255, 209, 0.4);
}

.terminal-header {
  border-bottom: 1px dotted rgba(0, 255, 209, 0.4);
  padding-bottom: 15px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  animation: flicker 4s infinite alternate;
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 15px;
  font-size: 1.05rem;
  line-height: 1.4;
  letter-spacing: 0.05em;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,255,209,0.3) transparent;
}

.terminal-output::-webkit-scrollbar {
  width: 6px;
}
.terminal-output::-webkit-scrollbar-thumb {
  background: rgba(0,255,209,0.3);
}

.terminal-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dotted rgba(0, 255, 209, 0.2);
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 1.1rem;
  outline: none;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
  letter-spacing: 0.05em;
}

.prompt-prefix {
  color: #A0E8D8;
  font-weight: bold;
}
.prompt-dir {
  color: #00FFD1;
}
.prompt-symbol {
  color: #7AAFC4;
}

.sys-text { color: #8892b0; font-style: italic; }
.err-text { color: #ff3366; text-shadow: 0 0 5px rgba(255, 51, 102, 0.6); }
.ans-text { color: #e6f1ff; }
.hdr-text { color: #64ffda; font-weight: bold; }
.quiz-text { color: #ffd700; text-shadow: 0 0 5px rgba(255, 215, 0, 0.4); }

.ascii-art {
  font-size: 0.7rem;
  line-height: 1.1;
  white-space: pre;
  color: #00FFD1;
  margin: 10px 0;
  text-shadow: 0 0 3px rgba(0, 255, 209, 0.4);
}
`;

// --- DATA ---
const ASCII_LOGO = `
\\\\\\\\\\\\\\   \\\\\\\\\\\\\\                            
 \\\\\\\\\\   \\\\\\\\\\\\\\   X E N O V A           
  \\\\\\\\\\ \\\\\\\\\\\\\\    A R C H I V E S       
   \\\\\\\\\\\\\\\\\\                             
   \\\\\\\\\\\\\\\\                            T E R M I N A L
  \\\\\\\\\\ \\\\\\\\\\\\                         S Y S T E M   V2.4
 \\\\\\\\\\   \\\\\\\\\\\\\\                       
`;

const INITIAL_BOOT_SEQ = [
  { text: "INIT KERNEL... [OK]", delay: 100, type: "sys-text" },
  { text: "LOADING ARCHIVE DRIVERS... [OK]", delay: 300, type: "sys-text" },
  { text: "ESTABLISHING UPLINK WITH RELIC DATABASE... [OK]", delay: 700, type: "sys-text" },
  { text: "OVERRIDING SECURITY PROTOCOLS... [OK]", delay: 1100, type: "pwd-override" },
  { text: "WARN: UNAUTHORIZED ACCESS DETECTED in SECTOR 7", delay: 1300, type: "err-text" },
  { text: "WELCOME TO THE XENOVA COMMAND LINE.", delay: 1800, type: "hdr-text" },
  { text: "Type 'help' to see available commands.", delay: 2000, type: "ans-text" }
];

const HELP_TEXT = `
AVAILABLE COMMANDS:
------------------------------------------------------
> help          - Display this help menu
> clear         - Clear the terminal screen
> clear         - Clear the terminal screen
> pwd           - Show current planetary directory
> generate quiz - Synthesize Ketharan knowledge assessment
> sysinfo       - Display system status and connection metrics
------------------------------------------------------
`;

const SYSINFO_TEXT = `
SYSTEM HOST:   U.S.S. VANGUARD ORBITAL RELAY
UPTIME:        472 YEARS, 12 DAYS, 4 HOURS
MEMORY:        99.4TB / 100.0TB ALLOCATED
NETWORK:       ENCRYPTED QUANTUM TUNNEL [STABLE]
CURRENT USER:  VISITOR-NULL
SECURITY:      LEVEL 1 (READ-ONLY)
`;

// --- COMPONENT ---
const Terminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [isBooting, setIsBooting] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [history, isBooting, isGenerating]);

    // Focus input on click anywhere
    const handleContainerClick = () => {
        if (inputRef.current) inputRef.current.focus();
    };

    // Boot sequence
    useEffect(() => {
        let isSubscribed = true;
        
        const runBootSequence = async () => {
            // Give a tiny initial pause
            await new Promise(r => setTimeout(r, 400));
            
            for (let i = 0; i < INITIAL_BOOT_SEQ.length; i++) {
                if (!isSubscribed) return;
                const seq = INITIAL_BOOT_SEQ[i];
                await new Promise(r => setTimeout(r, seq.delay - (i > 0 ? INITIAL_BOOT_SEQ[i-1].delay : 0)));
                
                setHistory(prev => [...prev, {
                    type: seq.type === 'pwd-override' ? 'sys-text terminal-glow' : seq.type,
                    content: seq.text
                }]);
            }
            if (!isSubscribed) return;
            setIsBooting(false);
            if (inputRef.current) inputRef.current.focus();
        };

        runBootSequence();

        return () => { isSubscribed = false; };
    }, []);

    const executeCommand = (cmd) => {
        const command = cmd.trim().toLowerCase();
        
        // Push user command to history
        setHistory(prev => [...prev, {
            type: 'user',
            content: (
                <div>
                   <span className="prompt-prefix">root@xenova</span>:<span className="prompt-dir">~/archive</span><span className="prompt-symbol">$</span> {cmd}
                </div>
            )
        }]);

        if (command === '') return;

        switch (command) {
            case 'help':
                setHistory(prev => [...prev, { type: 'ans-text', content: HELP_TEXT }]);
                break;
            case 'clear':
                setHistory([]);
                break;
            case 'pwd':
                setHistory(prev => [...prev, { type: 'ans-text', content: '/sectors/kethara/archive/main' }]);
                break;
            case 'sysinfo':
                setHistory(prev => [...prev, { type: 'ans-text', content: SYSINFO_TEXT }]);
                break;
            case 'generate quiz':
                startQuizGeneration();
                break;
            default:
                setHistory(prev => [...prev, { 
                    type: 'err-text', 
                    content: `sh: command not found: ${command}. Type 'help' for available commands.` 
                }]);
        }
    };

    const startQuizGeneration = () => {
        setIsGenerating(true);
        setHistory(prev => [...prev, { type: 'sys-text', content: 'INITIALIZING SYNTHESIS ALGORITHMS...' }]);
        
        setTimeout(() => {
            setHistory(prev => [...prev, { type: 'sys-text', content: 'EXTRACTING RELIC DATA [100%]' }]);
            setTimeout(() => {
                setHistory(prev => [
                    ...prev,
                    { type: 'sys-text', content: 'COMPILED ASSESSMENT:' },
                    { type: 'quiz-text terminal-glow', content: '\n[ QUESTION 1 ]' },
                    { type: 'ans-text', content: "According to the Vex'al codex, what was the primary energy source powering the ancient Seed Lattice architecture found in the deepest craters of planet Kethara?" },
                    { type: 'ans-text', content: '  [A] Thermonuclear fusion harvested from the core.' },
                    { type: 'ans-text', content: '  [B] Void ambient resonance fields.' },
                    { type: 'ans-text', content: '  [C] Synthesized light from captured neighboring stars.' },
                    { type: 'ans-text', content: '  [D] Crystallized neural tissue of their predecessors.\n' },
                    { type: 'sys-text', content: '-> Type your answer [A/B/C/D] below (feature currently in maintenance overlay module)...' }
                ]);
                setIsGenerating(false);
            }, 1200);
        }, 800);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isBooting || isGenerating) return;
        executeCommand(input);
        setInput('');
    };

    return (
        <>
            <style>{terminalStyles}</style>
            <div className="terminal-container" onClick={handleContainerClick}>
                
                <div className="terminal-header">
                    <div>
                        <div className="terminal-glow" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>C.O.R.E. TERMINAL</div>
                        <div style={{ fontSize: '0.8rem', color: '#7AAFC4', marginTop: '4px' }}>ACCESS LEVEL: CLASSIFIED</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
                        CONNECTION: <span style={{ color: '#00FFD1' }}>SECURE</span>
                        <br/>
                        <span style={{ animation: 'pulseText 2s infinite' }}>■ REC</span>
                    </div>
                </div>

                <div className="terminal-output" ref={outputRef}>
                    
                    <div className="ascii-art">
                        {ASCII_LOGO}
                    </div>

                    {history.map((entry, idx) => (
                        <div key={idx} className={entry.type} style={{ whiteSpace: 'pre-wrap' }}>
                            {entry.content}
                        </div>
                    ))}
                    
                    {isGenerating && (
                        <div className="sys-text" style={{ animation: 'pulseText 1s infinite' }}>
                            Working... _
                        </div>
                    )}
                </div>

                {!isBooting && !isGenerating && (
                    <form className="terminal-input-wrapper" onSubmit={handleSubmit}>
                        <div>
                           <span className="prompt-prefix">root@xenova</span>:<span className="prompt-dir">~/archive</span><span className="prompt-symbol">$</span>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="terminal-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            spellCheck="false"
                            autoComplete="off"
                            autoFocus
                        />
                        <span style={{ 
                            width: '10px', 
                            height: '20px', 
                            backgroundColor: '#00FFD1', 
                            animation: 'blinkCursor 1s step-end infinite' 
                        }} />
                    </form>
                )}
            </div>
        </>
    );
};

export default Terminal;
