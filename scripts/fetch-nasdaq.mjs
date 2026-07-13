import {mkdir,writeFile} from "node:fs/promises";
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const startArg=process.env.WEEK_START;
const start=startArg?new Date(`${startArg}T12:00:00`):new Date();
if(!startArg){const dow=start.getDay();start.setDate(start.getDate()-(dow===0?6:dow-1));}
const weekdays=["일","월","화","수","목","금","토"];
const days=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return{date:iso(d),day:d.getDate(),weekday:weekdays[d.getDay()]}});
const headers={"user-agent":"Mozilla/5.0 (compatible; EarningsWeek/1.0)",accept:"application/json, text/plain, */*",origin:"https://www.nasdaq.com",referer:"https://www.nasdaq.com/"};
const money=v=>{const n=Number(String(v||"").replace(/[$,]/g,""));return Number.isFinite(n)?n:0};
const colors=["#1D4ED8","#0F766E","#B45309","#BE123C","#172554","#15803D"];
const batches=await Promise.all(days.map(async(d)=>{
 const url=`https://api.nasdaq.com/api/calendar/earnings?date=${d.date}`;
 const res=await fetch(url,{headers});
 if(!res.ok)throw new Error(`Nasdaq ${d.date}: ${res.status}`);
 const json=await res.json();
 const rows=json?.data?.rows??[];
 return rows.sort((a,b)=>money(b.marketCap)-money(a.marketCap)).slice(0,5).map((r,i)=>({
  date:d.date,day:d.day,company:r.name,ticker:r.symbol,session:r.time==="time-pre-market"?"장전":r.time==="time-after-hours"?"장후":"미정",eps:r.epsForecast||"—",marketCap:r.marketCap||"—",quarter:r.fiscalQuarterEnding||"—",color:colors[i%colors.length],featured:i===0
 }));
}));
const out={source:{name:"Nasdaq Earnings Calendar",url:"https://www.nasdaq.com/market-activity/earnings"},updatedAt:new Date().toISOString(),weekStart:days[0].date,weekEnd:days[6].date,days,items:batches.flat()};
await mkdir("app",{recursive:true});
await writeFile("app/earnings-data.json",JSON.stringify(out,null,2)+"\n","utf8");
console.log(`Saved ${out.items.length} Nasdaq earnings (${out.weekStart} — ${out.weekEnd})`);
