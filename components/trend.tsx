"use client";

import {memo,useCallback,useEffect,useMemo,useState} from "react";
import {Crosshair,Maximize2,Minimize2,ChevronLeft,ChevronRight,Minus,PictureInPicture2,Plus,RotateCcw,ZoomIn,X} from "lucide-react";
import {
 CartesianGrid,Line,LineChart,ReferenceArea,ReferenceLine,ResponsiveContainer,
 Tooltip,XAxis,YAxis
} from "recharts";
import type {TrendMetric,TrendPoint,TrendRange} from "@/lib/trends";

type Payload={metric:TrendMetric;range:TrendRange;source:string;from:string;to:string;points:TrendPoint[]};
type ChartPoint=TrendPoint&{label:string;index:number};

function istLabel(iso:string,range:TrendRange){
 const d=new Date(iso);
 return new Intl.DateTimeFormat("en-IN",{
  timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",
  second:range==="live"?"2-digit":undefined,
  ...(range==="custom"?{day:"2-digit",month:"short"}:{})
 }).format(d);
}
function localInput(d:Date){
 const pad=(n:number)=>String(n).padStart(2,"0");
 return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


const FastTrendGraph=memo(function FastTrendGraph({
 chart,moisture,prodDomain,dragStart,dragEnd,pinned,onMouseDown,onMouseMove,onMouseUp,onClick
}:{
 chart:ChartPoint[];
 moisture:boolean;
 prodDomain:[number,number];
 dragStart:number|null;
 dragEnd:number|null;
 pinned:ChartPoint|null;
 onMouseDown:(s:any)=>void;
 onMouseMove:(s:any)=>void;
 onMouseUp:()=>void;
 onClick:(s:any)=>void;
}){
 return <ResponsiveContainer width="100%" height="100%" debounce={40}>
  <LineChart data={chart} margin={{top:10,right:14,left:0,bottom:4}}
   onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onClick={onClick}>
   {moisture&&<>
    <ReferenceArea y1={0} y2={10} fill="#063b2d" fillOpacity={.18} ifOverflow="extendDomain"/>
    <ReferenceArea y1={10} y2={11.5} fill="#3b2f09" fillOpacity={.15} ifOverflow="extendDomain"/>
    <ReferenceArea y1={11.5} y2={15} fill="#4a1618" fillOpacity={.15} ifOverflow="extendDomain"/>
    <ReferenceLine y={10} stroke="#70808e" strokeDasharray="4 5"/>
    <ReferenceLine y={11.5} stroke="#70808e" strokeDasharray="4 5"/>
   </>}
   {dragStart!==null&&dragEnd!==null&&<ReferenceArea
    x1={chart[Math.min(dragStart,dragEnd)]?.label}
    x2={chart[Math.max(dragStart,dragEnd)]?.label}
    fill="#2389e8" fillOpacity={.10} stroke="#2389e8"
   />}
   {pinned&&chart.some(x=>x.timestamp===pinned.timestamp)&&
    <ReferenceLine x={pinned.label} stroke="#fff" strokeOpacity={.45} strokeDasharray="3 3"/>
   }
   <CartesianGrid vertical={false} stroke="#172029" strokeDasharray="2 4"/>
   <XAxis dataKey="label" interval="preserveStartEnd" tick={{fill:"#7893b1",fontSize:9}}
    axisLine={false} tickLine={false} minTickGap={38} height={22}/>
   <YAxis domain={moisture?[0,15]:prodDomain} ticks={moisture?[0,3.8,7.5,11.3,15]:undefined}
    tick={{fill:"#8ca0b6",fontSize:9}} axisLine={false} tickLine={false} width={42}/>
   <Tooltip
    isAnimationActive={false}
    contentStyle={{background:"#0b0d0f",border:"1px solid #29313a",color:"#fff",fontSize:10,borderRadius:6}}
    labelStyle={{color:"#91abc6"}}
    formatter={(v:any)=>[v==null?"No data":Number(v).toFixed(moisture?2:0),moisture?"Moisture %":"Production MT"]}
   />
   <Line type="linear" dataKey="value" stroke="#2d8cff" strokeWidth={2}
    dot={chart.length<=12?{r:2,fill:"#2d8cff",strokeWidth:0}:false}
    activeDot={{r:4,fill:"#fff",stroke:"#2d8cff",strokeWidth:2}}
    connectNulls={false} isAnimationActive={false}/>
  </LineChart>
 </ResponsiveContainer>
});

export function Trend(){
 const[metric,setMetric]=useState<TrendMetric>("moisture");
 const[range,setRange]=useState<TrendRange>("daily");
 const[points,setPoints]=useState<TrendPoint[]>([]);
 const[loading,setLoading]=useState(true),[error,setError]=useState("");
 const[customOpen,setCustomOpen]=useState(false);
 const[from,setFrom]=useState(()=>localInput(new Date(Date.now()-8*3600_000)));
 const[to,setTo]=useState(()=>localInput(new Date()));
 const[zoom,setZoom]=useState<{left:number;right:number}|null>(null);
 const[dragStart,setDragStart]=useState<number|null>(null),[dragEnd,setDragEnd]=useState<number|null>(null);
 const[pinned,setPinned]=useState<ChartPoint|null>(null);
 const[popout,setPopout]=useState(false),[expanded,setExpanded]=useState(false);
 const[windowSize,setWindowSize]=useState<number|null>(null);

 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   let url=`/api/trends?metric=${metric}&range=${range}`;
   if(range==="custom"){
    const f=new Date(from),t=new Date(to);
    if(Number.isNaN(f.getTime())||Number.isNaN(t.getTime())||f>=t)throw new Error("Choose a valid custom time range.");
    url+=`&from=${encodeURIComponent(f.toISOString())}&to=${encodeURIComponent(t.toISOString())}`;
   }
   const r=await fetch(url,{cache:"no-store"});const body=await r.json();
   if(!r.ok)throw new Error(body.error??"Trend request failed");
   setPoints(Array.isArray((body as Payload).points)?(body as Payload).points:[]);
  }catch(e){setError(e instanceof Error?e.message:"Trend request failed");setPoints([])}
  finally{setLoading(false)}
 },[metric,range,from,to]);

 useEffect(()=>{
  setZoom(null);setPinned(null);setDragStart(null);setDragEnd(null);load();
  if(range!=="live")return;
  const id=window.setInterval(load,3000);return()=>window.clearInterval(id);
 },[load,range,metric]);

 useEffect(()=>{
  if(!popout)return;
  const esc=(e:KeyboardEvent)=>{if(e.key==="Escape"){setPopout(false);setExpanded(false)}};
  window.addEventListener("keydown",esc);return()=>window.removeEventListener("keydown",esc);
 },[popout]);

 const full=useMemo<ChartPoint[]>(()=>points.map((p,index)=>({...p,index,label:istLabel(p.timestamp,range)})),[points,range]);
 const chart=useMemo(()=>{
  if(zoom)return full.slice(zoom.left,zoom.right+1);
  if(windowSize&&full.length>windowSize)return full.slice(full.length-windowSize);
  return full;
 },[full,zoom,windowSize]);
 const moisture=metric==="moisture";
 const valid=chart.filter(x=>x.value!==null).map(x=>x.value as number);
 const prodDomain:[number,number]=valid.length
   ? [Math.max(0,Math.floor(Math.min(...valid)*.97)),Math.max(1,Math.ceil(Math.max(...valid)*1.03))]
   : [0,16000];

 const setVisibleWindow=(size:number)=>{
  const next=Math.max(3,Math.min(full.length||3,size));
  setZoom(null);setWindowSize(next);
 };
 const zoomIn=()=>setVisibleWindow(Math.max(3,Math.floor(chart.length*.7)));
 const zoomOut=()=>setVisibleWindow(Math.min(full.length,Math.ceil(chart.length*1.4)));
 const pan=(direction:-1|1)=>{
  if(!full.length)return;
  const current=zoom??{left:Math.max(0,full.length-chart.length),right:full.length-1};
  const width=current.right-current.left+1;
  const step=Math.max(1,Math.floor(width*.2))*direction;
  let left=current.left+step,right=current.right+step;
  if(left<0){right-=left;left=0}
  if(right>=full.length){left-=right-full.length+1;right=full.length-1}
  setWindowSize(null);setZoom({left:Math.max(0,left),right:Math.min(full.length-1,right)});
 };
 const wheelZoom=(e:React.WheelEvent<HTMLDivElement>)=>{
  if(full.length<4)return;
  e.preventDefault();
  if(e.deltaY<0)zoomIn();else zoomOut();
 };
 const finishZoom=()=>{
  if(dragStart===null||dragEnd===null){setDragStart(null);setDragEnd(null);return}
  const a=Math.min(dragStart,dragEnd),b=Math.max(dragStart,dragEnd);
  if(b-a>=2){const offset=zoom?.left??0;setZoom({left:offset+a,right:offset+b})}
  setDragStart(null);setDragEnd(null);
 };
 const reset=()=>{setZoom(null);setWindowSize(null);setPinned(null);setDragStart(null);setDragEnd(null)};

 const graph=<>
   {chart.length>0&&<FastTrendGraph
    chart={chart}
    moisture={moisture}
    prodDomain={prodDomain}
    dragStart={dragStart}
    dragEnd={dragEnd}
    pinned={pinned}
    onMouseDown={(s:any)=>{if(s?.activeTooltipIndex!=null)setDragStart(s.activeTooltipIndex)}}
    onMouseMove={(s:any)=>{if(dragStart!==null&&s?.activeTooltipIndex!=null)setDragEnd(s.activeTooltipIndex)}}
    onMouseUp={finishZoom}
    onClick={(s:any)=>{if(dragStart===null&&s?.activePayload?.[0]?.payload)setPinned(s.activePayload[0].payload as ChartPoint)}}
   />}
   {(loading||error||(!loading&&!chart.length))&&<div className="chart-state">
    <strong>{loading?"Loading historian data…":error?"Trend unavailable":"No historian data in this range"}</strong>
    {!loading&&<span>{error||`No ${metric} readings were returned for ${range} mode.`}</span>}
    {!loading&&<button onClick={load}>Retry query</button>}
   </div>}
 </>

 const toolbar=<>
  <div className="toolbar">
   <div><button className={moisture?"on":""} onClick={()=>setMetric("moisture")}>Moisture Trend</button><button className={!moisture?"on":""} onClick={()=>setMetric("production")}>Production Trend</button></div>
   <div><button className={range==="live"?"on":""} onClick={()=>{setRange("live");setCustomOpen(false)}}>Live</button><button className={range==="daily"?"on":""} onClick={()=>{setRange("daily");setCustomOpen(false)}}>Daily</button><button className={range==="custom"?"on":""} onClick={()=>{setRange("custom");setCustomOpen(true)}}>Custom</button></div>
  </div>
  {customOpen&&<div className="custom-range"><label>From <input type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To <input type="datetime-local" value={to} onChange={e=>setTo(e.target.value)}/></label><button onClick={load}>Apply</button></div>}
  <div className="chart-tools">
   <span><ZoomIn/> Drag to zoom</span><span><Crosshair/> Click to pin</span>
   <span className="trend-count">{valid.length} points</span>
   <button onClick={()=>pan(-1)} disabled={full.length<=chart.length} title="Pan left"><ChevronLeft/></button>
   <button onClick={zoomIn} disabled={chart.length<=3} title="Zoom in / stretch"><Plus/> Stretch</button>
   <button onClick={zoomOut} disabled={chart.length>=full.length} title="Zoom out / compress"><Minus/> Compress</button>
   <button onClick={()=>pan(1)} disabled={full.length<=chart.length} title="Pan right"><ChevronRight/></button>
   <button onClick={reset} disabled={!zoom&&!windowSize&&!pinned}><RotateCcw/> Reset</button>
   {!popout&&<button onClick={()=>setPopout(true)} title="Pop out chart"><PictureInPicture2/> Pop out</button>}
  </div>
 </>;

 return <>
  <section className="panel trend">
   {toolbar}
   <div className="chart interactive-chart" tabIndex={0} onWheel={wheelZoom}
 onKeyDown={e=>{if(e.key==="+"){zoomIn()}else if(e.key==="-"){zoomOut()}else if(e.key==="ArrowLeft"){pan(-1)}else if(e.key==="ArrowRight"){pan(1)}else if(e.key==="Escape"){reset()}}}>
 {graph}
</div>
   <div className="trend-bottom"><footer>All timestamps rendered in IST (Asia/Kolkata). Historian gaps are not interpolated.</footer>{pinned&&<div className="pinned-point"><b>PINNED</b><span>{istLabel(pinned.timestamp,range)}</span><strong>{pinned.value==null?"No data":`${pinned.value.toFixed(moisture?2:0)} ${moisture?"%":"MT"}`}</strong></div>}</div>
  </section>

  {popout&&<div className="chart-popout-backdrop">
   <section className={`chart-popout panel ${expanded?"expanded":""}`}>
    <header><div><small>PELLET PLANT · TREND VIEW</small><h2>{moisture?"Moisture":"Production"} Trend</h2></div><div><button onClick={()=>setExpanded(v=>!v)} title={expanded?"Restore":"Maximize"}>{expanded?<Minimize2/>:<Maximize2/>}</button><button onClick={()=>{setPopout(false);setExpanded(false)}} title="Close"><X/></button></div></header>
    {toolbar}
    <div className="popout-chart" tabIndex={0} onWheel={wheelZoom}>{graph}</div>
    <footer>IST (Asia/Kolkata) · {valid.length} historian points · Esc closes this view</footer>
   </section>
  </div>}
 </>;
}