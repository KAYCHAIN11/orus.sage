/**
 * @alphalang/blueprint
 * @component: PersonalizationTypes
 * @cognitive-signature: Type-Definitions, Theme-Schema, Preferences-Structure
 * @minerva-version: 3.0
 * @evolution-level: Production
 * @orus-sage-engine: Workspace-Personalization
 * @bloco: 2
 */

// THEME SYSTEM
export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'custom' | 'system';
  version: number;
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowDefinitions;
  animations: AnimationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
  status: StatusColors;
  semantic: SemanticColors;
}

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface BackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  elevated: string;
  overlay: string;
  contrast: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  link: string;
  linkHover: string;
}

export interface BorderColors {
  default: string;
  light: string;
  dark: string;
  focus: string;
}

export interface StatusColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  pending: string;
}

export interface SemanticColors {
  positive: string;
  negative: string;
  neutral: string;
  attention: string;
}

export interface TypographySettings {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    display: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  6: string;
  8: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  64: string;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowDefinitions {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface AnimationSettings {
  duration: {
    instant: string;
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    cubic: string;
  };
  transitions: Record<string, string>;
}

// USER PREFERENCES
export interface UserPreferences {
  userId: string;
  workspaceId: string;
  theme: ThemePreference;
  interface: InterfacePreferences;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  language: LanguagePreference;
  privacy: PrivacyPreferences;
  advanced: AdvancedPreferences;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface ThemePreference {
  themeId: string;
  mode: 'light' | 'dark' | 'auto';
  followSystem: boolean;
  customizations?: Partial<Theme>;
  scheduleLight?: { start: string; end: string };
  scheduleDark?: { start: string; end: string };
}

export interface InterfacePreferences {
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition: 'left' | 'right';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  showAvatars: boolean;
  showTimestamps: boolean;
  messageGrouping: boolean;
  codeTheme: string;
  highlightSyntax: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
}

export interface NotificationPreferences {
  desktop: boolean;
  sound: boolean;
  email: boolean;
  mentions: boolean;
  replies: boolean;
  workspaceUpdates: boolean;
  agentResponses: boolean;
  collaborationUpdates: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  notificationLevel: 'all' | 'important' | 'silent';
}

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  focusIndicators: boolean;
  largerClickTargets: boolean;
  textScaling: number;
  captions: boolean;
}

export interface LanguagePreference {
  code: string;
  name: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  timezone: string;
  numberFormat: 'comma' | 'period';
}

export interface PrivacyPreferences {
  showOnlineStatus: boolean;
  showTypingIndicator: boolean;
  allowAnalytics: boolean;
  shareUsageData: boolean;
  readReceipts: boolean;
  profileVisibility: 'everyone' | 'workspace' | 'friends' | 'private';
  dataRetention: number; // days
}

export interface AdvancedPreferences {
  enableBeta: boolean;
  enableDebugMode: boolean;
  enableTelemetry: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  cacheSize: number;
  memoryOptimization: boolean;
  apiKey?: string;
}

// WORKSPACE CUSTOMIZATION
export interface WorkspaceCustomization {
  workspaceId: string;
  branding: BrandingSettings;
  layout: LayoutSettings;
  features: FeatureToggles;
  integrations: IntegrationSettings;
  versioning: number;
  updatedAt: Date;
}

export interface BrandingSettings {
  logo?: string;
  icon?: string;
  favicon?: string;
  colors?: Partial<ColorPalette>;
  customCSS?: string;
  customDomain?: string;
}

export interface LayoutSettings {
  defaultView: 'chat' | 'dashboard' | 'agents' | 'settings';
  pinnedSections: string[];
  hiddenSections: string[];
  customSections?: CustomSection[];
  mainColumnWidth: number;
  sidebarWidth: number;
}

export interface CustomSection {
  id: string;
  name: string;
  icon: string;
  url: string;
  position: number;
  color?: string;
  isExternal: boolean;
}

export interface FeatureToggles {
  multiChat: boolean;
  voiceInput: boolean;
  fileSharing: boolean;
  collaboration: boolean;
  analytics: boolean;
  apiAccess: boolean;
  customAgents: boolean;
  webhooks: boolean;
  customDomain: boolean;
  sso: boolean;
  mfa: boolean;
}

export interface IntegrationSettings {
  enabled: string[];
  config: Record<string, any>;
  apiTokens: Array<{ name: string; token: string; createdAt: Date }>;
}

// PRESET THEMES
export const PRESET_THEMES: Record<string, Partial<Theme>> = {
  light: {
    id: 'light',
    name: 'Light',
    type: 'light'
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    type: 'dark'
  }
};

export type PreferenceKey = keyof UserPreferences;
export type ThemeMode = 'light' | 'dark' | 'auto' | 'system';
