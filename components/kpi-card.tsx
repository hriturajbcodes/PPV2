"use client";
import {ReactNode,useEffect,useRef,useState} from "react";
import type {Quality} from "@/lib/types";
import {qualityClass} from "@/lib/presentation";

function AnimatedValue({value}:{value:string}){
 const match=value.match(/^(-?[\d,.]+)(.*)$/);
 const target=match?Number(match[1].replace(/,/g,"")):NaN;
 const suffix=match?.[2]??"";
 const [shown,setShown]=useState(Number.isFinite(target)?target:0);
 const previous=useRef(Number.isFinite(target)?target:0);

 useEffect(()=>{
  if(!Number.isFinite(target))return;
  const start=previous.current,end=target,started=performance.now(),duration=380;
  let raf=0;
  const tick=(now:number)=>{
   const p=Math.min(1,(now-started)/duration);
   const eased=1-Math.pow(1-p,3);
   setShown(start+(end-start)*eased);
   if(p<1)raf=requestAnimationFrame(tick);else previous.current=end;
  };
  raf=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(raf);
 },[target]);

 if(!Number.isFinite(target))return <>{value}</>;
 const decimals=match?.[1].includes(".")?(match[1].split(".")[1]?.length??0):0;
 return <>{shown.toLocaleString("en-IN",{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}{suffix}</>;
}

export function Kpi({title,value,unit,quality,children}:{title:string;value:string;unit:string;quality:Quality;children:ReactNode}){
 return <article className="panel kpi motion-card">
  <header><b>{title}</b><span className={qualityClass(quality)}>{quality}</span></header>
  <div className="value"><AnimatedValue value={value}/> <small>{unit}</small></div>
  {children}
 </article>
}
