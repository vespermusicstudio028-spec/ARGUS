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

  // Initialize Session ID
  useEffect(() => {
    let savedId = localStorage.getItem('argus_session_id');
    if (!savedId) {
      savedId = crypto.randomUUID();
      localStorage.setItem('argus_session_id', savedId);
    }
    setSessionId(savedId);
  }, []);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const argusVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  
  // Track if we are currently manually processing an interaction
  const isInteractingRef = useRef(false);

  // Initialize Speech Services
  useEffect(() => {
    // Check Speech Recognition Support
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

    // Setup Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    recognition.onstart = () => {
      if (!isInteractingRef.current) {
        setStatus('listening');
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
        setStatus('waiting');
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    // Fetch matching voice based on selected language
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
        setStatus('listening');
      } catch (e) {}
    } else if (!isMicActive) {
      recognitionRef.current.stop();
      if (synthRef.current) {
         synthRef.current.cancel();
      }
      setStatus('waiting');
      isInteractingRef.current = false;
    }
  }, [isMicActive]);

  // Audio context for neural voice playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Helper: convert base64 PCM16 24kHz mono to AudioBuffer
  const pcmToAudioBuffer = useCallback((base64: string, sampleRate: number = 24000): AudioBuffer | null => {
    try {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // PCM 16-bit signed little-endian → Float32
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate });
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);
      return audioBuffer;
    } catch (e) {
      console.error('PCM decode error:', e);
      return null;
    }
  }, []);

  // Fallback: browser speech synthesis (used when neural API fails)
  const speakBrowserFallback = useCallback((text: string, onEnd: () => void) => {
    if (!synthRef.current) { onEnd(); return; }
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (argusVoiceRef.current) {
      utterance.voice = argusVoiceRef.current;
      utterance.lang = language;
    }
    utterance.pitch = 0.85;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
    synthRef.current.speak(utterance);
  }, [language]);

  // Primary: Neural voice via Gemini API
  const speak = useCallback(async (text: string, onEnd: () => void) => {
    // Stop any currently playing audio
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
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
      
      if (!data.audio) throw new Error('No audio data received');

      // Parse sample rate from mimeType (e.g. "audio/L16;rate=24000")
      let sampleRate = 24000;
      if (data.mimeType) {
        const rateMatch = data.mimeType.match(/rate=(\d+)/);
        if (rateMatch) sampleRate = parseInt(rateMatch[1]);
      }

      const audioBuffer = pcmToAudioBuffer(data.audio, sampleRate);
      if (!audioBuffer) throw new Error('Failed to decode audio');

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate });
      }
      
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        currentSourceRef.current = null;
        onEnd();
      };
      currentSourceRef.current = source;
      source.start(0);

    } catch (error) {
      console.warn('Neural TTS failed, using browser fallback:', error);
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

    if (isStandbyRef.current) {
      if (cleanTranscript.includes('argus') || cleanTranscript.includes('argos')) {
        setIsStandby(false);
        isStandbyRef.current = false;
        
        const wakeMsg = "Online.";
        setStatus('responding');
        speak(wakeMsg, () => {
          isInteractingRef.current = false;
          setStatus(isMicActive ? 'listening' : 'waiting');
          if (isMicActive) {
            setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
          }
        });
        return;
      } else {
        // Stay in standby, ignore safely without crashing Recognition
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
        'fique quieto', 'silêncio', 'calar a boca', 'durma', 'desligar', 
        'modo de espera', 'standby', 'descançar', 'boa noite', 'vai dormir', 
        'tchau', 'tchau tchau', 'by', 'by by', 'stop talking', 'be quiet', 'stand by', 'não fale mais'
      ];
      
      if (standbyKeywords.some(keyword => lowerTranscript.includes(keyword))) {
        setIsStandby(true);
        isStandbyRef.current = true;
        
        const standbyMsg = language.startsWith('pt') ? "Entrando em modo standby. Diga meu nome se precisar de mim." : "Going to standby mode. Call my name if you need me.";
        setStatus('responding');
        speak(standbyMsg, () => {
          isInteractingRef.current = false;
          setStatus(isMicActive ? 'listening' : 'waiting');
          if (isMicActive) {
            setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
          }
        });
        return;
      }
    }

    setStatus('processing');
    if (onMessageUser) onMessageUser(transcript);

    try {
      setStatus('analyzing');
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

      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      const reply = data.reply.replace(/\*+/g, '');

      if (onMessageAi) onMessageAi(reply);
      
      setStatus('responding');
      
      speak(reply, () => {
        isInteractingRef.current = false;
        if (isMicActive) {
          setStatus('listening');
          setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
        } else {
          setStatus('waiting');
        }
      });
      
    } catch (error) {
      console.error(error);
      const errorMsg = language.startsWith('pt') ? "Sinto muito, houve uma falha de conexão." : "I apologize, there was a connection failure.";
      setStatus('responding');
      speak(errorMsg, () => {
        isInteractingRef.current = false;
        setStatus(isMicActive ? 'listening' : 'waiting');
        if (isMicActive) {
            setTimeout(() => { try { recognitionRef.current?.start(); } catch(e) {} }, 100);
        }
      });
    }
  }, [isMicActive, onMessageUser, onMessageAi, speak, language]);;

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
      // Optionally reset on client too if we had a messages state here
    } catch (e) {
      console.error("Failed to reset session", e);
    }
  };
  
  // For manual text input
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
    isStandby
  };
}
