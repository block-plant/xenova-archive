import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useVisitor } from '../context/VisitorContext';
import { auth } from '../config/firebase';

function FeedbackModal({ isOpen, onClose }) {
  const { visitorName } = useVisitor();
  
  const [formData, setFormData] = useState({
    designation: '',
    email: '',
    message: ''
  });
  
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
  const [errMsg, setErrMsg] = useState('');

  // Prefill designation and hardcode email if available
  useEffect(() => {
    if (isOpen && auth.currentUser) {
      setFormData(prev => ({ 
        ...prev, 
        designation: visitorName !== 'ANONYMOUS' ? visitorName : prev.designation,
        email: auth.currentUser.email || prev.email
      }));
    }
  }, [isOpen, visitorName]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.designation || !formData.email || !formData.message) {
      setErrMsg("ALL FIELDS REQUIRED FOR TRANSMISSION.");
      return;
    }
    
    setStatus('SUBMITTING');
    setErrMsg('');
    
    try {
      const response = await fetch("https://formspree.io/f/mojpgvvr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          designation: formData.designation,
          email: formData.email,
          message: formData.message,
          _subject: `Xenova Archive Anomaly Report from ${formData.designation}`
        })
      });
      
      if (response.ok) {
        setStatus('SUCCESS');
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            setStatus('IDLE');
            setFormData({ designation: '', email: '', message: '' });
          }, 500);
        }, 3000);
      } else {
        const data = await response.json();
        if (Object.hasOwn(data, 'errors')) {
          setErrMsg(data.errors.map(error => error.message).join(", ").toUpperCase());
        } else {
          setErrMsg("TRANSMISSION INTERCEPTED. TRY AGAIN.");
        }
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
      setErrMsg("NETWORK FAILURE. TRANSMISSION LOST.");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        .xnv-feedback-textarea::placeholder {
          color: rgba(122, 175, 196, 0.5);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
      `}</style>
      <div className="xnv-panel" style={{ position: 'relative', width: '100%', maxWidth: '450px', backgroundColor: 'rgba(5, 10, 20, 0.8)', border: '1px solid rgba(0, 255, 209, 0.15)', borderRadius: '4px', padding: '2rem 2.5rem' }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: '0 0 50px rgba(0, 255, 209, 0.05)', pointerEvents: 'none', borderRadius: '4px' }} />
        
        {status !== 'SUCCESS' && (
          <div className="xnv-form-container" onKeyDown={e => e.key === 'Enter' && handleSubmit()}>
            <div className="xnv-panel-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: '#7AAFC4', letterSpacing: '0.3em', marginBottom: '8px' }}>USER FEEDBACK ROUTING</div>
              <div className="xnv-title" style={{ fontSize: '1.6rem', color: '#FFB347', letterSpacing: '0.2em', textShadow: '0 0 10px rgba(255,179,71,0.5)' }}>ANOMALY REPORT</div>
            </div>

            {errMsg && (
              <div style={{ color: '#FF3A3A', fontSize: '0.65rem', marginBottom: '15px', textAlign: 'center', letterSpacing: '0.1em', background: 'rgba(255,58,58,0.1)', padding: '8px', border: '1px solid rgba(255,58,58,0.3)' }}>
                ⚠️ {errMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              <div className="xnv-input-group">
                <span className="xnv-label" style={{ fontSize: '0.6rem', color: '#7AAFC4', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>DESIGNATION</span>
                <input className="xnv-input" type="text" value={formData.designation} onChange={e => handleChange('designation', e.target.value)} autoComplete="off" spellCheck={false} style={{ width: '100%', background: 'rgba(0, 255, 209, 0.04)', border: '1px solid rgba(0, 255, 209, 0.2)', padding: '10px 14px', color: '#00FFD1', fontSize: '0.8rem', outline: 'none' }} />
              </div>

              <div className="xnv-input-group">
                <span className="xnv-label" style={{ fontSize: '0.6rem', color: '#7AAFC4', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>ANOMALY DESCRIPTION</span>
                <textarea 
                  className="xnv-input xnv-feedback-textarea" 
                  rows={6} 
                  value={formData.message} 
                  onChange={e => handleChange('message', e.target.value)} 
                  autoComplete="off" 
                  spellCheck={false}
                  placeholder="REPORT BUGS, SUGGESTIONS, OR LORE DISCOVERIES..."
                  style={{ width: '100%', background: 'rgba(0, 255, 209, 0.04)', border: '1px solid rgba(0, 255, 209, 0.2)', padding: '12px 14px', color: '#00FFD1', fontSize: '0.8rem', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: '1.4' }}
                />
              </div>
            </div>

            <button 
              className="xnv-btn" 
              onClick={handleSubmit} 
              disabled={status === 'SUBMITTING'}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: `1px solid ${status === 'SUBMITTING' ? '#FFB347' : '#00FFD1'}`,
                color: status === 'SUBMITTING' ? '#FFB347' : '#00FFD1',
                textShadow: status === 'SUBMITTING' ? '0 0 10px rgba(255,179,71,0.5)' : 'none',
                letterSpacing: '0.2em',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {status === 'SUBMITTING' ? 'TRANSMITTING ROUTE...' : 'LAUNCH TRANSMISSION'}
            </button>
            <div 
              className="xnv-link" 
              onClick={() => { setStatus('IDLE'); setErrMsg(''); onClose(); }}
              style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.65rem', color: 'rgba(0, 255, 209, 0.5)', cursor: 'pointer', letterSpacing: '0.15em' }}
            >
              ← ABORT TRANSMISSION
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
             <div className="xnv-panel-header">
              <div className="xnv-title" style={{ color: '#00FFD1', fontSize: '2rem' }}>TRANSMISSION SECURED</div>
              <div className="xnv-subtitle" style={{ marginTop: '10px' }}>ADMINISTRATOR ALERTED</div>
            </div>
            <div style={{ color: '#FFF', fontSize: '0.8rem', lineHeight: '1.6', marginTop: '20px', letterSpacing: '0.05em' }}>
              Your anomaly report has been routed successfully.<br/>
              Closing comms channel...
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

export default FeedbackModal;
