"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Activity,ArrowLeft,ArrowUpRight,BarChart3,Droplets,Gauge,Layers3} from "lucide-react";
import type {InsightsPayload} from "@/lib/insights";

export function InsightsDashboard(){
 const[data,setData]=useState<InsightsPayload|null>(null);
 useEffect(()=>{let alive=true;const load=()=>fetch("/api/insights",{cache:"no-store"}).then(r=>r.json()).then(x=>alive&&setData(x)).catch(()=>{});load();const id=setInterval(load,5000);return()=>{alive=false;clearInterval(id)}},[]);
 const cards=[
  ["Production progress",data?.scorecard.productionProgress==null?"--":`${data.scorecard.productionProgress.toFixed(1)}%`,Gauge],
  ["Feed deviation",data?.scorecard.feedDeviation==null?"--":`${data.scorecard.feedDeviation.toFixed(1)} TPH`,Activity],
  ["Moisture",data?.scorecard.moisture==null?"--":`${data.scorecard.moisture.toFixed(1)}%`,Droplets],
  ["Bin spread",data?.scorecard.binSpread==null?"--":`${data.scorecard.binSpread.toFixed(1)} pp`,Layers3]
 ] as const;

 return <main className="insights-shell editorial-insights">
  <header className="insights-top">
   <div><small>PELLET PLANT · PLANT 2 · LIVE INTELLIGENCE</small><h1>Operational <em>intelligence.</em></h1><p>Live observations distilled from historian values into an executive operating view.</p></div>
   <Link href="/"><ArrowLeft/>Dashboard</Link>
  </header>
  <section className="insight-cards">{cards.map(([l,v,I],i)=><article className="panel insight-kpi motion-card" style={{animationDelay:`${i*55}ms`}} key={l}><I/><span>{l}</span><b>{v}</b><ArrowUpRight className="insight-arrow"/></article>)}</section>
  <section className="panel insight-list"><header><div><small className="section-kicker">WHAT NEEDS ATTENTION</small><h2>Current observations</h2><p>Deterministic operational interpretation — no fabricated predictive values.</p></div><span>{data?.source?.toUpperCase()??"LOADING"}</span></header>
   <div>{!data?.items.length?<div className="insight-empty"><BarChart3/>Waiting for usable historian values…</div>:data.items.map((x,i)=><article className={`insight-row sev-${x.severity.toLowerCase()}`} style={{animationDelay:`${i*45}ms`}} key={x.id}><span className="insight-index">{String(i+1).padStart(2,"0")}</span><div><small>{x.metric}</small><h3>{x.title}</h3><p>{x.detail}</p></div><b>{x.severity}</b></article>)}</div>
  </section>
  <section className="panel forecast-placeholder"><div><small>NEXT ANALYTICS MODULE</small><h2>B–L Bin Level <em>forecasting.</em></h2><p>5 / 10 / 15 / 30 minute forecasting will live here after historical training-data validation.</p></div><span>Not enabled</span></section>
 </main>
}
