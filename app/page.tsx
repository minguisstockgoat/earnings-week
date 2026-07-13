"use client";
import {useEffect,useMemo,useState} from "react";
import usData from "./us-earnings.json";
import japanData from "./japan-earnings.json";

type UsItem={date:string;company:string;ticker:string;session:"장전"|"장후"|"미정";eps:string;marketCap:string;marketCapValue:number;quarter:string};
type JapanItem={date:string;weekday:string;company:string;code:string;sector:string;previousDate:string;previousSurprise:number|null;featured:boolean};
type CalendarItem={id:string;date:string;country:"미국"|"일본";company:string;code:string;time:string;detail:string;marketCapValue:number;featured:boolean};
const us=usData.items as UsItem[];
const jp=japanData.rows as JapanItem[];
const DAY=86400000;
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fromIso=(s:string)=>new Date(`${s}T12:00:00`);
const addDays=(s:string,n:number)=>{const d=fromIso(s);d.setDate(d.getDate()+n);return iso(d)};
const short=(s:string)=>`${Number(s.slice(5,7))}/${Number(s.slice(8,10))}`;
const weekdays=["월","화","수","목","금","토","일"];
const usItems:CalendarItem[]=us.map(x=>({id:`US-${x.date}-${x.ticker}`,date:x.date,country:"미국",company:x.company,code:x.ticker,time:x.session,detail:`EPS ${x.eps}`,marketCapValue:x.marketCapValue,featured:false}));
const jpItems:CalendarItem[]=jp.map(x=>({id:`JP-${x.date}-${x.code}`,date:x.date,country:"일본",company:x.company,code:x.code,time:"시간 미정",detail:x.sector,marketCapValue:0,featured:x.featured}));
const all=[...usItems,...jpItems];
const rangeStart=usData.rangeStart;
const rangeEnd=[usData.rangeEnd,...jp.map(x=>x.date)].sort().at(-1)!;
const firstMonday=(()=>{const d=fromIso(rangeStart),day=d.getDay();d.setDate(d.getDate()-(day===0?6:day-1));return iso(d)})();
const weekCount=Math.max(1,Math.ceil((fromIso(rangeEnd).getTime()-fromIso(firstMonday).getTime()+DAY)/(7*DAY)));

export default function Home(){
 const [theme,setTheme]=useState<"light"|"dark">("light");
 const [week,setWeek]=useState(0),[market,setMarket]=useState<"전체"|"미국"|"일본">("전체"),[query,setQuery]=useState("");
 useEffect(()=>{
  const saved=window.localStorage.getItem("earnings-theme");
  if(saved==="dark") setTheme("dark");
 },[]);
 useEffect(()=>{
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  window.localStorage.setItem("earnings-theme",theme);
 },[theme]);
 const start=addDays(firstMonday,week*7),end=addDays(start,6);
 const dates=Array.from({length:7},(_,i)=>addDays(start,i));
 const weekItems=useMemo(()=>{const q=query.trim().toLowerCase();return all.filter(x=>x.date>=start&&x.date<=end&&(market==="전체"||x.country===market)&&(!q||`${x.company} ${x.code}`.toLowerCase().includes(q)))},[start,end,market,query]);
 const primaryIds=new Set<string>();
 for(const date of dates){
  weekItems.filter(x=>x.date===date&&x.country==="미국").sort((a,b)=>b.marketCapValue-a.marketCapValue).slice(0,4).forEach(x=>primaryIds.add(x.id));
  weekItems.filter(x=>x.date===date&&x.country==="일본"&&x.featured).forEach(x=>primaryIds.add(x.id));
 }
 const secondary=weekItems.filter(x=>!primaryIds.has(x.id));
 const updated=new Intl.DateTimeFormat("ko-KR",{month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Seoul"}).format(new Date(usData.updatedAt));
 return <main>
  <header className="header"><div><h1>실적 발표 캘린더</h1><p>미국 · 일본</p></div><div className="header-meta"><span>데이터 기준 {updated}</span><div className="header-actions"><a href="https://github.com/minguisstockgoat/earnings-week/actions/workflows/refresh-data.yml" target="_blank" rel="noreferrer">데이터 갱신</a><button className="theme-toggle" type="button" onClick={()=>setTheme(x=>x==="light"?"dark":"light")} aria-label={`${theme==="light"?"다크":"라이트"} 테마로 전환`} aria-pressed={theme==="dark"}>{theme==="light"?"다크 모드":"라이트 모드"}</button></div></div></header>
  <section className="controls" aria-label="캘린더 조작"><button onClick={()=>setWeek(x=>Math.max(0,x-1))} disabled={week===0}>← 이전 주</button><div className="week-title"><strong>{short(start)} – {short(end)}</strong><span>{weekItems.length.toLocaleString()}개 일정</span></div><button onClick={()=>setWeek(x=>Math.min(weekCount-1,x+1))} disabled={week>=weekCount-1}>다음 주 →</button></section>
  <section className="filter-row"><div className="segments">{(["전체","미국","일본"] as const).map(x=><button key={x} className={market===x?"selected":""} onClick={()=>setMarket(x)}>{x}</button>)}</div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="기업명 또는 종목코드 검색" aria-label="기업 검색"/></section>
  <section className="calendar" aria-label={`${short(start)}부터 ${short(end)}까지 주요 일정`}>{dates.map((date,i)=>{const primary=weekItems.filter(x=>x.date===date&&primaryIds.has(x.id));return <article className="day" key={date}><div className="day-head"><b>{weekdays[i]}</b><span>{short(date)}</span></div><div className="primary-list">{primary.map(x=><div className={`primary-item ${x.country==="일본"?"jp":""}`} key={x.id}><div className="item-top"><span className="country">{x.country}</span><code>{x.code}</code></div><strong>{x.company}</strong><div className="item-bottom"><span>{x.time}</span><span>{x.detail}</span></div></div>)}{primary.length===0&&<p className="empty">주요 일정 없음</p>}</div></article>})}</section>
  <section className="other-section"><div className="section-title"><h2>기타 실적 예정 기업</h2><span>상단 주요 기업을 제외한 {secondary.length.toLocaleString()}개</span></div><div className="other-days">{dates.map((date,i)=>{const list=secondary.filter(x=>x.date===date).sort((a,b)=>a.country.localeCompare(b.country)||b.marketCapValue-a.marketCapValue||a.company.localeCompare(b.company));return <details key={date} open={i===0&&list.length>0}><summary><span><b>{weekdays[i]}</b> {short(date)}</span><em>{list.length.toLocaleString()}개</em></summary><div className="table-head"><span>시장</span><span>기업</span><span>코드</span><span>발표</span><span>정보</span></div>{list.map(x=><div className="list-row" key={x.id}><span className={`market-tag ${x.country==="일본"?"jp":""}`}>{x.country}</span><strong>{x.company}</strong><code>{x.code}</code><span>{x.time}</span><span>{x.detail}</span></div>)}{list.length===0&&<p className="no-list">예정 기업 없음</p>}</details>})}</div></section>
  <footer><span>미국: Nasdaq Earnings Calendar</span><span>일본: 일본실적일정_20260713.xlsx</span><span>일정은 변경될 수 있습니다.</span></footer>
 </main>
}
