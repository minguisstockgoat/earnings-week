import {writeFile} from "node:fs/promises";
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const start=new Date(`${process.env.START_DATE||iso(new Date())}T12:00:00`);
const days=Array.from({length:31},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return iso(d)});
const headers={"user-agent":"Mozilla/5.0 (compatible; EarningsWeek/1.0)",accept:"application/json, text/plain, */*",origin:"https://www.nasdaq.com",referer:"https://www.nasdaq.com/"};
const money=v=>{const n=Number(String(v||"").replace(/[$,]/g,""));return Number.isFinite(n)?n:0};
const items=[];
for(const date of days){
 const res=await fetch(`https://api.nasdaq.com/api/calendar/earnings?date=${date}`,{headers});
 if(!res.ok)throw new Error(`Nasdaq ${date}: ${res.status}`);
 const json=await res.json();
 for(const row of json?.data?.rows??[]){
  items.push({date,company:row.name,ticker:row.symbol,session:row.time==="time-pre-market"?"장전":row.time==="time-after-hours"?"장후":"미정",eps:row.epsForecast||"—",marketCap:row.marketCap||"—",marketCapValue:money(row.marketCap),quarter:row.fiscalQuarterEnding||"—"});
 }
 await new Promise(resolve=>setTimeout(resolve,60));
}
items.sort((a,b)=>a.date.localeCompare(b.date)||b.marketCapValue-a.marketCapValue);
const out={source:{name:"Nasdaq Earnings Calendar",url:"https://www.nasdaq.com/market-activity/earnings"},updatedAt:new Date().toISOString(),rangeStart:days[0],rangeEnd:days.at(-1),items};
await writeFile("app/us-earnings.json",JSON.stringify(out,null,2)+"\n","utf8");
console.log(`Saved ${items.length} Nasdaq earnings (${out.rangeStart} — ${out.rangeEnd})`);