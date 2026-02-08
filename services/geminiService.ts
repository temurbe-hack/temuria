import { GoogleGenAI, Tool } from "@google/genai";
import { ArticleData, Language } from "../types";

const apiKey = "AIzaSyAIqLHUatNYesEEk9np7U6kTtSWdeKqGiQ"

const ai = new GoogleGenAI({ apiKey });

// Helper to find relevant images for the article from the web
const findArticleImages = async (topic: string): Promise<string[]> => {
  if (!apiKey) return [];
  try {
    // Request multiple images, preferring Wikimedia for stability
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Task: Find 3 distinct, high-quality, real-world image URLs representing: "${topic}".
        
        Constraints:
        1. Source: Prefer Wikimedia Commons, Flickr (Public Domain), or reputable news/educational sites.
        2. Format: Direct links to image files (.jpg, .png, .webp).
        3. Output: Return ONLY a JSON array of strings. Example: ["https://site.com/img1.jpg", "https://site.com/img2.jpg"]
      `,
      config: {
        tools: [{ googleSearch: {} }], 
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) return [];

    try {
      const urls = JSON.parse(jsonText);
      if (Array.isArray(urls)) {
        // Filter for valid-looking image URLs
        return urls.filter(url => 
            typeof url === 'string' && 
            url.startsWith('http') && 
            /\.(jpg|jpeg|png|webp|svg)/i.test(url)
        );
      }
    } catch (e) {
      console.warn("Failed to parse image JSON", e);
    }
    
    return [];
  } catch (error) {
    console.warn("Image search failed:", error);
    return [];
  }
};

export const generateWikiArticle = async (topic: string, lang: Language = 'en'): Promise<ArticleData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }

  // 1. Start Image Search in Parallel
  const imagesPromise = findArticleImages(topic);

  // 2. Prepare Text Generation with Grounding
  const tools: Tool[] = [{ googleSearch: {} }];

  const languageNames = {
    en: 'English',
    ru: 'Russian',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    zh: 'Simplified Chinese'
  };

  const targetLang = languageNames[lang];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are "Temuria", a real-time AI encyclopedia.
        
        Task: Write a comprehensive, neutral, and academic encyclopedia article about: "${topic}".
        Language: Write the ENTIRE article in ${targetLang}.
        
        Requirements:
        1. **Structure**: Use Markdown. Start with a summary paragraph. Use standard encyclopedia sections (History, Characteristics, Modern Status, etc.) translated to ${targetLang}.
        2. **Real-time**: Use the Google Search tool to find the LATEST information (news, stats, updates from ${new Date().getFullYear()}) and include it.
        3. **Tone**: Objective, encyclopedic.
        4. **Formatting**: Bold key terms. No Title Header (#) in body.
        
        If the topic is unclear, provide a disambiguation page style response in ${targetLang}.
      `,
      config: {
        tools: tools,
        systemInstruction: `You are a helpful, neutral encyclopedia editor writing in ${targetLang}.`,
        temperature: 0.3,
      },
    });

    const text = response.text || "No content generated.";
    
    // Extract grounding metadata for sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as { title: string; uri: string }[];

    // 3. Await the images
    const images = await imagesPromise;

    return {
      title: topic,
      content: text,
      lastUpdated: new Date().toLocaleDateString(lang, { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      sources: uniqueSources,
      images: images
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to retrieve article from the archives.");
  }
};

export const getTrendingTopics = async (lang: Language): Promise<string[]> => {
    const topics: Record<Language, string[]> = {
        en: ["Artificial Intelligence", "Mars Colonization", "Quantum Computing", "Global Economy 2025", "Latest Nobel Prize"],
        ru: ["Искусственный интеллект", "Колонизация Марса", "Квантовые вычисления", "Мировая экономика 2025", "Нобелевская премия"],
        es: ["Inteligencia Artificial", "Colonización de Marte", "Computación Cuántica", "Economía Global 2025", "Premio Nobel"],
        fr: ["Intelligence Artificielle", "Colonisation de Mars", "Informatique Quantique", "Économie Mondiale 2025", "Prix Nobel"],
        de: ["Künstliche Intelligenz", "Besiedlung des Mars", "Quantencomputing", "Weltwirtschaft 2025", "Nobelpreis"],
        zh: ["人工智能", "火星殖民", "量子计算", "2025年全球经济", "诺贝尔奖"]
    };
    return topics[lang] || topics.en;
};
