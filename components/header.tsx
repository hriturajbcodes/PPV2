"use client";
import Image from "next/image";
import Link from "next/link";
import {Bell,Expand,LockKeyhole,Printer,Sun,Moon} from "lucide-react";
import {useEffect,useState} from "react";
import type { DashboardSnapshot } from "@/lib/types";

export function Header({data,paused,onPause,sound,onSound,alarmCount,onAlarms}:{data:DashboardSnapshot|null;paused:boolean;onPause:(v:boolean)=>void;sound:boolean;onSound:()=>void;alarmCount:number;onAlarms:()=>void}){
 const fs=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
 const state=data?.state??"STANDBY"; const latency=data?.latencyMs??0;
 const [light,setLight]=useState(false);

 useEffect(()=>{
   const saved=window.localStorage.getItem("pp-theme");
   const next=saved==="light";
   setLight(next);
   document.documentElement.dataset.theme=next?"light":"dark";
 },[]);

 const toggleTheme=()=>{
   const next=!light;
   setLight(next);
   document.documentElement.dataset.theme=next?"light":"dark";
   window.localStorage.setItem("pp-theme",next?"light":"dark");
 };

 return <header className="topbar">
   <div><div className="title brand-title"><span>Pellet Plant</span><em>KPI Dashboard.</em></div><div className="sub">PELLET PLANT - PLANT 2 <b className={`state-${state.toLowerCase()}`}>{state} <i>({latency}ms)</i></b></div></div>
   <div className="actions">
     <button className={alarmCount?"alarm-button":""} onClick={onAlarms} title="Active alarms"><Bell/>{alarmCount>0&&<span>{alarmCount}</span>}</button>
     <button onClick={()=>window.print()} title="Print dashboard"><Printer/></button>
     <button className="round" onClick={toggleTheme} title={light?"Switch to dark theme":"Switch to light theme"}>{light?<Moon/>:<Sun/>}</button>
     <button onClick={fs} title="Toggle fullscreen"><Expand/></button>
     <Link className="admin-lock" href="/admin" title="Admin"><LockKeyhole/></Link>
     <Link className="insights-button" href="/insights">
       Insights <span aria-hidden="true"></span>
     </Link>
     <em/>
     <div className="logo"><Image src="/jspl_logo.png" alt="Jindal Steel" width={120} height={46} priority className="jspl-logo-image"/></div>
     <div className="innovation"><strong>Innovation for Excellence ©2026</strong><span>Designed and developed by</span><b>Digital Transformation &amp; Automation</b></div>
     
   </div>
 </header>
}




