/**
 * Internationalization (i18n) System
 * Multi-language support with locale-aware formatting
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar';
export type LanguageDirection = 'ltr' | 'rtl';

export interface LanguageConfig {
  name: string;
  direction: LanguageDirection;
  nativeName: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

/**
 * i18n Manager for multi-language support
 */
export class I18nManager {
  private currentLanguage: Language = 'en';
  private supportedLanguages: Map<Language, LanguageConfig> = new Map();
  private translations: Map<Language, Translations> = new Map();
  private listeners: Array<(lang: Language) => void> = [];

  constructor() {
    this.initializeLanguages();
    this.loadTranslations();
  }

  private initializeLanguages(): void {
    const languages: Record<Language, LanguageConfig> = {
      en: { name: 'English', direction: 'ltr', nativeName: 'English' },
      es: { name: 'Spanish', direction: 'ltr', nativeName: 'Español' },
      fr: { name: 'French', direction: 'ltr', nativeName: 'Français' },
      de: { name: 'German', direction: 'ltr', nativeName: 'Deutsch' },
      ja: { name: 'Japanese', direction: 'ltr', nativeName: '日本語' },
      zh: { name: 'Chinese', direction: 'ltr', nativeName: '中文' },
      ar: { name: 'Arabic', direction: 'rtl', nativeName: 'العربية' }
    };

    Object.entries(languages).forEach(([lang, config]) => {
      this.supportedLanguages.set(lang as Language, config);
    });
  }

  private loadTranslations(): void {
    // English translations (fallback/base language)
    this.translations.set('en', {
      game: {
        title: 'Deception Doodle',
        start: 'Start Game',
        join: 'Join Room',
        leave: 'Leave Game',
        draw: 'Draw',
        guess: 'Guess',
        word: 'Word',
        score: 'Score',
        round: 'Round',
        timer: 'Time',
        players: 'Players',
        impostor: 'Impostor',
        drawer: 'Drawer',
        winner: 'Winner!'
      },
      messages: {
        welcome: 'Welcome to Deception Doodle',
        connecting: 'Connecting to game...',
        waiting: 'Waiting for other players...',
        error: 'An error occurred',
        offline: 'You are offline',
        reconnecting: 'Reconnecting...'
      },
      buttons: {
        ok: 'OK',
        cancel: 'Cancel',
        submit: 'Submit',
        retry: 'Retry',
        settings: 'Settings'
      }
    });

    // Spanish translations
    this.translations.set('es', {
      game: {
        title: 'Deception Doodle',
        start: 'Iniciar Juego',
        join: 'Unirse a Sala',
        leave: 'Salir del Juego',
        draw: 'Dibujar',
        guess: 'Adivinar',
        word: 'Palabra',
        score: 'Puntuación',
        round: 'Ronda',
        timer: 'Tiempo',
        players: 'Jugadores',
        impostor: 'Impostor',
        drawer: 'Dibujante',
        winner: '¡Ganador!'
      },
      messages: {
        welcome: 'Bienvenido a Deception Doodle',
        connecting: 'Conectando al juego...',
        waiting: 'Esperando a otros jugadores...',
        error: 'Ocurrió un error',
        offline: 'Estás desconectado',
        reconnecting: 'Reconectando...'
      },
      buttons: {
        ok: 'Aceptar',
        cancel: 'Cancelar',
        submit: 'Enviar',
        retry: 'Reintentar',
        settings: 'Configuración'
      }
    });

    // French translations
    this.translations.set('fr', {
      game: {
        title: 'Deception Doodle',
        start: 'Démarrer le Jeu',
        join: 'Rejoindre une Salle',
        leave: 'Quitter le Jeu',
        draw: 'Dessiner',
        guess: 'Deviner',
        word: 'Mot',
        score: 'Score',
        round: 'Manche',
        timer: 'Temps',
        players: 'Joueurs',
        impostor: 'Imposteur',
        drawer: 'Dessinateur',
        winner: 'Gagnant!'
      },
      messages: {
        welcome: 'Bienvenue dans Deception Doodle',
        connecting: 'Connexion au jeu...',
        waiting: 'En attente des autres joueurs...',
        error: 'Une erreur est survenue',
        offline: 'Vous êtes hors ligne',
        reconnecting: 'Reconnexion...'
      },
      buttons: {
        ok: 'OK',
        cancel: 'Annuler',
        submit: 'Soumettre',
        retry: 'Réessayer',
        settings: 'Paramètres'
      }
    });

    // German translations
    this.translations.set('de', {
      game: {
        title: 'Deception Doodle',
        start: 'Spiel starten',
        join: 'Raum beitreten',
        leave: 'Spiel verlassen',
        draw: 'Zeichnen',
        guess: 'Erraten',
        word: 'Wort',
        score: 'Punkte',
        round: 'Runde',
        timer: 'Zeit',
        players: 'Spieler',
        impostor: 'Betrüger',
        drawer: 'Zeichner',
        winner: 'Gewinner!'
      },
      messages: {
        welcome: 'Willkommen bei Deception Doodle',
        connecting: 'Verbindung zum Spiel wird hergestellt...',
        waiting: 'Warten auf andere Spieler...',
        error: 'Ein Fehler ist aufgetreten',
        offline: 'Sie sind offline',
        reconnecting: 'Verbindung wird wiederhergestellt...'
      },
      buttons: {
        ok: 'OK',
        cancel: 'Abbrechen',
        submit: 'Absenden',
        retry: 'Erneut versuchen',
        settings: 'Einstellungen'
      }
    });
  }

