/**
 * PriceSnap - Visual Shopping Search Engine
 * Client-Side Static Architecture for GitHub Pages
 *
 * Supported AI Vision Engines:
 * 1. Google Gemini API (Recommended: gemini-2.5-flash) - Blazing fast, official vision, highly accurate
 * 2. Groq Vision API (qwen/qwen3.8-27b) - Ultra low-latency inference
 *
 * Core Modules:
 * - PriceSnapConfig: Local storage management for Gemini & Groq keys and models
 * - PriceSnapStorage: Session storage for image data and analysis payloads
 * - ImageProcessor: Canvas compression and format validation
 * - GeminiVisionClient: Google Gemini vision integration
 * - GroqVisionClient: Groq vision integration with auto-recovery to Gemini
 * - RetailerLogos: Crisp inline SVG logos for world-wide online stores across all countries
 * - SearchProvider: Worldwide shopping search engine across US, UK, EU, India, Canada, Australia, Japan, Asia, LatAm
 * - SampleCatalog: Pre-configured items for rapid zero-config demonstration
 * - Page Controllers: index, loading, and results handlers
 */

// ==========================================
// 1. CONFIGURATION (Stored in localStorage)
// ==========================================
const PriceSnapConfig = {
  STORAGE_KEY_PROVIDER: 'pricesnap_ai_provider',
  STORAGE_KEY_GEMINI_KEY: 'pricesnap_gemini_api_key',
  STORAGE_KEY_GEMINI_MODEL: 'pricesnap_gemini_model',
  STORAGE_KEY_GROQ_KEY: 'pricesnap_groq_api_key',
  STORAGE_KEY_GROQ_MODEL: 'pricesnap_groq_model',

  DEFAULT_PROVIDER: 'gemini',
  DEFAULT_GEMINI_MODEL: 'gemini-2.5-flash',
  DEFAULT_GROQ_MODEL: 'qwen/qwen3.8-27b',

  getProvider() {
    return localStorage.getItem(this.STORAGE_KEY_PROVIDER) || this.DEFAULT_PROVIDER;
  },

  setProvider(provider) {
    localStorage.setItem(this.STORAGE_KEY_PROVIDER, provider);
  },

  getGeminiKey() {
    const userKey = localStorage.getItem(this.STORAGE_KEY_GEMINI_KEY);
    if (userKey && userKey.trim()) return userKey.trim();

    // Check if injected from Vite development environment (AI Studio build preview)
    if (typeof window !== 'undefined' && window.__ENV_GEMINI_KEY__ && window.__ENV_GEMINI_KEY__.trim()) {
      return window.__ENV_GEMINI_KEY__.trim();
    }
    return '';
  },

  setGeminiKey(key) {
    if (!key || !key.trim()) {
      localStorage.removeItem(this.STORAGE_KEY_GEMINI_KEY);
    } else {
      localStorage.setItem(this.STORAGE_KEY_GEMINI_KEY, key.trim());
    }
  },

  getGeminiModel() {
    return localStorage.getItem(this.STORAGE_KEY_GEMINI_MODEL) || this.DEFAULT_GEMINI_MODEL;
  },

  setGeminiModel(model) {
    localStorage.setItem(this.STORAGE_KEY_GEMINI_MODEL, model || this.DEFAULT_GEMINI_MODEL);
  },

  getGroqKey() {
    return localStorage.getItem(this.STORAGE_KEY_GROQ_KEY) || '';
  },

  setGroqKey(key) {
    if (!key || !key.trim()) {
      localStorage.removeItem(this.STORAGE_KEY_GROQ_KEY);
    } else {
      localStorage.setItem(this.STORAGE_KEY_GROQ_KEY, key.trim());
    }
  },

  getGroqModel() {
    let m = localStorage.getItem(this.STORAGE_KEY_GROQ_MODEL);
    // Auto-migrate retired/decommissioned Groq models
    if (!m || m === 'qwen/qwen3.6-27b' || m === 'llama-3.2-11b-vision-preview') {
      m = this.DEFAULT_GROQ_MODEL;
      localStorage.setItem(this.STORAGE_KEY_GROQ_MODEL, m);
    }
    return m;
  },

  setGroqModel(model) {
    localStorage.setItem(this.STORAGE_KEY_GROQ_MODEL, model || this.DEFAULT_GROQ_MODEL);
  },

  hasActiveKey() {
    const provider = this.getProvider();
    if (provider === 'gemini') {
      return Boolean(this.getGeminiKey());
    }
    return Boolean(this.getGroqKey());
  }
};

