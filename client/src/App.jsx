import React, { useState, useRef, useEffect } from 'react';

// Unified UI Translation Matrix
const translations = {
  en: {
    title: "ROAD_SOS // EMERGENCY_PORTAL",
    sosBtn: "INITIALIZE EMERGENCY SOS",
    dispatchCtrl: "[SECTION_01: DISPATCH_CONTROL]",
    firstAidAi: "[SECTION_02: FIRST_AID_AI]",
    chatPlaceholder: "Describe the injuries (e.g., severe bleeding, broken bone)...",
    send: "SEND",
    status: "STATUS",
    telemetry: "TELEMETRY LOGS",
    hub: "Identified Hub",
    smsId: "Twilio SMS Tracking ID",
    mapLink: "Live Map Link",
    idle: "SYSTEM_READY",
    loadingSos: "DISPATCHING_SOS...",
    loadingAi: "AI_THINKING..."
  },
  hi: {
    title: "रोड_SOS // आपातकालीन पोर्टल",
    sosBtn: "आपातकालीन SOS शुरू करें",
    dispatchCtrl: "[भाग_01: डिस्पैच नियंत्रण]",
    firstAidAi: "[भाग_02: प्राथमिक चिकित्सा AI]",
    chatPlaceholder: "चोटों के बारे में बताएं (जैसे, भारी रक्तस्राव, टूटी हड्डी)...",
    send: "भेजें",
    status: "स्थिति",
    telemetry: "टेलीमेट्री लॉग्स",
    hub: "पहचाना गया केंद्र",
    smsId: "ट्विलियो SMS ट्रैकिंग ID",
    mapLink: "लाइव मैप लिंक",
    idle: "सिस्टम तैयार है",
    loadingSos: "SOS भेजा जा रहा है...",
    loadingAi: "AI सोच रहा है..."
  }
};

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sosStatus, setSosStatus] = useState('idle'); 
  const [telemetry, setTelemetry] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const chatEndRef = useRef(null);
  const t = translations[currentLanguage];

  // Auto-scroll mechanism
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, aiLoading]);

  // Native Web Speech Audio Hook
  const playVoiceAlert = (lang) => {
    window.speechSynthesis.cancel();
    const text = lang === 'hi' 
      ? "आपातकाल! आपातकाल! चिकित्सा सहायता भेजी जा रही है।" 
      : "EMERGENCY! EMERGENCY! MEDICAL ASSISTANCE IS BEING DISPATCHED.";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.1; 
    utterance.volume = 1.0; 
    window.speechSynthesis.speak(utterance);
  };

  const handleSOS = () => {
    playVoiceAlert(currentLanguage);
    setSosStatus('loading');
    setTelemetry(null);

    if (!navigator.geolocation) {
      alert("Geolocation engine failure or unprovided hardware permission.");
      setSosStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch('http://127.0.0.1:5000/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          const data = await response.json();
          if (response.ok) {
            setTelemetry(data);
            setSosStatus('success');
          } else {
            setSosStatus('error');
          }
        } catch (err) {
          console.error(err);
          setSosStatus('error');
        }
      },
      (error) => {
        console.error(error);
        setSosStatus('error');
      }
    );
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setAiLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, language: currentLanguage }),
      });

      const data = await response.json();
      if (response.ok) {
        const cleanText = data.text.replaceAll('**', '');
        setChatHistory((prev) => [...prev, { sender: 'ai', text: cleanText }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: 'system', text: 'Error fetching AI guidance.' }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { sender: 'system', text: 'Network error connecting to AI core.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Raw inline styling matrices to bypass any missing Tailwind installation errors
  const styles = {
    wrapper: {
      backgroundColor: '#000000',
      color: '#ef4444',
      fontFamily: 'monospace',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    },
    header: {
      borderBottom: '2px solid #991b1b',
      paddingBottom: '15px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      letterSpacing: '1px'
    },
    langBtn: {
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: 'bold',
      borderRadius: '4px',
      fontFamily: 'monospace'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
      flexGrow: 1
    },
    card: {
      border: '1px solid #991b1b',
      backgroundColor: '#09090b',
      padding: '20px',
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    },
    sectionTitle: {
      color: '#a1a1aa',
      fontSize: '12px',
      fontWeight: 'bold',
      marginTop: 0,
      marginBottom: '15px',
      letterSpacing: '1px'
    },
    sosButton: {
      width: '100%',
      backgroundColor: '#991b1b',
      color: '#ffffff',
      border: '2px solid #ef4444',
      padding: '25px 10px',
      fontSize: '20px',
      fontWeight: 'bold',
      cursor: 'pointer',
      borderRadius: '6px',
      fontFamily: 'monospace',
      transition: 'all 0.2s'
    },
    telemetryBox: {
      marginTop: '20px',
      backgroundColor: '#000000',
      border: '1px solid #27272a',
      padding: '15px',
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: '1.6'
    },
    chatDisplay: {
      backgroundColor: '#000000',
      border: '1px solid #27272a',
      padding: '15px',
      borderRadius: '6px',
      height: '320px',
      overflowY: 'auto',
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    inputForm: {
      display: 'flex',
      gap: '10px'
    },
    textInput: {
      flexGrow: 1,
      backgroundColor: '#18181b',
      border: '1px solid #3f3f46',
      color: '#ffffff',
      padding: '12px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '14px'
    },
    sendBtn: {
      backgroundColor: '#ef4444',
      color: '#000000',
      border: 'none',
      padding: '0 20px',
      fontWeight: 'bold',
      cursor: 'pointer',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Top Banner Control Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>{t.title}</h1>
        <button 
          onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'hi' : 'en')}
          style={styles.langBtn}
        >
          {currentLanguage === 'en' ? "हिन्दी (HINDI)" : "ENGLISH (EN)"}
        </button>
      </header>

      {/* Structured Split Console Windows */}
      <div style={styles.gridContainer}>
        
        {/* Left Module Window: Hardware Transmission Controls */}
        <div style={styles.card}>
          <div>
            <h2 style={styles.sectionTitle}>{t.dispatchCtrl}</h2>
            <button
              onClick={handleSOS}
              disabled={sosStatus === 'loading'}
              style={styles.sosButton}
            >
              {sosStatus === 'loading' ? t.loadingSos : t.sosBtn}
            </button>
          </div>

          <div style={styles.telemetryBox}>
            <div style={{ color: '#71717a', fontSize: '11px', marginBottom: '6px', fontWeight: 'bold' }}>{t.telemetry}</div>
            <div>{t.status}: <span style={{ color: sosStatus === 'success' ? '#4ade80' : sosStatus === 'error' ? '#ef4444' : '#a1a1aa', fontWeight: 'bold' }}>{sosStatus === 'loading' ? t.loadingSos : sosStatus === 'idle' ? t.idle : sosStatus.toUpperCase()}</span></div>
            {telemetry && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>{t.hub}: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{telemetry.nearestTraumaCenter}</span></div>
                <div style={{ wordBreak: 'break-all' }}>{t.smsId}: <span style={{ color: '#a1a1aa' }}>{telemetry.smsId}</span></div>
                <div style={{ wordBreak: 'break-all' }}>
                  {t.mapLink}: <a href={telemetry.mapLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{telemetry.mapLink}</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Module Window: Medical AI Terminal Console */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>{t.firstAidAi}</h2>
          
          <div style={styles.chatDisplay}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <span style={{ color: msg.sender === 'user' ? '#3b82f6' : msg.sender === 'system' ? '#eab308' : '#4ade80', fontWeight: 'bold' }}>
                  {msg.sender === 'user' ? 'YOU: ' : msg.sender === 'system' ? 'SYS: ' : 'AI: '}
                </span>
                <span style={{ color: msg.sender === 'ai' ? '#ffffff' : '#d4d4d8', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.5' }}>
                  {msg.text}
                </span>
              </div>
            ))}
            {aiLoading && <div style={{ color: '#71717a', fontStyle: 'italic' }}>{t.loadingAi}</div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendChat} style={styles.inputForm}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              style={styles.textInput}
            />
            <button type="submit" style={styles.sendBtn}>
              {t.send}
            </button>
          </form>
        </div>

      </div>

      <footer style={{ textAlign: 'center', fontSize: '10px', color: '#3f3f46', marginTop: '30px', borderTop: '1px solid #18181b', paddingTop: '10px' }}>
        ROAD_SOS TELEMETRY PANEL // SECURE MULTILINGUAL ACCESSIBILITY LAYER // INLINE_CSS_BACKBONE
      </footer>
    </div>
  );
}

export default App;