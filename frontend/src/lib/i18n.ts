/**
 * ORUS SAGE - Internationalization Setup
 * Languages: PT-BR (default), EN, ES
 */

export type Language = 'pt-BR' | 'en' | 'es';

export const languages: Record<Language, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  es: 'Español',
};

export const defaultLanguage: Language = 'pt-BR';

export const translations: Record<Language, Record<string, any>> = {
  'pt-BR': {
    nav: {
      dashboard: 'Dashboard',
      workspace: 'Workspace',
      chat: 'Chat',
      settings: 'Configurações',
      logout: 'Sair',
      help: 'Ajuda',
    },
    header: {
      logo: 'ORUS SAGE',
      tagline: 'Comunicação Simbiôtica Suprema',
      searchPlaceholder: 'Buscar...',
    },
    footer: {
      copyright: '© 2025 ORUS SAGE. Todos os direitos reservados.',
      links: {
        privacy: 'Privacidade',
        terms: 'Termos',
        contact: 'Contato',
      },
    },
    breadcrumb: {
      home: 'Início',
    },
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Deletar',
      edit: 'Editar',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      workspace: 'Workspace',
      chat: 'Chat',
      settings: 'Settings',
      logout: 'Logout',
      help: 'Help',
    },
    header: {
      logo: 'ORUS SAGE',
      tagline: 'Supreme Symbiotic Communication',
      searchPlaceholder: 'Search...',
    },
    footer: {
      copyright: '© 2025 ORUS SAGE. All rights reserved.',
      links: {
        privacy: 'Privacy',
        terms: 'Terms',
        contact: 'Contact',
      },
    },
    breadcrumb: {
      home: 'Home',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
    },
  },
  es: {
    nav: {
      dashboard: 'Dashboard',
      workspace: 'Workspace',
      chat: 'Chat',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      help: 'Ayuda',
    },
    header: {
      logo: 'ORUS SAGE',
      tagline: 'Comunicación Simbiótica Suprema',
      searchPlaceholder: 'Buscar...',
    },
    footer: {
      copyright: '© 2025 ORUS SAGE. Todos los derechos reservados.',
      links: {
        privacy: 'Privacidad',
        terms: 'Términos',
        contact: 'Contacto',
      },
    },
    breadcrumb: {
      home: 'Inicio',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
    },
  },
};

export const getTranslation = (key: string, language: Language = defaultLanguage): string => {
  const keys = key.split('.');
  let current: any = translations[language];

  for (const k of keys) {
    current = current?.[k];
  }

  return current || key;
};
