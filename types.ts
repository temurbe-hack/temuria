export type Language = 'en' | 'ru' | 'es' | 'fr' | 'de' | 'zh';

export interface ArticleData {
  title: string;
  content: string; // Markdown content
  lastUpdated: string;
  sources: { title: string; uri: string }[];
  images: string[];
}

export enum ViewState {
  HOME = 'HOME',
  LOADING = 'LOADING',
  ARTICLE = 'ARTICLE',
  ERROR = 'ERROR'
}

export interface SearchResult {
  query: string;
}

export const LANGUAGES: Record<Language, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  zh: { name: 'Chinese', nativeName: '中文' },
};