  /**
   * Set current language
   */
  public setLanguage(language: Language): void {
    if (!this.supportedLanguages.has(language)) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    this.currentLanguage = language;
    this.updateDirection();
    this.notifyListeners();
    console.log(`[i18n] Language changed to: ${language}`);
  }

  /**
   * Get current language
   */
  public getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Get translation string
   */
  public t(key: string, defaultValue = ''): string {
    const translations = this.translations.get(this.currentLanguage);
    if (!translations) return defaultValue;

    const value = this.getNestedValue(translations, key);
    return typeof value === 'string' ? value : defaultValue;
  }

  /**
   * Get nested translation value
   */
  private getNestedValue(obj: Translations, path: string): string | Translations | undefined {
    const keys = path.split('.');
    let current: Translations | string | undefined = obj;

    for (const key of keys) {
      if (typeof current !== 'object' || current === null) return undefined;
      current = (current as Translations)[key];
    }

    return current;
  }

  /**
   * Get all supported languages
   */
  public getSupportedLanguages(): Language[] {
    return Array.from(this.supportedLanguages.keys());
  }

  /**
   * Get language config
   */
  public getLanguageConfig(language: Language): LanguageConfig | null {
    return this.supportedLanguages.get(language) || null;
  }

  /**
   * Get current text direction
   */
  public getDirection(): LanguageDirection {
    const config = this.supportedLanguages.get(this.currentLanguage);
    return config?.direction || 'ltr';
  }

  /**
   * Update document direction
   */
  private updateDirection(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = this.getDirection();
      document.documentElement.lang = this.currentLanguage;
    }
  }

  /**
   * Subscribe to language changes
   */
  public onLanguageChange(callback: (language: Language) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  /**
   * Format number for current locale
   */
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(value);
  }

  /**
   * Format date for current locale
   */
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  /**
   * Format currency for current locale
   */
  public formatCurrency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency
    }).format(value);
  }

  /**
   * Detect browser language
   */
  public detectBrowserLanguage(): Language {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language.split('-')[0] as Language;
    return this.supportedLanguages.has(browserLang) ? browserLang : 'en';
  }

  /**
   * Initialize with detected language
   */
  public initializeWithDetection(): void {
    const detected = this.detectBrowserLanguage();
    this.setLanguage(detected);
  }
}

/**
 * Global i18n instance
 */
export const i18n = new I18nManager();

/**
 * Hook for i18n
 */
export const useI18n = () => {
  return {
    t: (key: string) => i18n.t(key),
    language: i18n.getLanguage(),
    direction: i18n.getDirection(),
    setLanguage: (lang: Language) => i18n.setLanguage(lang),
    supportedLanguages: i18n.getSupportedLanguages(),
    formatNumber: (value: number) => i18n.formatNumber(value),
    formatDate: (date: Date) => i18n.formatDate(date),
    formatCurrency: (value: number) => i18n.formatCurrency(value)
  };
};