// ==========================================
// 2. SESSION STORAGE (Volatile, tab-scoped)
// ==========================================
const PriceSnapStorage = {
  KEY_IMAGE: 'pricesnap_image_data',
  KEY_FILENAME: 'pricesnap_image_name',
  KEY_RESULT: 'pricesnap_analysis_result',
  KEY_IS_SAMPLE: 'pricesnap_is_sample',

  saveSession(dataUrl, filename, isSample = false) {
    try {
      sessionStorage.setItem(this.KEY_IMAGE, dataUrl);
      sessionStorage.setItem(this.KEY_FILENAME, filename || 'product-image.jpg');
      sessionStorage.setItem(this.KEY_IS_SAMPLE, isSample ? 'true' : 'false');
    } catch (e) {
      console.error('Session storage quota exceeded:', e);
      throw new Error('Image too large for session storage. Try a smaller image.');
    }
  },

  getImage() {
    return sessionStorage.getItem(this.KEY_IMAGE);
  },

  getFilename() {
    return sessionStorage.getItem(this.KEY_FILENAME) || 'product-image.jpg';
  },

  isSample() {
    return sessionStorage.getItem(this.KEY_IS_SAMPLE) === 'true';
  },

  saveResult(resultObj) {
    sessionStorage.setItem(this.KEY_RESULT, JSON.stringify(resultObj));
  },

  getResult() {
    const raw = sessionStorage.getItem(this.KEY_RESULT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  clearSession() {
    sessionStorage.removeItem(this.KEY_IMAGE);
    sessionStorage.removeItem(this.KEY_FILENAME);
    sessionStorage.removeItem(this.KEY_RESULT);
    sessionStorage.removeItem(this.KEY_IS_SAMPLE);
  }
};

// ==========================================
// 3. IMAGE PROCESSOR (Client-side Canvas)
// ==========================================
const ImageProcessor = {
  MAX_DIMENSION: 1024,
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024, // 15MB max raw file

  validateFile(file) {
    if (!file) {
      throw new Error('No file selected.');
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported image format. Please use JPG, PNG, or WEBP.');
    }
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error('Image file is too large (max 15MB).');
    }
    return true;
  },

  compressAndLoad(file) {
    return new Promise((resolve, reject) => {
      try {
        this.validateFile(file);
      } catch (err) {
        return reject(err);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * this.MAX_DIMENSION) / width);
              width = this.MAX_DIMENSION;
            } else {
              width = Math.round((width * this.MAX_DIMENSION) / height);
              height = this.MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG for high model compatibility
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            dataUrl: compressedDataUrl,
            width,
            height,
            name: file.name
          });
        };
        img.onerror = () => reject(new Error('Failed to load image into browser memory.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  }
};

// Common System Prompt for both Gemini and Groq
const SHARED_VISION_PROMPT = `You are the product identification engine for PriceSnap.
Analyze the uploaded product image carefully.
Look for:
- Brand logos
- Product names
- Model numbers
- SKU numbers
- UPC/EAN/barcodes when readable
- Packaging text
- Labels
- Distinctive product design
- Shape
- Color
- Materials
- Buttons
- Ports
- Logos
- Product category

Identify the exact product only when there is enough visual evidence.
Do not hallucinate an exact model.
If the exact product cannot be confidently identified, return a broader product category and visual description.
Generate useful search queries that can be used to search real product listings worldwide.
Never invent prices.
Never invent retailers.
Never invent product URLs.
Never invent ratings.
Never invent reviews.
Never invent availability.
Return valid JSON only following this exact schema:
{
  "product_identified": boolean,
  "confidence": number,
  "brand": string or null,
  "product_name": string or null,
  "full_product_name": string,
  "model_number": string or null,
  "category": string,
  "subcategory": string,
  "color": string,
  "identifiers": string[],
  "visual_description": string,
  "search_queries": string[]
}`;

// ==========================================
// 4A. GOOGLE GEMINI VISION CLIENT
// ==========================================
const GeminiVisionClient = {
  async analyzeImage(base64DataUrl) {
    const apiKey = PriceSnapConfig.getGeminiKey();
    if (!apiKey) {
      throw new Error('MISSING_GEMINI_KEY');
    }

    const model = PriceSnapConfig.getGeminiModel();
    // Strip "data:image/jpeg;base64," prefix for Gemini inlineData
    const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: SHARED_VISION_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      throw new Error('Network error connecting to Google Gemini API. Please check your connection.');
    }

    if (!response.ok) {
      let errorMsg = `Google Gemini API Error (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {
        // fallback text
      }
      if (response.status === 400 && errorMsg.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Google Gemini API Key. Please verify your key in Settings.');
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Empty response received from Google Gemini model.');
    }

    return parseAndValidateJson(content);
  }
};

// ==========================================
// 4B. GROQ VISION CLIENT (With Gemini Auto-Fallback)
// ==========================================
const GroqVisionClient = {
  async analyzeImage(base64DataUrl) {
    const apiKey = PriceSnapConfig.getGroqKey();
    if (!apiKey) {
      // If no Groq key, but Gemini key exists, switch to Gemini
      if (PriceSnapConfig.getGeminiKey()) {
        console.log('[PriceSnap] Falling back to Gemini Vision...');
        PriceSnapConfig.setProvider('gemini');
        return GeminiVisionClient.analyzeImage(base64DataUrl);
      }
      throw new Error('MISSING_GROQ_KEY');
    }

    const model = PriceSnapConfig.getGroqModel();

    const payload = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SHARED_VISION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: base64DataUrl
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    };

    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      throw new Error('Network error: Unable to contact Groq API.');
    }

    if (!response.ok) {
      let errorMsg = `Groq API Error (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {
        // fallback text
      }

      // Check if model was decommissioned or not found
      const isDecommissioned = errorMsg.includes('decommissioned') ||
        errorMsg.includes('no longer supported') ||
        response.status === 404 ||
        errorMsg.includes('not found');

      if (isDecommissioned) {
        // If Gemini is available, switch automatically!
        if (PriceSnapConfig.getGeminiKey()) {
          console.warn('[PriceSnap] Groq model decommissioned. Auto-switching to Gemini API!');
          PriceSnapConfig.setProvider('gemini');
          if (window.UI) UI.showToast('Groq model decommissioned. Switched to Google Gemini vision!');
          return GeminiVisionClient.analyzeImage(base64DataUrl);
        }
        throw new Error(`Groq model "${model}" is decommissioned or unavailable. Please switch to Google Gemini API (Recommended) or update your model in Settings.`);
      }

      if (response.status === 401) {
        throw new Error('Invalid Groq API Key. Please verify your key in Settings.');
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from Groq vision model.');
    }

    return parseAndValidateJson(content);
  }
};

// Unified Unified Vision Dispatcher
const AIVisionEngine = {
  async analyzeImage(base64DataUrl) {
    const provider = PriceSnapConfig.getProvider();
    if (provider === 'gemini') {
      return GeminiVisionClient.analyzeImage(base64DataUrl);
    } else {
      return GroqVisionClient.analyzeImage(base64DataUrl);
    }
  }
};

function parseAndValidateJson(rawContent) {
  let clean = rawContent.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    throw new Error('Failed to parse AI response as valid JSON: ' + e.message);
  }

  return {
    product_identified: Boolean(parsed.product_identified),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.90,
    brand: parsed.brand || null,
    product_name: parsed.product_name || null,
    full_product_name: parsed.full_product_name || (parsed.brand ? `${parsed.brand} ${parsed.product_name || 'Product'}` : 'Unidentified Product'),
    model_number: parsed.model_number || null,
    category: parsed.category || 'General Merchandise',
    subcategory: parsed.subcategory || 'Product',
    color: parsed.color || 'Standard',
    identifiers: Array.isArray(parsed.identifiers) ? parsed.identifiers : [],
    visual_description: parsed.visual_description || 'Product identified from visual characteristics.',
    search_queries: Array.isArray(parsed.search_queries) && parsed.search_queries.length > 0
      ? parsed.search_queries
      : [parsed.full_product_name || 'Product search']
  };
}

// ==========================================
// 5. RETAILER LOGOS (Crisp Inline SVGs)
// ==========================================
const RetailerLogos = {
  amazon: `<svg viewBox="0 0 100 32" width="100%" height="100%"><path d="M12 22c-6.6 0-12-3.8-12-8.5 0-4.8 5.4-8.5 12-8.5 4.5 0 8.5 1.8 10.5 4.8V5.5h4v16h-4v-2c-2 2.5-6 2.5-10.5 2.5zm1.5-3.8c4.2 0 7.5-2.2 7.5-5.2s-3.3-5.2-7.5-5.2c-4.2 0-7.5 2.2-7.5 5.2s3.3 5.2 7.5 5.2z" fill="#0f172a"/><path d="M4 27c12 6.5 35 6 48-1.5" stroke="#ff9900" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M49 22l6 4-6 4" fill="#ff9900"/></svg>`,

  google_shopping: `<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M14 10h12v5h-12z" fill="none" stroke="#4285f4" stroke-width="3"/><path d="M9 15h22l-2 18H11z" fill="#ea4335"/><path d="M15 15v5c0 2.8 2.2 5 5 5s5-2.2 5-5v-5" fill="none" stroke="#fbbc05" stroke-width="3"/><path d="M11 33l18-18" stroke="#34a853" stroke-width="2" opacity="0.3"/></svg>`,

  google_web: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="16" fill="none" stroke="#4285f4" stroke-width="3"/><ellipse cx="20" cy="20" rx="7" ry="16" fill="none" stroke="#34a853" stroke-width="2.5"/><line x1="4" y1="20" x2="36" y2="20" stroke="#ea4335" stroke-width="2.5"/><line x1="8" y1="10" x2="32" y2="10" stroke="#fbbc05" stroke-width="2"/><line x1="8" y1="30" x2="32" y2="30" stroke="#fbbc05" stroke-width="2"/></svg>`,

  ebay: `<svg viewBox="0 0 80 32" width="100%" height="100%"><text x="4" y="24" font-family="sans-serif" font-weight="900" font-size="28" fill="#e53238">e</text><text x="21" y="24" font-family="sans-serif" font-weight="900" font-size="28" fill="#0064d2">b</text><text x="39" y="24" font-family="sans-serif" font-weight="900" font-size="28" fill="#f5af02">a</text><text x="56" y="24" font-family="sans-serif" font-weight="900" font-size="28" fill="#86b817">y</text></svg>`,

  walmart: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#0071dc"/><path d="M20 7v6m0 14v6M7 20h6m14 0h6m-19-9l4 4m10 10l4 4m0-18l-4 4m-10 10l-4 4" stroke="#ffc220" stroke-width="3.5" stroke-linecap="round"/></svg>`,

  target: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="none" stroke="#cc0000" stroke-width="5"/><circle cx="20" cy="20" r="7" fill="#cc0000"/></svg>`,

  bestbuy: `<svg viewBox="0 0 50 36" width="100%" height="100%"><path d="M4 4h36l8 14-8 14H4z" fill="#fff200"/><circle cx="42" cy="18" r="3" fill="#000"/><text x="8" y="22" font-family="sans-serif" font-weight="900" font-size="12" fill="#0046be">BEST BUY</text></svg>`,

  flipkart: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#2874f0"/><path d="M12 12h16l-2 18H14z" fill="#ffe11b"/><text x="17" y="27" font-family="sans-serif" font-weight="900" font-size="16" fill="#2874f0">f</text></svg>`,

  aliexpress: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#ff4747"/><path d="M10 14h20v14H10z" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M15 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#fff" stroke-width="2.5"/><text x="13" y="25" font-family="sans-serif" font-weight="800" font-size="10" fill="#fff">Ali</text></svg>`,

  rakuten: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#bf0000"/><text x="20" y="26" font-family="sans-serif" font-weight="900" font-size="20" fill="#fff" text-anchor="middle">R</text></svg>`,

  bhphoto: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#0b5e28"/><circle cx="20" cy="20" r="10" fill="none" stroke="#fff" stroke-width="2.5"/><text x="20" y="24" font-family="sans-serif" font-weight="800" font-size="10" fill="#fff" text-anchor="middle">B&amp;H</text></svg>`,

  newegg: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="16" cy="20" r="11" fill="#f7941d"/><circle cx="24" cy="20" r="11" fill="#005596" opacity="0.85"/><text x="20" y="23" font-family="sans-serif" font-weight="900" font-size="7" fill="#fff" text-anchor="middle">NEWEGG</text></svg>`,

  currys: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#4d148c"/><circle cx="20" cy="20" r="8" fill="#ff007f"/></svg>`,

  mediamarkt: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#df0000"/><path d="M8 20 Q 20 8, 32 20 Q 20 32, 8 20" fill="none" stroke="#fff" stroke-width="3"/></svg>`,

  otto: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#d4002a"/><text x="20" y="25" font-family="sans-serif" font-weight="900" font-size="12" fill="#fff" text-anchor="middle">OTTO</text></svg>`,

  argos: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#d2153d"/><text x="20" y="24" font-family="sans-serif" font-weight="900" font-size="9" fill="#fff" text-anchor="middle">ARGOS</text></svg>`,

  fnac: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#e1a100"/><text x="20" y="25" font-family="sans-serif" font-weight="900" font-size="12" fill="#000" text-anchor="middle">fnac</text></svg>`,

  allegro: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#ff5a00"/><text x="20" y="27" font-family="sans-serif" font-weight="900" font-size="20" fill="#fff" text-anchor="middle">a</text></svg>`,

  shopee: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#ee4d2d"/><path d="M12 14h16l-2 16H14z" fill="#fff"/><text x="20" y="26" font-family="sans-serif" font-weight="900" font-size="12" fill="#ee4d2d" text-anchor="middle">S</text></svg>`,

  lazada: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#0f156d"/><path d="M14 16 C 14 12, 20 12, 20 16 C 20 12, 26 12, 26 16 C 26 22, 20 26, 20 26 C 20 26, 14 22, 14 16 Z" fill="#f53d2d"/></svg>`,

  mercadolibre: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="18" fill="#ffe600"/><path d="M12 20l5 5 11-11" stroke="#2d3277" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,

  jbhifi: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#ffeb00"/><text x="20" y="23" font-family="sans-serif" font-weight="900" font-size="11" fill="#000" text-anchor="middle">JB HI-FI</text></svg>`,

  croma: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#00838f"/><text x="20" y="24" font-family="sans-serif" font-weight="800" font-size="9" fill="#fff" text-anchor="middle">CROMA</text></svg>`,

  reliancedigital: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#e50914"/><text x="20" y="23" font-family="sans-serif" font-weight="800" font-size="7" fill="#fff" text-anchor="middle">RELIANCE</text><text x="20" y="31" font-family="sans-serif" font-weight="800" font-size="7" fill="#fff" text-anchor="middle">DIGITAL</text></svg>`,

  canadiantire: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#006633"/><polygon points="20,10 32,30 8,30" fill="#cc0000"/><polygon points="20,14 28,27 12,27" fill="#fff"/></svg>`,

  official_brand: `<svg viewBox="0 0 40 40" width="100%" height="100%"><rect width="40" height="40" rx="8" fill="#1e293b"/><path d="M10 16l10-6 10 6v14H10z" fill="none" stroke="#6366f1" stroke-width="2.5"/><circle cx="20" cy="22" r="3" fill="#6366f1"/></svg>`
};

// ==========================================
// 6. WORLDWIDE SEARCH PROVIDER ARCHITECTURE
// ==========================================
const SearchProvider = {
  generateRetailerLinks(searchQuery, region = 'all', brand = '') {
    const q = encodeURIComponent(searchQuery.trim());
    const brandQuery = brand ? encodeURIComponent(`${brand} official store online`) : q;

    const allStores = [
      // 1. GLOBAL / WORLDWIDE & WEB
      {
        id: 'google_shopping',
        name: 'Google Shopping',
        region: 'all',
        countryName: 'Worldwide',
        flag: '🌐',
        domain: 'google.com/shopping',
        logo: RetailerLogos.google_shopping,
        url: `https://www.google.com/search?tbm=shop&q=${q}`,
        description: 'Multi-merchant comparison across global stores'
      },
      {
        id: 'google_web_global',
        name: 'Worldwide Web Search',
        region: 'all',
        countryName: 'Any Country / Site',
        flag: '🌍',
        domain: 'google.com',
        logo: RetailerLogos.google_web,
        url: `https://www.google.com/search?q=${q}+buy+online`,
        description: 'Search online stores and shops across all countries'
      },
      {
        id: 'official_brand_store',
        name: brand ? `${brand} Official Store` : 'Official Brand Online Store',
        region: 'all',
        countryName: 'Brand Direct',
        flag: '🏷️',
        domain: brand ? `${brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'official',
        logo: RetailerLogos.official_brand,
        url: `https://www.google.com/search?q=${brandQuery}`,
        description: 'Find official manufacturer store and certified sellers'
      },
      {
        id: 'aliexpress',
        name: 'AliExpress Global',
        region: 'all',
        countryName: 'Global Shipping (200+ Countries)',
        flag: '🌐',
        domain: 'aliexpress.com',
        logo: RetailerLogos.aliexpress,
        url: `https://www.aliexpress.com/wholesale?SearchText=${q}`,
        description: 'Worldwide consumer products & direct marketplace'
      },

      // 2. UNITED STATES
      {
        id: 'amazon_us',
        name: 'Amazon US',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'amazon.com',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.com/s?k=${q}`,
        description: 'Amazon US marketplace catalog & Prime'
      },
      {
        id: 'walmart',
        name: 'Walmart',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'walmart.com',
        logo: RetailerLogos.walmart,
        url: `https://www.walmart.com/search?q=${q}`,
        description: 'Walmart online & retail stores nationwide'
      },
      {
        id: 'target',
        name: 'Target',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'target.com',
        logo: RetailerLogos.target,
        url: `https://www.target.com/s?searchTerm=${q}`,
        description: 'Target retail inventory & online orders'
      },
      {
        id: 'bestbuy',
        name: 'Best Buy',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'bestbuy.com',
        logo: RetailerLogos.bestbuy,
        url: `https://www.bestbuy.com/site/searchpage.jsp?st=${q}`,
        description: 'Top US consumer tech & electronics'
      },
      {
        id: 'ebay_us',
        name: 'eBay US',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'ebay.com',
        logo: RetailerLogos.ebay,
        url: `https://www.ebay.com/sch/i.html?_nkw=${q}`,
        description: 'eBay new, used & refurbished inventory'
      },
      {
        id: 'bhphoto',
        name: 'B&H Photo Video',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'bhphotovideo.com',
        logo: RetailerLogos.bhphoto,
        url: `https://www.bhphotovideo.com/c/search?Ntt=${q}`,
        description: 'Professional tech, photo, audio & computer store'
      },
      {
        id: 'newegg',
        name: 'Newegg',
        region: 'us',
        countryName: 'United States',
        flag: '🇺🇸',
        domain: 'newegg.com',
        logo: RetailerLogos.newegg,
        url: `https://www.newegg.com/p/pl?d=${q}`,
        description: 'Computer hardware, electronics & gaming'
      },

      // 3. UNITED KINGDOM
      {
        id: 'amazon_uk',
        name: 'Amazon UK',
        region: 'uk',
        countryName: 'United Kingdom',
        flag: '🇬🇧',
        domain: 'amazon.co.uk',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.co.uk/s?k=${q}`,
        description: 'Amazon UK store with fast delivery'
      },
      {
        id: 'currys',
        name: 'Currys UK',
        region: 'uk',
        countryName: 'United Kingdom',
        flag: '🇬🇧',
        domain: 'currys.co.uk',
        logo: RetailerLogos.currys,
        url: `https://www.currys.co.uk/search?q=${q}`,
        description: 'Major UK electrical & technology retailer'
      },
      {
        id: 'argos',
        name: 'Argos UK',
        region: 'uk',
        countryName: 'United Kingdom',
        flag: '🇬🇧',
        domain: 'argos.co.uk',
        logo: RetailerLogos.argos,
        url: `https://www.argos.co.uk/search/${q}`,
        description: 'UK catalogue retail & same-day collection'
      },
      {
        id: 'ebay_uk',
        name: 'eBay UK',
        region: 'uk',
        countryName: 'United Kingdom',
        flag: '🇬🇧',
        domain: 'ebay.co.uk',
        logo: RetailerLogos.ebay,
        url: `https://www.ebay.co.uk/sch/i.html?_nkw=${q}`,
        description: 'eBay UK marketplace & verified sellers'
      },

      // 4. EUROPE
      {
        id: 'amazon_de',
        name: 'Amazon DE (Europe)',
        region: 'eu',
        countryName: 'Germany / Europe',
        flag: '🇪🇺',
        domain: 'amazon.de',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.de/s?k=${q}`,
        description: 'Largest European Amazon marketplace'
      },
      {
        id: 'mediamarkt',
        name: 'MediaMarkt',
        region: 'eu',
        countryName: 'Europe (Germany, Spain, etc.)',
        flag: '🇪🇺',
        domain: 'mediamarkt.de',
        logo: RetailerLogos.mediamarkt,
        url: `https://www.mediamarkt.de/de/search.html?query=${q}`,
        description: 'Europe\'s largest consumer electronics retailer'
      },
      {
        id: 'otto_de',
        name: 'Otto Germany',
        region: 'eu',
        countryName: 'Germany',
        flag: '🇩🇪',
        domain: 'otto.de',
        logo: RetailerLogos.otto,
        url: `https://www.otto.de/suche/${q}`,
        description: 'Leading German e-commerce platform'
      },
      {
        id: 'fnac_fr',
        name: 'Fnac France',
        region: 'eu',
        countryName: 'France / Europe',
        flag: '🇫🇷',
        domain: 'fnac.com',
        logo: RetailerLogos.fnac,
        url: `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0&Search=${q}`,
        description: 'Leading French retail chain for cultural & electronic goods'
      },
      {
        id: 'allegro_pl',
        name: 'Allegro Poland',
        region: 'eu',
        countryName: 'Poland / Central Europe',
        flag: '🇵🇱',
        domain: 'allegro.pl',
        logo: RetailerLogos.allegro,
        url: `https://www.allegro.pl/listing?string=${q}`,
        description: 'Top European e-commerce marketplace in Poland'
      },

      // 5. INDIA
      {
        id: 'flipkart',
        name: 'Flipkart',
        region: 'in',
        countryName: 'India',
        flag: '🇮🇳',
        domain: 'flipkart.com',
        logo: RetailerLogos.flipkart,
        url: `https://www.flipkart.com/search?q=${q}`,
        description: 'India\'s leading online shopping destination'
      },
      {
        id: 'amazon_in',
        name: 'Amazon India',
        region: 'in',
        countryName: 'India',
        flag: '🇮🇳',
        domain: 'amazon.in',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.in/s?k=${q}`,
        description: 'Amazon India store with Prime delivery'
      },
      {
        id: 'croma_in',
        name: 'Croma Electronics',
        region: 'in',
        countryName: 'India',
        flag: '🇮🇳',
        domain: 'croma.com',
        logo: RetailerLogos.croma,
        url: `https://www.croma.com/searchB?q=${q}`,
        description: 'Tata-backed nationwide electronics retailer'
      },
      {
        id: 'reliance_digital',
        name: 'Reliance Digital',
        region: 'in',
        countryName: 'India',
        flag: '🇮🇳',
        domain: 'reliancedigital.in',
        logo: RetailerLogos.reliancedigital,
        url: `https://www.reliancedigital.in/search?q=${q}`,
        description: 'Reliance Retail electronics & tech store'
      },

      // 6. CANADA
      {
        id: 'amazon_ca',
        name: 'Amazon Canada',
        region: 'ca',
        countryName: 'Canada',
        flag: '🇨🇦',
        domain: 'amazon.ca',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.ca/s?k=${q}`,
        description: 'Amazon Canada marketplace'
      },
      {
        id: 'bestbuy_ca',
        name: 'Best Buy Canada',
        region: 'ca',
        countryName: 'Canada',
        flag: '🇨🇦',
        domain: 'bestbuy.ca',
        logo: RetailerLogos.bestbuy,
        url: `https://www.bestbuy.ca/en-ca/search?search=${q}`,
        description: 'Consumer electronics & tech across Canada'
      },
      {
        id: 'canadian_tire',
        name: 'Canadian Tire',
        region: 'ca',
        countryName: 'Canada',
        flag: '🇨🇦',
        domain: 'canadiantire.ca',
        logo: RetailerLogos.canadiantire,
        url: `https://www.canadiantire.ca/en/search-results.html?q=${q}`,
        description: 'Canadian automotive, home, outdoor & sports retail'
      },

      // 7. AUSTRALIA
      {
        id: 'amazon_au',
        name: 'Amazon Australia',
        region: 'au',
        countryName: 'Australia',
        flag: '🇦🇺',
        domain: 'amazon.com.au',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.com.au/s?k=${q}`,
        description: 'Amazon Australia shopping & Prime'
      },
      {
        id: 'jbhifi',
        name: 'JB Hi-Fi Australia',
        region: 'au',
        countryName: 'Australia & New Zealand',
        flag: '🇦🇺',
        domain: 'jbhifi.com.au',
        logo: RetailerLogos.jbhifi,
        url: `https://www.jbhifi.com.au/search?query=${q}`,
        description: 'Australia\'s premier home entertainment & electronics store'
      },
      {
        id: 'ebay_au',
        name: 'eBay Australia',
        region: 'au',
        countryName: 'Australia',
        flag: '🇦🇺',
        domain: 'ebay.com.au',
        logo: RetailerLogos.ebay,
        url: `https://www.ebay.com.au/sch/i.html?_nkw=${q}`,
        description: 'eBay Australia marketplace'
      },

      // 8. JAPAN
      {
        id: 'amazon_jp',
        name: 'Amazon Japan',
        region: 'jp',
        countryName: 'Japan',
        flag: '🇯🇵',
        domain: 'amazon.co.jp',
        logo: RetailerLogos.amazon,
        url: `https://www.amazon.co.jp/s?k=${q}`,
        description: 'Amazon Japan marketplace catalog'
      },
      {
        id: 'rakuten_jp',
        name: 'Rakuten Japan',
        region: 'jp',
        countryName: 'Japan',
        flag: '🇯🇵',
        domain: 'rakuten.co.jp',
        logo: RetailerLogos.rakuten,
        url: `https://search.rakuten.co.jp/search/mall/${q}/`,
        description: 'Japan\'s largest e-commerce shopping mall'
      },

      // 9. ASIA & LATIN AMERICA
      {
        id: 'shopee',
        name: 'Shopee',
        region: 'asia',
        countryName: 'Southeast Asia / LatAm',
        flag: '🌏',
        domain: 'shopee.com',
        logo: RetailerLogos.shopee,
        url: `https://shopee.com/search?keyword=${q}`,
        description: 'Leading mobile e-commerce platform in SE Asia'
      },
      {
        id: 'lazada',
        name: 'Lazada',
        region: 'asia',
        countryName: 'Southeast Asia',
        flag: '🌏',
        domain: 'lazada.com',
        logo: RetailerLogos.lazada,
        url: `https://www.lazada.com/catalog/?q=${q}`,
        description: 'Major online shopping mall in Southeast Asia'
      },
      {
        id: 'mercadolibre',
        name: 'Mercado Libre',
        region: 'asia',
        countryName: 'Latin America (Brazil, Mexico, etc.)',
        flag: '🌎',
        domain: 'mercadolibre.com',
        logo: RetailerLogos.mercadolibre,
        url: `https://www.mercadolibre.com/jm/search?as_word=${q}`,
        description: 'Latin America\'s largest online commerce ecosystem'
      }
    ];

    if (region === 'all') {
      return allStores;
    }

    return allStores.filter(store => store.region === region || store.region === 'all');
  },

  async searchProducts(query) {
    return {
      liveProviderConnected: false,
      providerName: 'Direct Retailer Search Links',
      results: []
    };
  }
};

// ==========================================
// 7. SAMPLE CATALOG (For Instant Testing)
// ==========================================
const SampleCatalog = [
  {
    id: 'sony-headphones',
    name: 'Sony WH-1000XM5',
    category: 'Headphones',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="#0f172a"/><circle cx="200" cy="200" r="140" fill="none" stroke="#334155" stroke-width="12"/><path d="M120 180 C 120 100, 280 100, 280 180" fill="none" stroke="#94a3b8" stroke-width="18" stroke-linecap="round"/><rect x="100" y="180" width="46" height="90" rx="23" fill="#1e293b" stroke="#64748b" stroke-width="6"/><rect x="254" y="180" width="46" height="90" rx="23" fill="#1e293b" stroke="#64748b" stroke-width="6"/><text x="200" y="320" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="20" text-anchor="middle">SONY WH-1000XM5</text></svg>`,
    data: {
      product_identified: true,
      confidence: 0.95,
      brand: "Sony",
      product_name: "WH-1000XM5",
      full_product_name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
      model_number: "WH-1000XM5",
      category: "Electronics",
      subcategory: "Wireless Headphones",
      color: "Black",
      identifiers: ["WH1000XM5/B"],
      visual_description: "Over-ear noise cancelling headphones in matte black finish with continuous cylindrical headband, stepless slider mechanism, and oval synthetic leather earcups.",
      search_queries: [
        "Sony WH-1000XM5",
        "Sony WH-1000XM5 black headphones",
        "Sony WH-1000XM5 wireless noise cancelling"
      ]
    }
  },
  {
    id: 'logitech-mouse',
    name: 'Logitech MX Master 3S',
    category: 'Computer Peripherals',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="#0f172a"/><path d="M160 110 C 220 100, 270 140, 270 230 C 270 290, 230 310, 180 310 C 130 310, 120 270, 120 220 C 120 180, 140 120, 160 110 Z" fill="#1e293b" stroke="#64748b" stroke-width="8"/><circle cx="195" cy="160" r="14" fill="#94a3b8"/><rect x="135" y="195" width="22" height="12" rx="4" fill="#cbd5e1"/><text x="200" y="360" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="18" text-anchor="middle">LOGITECH MX MASTER 3S</text></svg>`,
    data: {
      product_identified: true,
      confidence: 0.93,
      brand: "Logitech",
      product_name: "MX Master 3S",
      full_product_name: "Logitech MX Master 3S Performance Wireless Mouse",
      model_number: "910-006556",
      category: "Computer Peripherals",
      subcategory: "Ergonomic Mice",
      color: "Graphite",
      identifiers: ["MX Master 3S"],
      visual_description: "Ergonomic right-handed wireless mouse featuring textured thumb rest, MagSpeed electromagnetic scroll wheel, side thumb wheel, and dark graphite silicone casing.",
      search_queries: [
        "Logitech MX Master 3S",
        "Logitech MX Master 3S graphite wireless mouse",
        "Logitech MX Master 3S performance mouse"
      ]
    }
  },
  {
    id: 'nike-sneakers',
    name: 'Nike Air Max 270',
    category: 'Footwear',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="#0f172a"/><path d="M80 250 L 140 250 Q 200 240 250 210 L 320 230 Q 330 270 290 280 L 100 280 Z" fill="#1e293b" stroke="#e2e8f0" stroke-width="6"/><circle cx="130" cy="265" r="22" fill="#ef4444" opacity="0.85"/><path d="M170 210 L 230 190 L 220 220 Z" fill="#ffffff"/><text x="200" y="350" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="20" text-anchor="middle">NIKE AIR MAX 270</text></svg>`,
    data: {
      product_identified: true,
      confidence: 0.91,
      brand: "Nike",
      product_name: "Air Max 270",
      full_product_name: "Nike Air Max 270 Men's Running Shoes",
      model_number: "AH8050-002",
      category: "Footwear",
      subcategory: "Athletic Sneakers",
      color: "Black / Hot Punch / White",
      identifiers: ["AH8050"],
      visual_description: "Athletic sneaker with prominent 270-degree Max Air heel unit in vibrant punch red, engineered breathable mesh upper in black, and asymmetrical lacing.",
      search_queries: [
        "Nike Air Max 270",
        "Nike Air Max 270 black running shoes",
        "Nike Air Max 270 AH8050"
      ]
    }
  },
  {
    id: 'apple-watch',
    name: 'Apple Watch Ultra 2',
    category: 'Wearables',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%"><rect width="400" height="400" fill="#0f172a"/><rect x="145" y="60" width="110" height="280" rx="14" fill="#ea580c"/><rect x="130" y="125" width="140" height="150" rx="34" fill="#334155" stroke="#94a3b8" stroke-width="8"/><rect x="145" y="140" width="110" height="120" rx="22" fill="#000000"/><rect x="270" y="160" width="10" height="34" rx="4" fill="#f97316"/><text x="200" y="380" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="18" text-anchor="middle">APPLE WATCH ULTRA 2</text></svg>`,
    data: {
      product_identified: true,
      confidence: 0.96,
      brand: "Apple",
      product_name: "Watch Ultra 2",
      full_product_name: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
      model_number: "A2986",
      category: "Wearables",
      subcategory: "Smartwatches",
      color: "Natural Titanium / Orange Alpine Loop",
      identifiers: ["Apple Watch Ultra 2"],
      visual_description: "Rugged 49mm aerospace-grade titanium case with raised sapphire crystal display edge, high-contrast orange international Action Button, and orange Alpine Loop band.",
      search_queries: [
        "Apple Watch Ultra 2",
        "Apple Watch Ultra 2 49mm titanium",
        "Apple Watch Ultra 2 GPS Cellular"
      ]
    }
  }
];

function sampleSvgToDataUrl(svgString) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

// ==========================================
// 8. COMMON UI CONTROLLERS & SETTINGS MODAL
// ==========================================
const UI = {
  showToast(message, duration = 3500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtns = document.querySelectorAll('[data-open-settings]');
    const closeBtn = document.getElementById('close-settings-btn');
    const cancelBtn = document.getElementById('cancel-settings-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const removeBtn = document.getElementById('remove-settings-btn');

    const providerSelect = document.getElementById('ai-provider-select');
    const geminiFields = document.getElementById('gemini-settings-group');
    const groqFields = document.getElementById('groq-settings-group');

    const geminiKeyInput = document.getElementById('gemini-api-key-input');
    const geminiModelSelect = document.getElementById('gemini-model-select');
    const toggleGeminiEye = document.getElementById('toggle-gemini-key-btn');

    const groqKeyInput = document.getElementById('groq-api-key-input');
    const groqModelSelect = document.getElementById('groq-model-select');
    const toggleGroqEye = document.getElementById('toggle-groq-key-btn');

    if (!modal) return;

    const syncProviderVisibility = () => {
      const p = providerSelect ? providerSelect.value : 'gemini';
      if (geminiFields) geminiFields.style.display = p === 'gemini' ? 'block' : 'none';
      if (groqFields) groqFields.style.display = p === 'groq' ? 'block' : 'none';
    };

    const populateValues = () => {
      if (providerSelect) {
        providerSelect.value = PriceSnapConfig.getProvider();
        syncProviderVisibility();
      }
      if (geminiKeyInput) geminiKeyInput.value = PriceSnapConfig.getGeminiKey();
      if (geminiModelSelect) geminiModelSelect.value = PriceSnapConfig.getGeminiModel();
      if (groqKeyInput) groqKeyInput.value = PriceSnapConfig.getGroqKey();
      if (groqModelSelect) groqModelSelect.value = PriceSnapConfig.getGroqModel();
      this.updateHeaderKeyBadge();
    };

    if (providerSelect) {
      providerSelect.addEventListener('change', syncProviderVisibility);
    }

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        populateValues();
        modal.classList.add('active');
      });
    });

    const closeModal = () => modal.classList.remove('active');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const wireEye = (btn, input) => {
      if (!btn || !input) return;
      btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? 'Hide' : 'Show';
      });
    };
    wireEye(toggleGeminiEye, geminiKeyInput);
    wireEye(toggleGroqEye, groqKeyInput);

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const p = providerSelect ? providerSelect.value : 'gemini';
        PriceSnapConfig.setProvider(p);

        if (geminiKeyInput) PriceSnapConfig.setGeminiKey(geminiKeyInput.value.trim());
        if (geminiModelSelect) PriceSnapConfig.setGeminiModel(geminiModelSelect.value.trim());

        if (groqKeyInput) PriceSnapConfig.setGroqKey(groqKeyInput.value.trim());
        if (groqModelSelect) PriceSnapConfig.setGroqModel(groqModelSelect.value.trim());

        this.updateHeaderKeyBadge();
        closeModal();
        this.showToast('Settings saved locally in your browser.');
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const p = providerSelect ? providerSelect.value : 'gemini';
        if (p === 'gemini') {
          PriceSnapConfig.setGeminiKey('');
          if (geminiKeyInput) geminiKeyInput.value = '';
        } else {
          PriceSnapConfig.setGroqKey('');
          if (groqKeyInput) groqKeyInput.value = '';
        }
        this.updateHeaderKeyBadge();
        closeModal();
        this.showToast('API Key removed.');
      });
    }

    this.updateHeaderKeyBadge();
  },

  updateHeaderKeyBadge() {
    const badge = document.getElementById('key-status-indicator');
    const text = document.getElementById('key-status-text');
    if (!badge || !text) return;

    const provider = PriceSnapConfig.getProvider();
    const hasKey = PriceSnapConfig.hasActiveKey();

    if (hasKey) {
      badge.classList.add('active');
      text.textContent = provider === 'gemini' ? 'AI: Gemini Active' : 'AI: Groq Active';
    } else {
      badge.classList.remove('active');
      text.textContent = 'AI: Settings';
    }
  }
};

