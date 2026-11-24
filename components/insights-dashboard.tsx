"use client";
import Link from "next/link";import {useEffect,useState} from "react";import {Activity,ArrowLeft,BarChart3,Droplets,Gauge,Layers3} from "lucide-react";import type {InsightsPayload} from "@/lib/insights";
export function InsightsDashboard(){
 const[data,setData]=useState<InsightsPayload|null>(null);
 useEffect(()=>{let alive=true;const load=()=>fetch("/api/insights",{cache:"no-store"}).then(r=>r.json()).then(x=>alive&&setData(x));load();const id=setInterval(load,5000);return()=>{alive=false;clearInterval(id)}},[]);
 const cards=[
 ["Production progress",data?.scorecard.productionProgress==null?"--":`${data.scorecard.productionProgress.toFixed(1)}%`,Gauge],
 ["Feed deviation",data?.scorecard.feedDeviation==null?"--":`${data.scorecard.feedDeviation.toFixed(1)} TPH`,Activity],
 ["Moisture",data?.scorecard.moisture==null?"--":`${data.scorecard.moisture.toFixed(1)}%`,Droplets],
 ["Bin spread",data?.scorecard.binSpread==null?"--":`${data.scorecard.binSpread.toFixed(1)} pp`,Layers3]
 ] as const;
 return <main className="insights-shell"><header className="insights-top"><div><small>PELLET PLANT · PLANT 2</small><h1>Operational Insights</h1><p>Deterministic observations derived from current historian values.</p></div><Link href="/"><ArrowLeft/>Dashboard</Link></header>
 <section className="insight-cards">{cards.map(([l,v,I])=><article className="panel insight-kpi" key={l}><I/><span>{l}</span><b>{v}</b></article>)}</section>
 <section className="panel insight-list"><header><div><h2>Current observations</h2><p>No predictive/AI values are fabricated in this phase.</p></div><span>{data?.source?.toUpperCase()??"LOADING"}</span></header>
 <div>{!data?.items.length?<div className="insight-empty"><BarChart3/>Waiting for usable historian values…</div>:data.items.map(x=><article className={`insight-row sev-${x.severity.toLowerCase()}`} key={x.id}><i/><div><small>{x.metric}</small><h3>{x.title}</h3><p>{x.detail}</p></div><b>{x.severity}</b></article>)}</div></section>
 <section className="panel forecast-placeholder"><div><small>NEXT ANALYTICS MODULE</small><h2>B–L Bin Level Forecasting</h2><p>5 / 10 / 15 / 30 minute forecasting will be implemented here after historical training-data validation.</p></div><span>Not enabled</span></section></main>
}
