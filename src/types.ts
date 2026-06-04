export type AiStatus = 'listening' | 'processing' | 'analyzing' | 'responding' | 'waiting' | 'standby';
export type ArgusLanguage = 'pt-BR' | 'en-GB' | 'es-ES' | 'fr-FR';

export interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const UI_TRANSLATIONS = {
  'pt-BR': {
    howCanIHelp: 'Como posso ajudar?',
    voiceDisabled: 'Voz Desativada',
    waitingCommand: 'Aguardando comando',
    transmitting: 'Transmitindo Resposta...',
    listening: 'ESCUTANDO',
    processing: 'PROCESSANDO',
    analyzing: 'ANALISANDO',
    responding: 'RESPONDENDO',
    waiting: 'AGUARDANDO',
    standby: 'MODO DE ESPERA'
  },
  'en-GB': {
    howCanIHelp: 'How can I help?',
    voiceDisabled: 'Voice Disabled',
    waitingCommand: 'Waiting for command',
    transmitting: 'Transmitting Response...',
    listening: 'LISTENING',
    processing: 'PROCESSING',
    analyzing: 'ANALYZING',
    responding: 'RESPONDING',
    waiting: 'WAITING',
    standby: 'STANDBY'
  },
  'es-ES': {
    howCanIHelp: '¿Cómo puedo ayudar?',
    voiceDisabled: 'Voz desactivada',
    waitingCommand: 'Esperando comando',
    transmitting: 'Transmitiendo respuesta...',
    listening: 'ESCUCHANDO',
    processing: 'PROCESANDO',
    analyzing: 'ANALIZANDO',
    responding: 'RESPONDIENDO',
    waiting: 'ESPERANDO',
    standby: 'MODO DE ESPERA'
  },
  'fr-FR': {
    howCanIHelp: 'Comment puis-je vous aider?',
    voiceDisabled: 'Voix désactivée',
    waitingCommand: 'En attente de commande',
    transmitting: 'Transmission de réponse...',
    listening: 'ÉCOUTE',
    processing: 'TRAITEMENT',
    analyzing: 'ANALYSE',
    responding: 'RÉPONSE',
    waiting: 'ATTENTE',
    standby: 'VEILLE'
  }
};
