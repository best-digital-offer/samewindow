# PriceSnap

> **Snap it. Find it. Compare it.**

PriceSnap is a 100% static visual shopping search web application. It enables users to take a photo or upload a screenshot of any product, identify it using AI vision models, and launch real shopping searches across online stores in **any country on any site worldwide**, complete with authentic merchant logos.

---

## Worldwide Coverage

PriceSnap features verified direct search integrations across top global online stores:

- **Global & Worldwide**: Google Shopping Global, Worldwide Web Search, Official Brand Store Finder, AliExpress (200+ countries)
- **United States 🇺🇸**: Amazon US, Walmart, Target, Best Buy, B&H Photo Video, Newegg, eBay US
- **United Kingdom 🇬🇧**: Amazon UK, Currys UK, Argos UK, eBay UK
- **Europe 🇪🇺**: Amazon DE/FR/ES/IT, MediaMarkt Europe, Otto Germany, Fnac France, Allegro Poland
- **India 🇮🇳**: Flipkart, Amazon India, Croma Electronics, Reliance Digital
- **Canada 🇨🇦**: Amazon Canada, Best Buy Canada, Canadian Tire
- **Australia 🇦🇺**: Amazon Australia, JB Hi-Fi, eBay Australia
- **Japan 🇯🇵**: Amazon Japan, Rakuten Japan
- **Asia & Latin America 🌏**: Shopee, Lazada, Mercado Libre

Each store card displays its authentic brand SVG logo, country/region badge, query parameters, and a direct deep-search button.

---

## Supported Groq Vision Models

PriceSnap connects directly from your browser to Groq's high-speed vision inference models:

- **`llama-3.2-11b-vision-preview`** *(Recommended & Default)*: High-performance, production-ready vision model universally active on Groq.
- **`llama-3.2-90b-vision-preview`**: Large multimodal reasoning model for dense text/packaging inspection.
- **`meta-llama/llama-4-maverick-17b-128e-instruct`**: Llama 4 multimodal mixture-of-experts model.
- **`qwen/qwen3.8-27b`**: Qwen multimodal vision model.

### Automatic Model Auto-Recovery
If a selected model is temporarily unavailable or returns `404` (e.g. `qwen/qwen3.6-27b`), PriceSnap **automatically falls back** to the active `llama-3.2-11b-vision-preview` model, updates your local settings seamlessly, and completes your analysis without failing.

---

## Key Features

- **Client-Side Image Processing**: Upload files via drag-and-drop, file picker, or mobile device camera (`capture="environment"`). Images are automatically resized client-side using the HTML5 Canvas API (max 1024px) for speed and minimal bandwidth.
- **Direct Browser Groq API**: Calls `https://api.groq.com/openai/v1/chat/completions` directly from your browser. Your API key is stored exclusively in your browser's `localStorage` (`pricesnap_groq_api_key`).
- **Zero Data Hallucination**: Distinguishes AI visual recognition from live shopping data. Retailer search links are generated with strict `encodeURIComponent` query parameters rather than fabricating false prices, stock statuses, or mock Amazon listings.
- **Instant Demo Mode**: Includes pre-calibrated sample products (Sony WH-1000XM5, Logitech MX Master 3S, Nike Air Max 270, Apple Watch Ultra 2) so anyone can evaluate the system without needing an API key immediately.
- **Country & Region Filter Tabs**: Filter stores instantly by `Worldwide`, `United States`, `United Kingdom`, `Europe`, `India`, `Canada`, `Australia`, `Japan`, or `Asia & LatAm`.
- **Fully Static & GitHub Pages Ready**: Built purely with vanilla HTML5, CSS3, and JavaScript using relative paths (`./styles.css`, `./app.js`, `./loading.html`, `./results.html`). Runs directly in any web browser without Node.js, npm, or server-side build steps.

---

## How to Deploy to GitHub Pages

Because PriceSnap is completely static, it requires **no build step, no npm install, and no backend server**.

### Option A: Automatic GitHub Actions (Recommended)
1. Push this repository to GitHub.
2. In your repository settings, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically publish your repository root directly to GitHub Pages.

### Option B: Deploy from Branch
1. Navigate to **Settings** > **Pages** in your repository.
2. Under **Source**, choose **Deploy from a branch**.
3. Select your `main` branch and `/ (root)` folder, then click **Save**.
4. Your website will be available at `https://<username>.github.io/<repository-name>/`.

---

## Privacy & Security

- **Images**: Uploaded images are compressed in-browser and held in temporary `sessionStorage` during your active tab session. PriceSnap does not retain, upload, or store your photos permanently.
- **API Keys**: Stored only in your local browser's `localStorage`.
- **Zero Telemetry**: No third-party trackers, telemetry beacons, or advertising scripts.
