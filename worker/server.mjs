import express from "express";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
app.use(express.json({limit:"15mb"}));
const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";
const PROFILE = process.env.LENS_PROFILE_DIR || path.join(os.tmpdir(),"samewindow-lens-profile");

let contextPromise;
async function getContext(){
  if(!contextPromise){
    contextPromise = chromium.launchPersistentContext(PROFILE,{
      headless:true,
      viewport:{width:1440,height:1100},
      locale:"en-US",
      args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-blink-features=AutomationControlled"],
      ignoreDefaultArgs:["--enable-automation"],
      userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    }).catch(err=>{contextPromise=null;throw err;});
  }
  return contextPromise;
}
function cleanText(v){return(v||"").replace(/\s+/g," ").trim();}
function absolute(href,base){try{const u=new URL(href,base);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}}
function unwrapGoogle(href){
  try{
    const u=new URL(href);
    if(u.hostname.includes("google.") && (u.pathname.includes("/url")||u.pathname.includes("/goto"))){
      return u.searchParams.get("url")||u.searchParams.get("q")||href;
    }
  }catch{}
  return href;
}
function extractOffers(data){
  const out=[],seen=new Set();
  const merchants=["amazon.","walmart.","target.","ebay.","bestbuy.","etsy.","homedepot.","lowes.","macys.","nike.","adidas.","costco.","wayfair.","flipkart.","myntra.","croma.","reliancedigital.","ajio.","meesho."];
  for(const item of data.links){
    let url=absolute(item.href,data.url); if(!url) continue;
    url=unwrapGoogle(url);
    if(seen.has(url)) continue;
    const label=cleanText(item.text);
    const host=(()=>{try{return new URL(url).hostname.toLowerCase()}catch{return""}})();
    const price=(label.match(/(?:₹|\$|€|£|\bINR\b|\bUSD\b|\bEUR\b|\bGBP\b)\s?[0-9][0-9,.]*/i)||[])[0]||"";
    const looksLikeOffer=merchants.some(m=>host.includes(m))||/buy|shop|price|\$|₹|€|£|inr|usd|eur|gbp/i.test(label+" "+host);
    if(!looksLikeOffer||label.length<3) continue;
    seen.add(url);
    out.push({merchant:host.replace(/^www\./,""),title:label.slice(0,240),price,currency:price.startsWith("₹")?"INR":price.startsWith("$")?"USD":price.startsWith("€")?"EUR":price.startsWith("£")?"GBP":"",url});
    if(out.length>=50)break;
  }
  return out;
}
function deriveProductQuery(data){
  const candidates=[
    data.title,
    ...((data.text||"").split("\n").map(cleanText).filter(Boolean).slice(0,40))
  ];
  const bad=/google lens|visual matches|shopping|sign in|search by image|similar/i;
  for(const value of candidates){
    const q=cleanText(value).replace(/Google Lens/gi,"").replace(/\s+/g," ").trim();
    if(q.length>=5 && q.length<=180 && !bad.test(q)) return q;
  }
  return "";
}
async function searchProductOffers(context,query){
  const page=await context.newPage();
  try{
    const searchUrl="https://www.google.com/search?tbm=shop&q="+encodeURIComponent(query);
    await page.goto(searchUrl,{waitUntil:"domcontentloaded",timeout:30000}).catch(()=>{});
    await page.waitForTimeout(2500);
    const data=await page.evaluate(()=>({
      url:location.href,
      title:document.title,
      text:(document.body?.innerText||"").slice(0,100000),
      links:[...document.querySelectorAll("a[href]")].map(a=>({href:a.href,text:(a.innerText||a.textContent||"").trim()}))
    }));
    if(blocked(data.url,data.text)) return {blocked:true,url:data.url,offers:[]};
    return {blocked:false,url:data.url,offers:extractOffers(data)};
  }finally{await page.close().catch(()=>{});}
}

function blocked(url,text){
  return /sorry\/index|consent.google|unusual traffic|not a robot|captcha|enable javascript/i.test(url+" "+text);
}

app.get("/health",(req,res)=>res.json({ok:true,service:"samewindow-browser-worker",lensProfile:PROFILE}));

app.post("/lens-search",async(req,res)=>{
  const started=Date.now(), imageData=req.body?.imageData;
  if(typeof imageData!=="string"||!imageData.startsWith("data:image/"))
    return res.status(400).json({success:false,message:"imageData must be a data:image/... URL"});
  let page;
  try{
    const m=imageData.match(/^data:([^;]+);base64,(.+)$/s); if(!m)throw new Error("Invalid image data");
    const buffer=Buffer.from(m[2],"base64");
    const context=await getContext();
    page=await context.newPage();

    await page.goto("https://www.google.com/",{waitUntil:"domcontentloaded",timeout:30000}).catch(()=>{});
    await page.waitForTimeout(1000);

    // Submit Lens upload as a real top-level multipart navigation.
    await page.evaluate(({b64,mime})=>{
      const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
      const form=document.createElement("form");
      form.method="POST"; form.action="https://lens.google.com/v3/upload?ep=ccm&s=&st="+Date.now();
      form.enctype="multipart/form-data";
      const input=document.createElement("input"); input.type="file"; input.name="encoded_image";
      const dt=new DataTransfer(); dt.items.add(new File([bytes],"image.jpg",{type:mime})); input.files=dt.files;
      form.appendChild(input);
      const dims=document.createElement("input"); dims.type="hidden"; dims.name="processed_image_dimensions"; dims.value="1000,1000"; form.appendChild(dims);
      const src=document.createElement("input"); src.type="hidden"; src.name="sbisrc"; src.value="Google Chrome"; form.appendChild(src);
      document.body.appendChild(form); form.submit();
    },{b64:m[2],mime:m[1]});

    await page.waitForTimeout(10000);
    const url=page.url();
    const data=await page.evaluate(()=>({
      url:location.href,
      title:document.title,
      text:(document.body?.innerText||"").slice(0,80000),
      links:[...document.querySelectorAll("a[href]")].map(a=>({href:a.href,text:(a.innerText||a.textContent||"").trim()}))
    }));
    if(blocked(data.url,data.text)){
      return res.status(502).json({
        success:false,
        blocked:true,
        message:"Google Lens returned a verification/challenge page instead of the shopping results. The browser worker needs a verified Google session before automatic extraction can continue.",
        resultsUrl:data.url,
        elapsedMs:Date.now()-started
      });
    }
    const offers=extractOffers(data);
    return res.json({success:true,resultsUrl:data.url,productName:cleanText(data.title).replace(/Google Lens/gi,"").trim(),offers,count:offers.length,elapsedMs:Date.now()-started});
  }catch(error){
    return res.status(500).json({success:false,message:error?.message||"Lens browser search failed",elapsedMs:Date.now()-started});
  }finally{await page?.close().catch(()=>{});}
});
app.listen(PORT,HOST,()=>console.log("SameWindow browser worker listening on "+PORT));