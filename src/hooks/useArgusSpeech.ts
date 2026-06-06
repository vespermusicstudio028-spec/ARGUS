import { useState, useEffect, useRef, useCallback } from 'react';
import { AiStatus, ArgusLanguage } from '../types';

interface UseArgusSpeechProps {
  onMessageUser?: (msg: string) => void;
  onMessageAi?: (msg: string) => void;
  language?: ArgusLanguage;
}

export function useArgusSpeech({ onMessageUser, onMessageAi, language = 'pt-BR' }: UseArgusSpeechProps = {}) {
  const [status, setStatus] = useState<AiStatus>('waiting');
  const [isMicActive, setIsMicActive] = useState(true);
  const [hasBrowserSupport, setHasBrowserSupport] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [isStandby, setIsStandby] = useState(false);
  const isStandbyRef = useRef(false);

  // Audio nodes and contexts
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Mic capture nodes for visualization and VAD
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Track if we are currently manually processing an interaction
  const isInteractingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const argusVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize Session ID
  useEffect(() => {
    let savedId = localStorage.getItem('argus_session_id');
    if (!savedId) {
      savedId = crypto.randomUUID();
      localStorage.setItem('argus_session_id', savedId);
    }
    setSessionId(savedId);
  }, []);

  // Set the correct state values when status changes
  const updateStatus = (newStatus: AiStatus) => {
    setStatus(newStatus);
    if (newStatus === 'listening' && micAnalyserRef.current) {
      setAnalyser(micAnalyserRef.current);
    } else if (newStatus === 'responding' && ttsAnalyserRef.current) {
      setAnalyser(ttsAnalyserRef.current);
    } else if (newStatus !== 'listening' && newStatus !== 'responding') {
      setAnalyser(null);
    }
  };

  // Setup Mic Audio Stream for visualizer and VAD
  useEffect(() => {
    let active = true;

    const setupMicStream = async () => {
      if (!isMicActive) {
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(track => track.stop());
          micStreamRef.current = null;
        }
        micAnalyserRef.current = null;
        if (status === 'listening') {
          setAnalyser(null);
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        micStreamRef.current = stream;

        // Initialize AudioContext
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const source = audioContextRef.current.createMediaStreamSource(stream);
        const micAnalyser = audioContextRef.current.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);
        micAnalyserRef.current = micAnalyser;

        if (status === 'listening') {
          setAnalyser(micAnalyser);
        }
      } catch (err) {
        console.warn('Microphone capture failed for visualizer/VAD:', err);
      }
    };

    setupMicStream();

    return () => {
      active = false;
    };
  }, [isMicActive, status]);

  // Interrupt speaking immediately
  const interruptSpeaking = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    
    setAnalyser(null);
    isInteractingRef.current = false;

    if (isMicActive) {
      updateStatus('listening');
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }, 100);
    } else {
      updateStatus('waiting');
    }
  }, [isMicActive]);

  // VAD Loop (Checks mic audio to interrupt ARGUS if user speaks)
  useEffect(() => {
    let active = true;
    let frameId: number;
    const threshold = 38; // Vol threshold
    let voiceTimeframes = 0;

    const checkMicActivity = () => {
      if (!active) return;

      if (status === 'responding' && micAnalyserRef.current) {
        const dataArray = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
        micAnalyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;

        if (avg > threshold) {
          voiceTimeframes++;
          if (voiceTimeframes > 7) { // ~120ms of voice activity
            console.log('Voice activity detected. Interrupting speaking.');
            interruptSpeaking();
            voiceTimeframes = 0;
          }
        } else {
          voiceTimeframes = Math.max(0, voiceTimeframes - 1);
        }
      } else {
        voiceTimeframes = 0;
      }

      frameId = requestAnimationFrame(checkMicActivity);
    };

    if (isMicActive) {
      frameId = requestAnimationFrame(checkMicActivity);
    }

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [status, isMicActive, interruptSpeaking]);

  // Initialize Speech Services
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      setHasBrowserSupport(false);
      return;
    }

    if (!window.speechSynthesis) {
      console.warn("Speech synthesis is not supported in this browser.");
      setHasBrowserSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    recognition.onstart = () => {
      if (!isInteractingRef.current) {
        updateStatus('listening');
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) {
        handleUserSpeech(transcript);
      }
    };

    recognition.onend = () => {
      if (isMicActive && !isInteractingRef.current) {
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      if (event.error === 'not-allowed') {
        setIsMicActive(false);
        updateStatus('waiting');
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    const setVoice = () => {
      const voices = synthRef.current?.getVoices() || [];
      let targetVoice: SpeechSynthesisVoice | undefined;

      if (language.startsWith('en')) {
        targetVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google')) && v.lang.startsWith('en-GB'))
                    || voices.find(v => v.lang.startsWith('en-GB'))
                    || voices.find(v => v.lang.startsWith('en'));
      } else if (language.startsWith('pt')) {
        targetVoice = voices.find(v => v.lang.startsWith('pt') && (v.name.includes('Daniel') || v.name.toLowerCase().includes('male')))
                    || voices.find(v => v.lang.startsWith('pt') && v.name.includes('Google'))
                    || voices.find(v => v.lang.startsWith('pt'));
      } else if (language.startsWith('es')) {
        targetVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google'))
                    || voices.find(v => v.lang.startsWith('es'));
      } else if (language.startsWith('fr')) {
        targetVoice = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Google'))
                    || voices.find(v => v.lang.startsWith('fr'));
      }

      if (targetVoice) {
        argusVoiceRef.current = targetVoice;
      }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
    setVoice();

    return () => {
      recognition.stop();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isMicActive, language]);

  // Ensure recognition starts/stops when mic toggle changes state
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    if (isMicActive && !isInteractingRef.current) {
      try {
        recognitionRef.current.start();
        updateStatus('listening');
      } catch (e) {}
    } else if (!isMicActive) {
      recognitionRef.current.stop();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      updateStatus('waiting');
      isInteractingRef.current = false;
    }
  }, [isMicActive]);

  // PCM Decoder helper
  const pcmToAudioBuffer = useCallback((base64: string, sampleRate: number = 24000): AudioBuffer | null => {
    try {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);
      return audioBuffer;
    } catch (e) {
      console.error('PCM decode error:', e);
      return null;
    }
  }, []);

  // Web Speech synthesis browser fallback
  const speakBrowserFallback = useCallback((text: string, onEnd: () => void) => {
    if (!synthRef.current) {
      onEnd();
      return;
    }
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (argusVoiceRef.current) {
      utterance.voice = argusVoiceRef.current;
      utterance.lang = language;
    }
    utterance.pitch = 0.85;
    utterance.rate = 1.05;
    utterance.volume = 1.0;
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
    synthRef.current.speak(utterance);
  }, [language]);

  // Primary: Speak Neural voice
  const speak = useCallback(async (text: string, onEnd: () => void) => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    if (synthRef.current) synthRef.current.cancel();

    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });

      if (!res.ok) throw new Error('Neural TTS API error');

      const data = await res.json();
      if (!data.audio) throw new Error('No audio data');

      let sampleRate = 24000;
      if (data.mimeType) {
        const rateMatch = data.mimeType.match(/rate=(\d+)/);
        if (rateMatch) sampleRate = parseInt(rateMatch[1]);
      }

      const audioBuffer = pcmToAudioBuffer(data.audio, sampleRate);
      if (!audioBuffer) throw new Error('PCM decoding failed');

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create AnalyserNode for TTS visualization
      if (!ttsAnalyserRef.current) {
        const ttsAnalyser = audioContextRef.current.createAnalyser();
        ttsAnalyser.fftSize = 256;
        ttsAnalyserRef.current = ttsAnalyser;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      // Route: Source -> TTS Analyser -> Destination
      source.connect(ttsAnalyserRef.current);
      ttsAnalyserRef.current.connect(audioContextRef.current.destination);
      
      setAnalyser(ttsAnalyserRef.current);

      source.onended = () => {
        currentSourceRef.current = null;
        setAnalyser(null);
        onEnd();
      };

      currentSourceRef.current = source;
      source.start(0);

    } catch (error) {
      console.warn('Neural TTS failed, calling browser fallback:', error);
      speakBrowserFallback(text, onEnd);
    }
  }, [language, pcmToAudioBuffer, speakBrowserFallback]);

  const handleUserSpeech = useCallback(async (transcript: string) => {
    isInteractingRef.current = true;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    const lowerTranscript = transcript.toLowerCase();
    const cleanTranscript = lowerTranscript.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Standby keyword check
    if (isStandbyRef.current) {
      if (cleanTranscript.includes('argus') || cleanTranscript.includes('argos')) {
        setIsStandby(false);
        isStandbyRef.current = false;
        
        const wakeMsg = language.startsWith('pt') ? "Sistema online. Como posso ajudar?" : "System online. How can I help you?";
        updateStatus('responding');
        speak(wakeMsg, () => {
          isInteractingRef.current = false;
          updateStatus(isMicActive ? 'listening' : 'waiting');
          if (isMicActive) {
            setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
          }
        });
        return;
      } else {
        isInteractingRef.current = false;
        setTimeout(() => {
          if (isMicActive && !isInteractingRef.current) {
            try { recognitionRef.current?.start(); } catch(e) {}
          }
        }, 300);
        return;
      }
    } else {
      const standbyKeywords = [
        'fique quieto', 'silencio', 'calar a boca', 'durma', 'desligar', 
        'modo de espera', 'standby', 'descansar', 'boa noite', 'vai dormir', 
        'tchau', 'tchau tchau', 'by', 'by by', 'stop talking', 'be quiet', 'stand by', 'nao fale mais'
      ];
      
      if (standbyKeywords.some(keyword => cleanTranscript.includes(keyword))) {
        setIsStandby(true);
        isStandbyRef.current = true;
        
        const standbyMsg = language.startsWith('pt') 
          ? "Entrando em modo de espera. Diga meu nome se precisar de mim." 
          : "Going to standby mode. Call my name if you need me.";
        updateStatus('responding');
        speak(standbyMsg, () => {
          isInteractingRef.current = false;
          updateStatus('standby');
        });
        return;
      }
    }

    updateStatus('processing');
    if (onMessageUser) onMessageUser(transcript);

    try {
      updateStatus('analyzing');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: transcript,
          language,
          sessionId: sessionId || 'default'
        })
      });

      const data = await res.json();

      if (res.status === 403 || data.limitReached) {
        const reply = data.reply || (language.startsWith('pt') 
          ? "Criador, seu limite de mensagens do plano foi atingido no Supabase." 
          : "Creator, your plan message limit has been reached on Supabase.");
        
        if (onMessageAi) onMessageAi(reply);
        updateStatus('error');
        speak(reply, () => {
          isInteractingRef.current = false;
          updateStatus('waiting');
        });
        return;
      }

      if (!res.ok) throw new Error(data.error || 'API Error');

      const reply = data.reply.replace(/\*+/g, '');

      if (onMessageAi) onMessageAi(reply);
      
      updateStatus('responding');
      speak(reply, () => {
        isInteractingRef.current = false;
        if (isMicActive) {
          updateStatus('listening');
          setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
        } else {
          updateStatus('waiting');
        }
      });
      
    } catch (error) {
      console.error(error);
      const errorMsg = language.startsWith('pt') 
        ? "Sinto muito, houve uma falha de conexão de dados." 
        : "I apologize, there was a data connection failure.";
      updateStatus('error');
      
      speak(errorMsg, () => {
        isInteractingRef.current = false;
        updateStatus(isMicActive ? 'listening' : 'waiting');
        if (isMicActive) {
          setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
        }
      });
    }
  }, [isMicActive, onMessageUser, onMessageAi, speak, language, sessionId]);

  const toggleMic = () => {
    setIsMicActive(prev => !prev);
  };

  const resetSession = async () => {
    try {
      await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) {
      console.error("Failed to reset session", e);
    }
  };

  const sendTextMessage = (text: string) => {
    handleUserSpeech(text);
  };

  return {
    status: isStandby ? 'standby' as AiStatus : status,
    isMicActive,
    toggleMic,
    hasBrowserSupport,
    sendTextMessage,
    resetSession,
    isStandby,
    analyser
  };
}
