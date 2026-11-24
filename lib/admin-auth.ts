import "server-only";
import crypto from "crypto";

const COOKIE = "pp_admin_session";

export function adminCookieName(){ return COOKIE; }

function secret(){
  return process.env.PP_ADMIN_SECRET || "change-me-in-env-local";
}

export function expectedPassword(){
  return process.env.PP_ADMIN_PASSWORD || "admin";
}

export function makeToken(){
  return crypto.createHmac("sha256",secret()).update("pellet-plant-admin").digest("hex");
}

export function validToken(token:string|undefined){
  if(!token) return false;
  const expected=makeToken();
  const a=Buffer.from(token),b=Buffer.from(expected);
  return a.length===b.length && crypto.timingSafeEqual(a,b);
}
