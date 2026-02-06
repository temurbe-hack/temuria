import React, { useEffect, useState } from 'react';
import { ArticleData } from '../types';
import { MarkdownView } from './MarkdownView';
import { GlobeAltIcon, ClockIcon, BookOpenIcon, ShareIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ArticlePageProps {
  data: ArticleData;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ data }) => {
  const [toc, setToc] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const headers = data.content
      .split('\n')
      .filter(line => line.startsWith('## '))
      .map(line => line.replace('## ', ''));
    setToc(headers);
    setFailedImages(new Set());
  }, [data]);

  const handleImageError = (url: string) => {
    setFailedImages(prev => {
        const next = new Set(prev);
        next.add(url);
        return next;
    });
  };

  // Filter out failed images
  const validImages = data.images.filter(url => !failedImages.has(url));
  const heroImage = validImages[0];
  const galleryImages = validImages.slice(1);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4 py-6">
      
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-24 space-y-6 text-sm text-[#78756E]">
          <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E2D8]">
            <h4 className="font-serif font-bold text-[#3E3C38] mb-3 border-b border-[#E6E2D8] pb-2">Actions</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 hover:text-[#3E3C38] cursor-pointer transition-colors duration-200">
                <GlobeAltIcon className="w-4 h-4" /> Read
              </li>
              <li className="flex items-center gap-2 hover:text-[#3E3C38] cursor-pointer transition-colors duration-200">
                <ShareIcon className="w-4 h-4" /> Share
              </li>
              <li className="flex items-center gap-2 hover:text-[#3E3C38] cursor-pointer transition-colors duration-200">
                <BookOpenIcon className="w-4 h-4" /> Cite this page
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white min-h-[80vh] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6E2D8] overflow-hidden">
        
        {/* Hero Image Section */}
        {heroImage ? (
            <div className="relative h-64 md:h-96 w-full group overflow-hidden bg-[#F5F2EB]">
                {/* Blurred Background for ambiance */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" 
                    style={{ backgroundImage: `url(${heroImage})` }}
                ></div>
                
                {/* Main Image */}
                <img 
                    src={heroImage} 
                    alt={data.title}
                    className="relative w-full h-full object-contain z-10 transition-transform duration-1000 group-hover:scale-105"
                    onError={() => handleImageError(heroImage)}
                />
                <div className="absolute bottom-3 right-3 z-20 bg-[#3E3C38]/80 text-[#FDFBF7] text-xs px-3 py-1.5 rounded-sm flex items-center gap-2 backdrop-blur-sm">
                    <PhotoIcon className="w-3 h-3" />
                    <span className="font-medium tracking-wide">Web Source</span>
                </div>
            </div>
        ) : (
            <div className="h-2 w-full bg-[#E6E2D8]"></div>
        )}

        <div className="p-8 md:p-12">
            {/* Article Header */}
            <header className="mb-10 border-b border-[#E6E2D8] pb-8">
                <div className="flex justify-between items-start">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A26] mb-4 capitalize tracking-tight">
                        {data.title}
                    </h1>
                    <div className="hidden md:flex flex-col items-end">
                        <span className="bg-[#F5F2EB] text-[#78756E] px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-widest border border-[#E6E2D8]">
                            Live Article
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-[#948F7F] mt-2">
                    <div className="flex items-center gap-1">
                        <span className="font-serif italic">From Temuria, the live encyclopedia.</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1 rounded border border-[#E6E2D8]">
                        <ClockIcon className="w-4 h-4" />
                        <span>Last updated: {data.lastUpdated}</span>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="text-[#3E3C38]">
                <MarkdownView content={data.content} />
            </div>

            {/* Visual Gallery */}
            {galleryImages.length > 0 && (
                <section className="mt-12 mb-8">
                    <h3 className="text-xl font-serif font-bold text-[#3E3C38] mb-4 flex items-center gap-2">
                         <PhotoIcon className="w-5 h-5 text-[#8C8675]" />
                         Visual Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {galleryImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative aspect-video bg-[#F5F2EB] rounded overflow-hidden border border-[#E6E2D8] group">
                                <img 
                                    src={imgUrl} 
                                    alt={`${data.title} gallery ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={() => handleImageError(imgUrl)}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* References Section */}
            {data.sources.length > 0 && (
            <section className="mt-16 pt-8 border-t border-[#E6E2D8]">
                <h2 className="text-lg font-bold font-serif text-[#3E3C38] mb-6 uppercase tracking-wider text-sm">References & Live Sources</h2>
                <div className="bg-[#FDFBF7] p-6 rounded border border-[#E6E2D8]">
                    <p className="text-sm text-[#78756E] mb-4">
                        This article was dynamically generated using grounded information from the following sources:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-[#5E5B55]">
                    {data.sources.map((source, idx) => (
                        <li key={idx} className="break-all">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[#8C8675] hover:text-[#3E3C38] underline decoration-[#D6D2C4] hover:decoration-[#8C8675] underline-offset-2 transition-all">
                            {source.title || source.uri}
                        </a>
                        <span className="text-[#B8B4A6] mx-2">—</span>
                        <span className="text-[#948F7F] italic">Google Search</span>
                        </li>
                    ))}
                    </ol>
                </div>
            </section>
            )}
        </div>
      </main>

      {/* Right Sidebar - TOC */}
      <aside className="hidden xl:block w-72 shrink-0">
         <div className="sticky top-24">
            <div className="bg-white p-6 rounded-lg border border-[#E6E2D8] shadow-sm">
                <h3 className="font-bold text-[#3E3C38] mb-4 text-xs uppercase tracking-widest">Contents</h3>
                <nav>
                    <ul className="space-y-3 text-sm border-l border-[#E6E2D8] pl-4">
                        <li>
                            <a href="#" className="text-[#3E3C38] font-medium block -ml-[1.05rem] pl-4 border-l-2 border-[#8C8675]">Introduction</a>
                        </li>
                        {toc.map((item, idx) => (
                            <li key={idx}>
                                <a href="#" className="text-[#78756E] hover:text-[#3E3C38] transition-colors block">
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            
            <div className="mt-6 bg-[#F5F2EB] p-5 rounded-lg border border-[#E6E2D8]">
                <p className="text-xs text-[#78756E] leading-relaxed font-serif italic">
                    <strong>Note:</strong> Data is sourced in real-time. Formatting by AI.
                </p>
            </div>
         </div>
      </aside>
    </div>
  );
};