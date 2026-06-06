export type AiStatus = 'listening' | 'processing' | 'analyzing' | 'responding' | 'waiting' | 'standby' | 'error';
export type ArgusLanguage = 'pt-BR' | 'en-GB' | 'es-ES' | 'fr-FR';

export interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export interface UserPlan {
  name: 'Gratuito' | 'Basic' | 'Pro' | 'Ultra';
  maxMessages: number;
  usedMessages: number;
  price: string;
}

export interface SystemStats {
  activeUsers: number;
  totalMessages: number;
  revenue: number;
  aiTokens: number;
}

export const UI_TRANSLATIONS = {
  'pt-BR': {
    howCanIHelp: 'CONECTADA AO FUTURO',
    voiceDisabled: 'Voz Desativada',
    waitingCommand: 'Aguardando comando',
    transmitting: 'Transmitindo Resposta...',
    listening: 'ESCUTANDO',
    processing: 'PROCESSANDO',
    analyzing: 'ANALISANDO',
    responding: 'RESPONDENDO',
    waiting: 'AGUARDANDO',
    standby: 'MODO DE ESPERA',
    error: 'FALHA DE CONEXÃO',
    // Actions & Panels
    resetContext: 'Limpar Sessão',
    history: 'Histórico',
    settings: 'Configurações',
    profile: 'Perfil',
    plans: 'Planos',
    admin: 'Painel Admin',
    copy: 'Copiar',
    copied: 'Copiado!',
    searchPlaceholder: 'BUSCAR HISTÓRICO...',
    inputPlaceholder: 'INSERIR COMANDO OU MENSAGEM...',
    quickCommands: 'Comandos Rápidos',
    memoryPanel: 'Memória Contextual',
    memoryEmpty: 'Nenhuma informação retida nesta sessão.',
    clearMemory: 'Limpar Memória',
    feedbackPositive: 'Resposta útil',
    feedbackNegative: 'Resposta ruim'
  },
  'en-GB': {
    howCanIHelp: 'CONNECTED TO THE FUTURE',
    voiceDisabled: 'Voice Disabled',
    waitingCommand: 'Waiting for command',
    transmitting: 'Transmitting Response...',
    listening: 'LISTENING',
    processing: 'PROCESSING',
    analyzing: 'ANALYZING',
    responding: 'RESPONDING',
    waiting: 'WAITING',
    standby: 'STANDBY',
    error: 'CONNECTION FAILURE',
    // Actions & Panels
    resetContext: 'Reset Session',
    history: 'History',
    settings: 'Settings',
    profile: 'Profile',
    plans: 'Plans',
    admin: 'Admin Panel',
    copy: 'Copy',
    copied: 'Copied!',
    searchPlaceholder: 'SEARCH HISTORY...',
    inputPlaceholder: 'ENTER COMMAND OR MESSAGE...',
    quickCommands: 'Quick Commands',
    memoryPanel: 'Contextual Memory',
    memoryEmpty: 'No information retained in this session.',
    clearMemory: 'Clear Memory',
    feedbackPositive: 'Helpful reply',
    feedbackNegative: 'Poor reply'
  },
  'es-ES': {
    howCanIHelp: 'CONECTADA AL FUTURO',
    voiceDisabled: 'Voz desactivada',
    waitingCommand: 'Esperando comando',
    transmitting: 'Transmitiendo respuesta...',
    listening: 'ESCUCHANDO',
    processing: 'PROCESANDO',
    analyzing: 'ANALIZANDO',
    responding: 'RESPONDIENDO',
    waiting: 'ESPERANDO',
    standby: 'MODO DE ESPERA',
    error: 'FALLO DE CONEXIÓN',
    // Actions & Panels
    resetContext: 'Limpiar sesión',
    history: 'Historial',
    settings: 'Ajustes',
    profile: 'Perfil',
    plans: 'Planes',
    admin: 'Panel de Admin',
    copy: 'Copiar',
    copied: '¡Copiado!',
    searchPlaceholder: 'BUSCAR EN HISTORIAL...',
    inputPlaceholder: 'INGRESAR COMANDO O MENSAJE...',
    quickCommands: 'Comandos Rápidos',
    memoryPanel: 'Memoria Contextual',
    memoryEmpty: 'Ninguna información retenida en esta sesión.',
    clearMemory: 'Limpiar Memoria',
    feedbackPositive: 'Respuesta útil',
    feedbackNegative: 'Respuesta mala'
  },
  'fr-FR': {
    howCanIHelp: 'CONNECTÉE AU FUTUR',
    voiceDisabled: 'Voix désactivée',
    waitingCommand: 'En attente de commande',
    transmitting: 'Transmission de réponse...',
    listening: 'ÉCOUTE',
    processing: 'TRAITEMENT',
    analyzing: 'ANALYSE',
    responding: 'RÉPONSE',
    waiting: 'ATTENTE',
    standby: 'VEILLE',
    error: 'ÉCHEC DE CONNEXION',
    // Actions & Panels
    resetContext: 'Réinitialiser la session',
    history: 'Historique',
    settings: 'Paramètres',
    profile: 'Profil',
    plans: 'Plans',
    admin: 'Admin Panel',
    copy: 'Copier',
    copied: 'Copié!',
    searchPlaceholder: 'RECHERCHE HISTORIQUE...',
    inputPlaceholder: 'ENTRER COMMANDE OU MESSAGE...',
    quickCommands: 'Commandes Rapides',
    memoryPanel: 'Mémoire Contextuelle',
    memoryEmpty: 'Aucune information conservée pour cette session.',
    clearMemory: 'Effacer la mémoire',
    feedbackPositive: 'Réponse utile',
    feedbackNegative: 'Mauvaise réponse'
  }
};
