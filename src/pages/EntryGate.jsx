import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';
import { auth, githubProvider } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

// styles
const STYLES = `
  @keyframes xnv-pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  @keyframes xnv-slide-up {
    from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes xnv-shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  @keyframes xnv-portal-expand {
    0% { transform: scale(0); opacity: 0; box-shadow: 0 0 100px #00FFD1; }
    50% { opacity: 1; box-shadow: 0 0 300px #00FFD1; }
    100% { transform: scale(20); opacity: 1; background: #00FFD1; }
  }
  @keyframes xnv-float-glyph {
    0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
  .xnv-gate-root {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #000;
    color: #E8F4F8;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
  .xnv-bg-ring {
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    border: 1px solid rgba(0, 255, 209, 0.05);
    background: radial-gradient(circle, rgba(0,255,209,0.03) 0%, transparent 70%);
    animation: xnv-pulse-slow 8s infinite ease-in-out;
    pointer-events: none;
    z-index: 1;
  }
  .xnv-crt-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 50;
    opacity: 0.6;
  }
  .xnv-panel {
    position: relative;
    z-index: 10;
    width: 480px;
    padding: 40px;
    background: linear-gradient(135deg, rgba(8,15,26,0.85), rgba(5,8,16,0.95));
    border: 1px solid rgba(0, 255, 209, 0.3);
    box-shadow: 0 0 40px rgba(0,255,209,0.1), inset 0 0 20px rgba(0,255,209,0.05);
    animation: xnv-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }
  .xnv-panel-error {
    animation: xnv-shake 0.4s ease-in-out;
    border-color: rgba(255,58,58,0.8);
    box-shadow: 0 0 40px rgba(255,58,58,0.2), inset 0 0 20px rgba(255,58,58,0.1);
  }
  .xnv-panel-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .xnv-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #00FFD1;
    letter-spacing: 0.3em;
    text-shadow: 0 0 15px rgba(0,255,209,0.5);
    margin-bottom: 5px;
  }
  .xnv-subtitle {
    font-size: 0.7rem;
    color: #7AAFC4;
    letter-spacing: 0.15em;
  }
  .xnv-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  .xnv-label {
    font-size: 0.65rem;
    color: #7AAFC4;
    letter-spacing: 0.1em;
  }
  .xnv-input {
    width: 100%;
    background: rgba(0, 255, 209, 0.03);
    border: 1px solid rgba(0, 255, 209, 0.2);
    padding: 12px 16px;
    color: #00FFD1;
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.3s;
    box-sizing: border-box;
  }
  .xnv-input:focus {
    background: rgba(0, 255, 209, 0.08);
    border-color: #00FFD1;
    box-shadow: 0 0 15px rgba(0,255,209,0.15);
  }
  .xnv-input-error {
    border-color: #FF3A3A !important;
    color: #FF3A3A !important;
    background: rgba(255,58,58,0.05) !important;
  }
  .xnv-btn {
    width: 100%;
    padding: 14px;
    background: transparent;
    border: 1px solid #00FFD1;
    color: #00FFD1;
    font-family: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    margin-top: 10px;
  }
  .xnv-btn:hover:not(:disabled) {
    background: rgba(0,255,209,0.1);
    box-shadow: 0 0 20px rgba(0,255,209,0.2);
  }
  .xnv-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .xnv-btn-secondary {
    border-color: #7AAFC4;
    color: #7AAFC4;
  }
  .xnv-btn-secondary:hover:not(:disabled) {
    background: rgba(122,175,196,0.1);
    box-shadow: 0 0 20px rgba(122,175,196,0.2);
    border-color: #00FFD1;
    color: #00FFD1;
  }
  .xnv-link {
    font-size: 0.65rem;
    color: #7AAFC4;
    text-align: center;
    cursor: pointer;
    transition: color 0.3s;
    letter-spacing: 0.1em;
    margin-top: 20px;
    display: block;
  }
  .xnv-link:hover { color: #00FFD1; }
  
  .xnv-github-btn {
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.2);
    color: #FFF;
    font-family: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .xnv-github-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: #FFF;
    box-shadow: 0 0 15px rgba(255,255,255,0.2);
  }

  .xnv-otp-container {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 30px 0;
  }
  .xnv-otp-box {
    width: 45px;
    height: 55px;
    border: 1px solid rgba(0,255,209,0.3);
    background: rgba(0,255,209,0.02);
    color: #00FFD1;
    font-size: 1.5rem;
    text-align: center;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
  }
  .xnv-otp-box:focus {
    border-color: #00FFD1;
    background: rgba(0,255,209,0.1);
    box-shadow: 0 0 15px rgba(0,255,209,0.2);
  }
  .xnv-otp-sim {
    padding: 15px;
    background: rgba(0,255,209,0.05);
    border-left: 3px solid #00FFD1;
    margin-bottom: 20px;
    font-size: 0.8rem;
    color: #E8F4F8;
    letter-spacing: 0.1em;
  }

  .xnv-portal {
    position: absolute;
    top: 50%; left: 50%;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #00FFD1;
    transform: translate(-50%, -50%) scale(0);
    z-index: 100;
    pointer-events: none;
  }
  .xnv-portal.active {
    animation: xnv-portal-expand 1.5s cubic-bezier(0.8, 0, 0.2, 1) forwards;
  }
  .xnv-success-text {
    position: absolute;
    z-index: 101;
    color: #000;
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: 0.2em;
    opacity: 0;
    transition: opacity 1s;
    pointer-events: none;
  }

  .xnv-glyph {
    position: absolute;
    color: rgba(0, 255, 209, 0.15);
    font-size: 2rem;
    user-select: none;
    pointer-events: none;
    animation: xnv-float-glyph 15s linear infinite;
  }
  
  .xnv-judge-link {
    position: absolute;
    bottom: 20px;
    font-size: 0.6rem;
    color: rgba(255,58,58,0.5);
    letter-spacing: 0.2em;
    cursor: pointer;
    transition: color 0.3s;
    z-index: 10;
  }
  .xnv-judge-link:hover { color: #FF3A3A; }
`;

