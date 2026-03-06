// lib/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// ORUS SAGE — Sistema de Tema Central
//
// Para mudar a identidade visual do sistema inteiro, edite APENAS este arquivo.
// Todos os componentes importam daqui.
//
// COMO TROCAR DE TEMA:
//   import { theme } from '@/lib/theme';        ← usa o tema ativo
//   import { themes } from '@/lib/theme';       ← acessa todos os temas
//   themes.neon / themes.midnight / themes.amber
// ─────────────────────────────────────────────────────────────────────────────

export interface OrusTheme {
  name: string;

  // ── Backgrounds ───────────────────────────────────────────────────────────
  bg: {
    page:    string;   // fundo da página
    surface: string;   // cards, painéis
    overlay: string;   // modais/drawers
    input:   string;   // campos de texto
  };

  // ── Accent — cor principal do sistema ────────────────────────────────────
  accent: {
    primary:   string;  // ex: '#4ade80'
    secondary: string;  // ex: '#22c55e'
    rgb:       string;  // ex: '34,197,94'  ← usado em rgba()
    glow:      string;  // sombra/blur de destaque
    subtle:    string;  // bordas, linhas divisórias
    muted:     string;  // textos de label
  };

  // ── Texto ─────────────────────────────────────────────────────────────────
  text: {
    primary:   string;
    secondary: string;
    muted:     string;
    disabled:  string;
  };

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    default: string;
    accent:  string;
    subtle:  string;
  };

  // ── Níveis de agente ──────────────────────────────────────────────────────
  levels: Record<
    'MICRO_AGENTE' | 'AGENTE' | 'SUPER_AGENTE' | 'ALFA' | 'OMEGA',
    { bg: string; text: string; border: string; glow: string; label: string }
  >;

  // ── Estágios de bloco DNA ─────────────────────────────────────────────────
  stages: {
    master:       string;
    advanced:     string;
    intermediate: string;
    novice:       string;
  };

  // ── Estado ────────────────────────────────────────────────────────────────
  status: {
    success: string;
    warning: string;
    error:   string;
    info:    string;
  };

  // ── Gradientes prontos ────────────────────────────────────────────────────
  gradient: {
    page:   string;
    button: string;
    card:   string;
    topLine: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMA: Verde Cyberpunk (padrão atual do ORUS SAGE)
// ─────────────────────────────────────────────────────────────────────────────
const green: OrusTheme = {
  name: 'green',

  bg: {
    page:    'linear-gradient(180deg, #060c08 0%, #07100a 100%)',
    surface: 'rgba(255,255,255,0.025)',
    overlay: 'linear-gradient(180deg, #07110a 0%, #060d08 100%)',
    input:   'rgba(255,255,255,0.04)',
  },

  accent: {
    primary:   '#4ade80',
    secondary: '#22c55e',
    rgb:       '34,197,94',
    glow:      'rgba(34,197,94,0.2)',
    subtle:    'rgba(34,197,94,0.08)',
    muted:     'rgba(34,197,94,0.45)',
  },

  text: {
    primary:   'rgba(229,231,235,0.95)',
    secondary: 'rgba(229,231,235,0.7)',
    muted:     'rgba(107,114,128,0.6)',
    disabled:  'rgba(107,114,128,0.3)',
  },

  border: {
    default: 'rgba(255,255,255,0.06)',
    accent:  'rgba(34,197,94,0.2)',
    subtle:  'rgba(34,197,94,0.08)',
  },

  levels: {
    MICRO_AGENTE: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)',  glow: 'rgba(107,114,128,0.08)', label: 'MICRO'  },
    AGENTE:       { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', border: 'rgba(34,197,94,0.22)',   glow: 'rgba(34,197,94,0.06)',   label: 'AGENTE' },
    SUPER_AGENTE: { bg: 'rgba(6,182,212,0.1)',   text: '#22d3ee', border: 'rgba(6,182,212,0.22)',   glow: 'rgba(6,182,212,0.06)',   label: 'SUPER'  },
    ALFA:         { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.22)',  glow: 'rgba(59,130,246,0.06)',  label: 'ALFA'   },
    OMEGA:        { bg: 'rgba(139,92,246,0.12)', text: '#c084fc', border: 'rgba(139,92,246,0.28)',  glow: 'rgba(139,92,246,0.1)',   label: 'OMEGA'  },
  },

  stages: {
    master:       '#c084fc',
    advanced:     '#60a5fa',
    intermediate: '#22d3ee',
    novice:       '#4ade80',
  },

  status: {
    success: '#4ade80',
    warning: '#facc15',
    error:   '#f87171',
    info:    '#60a5fa',
  },

  gradient: {
    page:    'linear-gradient(160deg, #060d08 0%, #07110a 45%, #050c07 100%)',
    button:  'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(22,163,74,0.14))',
    card:    'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(0,0,0,0.2))',
    topLine: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMA: Azul Neon (alternativo)
// ─────────────────────────────────────────────────────────────────────────────
const neon: OrusTheme = {
  name: 'neon',

  bg: {
    page:    'linear-gradient(180deg, #060810 0%, #070a14 100%)',
    surface: 'rgba(255,255,255,0.025)',
    overlay: 'linear-gradient(180deg, #07091a 0%, #060810 100%)',
    input:   'rgba(255,255,255,0.04)',
  },

  accent: {
    primary:   '#60a5fa',
    secondary: '#3b82f6',
    rgb:       '59,130,246',
    glow:      'rgba(59,130,246,0.2)',
    subtle:    'rgba(59,130,246,0.08)',
    muted:     'rgba(59,130,246,0.5)',
  },

  text: {
    primary:   'rgba(229,231,235,0.95)',
    secondary: 'rgba(229,231,235,0.7)',
    muted:     'rgba(107,114,128,0.6)',
    disabled:  'rgba(107,114,128,0.3)',
  },

  border: {
    default: 'rgba(255,255,255,0.06)',
    accent:  'rgba(59,130,246,0.2)',
    subtle:  'rgba(59,130,246,0.08)',
  },

  levels: {
    MICRO_AGENTE: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)',  glow: 'rgba(107,114,128,0.08)', label: 'MICRO'  },
    AGENTE:       { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.22)',  glow: 'rgba(59,130,246,0.06)',  label: 'AGENTE' },
    SUPER_AGENTE: { bg: 'rgba(6,182,212,0.1)',   text: '#22d3ee', border: 'rgba(6,182,212,0.22)',   glow: 'rgba(6,182,212,0.06)',   label: 'SUPER'  },
    ALFA:         { bg: 'rgba(139,92,246,0.1)',  text: '#c084fc', border: 'rgba(139,92,246,0.22)',  glow: 'rgba(139,92,246,0.06)',  label: 'ALFA'   },
    OMEGA:        { bg: 'rgba(236,72,153,0.12)', text: '#f472b6', border: 'rgba(236,72,153,0.28)',  glow: 'rgba(236,72,153,0.1)',   label: 'OMEGA'  },
  },

  stages: {
    master:       '#f472b6',
    advanced:     '#c084fc',
    intermediate: '#60a5fa',
    novice:       '#22d3ee',
  },

  status: {
    success: '#4ade80',
    warning: '#facc15',
    error:   '#f87171',
    info:    '#60a5fa',
  },

  gradient: {
    page:    'linear-gradient(160deg, #060810 0%, #07091a 45%, #050810 100%)',
    button:  'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.14))',
    card:    'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(0,0,0,0.2))',
    topLine: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMA: Âmbar / Dourado
// ─────────────────────────────────────────────────────────────────────────────
const amber: OrusTheme = {
  name: 'amber',

  bg: {
    page:    'linear-gradient(180deg, #0c0900 0%, #100c00 100%)',
    surface: 'rgba(255,255,255,0.025)',
    overlay: 'linear-gradient(180deg, #120e00 0%, #0c0900 100%)',
    input:   'rgba(255,255,255,0.04)',
  },

  accent: {
    primary:   '#fbbf24',
    secondary: '#f59e0b',
    rgb:       '245,158,11',
    glow:      'rgba(245,158,11,0.2)',
    subtle:    'rgba(245,158,11,0.08)',
    muted:     'rgba(245,158,11,0.5)',
  },

  text: {
    primary:   'rgba(229,231,235,0.95)',
    secondary: 'rgba(229,231,235,0.7)',
    muted:     'rgba(107,114,128,0.6)',
    disabled:  'rgba(107,114,128,0.3)',
  },

  border: {
    default: 'rgba(255,255,255,0.06)',
    accent:  'rgba(245,158,11,0.2)',
    subtle:  'rgba(245,158,11,0.08)',
  },

  levels: {
    MICRO_AGENTE: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)',  glow: 'rgba(107,114,128,0.08)', label: 'MICRO'  },
    AGENTE:       { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.22)',  glow: 'rgba(245,158,11,0.06)',  label: 'AGENTE' },
    SUPER_AGENTE: { bg: 'rgba(249,115,22,0.1)',  text: '#fb923c', border: 'rgba(249,115,22,0.22)',  glow: 'rgba(249,115,22,0.06)',  label: 'SUPER'  },
    ALFA:         { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', border: 'rgba(239,68,68,0.22)',   glow: 'rgba(239,68,68,0.06)',   label: 'ALFA'   },
    OMEGA:        { bg: 'rgba(139,92,246,0.12)', text: '#c084fc', border: 'rgba(139,92,246,0.28)',  glow: 'rgba(139,92,246,0.1)',   label: 'OMEGA'  },
  },

  stages: {
    master:       '#c084fc',
    advanced:     '#f87171',
    intermediate: '#fb923c',
    novice:       '#fbbf24',
  },

  status: {
    success: '#4ade80',
    warning: '#facc15',
    error:   '#f87171',
    info:    '#60a5fa',
  },

  gradient: {
    page:    'linear-gradient(160deg, #0c0900 0%, #120e00 45%, #0a0800 100%)',
    button:  'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.14))',
    card:    'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,0,0,0.2))',
    topLine: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMA: Midnight Roxo
// ─────────────────────────────────────────────────────────────────────────────
const midnight: OrusTheme = {
  name: 'midnight',

  bg: {
    page:    'linear-gradient(180deg, #080610 0%, #0a0814 100%)',
    surface: 'rgba(255,255,255,0.025)',
    overlay: 'linear-gradient(180deg, #09071a 0%, #080610 100%)',
    input:   'rgba(255,255,255,0.04)',
  },

  accent: {
    primary:   '#c084fc',
    secondary: '#a855f7',
    rgb:       '168,85,247',
    glow:      'rgba(168,85,247,0.2)',
    subtle:    'rgba(168,85,247,0.08)',
    muted:     'rgba(168,85,247,0.5)',
  },

  text: {
    primary:   'rgba(229,231,235,0.95)',
    secondary: 'rgba(229,231,235,0.7)',
    muted:     'rgba(107,114,128,0.6)',
    disabled:  'rgba(107,114,128,0.3)',
  },

  border: {
    default: 'rgba(255,255,255,0.06)',
    accent:  'rgba(168,85,247,0.2)',
    subtle:  'rgba(168,85,247,0.08)',
  },

  levels: {
    MICRO_AGENTE: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.2)',  glow: 'rgba(107,114,128,0.08)', label: 'MICRO'  },
    AGENTE:       { bg: 'rgba(168,85,247,0.1)',  text: '#c084fc', border: 'rgba(168,85,247,0.22)',  glow: 'rgba(168,85,247,0.06)',  label: 'AGENTE' },
    SUPER_AGENTE: { bg: 'rgba(236,72,153,0.1)',  text: '#f472b6', border: 'rgba(236,72,153,0.22)',  glow: 'rgba(236,72,153,0.06)',  label: 'SUPER'  },
    ALFA:         { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.22)',  glow: 'rgba(59,130,246,0.06)',  label: 'ALFA'   },
    OMEGA:        { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80', border: 'rgba(34,197,94,0.28)',   glow: 'rgba(34,197,94,0.1)',    label: 'OMEGA'  },
  },

  stages: {
    master:       '#4ade80',
    advanced:     '#60a5fa',
    intermediate: '#f472b6',
    novice:       '#c084fc',
  },

  status: {
    success: '#4ade80',
    warning: '#facc15',
    error:   '#f87171',
    info:    '#60a5fa',
  },

  gradient: {
    page:    'linear-gradient(160deg, #080610 0%, #09071a 45%, #060510 100%)',
    button:  'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(126,34,206,0.14))',
    card:    'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))',
    topLine: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Exportações
// ─────────────────────────────────────────────────────────────────────────────

export const themes = { green, neon, amber, midnight } as const;
export type ThemeName = keyof typeof themes;

// ← MUDE AQUI para trocar o tema do sistema inteiro
export const ACTIVE_THEME: ThemeName = 'green';

export const theme: OrusTheme = themes[ACTIVE_THEME];