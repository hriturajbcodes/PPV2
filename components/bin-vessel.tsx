export function Bin({name,value,state}:{name:string;value:number|null;state:string}){
 const h=value===null?0:Math.max(0,Math.min(100,value));
 const label=state==="starving"?"Starving":state==="low"?"Low":state==="overfeed"?"Overfeed":state==="normal"?"Normal":"Stale / Offline";
 return <div className={`bin bin-${state}`} tabIndex={0} aria-label={`Bin ${name}: ${value===null?"no data":`${value.toFixed(1)} percent`}, ${label}`}>
  <b>{name}</b>
  <div className="vessel">
   <span className="vessel-zone zone-overfeed"/><span className="vessel-zone zone-normal"/><span className="vessel-zone zone-low"/><span className="vessel-zone zone-starving"/>
   <i className="t80"/><i className="t25"/><i className="t15"/>
   {value!==null&&<span className={`fill fill-${state}`} style={{height:`${h}%`}}><span className="fill-surface"/></span>}
   <span className="bin-tooltip"><b>BIN {name}</b><strong>{value===null?"No data":`${value.toFixed(1)}%`}</strong><em>{label}</em></span>
  </div>
  <strong className="bin-value">{value===null?"--":value.toFixed(1)}%</strong>
  <small>BIN {name}</small>
  <span className={`state-dot state-dot-${state}`}/>
 </div>
}
