"use client";
export default function ErrorPage({error,reset}:{error:Error;reset:()=>void}){return <main className="fatal"><div><small>PELLET PLANT DASHBOARD</small><h1>Application error</h1><p>{error.message||"An unexpected application error occurred."}</p><button onClick={reset}>Retry</button></div></main>}
