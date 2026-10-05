// SPDX-License-Identifier: AGPL-3.0-only
import {generate} from './model.mjs';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='GET'&&url.pathname==='/')return json({name:'IQ Canvas Core',version:'0.2.0',license:'AGPL-3.0-only',source:'/source.zip',engines:['jscad'],endpoint:'/v1/generate'});
  if(request.method==='GET'&&url.pathname==='/source.zip')return env.ASSETS.fetch(new Request(new URL('/source.zip',url),request));
  if(request.method!=='POST'||url.pathname!=='/v1/generate')return json({error:'Not found'},404);
  const expected=env.IQ_CORE_TOKEN;
  if(!expected||expected.length<24)return json({error:'Service not configured'},503);
  // Hash both strings before comparison; no arbitrary user code is executed.
  const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
  const [a,b]=await Promise.all([digest(request.headers.get('Authorization')||''),digest('Bearer '+expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  if(diff)return json({error:'Unauthorized'},401);
  try{
   const reader=request.body?.getReader();if(!reader)return json({error:'Missing body'},400);let bytes=0,parts=[];
   while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>20000){await reader.cancel();return json({error:'Request too large'},413);}parts.push(r.value);}
   const raw=new Uint8Array(bytes);let offset=0;for(const p of parts){raw.set(p,offset);offset+=p.length;}const data=JSON.parse(new TextDecoder().decode(raw));
   if(data.engine!=='jscad')return json({error:'Engine unavailable'},400);
   const result=generate(data.model);if(result.content.length>3000000)return json({error:'Result too large'},413);return json(result);
  }catch(e){return json({error:String(e.message||'Invalid model')},400);}
 }
};
