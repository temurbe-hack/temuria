import React, { useState, useEffect, FormEvent } from 'react';
import { Logo } from './components/Logo';
import { ArticlePage } from './components/ArticlePage';
import { generateWikiArticle, getTrendingTopics } from './services/geminiService';
import { ArticleData, ViewState, Language, LANGUAGES } from './types';
import { MagnifyingGlassIcon, SparklesIcon, ArrowPathIcon, LanguageIcon } from '@heroicons/react/24/solid';

// Simple UI Translation Dictionary
const UI_TEXT = {
  en: { searchPlaceholder: "Search for anything...", trending: "Trending on Temuria", didYouKnow: "Did you know?", try: "Try:", searching: "Searching global knowledge...", footer: "Temuria Foundation", access: "Accessing 100% of the world's knowledge." },
  ru: { searchPlaceholder: "Ищите что угодно...", trending: "Популярное в Темурии", didYouKnow: "Знаете ли вы?", try: "Попробуйте:", searching: "Поиск мировых знаний...", footer: "Фонд Темурия", access: "Доступ к 100% мировых знаний." },
  es: { searchPlaceholder: "Busca cualquier cosa...", trending: "Tendencias en Temuria", didYouKnow: "¿Sabías que?", try: "Prueba:", searching: "Buscando conocimiento global...", footer: "Fundación Temuria", access: "Accediendo al 100% del conocimiento mundial." },
  fr: { searchPlaceholder: "Recherchez n'importe quoi...", trending: "Tendances sur Temuria", didYouKnow: "Le saviez-vous ?", try: "Essayez :", searching: "Recherche des connaissances mondiales...", footer: "Fondation Temuria", access: "Accès à 100% des connaissances mondiales." },
  de: { searchPlaceholder: "Suche nach allem...", trending: "Trends auf Temuria", didYouKnow: "Wussten Sie schon?", try: "Versuchen Sie:", searching: "Durchsuche weltweites Wissen...", footer: "Temuria Stiftung", access: "Zugriff auf 100% des Weltwissens." },
  zh: { searchPlaceholder: "搜索任何内容...", trending: "Temuria 热门趋势", didYouKnow: "你知道吗？", try: "尝试：", searching: "搜索全球知识...", footer: "Temuria 基金会", access: "访问 100% 的世界知识。" },
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [query, setQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState<ArticleData | null>(null);
  const [trending, setTrending] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('ru');
  const [loadingText, setLoadingText] = useState('Consulting the archives...');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const loadTrending = async () => {
      const topics = await getTrendingTopics(language);
      setTrending(topics);
    };
    loadTrending();
  }, [language]);

  const handleSearch = async (e?: FormEvent, topicOverride?: string) => {
    if (e) e.preventDefault();
    const topic = topicOverride || query;
    if (!topic.trim()) return;

    setViewState(ViewState.LOADING);
    
    // Localized loading messages
    const loadingMessages = [
        UI_TEXT[language].searching,
        "Formatting references...",
        "Synthesizing recent events...",
        "Generating illustrations...",
        "Drafting article..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
        setLoadingText(loadingMessages[msgIdx % loadingMessages.length]);
        msgIdx++;
    }, 1500);

    try {
      const article = await generateWikiArticle(topic, language);
      setCurrentArticle(article);
      setViewState(ViewState.ARTICLE);
      setQuery(topic); 
    } catch (error) {
      console.error(error);
      setViewState(ViewState.ERROR);
    } finally {
      clearInterval(interval);
    }
  };

  const goHome = () => {
    setViewState(ViewState.HOME);
    setQuery('');
    setCurrentArticle(null);
  };

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const ui = UI_TEXT[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#3E3C38] font-sans selection:bg-[#E6E2D8] selection:text-[#1A1917]" onClick={() => showLangMenu && setShowLangMenu(false)}>
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <Logo size="sm" onClick={goHome} />
            
            {/* Search Bar - Condensed */}
            {viewState !== ViewState.HOME && (
              <form onSubmit={(e) => handleSearch(e)} className="hidden md:flex relative w-80 lg:w-96">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ui.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-1.5 bg-[#F5F2EB] border border-[#E6E2D8] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#948F7F] focus:bg-white transition-all text-sm text-[#3E3C38] placeholder-[#948F7F]"
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-[#948F7F] absolute left-3 top-2.5" />
              </form>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-6 text-sm font-medium text-[#78756E]">
             {/* Language Selector */}
             <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
                  className="flex items-center gap-1 hover:text-[#3E3C38] px-2 py-1 rounded hover:bg-[#F5F2EB] transition-colors"
                >
                  <LanguageIcon className="w-4 h-4" />
                  <span className="uppercase tracking-wide text-xs font-bold">{language}</span>
                </button>
                
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg border border-[#E6E2D8] py-1 z-50">
                    {Object.entries(LANGUAGES).map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => toggleLanguage(code as Language)}
                        className={`w-full text-left px-4 py-2 hover:bg-[#F5F2EB] text-sm ${language === code ? 'text-[#3E3C38] font-bold bg-[#FDFBF7]' : 'text-[#78756E]'}`}
                      >
                        {info.nativeName}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <button onClick={goHome} className="hidden sm:block hover:text-[#3E3C38] transition-colors">Home</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        
        {/* VIEW: HOME */}
        {viewState === ViewState.HOME && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
            <div className="mb-10 scale-110">
              <Logo />
            </div>
            
            <form onSubmit={(e) => handleSearch(e)} className="w-full max-w-2xl relative mb-16">
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ui.searchPlaceholder}
                  className="w-full pl-6 pr-14 py-4 text-lg bg-white border border-[#D6D2C4] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#948F7F] focus:ring-4 focus:ring-[#E6E2D8] transition-all text-[#3E3C38] placeholder-[#B8B4A6]"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-3 p-2 bg-[#8C8675] text-white rounded hover:bg-[#6B6861] transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 text-center text-[#948F7F] text-sm font-light tracking-wide">
                {ui.access}
              </div>
            </form>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl border border-[#E6E2D8] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <h3 className="flex items-center gap-2 font-serif font-bold text-[#3E3C38] text-lg mb-6 border-b border-[#F5F2EB] pb-2">
                  <SparklesIcon className="w-4 h-4 text-[#D6D2C4]" />
                  {ui.trending}
                </h3>
                <ul className="space-y-3">
                  {trending.map((topic, i) => (
                    <li key={i}>
                      <button 
                        onClick={() => handleSearch(undefined, topic)}
                        className="text-left w-full text-[#78756E] hover:text-[#3E3C38] hover:translate-x-1 transition-all text-[0.95rem] py-1"
                      >
                        {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#3E3C38] p-8 rounded-xl text-[#FDFBF7] shadow-[0_4px_15px_rgba(62,60,56,0.15)] flex flex-col justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="font-serif font-bold text-lg mb-3 text-[#D6D2C4]">{ui.didYouKnow}</h3>
                    <p className="text-[#948F7F] text-sm leading-relaxed">
                      Temuria uses advanced AI grounding to read the live web. Unlike traditional encyclopedias that can be months out of date, articles here are generated the moment you ask.
                    </p>
                </div>
                <div className="mt-6 relative z-10">
                   <button 
                     onClick={() => handleSearch(undefined, "How does Generative AI work?")}
                     className="text-xs font-bold uppercase tracking-widest bg-[#5E5B55] hover:bg-[#78756E] px-4 py-3 rounded-sm transition-colors border border-[#5E5B55]"
                   >
                     {ui.try} "GenAI"
                   </button>
                </div>
                {/* Decorative element */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#5E5B55] rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LOADING */}
        {viewState === ViewState.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#78756E]">
            <div className="relative w-12 h-12 mb-8">
               <div className="absolute inset-0 border-[3px] border-[#E6E2D8] rounded-full"></div>
               <div className="absolute inset-0 border-[3px] border-[#8C8675] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-serif font-medium text-[#3E3C38] animate-pulse">{loadingText}</h2>
            <p className="mt-3 text-sm text-[#948F7F] font-light">Verifying sources and compiling data.</p>
          </div>
        )}

        {/* VIEW: ARTICLE */}
        {viewState === ViewState.ARTICLE && currentArticle && (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
             <ArticlePage data={currentArticle} />
          </div>
        )}

        {/* VIEW: ERROR */}
        {viewState === ViewState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
             <div className="w-16 h-16 bg-[#F5F2EB] rounded-full flex items-center justify-center mb-6 border border-[#E6E2D8]">
                <span className="text-2xl grayscale opacity-50">⚠️</span>
             </div>
             <h2 className="text-2xl font-serif font-bold text-[#3E3C38] mb-3">Unable to Load Article</h2>
             <p className="max-w-md text-[#78756E] mb-8 leading-relaxed">
               The archives are currently unreachable. This may be due to a missing API key or a temporary network issue.
             </p>
             <button 
               onClick={goHome}
               className="px-6 py-2.5 bg-[#3E3C38] text-[#FDFBF7] rounded-sm hover:bg-[#2C2A26] transition-colors text-sm tracking-wide"
             >
               Return Home
             </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-[#E6E2D8] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#948F7F]">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-light tracking-wide">&copy; {new Date().getFullYear()} {ui.footer}.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#3E3C38] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#3E3C38] transition-colors">About</a>
            <a href="#" className="hover:text-[#3E3C38] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#3E3C38] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;