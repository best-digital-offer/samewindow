import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json({limit:"15mb"}));

const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";

let browserPromise;
async function getBrowser(){
  if(!browserPromise){
    browserPromise = chromium.launch({
      headless:true,
      args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"]
    }).catch(err=>{ browserPromise=null; throw err; });
  }
  return browserPromise;
}

function cleanText(v){ return (v||"").replace(/\s+/g," ").trim(); }

function normalizeUrl(href, base){
  try{
    const u = new URL(href, base);
    if(!/^https?:$/.test(u.protocol)) return null;
    return u.href;
  }catch{return null;}
}

function extractOffers(pageData){
  const {links,text} = pageData;
  const seen = new Set();
  const offers = [];
  const merchantHosts = [
    "amazon.","walmart.","target.","ebay.","bestbuy.","etsy.","shopify.",
    "homedepot.","lowes.","macys.","nike.","adidas.","costco.","wayfair.",
    "flipkart.","myntra.","croma.","reliancedigital.","ajio.","meesho."
  ];
  for(const item of links){
    const url = normalizeUrl(item.href, "https://lens.google.com/");
    if(!url || seen.has(url)) continue;
    const label = cleanText(item.text);
    const host = (()=>{try{return new URL(url).hostname.toLowerCase()}catch{return ""}})();
    const blob = (label+" "+host).toLowerCase();
    const price = (label.match(/(?:₹|\$|€|£|\bINR\b|\bUSD\b|\bEUR\b|\bGBP\b)\s?[0-9][0-9,]*(?:\.\d{1,2})?/i)||[])[0] || "";
    const merchantish = merchantHosts.some(x=>host.includes(x)) ||
      /buy|shop|price|\$|₹|€|£|inr|usd|eur|gbp/i.test(blob);
    if(!merchantish || !label || label.length<3) continue;
    seen.add(url);
    offers.push({merchant:host.replace(/^www\./,""),title:label.slice(0,220),price:cleanText(price),currency:price.startsWith("₹")?"INR":price.startsWith("$")?"USD":price.startsWith("€")?"EUR":price.startsWith("£")?"GBP":"",url});
    if(offers.length>=40) break;
  }
  return offers;
}

app.get("/health",(req,res)=>res.json({ok:true,service:"samewindow-browser-worker"}));

app.post("/lens-search", async (req,res)=>{
  const started=Date.now();
  const imageData=req.body?.imageData;
  if(typeof imageData!=="string" || !imageData.startsWith("data:image/")){
    return res.status(400).json({success:false,message:"imageData must be a data:image/... URL"});
  }

  let context;
  try{
    const match=imageData.match(/^data:([^;]+);base64,(.+)$/s);
    if(!match) throw new Error("Invalid image data");
    const mime=match[1];
    const buffer=Buffer.from(match[2],"base64");
    const browser=await getBrowser();
    context=await browser.newContext({
      viewport:{width:1440,height:1100},
      locale:"en-US",
      userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
    });
    const page=await context.newPage();

    await page.goto("https://lens.google.com/",{waitUntil:"domcontentloaded",timeout:30000});
    const fileInput=page.locator('input[type="file"]').first();
    await fileInput.waitFor({state:"attached",timeout:15000});
    await fileInput.setInputFiles({name:"image.jpg",mimeType:mime,buffer});
    await page.waitForLoadState("domcontentloaded",{timeout:20000}).catch(()=>{});
    await page.waitForTimeout(7000);

    for(let i=0;i<3;i++){
      await page.mouse.wheel(0,900);
      await page.waitForTimeout(1200);
    }

    const resultsUrl=page.url();
    const pageData=await page.evaluate(()=>{
      const links=[...document.querySelectorAll("a[href]")].map(a=>({href:a.href,text:(a.innerText||a.textContent||"").trim()}));
      return {links,text:(document.body?.innerText||"").slice(0,50000),title:document.title};
    });
    const offers=extractOffers(pageData);

    return res.json({
      success:true,
      resultsUrl,
      productName:cleanText(pageData.title).replace(/Google Lens/gi,"").trim(),
      offers,
      count:offers.length,
      elapsedMs:Date.now()-started
    });
  }catch(error){
    return res.status(500).json({success:false,message:error?.message||"Lens browser search failed",elapsedMs:Date.now()-started});
  }finally{
    await context?.close().catch(()=>{});
  }
});

app.listen(PORT,HOST,()=>console.log("SameWindow browser worker listening on "+PORT));