// ==========================================
// 9. PAGE CONTROLLER: INDEX.HTML
// ==========================================
function initIndexPage() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('file-input');
  const previewCard = document.getElementById('preview-card');
  const previewThumb = document.getElementById('preview-thumb');
  const previewName = document.getElementById('preview-filename');
  const previewSize = document.getElementById('preview-filesize');
  const removeBtn = document.getElementById('preview-remove-btn');
  const submitBtn = document.getElementById('submit-upload-btn');
  const samplesContainer = document.getElementById('samples-container');

  let currentImageDataUrl = null;
  let currentFileName = null;

  // Render Sample Items
  if (samplesContainer) {
    samplesContainer.innerHTML = '';
    SampleCatalog.forEach(sample => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sample-chip';
      chip.textContent = sample.name;
      chip.setAttribute('aria-label', `Test with sample: ${sample.name}`);
      chip.addEventListener('click', () => {
        const dataUrl = sampleSvgToDataUrl(sample.svg);
        PriceSnapStorage.saveSession(dataUrl, `${sample.id}.svg`, true);
        PriceSnapStorage.saveResult(sample.data);
        window.location.href = './loading.html';
      });
      samplesContainer.appendChild(chip);
    });
  }

  const handleSelectedFile = async (file) => {
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing Image...';

      const processed = await ImageProcessor.compressAndLoad(file);
      currentImageDataUrl = processed.dataUrl;
      currentFileName = processed.name;

      if (previewThumb) previewThumb.src = currentImageDataUrl;
      if (previewName) previewName.textContent = currentFileName;
      if (previewSize) previewSize.textContent = `${processed.width} × ${processed.height} px`;

      if (dropzone) dropzone.style.display = 'none';
      if (previewCard) previewCard.classList.add('visible');

      submitBtn.disabled = false;
      submitBtn.textContent = 'Find This Product';
    } catch (err) {
      alert(err.message);
      submitBtn.disabled = true;
      submitBtn.textContent = 'Find This Product';
    }
  };

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentImageDataUrl = null;
      currentFileName = null;
      if (fileInput) fileInput.value = '';
      if (previewCard) previewCard.classList.remove('visible');
      if (dropzone) dropzone.style.display = 'block';
      if (submitBtn) submitBtn.disabled = true;
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (!currentImageDataUrl) return;

      try {
        PriceSnapStorage.saveSession(currentImageDataUrl, currentFileName, false);
        window.location.href = './loading.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

// ==========================================
// 10. PAGE CONTROLLER: LOADING.HTML
// ==========================================
async function initLoadingPage() {
  const headline = document.getElementById('loading-headline');
  const subtext = document.getElementById('loading-subtext');
  const previewImg = document.getElementById('scanner-image');
  const stepItems = document.querySelectorAll('.step-item');

  const setStep = (stepIndex, title, subtitle) => {
    if (headline) headline.textContent = title;
    if (subtext) subtext.textContent = subtitle;

    stepItems.forEach((el, idx) => {
      if (idx < stepIndex) {
        el.classList.add('completed');
        el.classList.remove('active');
        const icon = el.querySelector('.step-icon');
        if (icon) icon.textContent = '✓';
      } else if (idx === stepIndex) {
        el.classList.add('active');
        el.classList.remove('completed');
        const icon = el.querySelector('.step-icon');
        if (icon) icon.textContent = '●';
      } else {
        el.classList.remove('active', 'completed');
        const icon = el.querySelector('.step-icon');
        if (icon) icon.textContent = String(idx + 1);
      }
    });
  };

  const imageDataUrl = PriceSnapStorage.getImage();
  if (!imageDataUrl) {
    window.location.href = './index.html';
    return;
  }

  if (previewImg) {
    previewImg.src = imageDataUrl;
  }

  const isSample = PriceSnapStorage.isSample();
  const existingResult = PriceSnapStorage.getResult();

  try {
    setStep(0, 'Analyzing your image...', 'Extracting visual features and inspecting packaging & logos.');
    await new Promise(r => setTimeout(r, 600));

    const providerName = PriceSnapConfig.getProvider() === 'gemini' ? 'Google Gemini' : 'Groq Vision';
    setStep(1, `Identifying the product with ${providerName}...`, 'Analyzing brand, model number, colors, and design characteristics.');

    let identificationResult;

    if (isSample && existingResult) {
      await new Promise(r => setTimeout(r, 700));
      identificationResult = existingResult;
    } else {
      if (!PriceSnapConfig.hasActiveKey()) {
        showApiKeyPromptModal(imageDataUrl);
        return;
      }

      identificationResult = await AIVisionEngine.analyzeImage(imageDataUrl);
      PriceSnapStorage.saveResult(identificationResult);
    }

    setStep(2, 'Preparing search queries...', 'Synthesizing targeted keyword parameters for worldwide retailer queries.');
    await new Promise(r => setTimeout(r, 500));

    setStep(3, 'Finding worldwide shopping options...', 'Generating direct search links across online stores in all countries.');
    await new Promise(r => setTimeout(r, 450));

    window.location.href = './results.html';
  } catch (err) {
    console.error('Identification failed:', err);
    showErrorState(err.message);
  }
}

function showApiKeyPromptModal(imageDataUrl) {
  const container = document.getElementById('loading-card-content');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: left;">
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">AI Vision Key Required</h3>
      <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">
        To analyze custom images with AI on this static site, choose an AI provider and enter your key:
      </p>

      <div class="form-group" style="margin-bottom: 14px;">
        <label class="form-label" for="prompt-provider-select">Select AI Provider</label>
        <select id="prompt-provider-select" class="form-input">
          <option value="gemini" selected>Google Gemini (Recommended - Free, Fast &amp; Reliable)</option>
          <option value="groq">Groq Vision (qwen/qwen3.8-27b)</option>
        </select>
      </div>

      <div class="form-group" id="prompt-gemini-box">
        <label class="form-label" for="prompt-gemini-key-input">Google Gemini API Key</label>
        <input type="password" id="prompt-gemini-key-input" class="form-input" placeholder="AIzaSy..." />
        <div class="form-help">
          Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">Google AI Studio</a>.
        </div>
      </div>

      <div class="form-group" id="prompt-groq-box" style="display: none;">
        <label class="form-label" for="prompt-groq-key-input">Groq API Key</label>
        <input type="password" id="prompt-groq-key-input" class="form-input" placeholder="gsk_..." />
        <div class="form-help">
          Get key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">console.groq.com/keys</a>.
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
        <button type="button" id="submit-key-and-retry-btn" class="btn-primary" style="flex: 1;">Save Key &amp; Analyze</button>
        <button type="button" id="use-sample-fallback-btn" class="btn-secondary">Use Sample Item</button>
        <a href="./index.html" class="btn-secondary">Back to Upload</a>
      </div>
    </div>
  `;

  const provSelect = document.getElementById('prompt-provider-select');
  const geminiBox = document.getElementById('prompt-gemini-box');
  const groqBox = document.getElementById('prompt-groq-box');
  const geminiInput = document.getElementById('prompt-gemini-key-input');
  const groqInput = document.getElementById('prompt-groq-key-input');
  const retryBtn = document.getElementById('submit-key-and-retry-btn');
  const sampleBtn = document.getElementById('use-sample-fallback-btn');

  if (provSelect) {
    provSelect.addEventListener('change', () => {
      const isGemini = provSelect.value === 'gemini';
      if (geminiBox) geminiBox.style.display = isGemini ? 'block' : 'none';
      if (groqBox) groqBox.style.display = isGemini ? 'none' : 'block';
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      const p = provSelect.value;
      PriceSnapConfig.setProvider(p);
      if (p === 'gemini') {
        const val = geminiInput.value.trim();
        if (!val) return alert('Please enter a Google Gemini API key.');
        PriceSnapConfig.setGeminiKey(val);
      } else {
        const val = groqInput.value.trim();
        if (!val) return alert('Please enter a Groq API key.');
        PriceSnapConfig.setGroqKey(val);
      }
      window.location.reload();
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      const sample = SampleCatalog[0];
      PriceSnapStorage.saveSession(sampleSvgToDataUrl(sample.svg), `${sample.id}.svg`, true);
      PriceSnapStorage.saveResult(sample.data);
      window.location.reload();
    });
  }
}

function showErrorState(errorMessage) {
  const container = document.getElementById('loading-card-content');
  if (!container) return;

  const isGroqError = errorMessage.toLowerCase().includes('groq') || errorMessage.toLowerCase().includes('decommissioned');

  container.innerHTML = `
    <div style="text-align: center; padding: 16px 0;">
      <div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--accent-rose-subtle); color: var(--accent-rose-text); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 16px;">✕</div>
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">Analysis Encountered an Issue</h3>
      <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5;">${errorMessage}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        ${isGroqError ? '<button type="button" class="btn-primary" id="switch-to-gemini-btn">Switch to Google Gemini (Recommended)</button>' : ''}
        <button type="button" class="btn-secondary" onclick="window.location.reload()">Retry</button>
        <a href="./index.html" class="btn-secondary">Try Another Image</a>
      </div>
    </div>
  `;

  const switchBtn = document.getElementById('switch-to-gemini-btn');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      PriceSnapConfig.setProvider('gemini');
      window.location.reload();
    });
  }
}

// ==========================================
// 11. PAGE CONTROLLER: RESULTS.HTML
// ==========================================
let currentActiveRegion = 'all';
let currentActiveQuery = '';
let currentBrand = '';

function initResultsPage() {
  const result = PriceSnapStorage.getResult();
  const imageDataUrl = PriceSnapStorage.getImage();

  if (!result || !imageDataUrl) {
    window.location.href = './index.html';
    return;
  }

  const imgEl = document.getElementById('result-uploaded-image');
  if (imgEl) imgEl.src = imageDataUrl;

  const filenameEl = document.getElementById('result-image-filename');
  if (filenameEl) filenameEl.textContent = PriceSnapStorage.getFilename();

  const headlineEl = document.getElementById('result-product-headline');
  if (headlineEl) headlineEl.textContent = result.full_product_name || 'Product Identified';

  const confidenceEl = document.getElementById('result-confidence-badge');
  if (confidenceEl) {
    const pct = Math.round((result.confidence || 0.85) * 100);
    confidenceEl.textContent = `${pct}% Match Confidence`;
    confidenceEl.className = pct >= 80 ? 'confidence-indicator high' : 'confidence-indicator medium';
  }

  const metaContainer = document.getElementById('result-meta-row');
  if (metaContainer) {
    const items = [];
    if (result.brand) items.push(`<span><strong class="meta-key">Brand:</strong> ${escapeHtml(result.brand)}</span>`);
    if (result.model_number) items.push(`<span><strong class="meta-key">Model:</strong> ${escapeHtml(result.model_number)}</span>`);
    if (result.category) items.push(`<span><strong class="meta-key">Category:</strong> ${escapeHtml(result.category)}</span>`);
    if (result.subcategory && result.subcategory !== result.category) items.push(`<span><strong class="meta-key">Type:</strong> ${escapeHtml(result.subcategory)}</span>`);
    if (result.color) items.push(`<span><strong class="meta-key">Color:</strong> ${escapeHtml(result.color)}</span>`);

    metaContainer.innerHTML = items.join('<span class="meta-separator" aria-hidden="true">·</span>');
  }

  const descEl = document.getElementById('result-visual-description');
  if (descEl) descEl.textContent = result.visual_description || 'Identified based on visual inspection.';

  currentBrand = result.brand || '';
  currentActiveQuery = (result.search_queries && result.search_queries[0]) || result.full_product_name;

  const queriesContainer = document.getElementById('result-queries-list');
  if (queriesContainer) {
    queriesContainer.innerHTML = '';
    const queries = result.search_queries || [currentActiveQuery];
    queries.forEach((q) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'query-chip';
      chip.innerHTML = `<span>${escapeHtml(q)}</span><span style="font-size:0.75rem; color:var(--text-subtle);">Use</span>`;
      chip.addEventListener('click', () => {
        currentActiveQuery = q;
        const queryInput = document.getElementById('custom-query-input');
        if (queryInput) queryInput.value = q;
        renderWorldwideRetailerLinks();
        UI.showToast(`Selected query: "${q}"`);
      });
      queriesContainer.appendChild(chip);
    });
  }

  const queryInput = document.getElementById('custom-query-input');
  const updateQueryBtn = document.getElementById('update-query-btn');
  if (queryInput && updateQueryBtn) {
    queryInput.value = currentActiveQuery;
    updateQueryBtn.addEventListener('click', () => {
      const val = queryInput.value.trim();
      if (val) {
        currentActiveQuery = val;
        renderWorldwideRetailerLinks();
        UI.showToast(`Updated retailer search links for "${val}"`);
      }
    });
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        updateQueryBtn.click();
      }
    });
  }

  setupRegionFilters();
  renderWorldwideRetailerLinks();
}

function setupRegionFilters() {
  const container = document.getElementById('region-filter-bar');
  if (!container) return;

  const regions = [
    { id: 'all', label: '🌐 All Worldwide' },
    { id: 'us', label: '🇺🇸 United States' },
    { id: 'uk', label: '🇬🇧 United Kingdom' },
    { id: 'eu', label: '🇪🇺 Europe' },
    { id: 'in', label: '🇮🇳 India' },
    { id: 'ca', label: '🇨🇦 Canada' },
    { id: 'au', label: '🇦🇺 Australia' },
    { id: 'jp', label: '🇯🇵 Japan' },
    { id: 'asia', label: '🌏 Asia & LatAm' }
  ];

  container.innerHTML = '';
  regions.forEach(reg => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `region-chip ${reg.id === currentActiveRegion ? 'active' : ''}`;
    btn.textContent = reg.label;
    btn.addEventListener('click', () => {
      currentActiveRegion = reg.id;
      container.querySelectorAll('.region-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorldwideRetailerLinks();
    });
    container.appendChild(btn);
  });
}

function renderWorldwideRetailerLinks() {
  const container = document.getElementById('retailer-links-container');
  const activeQuerySpan = document.getElementById('active-search-query-display');
  const countSpan = document.getElementById('retailers-count-badge');

  if (activeQuerySpan) activeQuerySpan.textContent = currentActiveQuery;
  if (!container) return;

  const stores = SearchProvider.generateRetailerLinks(currentActiveQuery, currentActiveRegion, currentBrand);

  if (countSpan) {
    countSpan.textContent = `${stores.length} store${stores.length === 1 ? '' : 's'}`;
  }

  container.innerHTML = '';

  stores.forEach(store => {
    const card = document.createElement('div');
    card.className = 'retailer-card';
    card.innerHTML = `
      <div>
        <div class="retailer-card-header">
          <div class="retailer-logo-box" aria-hidden="true">
            ${store.logo}
          </div>
          <div class="retailer-meta-header">
            <div class="retailer-card-name">${escapeHtml(store.name)}</div>
            <div class="retailer-region-tag">
              <span>${store.flag}</span>
              <span>${escapeHtml(store.countryName)}</span>
            </div>
          </div>
        </div>
        <div class="retailer-card-domain">${escapeHtml(store.domain)}</div>
        <p class="retailer-card-desc">${escapeHtml(store.description)}</p>
      </div>
      <a href="${store.url}" target="_blank" rel="noopener noreferrer" class="btn-open-retailer" aria-label="Search on ${escapeHtml(store.name)}">
        <span>Search ${escapeHtml(store.name)}</span>
        <span aria-hidden="true">↗</span>
      </a>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  UI.initSettingsModal();

  const path = window.location.pathname;
  if (path.endsWith('results.html')) {
    initResultsPage();
  } else if (path.endsWith('loading.html')) {
    initLoadingPage();
  } else {
    initIndexPage();
  }
});