// Alien glyphs for background
const GLYPHS = ['Δ','Γ','Λ','Ω','Φ','Ψ','Σ','Θ','Ξ','Π'];

export default function EntryGate() {
  const navigate = useNavigate();
  const { 
    hasPass, 
    bypassForJudge,
  } = useVisitor();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (hasPass) {
      navigate('/archive', { replace: true });
    }
  }, [hasPass, navigate]);

  // Inject CSS
  useEffect(() => {
    if (!document.getElementById('xnv-auth-styles')) {
      const s = document.createElement('style');
      s.id = 'xnv-auth-styles';
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // Make sure we only render content if NOT authenticated (otherwise we flash before redirect)
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    if (!hasPass) setIsRendered(true);
  }, [hasPass]);

  // screen states: welcome, signup, login, forgot, github, verify, success
  const [screen, setScreen] = useState('welcome');
  const [errShake, setErrShake] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // form data
  const [formData, setFormData] = useState({
    name: '', age: '', passportName: '',
    email: '', password: '', confirm: ''
  });

  // Portal State
  const [portalActive, setPortalActive] = useState(false);

  // helpers
  const triggerError = (msg) => {
    setErrMsg(msg);
    setErrShake(true);
    setTimeout(() => setErrShake(false), 500);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setErrMsg('');
  };

  // navigation
  const go = (s) => {
    setScreen(s);
    setErrMsg('');
    setFormData({ name: '', age: '', passportName: '', email: '', password: '', confirm: '' });
  };

  const executeSuccess = () => {
    setPortalActive(true);
    setTimeout(() => {
      document.getElementById('xnv-succ-tex').style.opacity = 1;
    }, 800);
    setTimeout(() => {
      navigate('/archive');
    }, 2500);
  };

  // handlers
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { name, age, passportName, email, password, confirm } = formData;
    if (!name || !age || !passportName || !email || !password) return triggerError("ALL FIELDS REQUIRED.");
    if (password !== confirm) return triggerError("PASSWORDS DO NOT MATCH.");
    
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: passportName });
      await sendEmailVerification(userCredential.user);
      await signOut(auth); // Sign them out immediately until they verify
      setIsSubmitting(false);
      go('verify');
    } catch (error) {
       setIsSubmitting(false);
       triggerError(error.message.toUpperCase().replace("FIREBASE:", "ARCHIVE:"));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) return triggerError("CREDENTIALS REQUIRED.");
    
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setIsSubmitting(false);
        return triggerError("COMMS CHANNEL UNVERIFIED. CHECK EMAIL.");
      }
      executeSuccess();
    } catch (error) {
       setIsSubmitting(false);
       triggerError("AUTHENTICATION FAILED. EMAIL OR CYPHER INCORRECT.");
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      executeSuccess();
    } catch (error) {
      setIsSubmitting(false);
      triggerError("EXTERNAL UPLINK FAILED: " + error.message.toUpperCase());
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const { email } = formData;
    if (!email) return triggerError("COMMS CHANNEL (EMAIL) REQUIRED.");

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitting(false);
      setErrMsg('');
      triggerError("ARCHIVE: RECOVERY LINK SENT TO YOUR COMMS CHANNEL."); // Abusing triggerError to show a success message since they use the same banner rn 
      setTimeout(() => go('welcome'), 3000);
    } catch (error) {
      setIsSubmitting(false);
      triggerError("RECOVERY FAILED: " + error.message.toUpperCase());
    }
  };

  const handleJudgeBypass = () => {
    bypassForJudge();
    navigate('/archive');
  };

  if (!isRendered) return null;

  const ErrorBanner = () => !!errMsg && (
    <div style={{ color: '#FF3A3A', fontSize: '0.75rem', marginBottom: '15px', textAlign: 'center', letterSpacing: '0.1em' }}>
      ⚠️ {errMsg}
    </div>
  );

  return (
    <div className="xnv-gate-root">
      <div className="stars-bg" />
      <div className="xnv-bg-ring" />
      
      {/* Floating Glyphs */}
      {Array.from({length: 15}).map((_, i) => (
        <div key={i} className="xnv-glyph" style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${10 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * -15}s`
        }}>
          {GLYPHS[i % GLYPHS.length]}
        </div>
      ))}

      <div className="xnv-crt-overlay" />

      {/* PORTAL OVERLAY */}
      <div className={`xnv-portal ${portalActive ? 'active' : ''}`} />
      <div id="xnv-succ-tex" className="xnv-success-text">CLEARANCE GRANTED</div>

      {/* MAIN PANELS */}
      {!portalActive && (
        <div className={`xnv-panel ${errShake ? 'xnv-panel-error' : ''}`}>
          
          {/* WELCOME */}
          {screen === 'welcome' && (
            <>
              <div className="xnv-panel-header">
                <div style={{ fontSize: '0.6rem', color: '#7AAFC4', letterSpacing: '0.3em', marginBottom: '8px' }}>XENOVA SOVEREIGNTY</div>
                <div className="xnv-title" style={{ fontSize: '2rem' }}>FIRST CONTACT</div>
                <div className="xnv-subtitle" style={{ marginTop: '10px' }}>IDENTIFICATION PROTOCOL ONLINE</div>
              </div>
              <button className="xnv-btn" onClick={() => go('signup')}>APPLY FOR CLEARANCE (SIGN UP)</button>
              <button className="xnv-btn xnv-btn-secondary" onClick={() => go('login')}>RE-AUTHENTICATE (LOG IN)</button>
              
              <button className="xnv-github-btn" onClick={handleGithubSubmit}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                CONTINUE WITH GITHUB
              </button>
            </>
          )}

          {/* SIGNUP */}
          {screen === 'signup' && (
            <div className="xnv-form-container" onKeyDown={e => e.key === 'Enter' && handleSignupSubmit(e)}>
              <div className="xnv-panel-header">
                <div className="xnv-title">VISITOR REGISTRY</div>
                <div className="xnv-subtitle">STEP 1: PROFILE GENERATION</div>
              </div>
              <ErrorBanner />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="xnv-input-group">
                  <span className="xnv-label">FULL NAME</span>
                  <input className="xnv-input" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                </div>
                <div className="xnv-input-group">
                  <span className="xnv-label">CYCLE AGE</span>
                  <input className="xnv-input" type="number" autoComplete="off" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} />
                </div>
              </div>
              <div className="xnv-input-group">
                <span className="xnv-label">PASSPORT DESIGNATION (UNIQUE ID)</span>
                <input className="xnv-input" type="text" autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off" value={formData.passportName} onChange={e => handleInputChange('passportName', e.target.value.toUpperCase())} />
              </div>
              <div className="xnv-input-group">
                <span className="xnv-label">COMMS CHANNEL (EMAIL)</span>
                <input className="xnv-input" type="email" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="xnv-input-group">
                  <span className="xnv-label">CYPHER (PASSWORD)</span>
                  <input className="xnv-input" type="password" autoComplete="new-password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
                </div>
                <div className="xnv-input-group">
                  <span className="xnv-label">VERIFY CYPHER</span>
                  <input className="xnv-input" type="password" autoComplete="new-password" value={formData.confirm} onChange={e => handleInputChange('confirm', e.target.value)} />
                </div>
              </div>
              <button className="xnv-btn" onClick={handleSignupSubmit} disabled={isSubmitting}>{isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT PROFILE'}</button>
              <div className="xnv-link" onClick={() => go('welcome')}>← CANCEL REGISTRY</div>
            </div>
          )}

          {/* LOGIN */}
          {screen === 'login' && (
            <div className="xnv-form-container" onKeyDown={e => e.key === 'Enter' && handleLoginSubmit(e)}>
              <div className="xnv-panel-header">
                <div className="xnv-title">AUTHENTICATION</div>
                <div className="xnv-subtitle">PLEASE PROVIDE CREDENTIALS</div>
              </div>
              <ErrorBanner />
              <div className="xnv-input-group">
                <span className="xnv-label">COMMS CHANNEL (EMAIL)</span>
                <input className="xnv-input" type="email" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} autoFocus />
              </div>
              <div className="xnv-input-group">
                <span className="xnv-label">CYPHER (PASSWORD)</span>
                <input className="xnv-input" type="password" autoComplete="new-password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
              </div>
              <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                <span style={{ fontSize: '0.6rem', color: '#FFB347', cursor: 'pointer', letterSpacing: '0.1em' }} onClick={() => go('forgot')}>CYPHER LOST?</span>
              </div>
              <button className="xnv-btn" onClick={handleLoginSubmit} disabled={isSubmitting}>{isSubmitting ? 'AUTHENTICATING...' : 'ENGAGE NEURAL LINK'}</button>
              <div className="xnv-link" onClick={() => go('welcome')}>← BACK TO HUB</div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {screen === 'forgot' && (
            <div className="xnv-form-container" onKeyDown={e => e.key === 'Enter' && handleForgotSubmit(e)}>
              <div className="xnv-panel-header">
                <div className="xnv-title">MEMORY RECOVERY</div>
                <div className="xnv-subtitle">PROVIDE CHANNEL TO RECEIVE OVERRIDE LINK</div>
              </div>
              <ErrorBanner />
              <div className="xnv-input-group" style={{ marginBottom: '30px' }}>
                <span className="xnv-label">COMMS CHANNEL (EMAIL)</span>
                <input className="xnv-input" type="email" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} autoFocus />
              </div>
              <button className="xnv-btn" onClick={handleForgotSubmit} disabled={isSubmitting}>{isSubmitting ? 'PROCESSING...' : 'REQUEST OVERRIDE PULSE'}</button>
              <div className="xnv-link" onClick={() => go('login')}>← ABORT RECOVERY</div>
            </div>
          )}

          {/* VERIFICATION STATE */}
          {screen === 'verify' && (
            <div style={{ textAlign: 'center' }}>
              <div className="xnv-panel-header">
                <div className="xnv-title" style={{ color: '#00FFD1' }}>NEURAL SYNC REQUIRED</div>
                <div className="xnv-subtitle">VERIFICATION LINK DEPLOYED</div>
              </div>
              
              <div style={{ color: '#FFF', fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '20px', letterSpacing: '0.05em' }}>
                A secure override link has been transmitted to your provided Comms Channel. <br/><br/>
                You must access it and verify your designation before entering the archive.
              </div>

              <button className="xnv-btn" onClick={() => go('login')}>PROCEED TO LOGIN</button>
            </div>
          )}

        </div>
      )}

      {/* JUDGE BYPASS */}
      {!portalActive && (
        <div className="xnv-judge-link" onClick={handleJudgeBypass}>
          [ SYSTEM OVERRIDE: JUDGE ACCESS ]
        </div>
      )}

    </div>
  );
}