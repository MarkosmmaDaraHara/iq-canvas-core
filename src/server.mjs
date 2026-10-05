// SPDX-License-Identifier: AGPL-3.0-only
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {timingSafeEqual} from 'node:crypto';
import {Worker} from 'node:worker_threads';
const token=process.env.IQ_CORE_TOKEN;if(!token||token.length<24)throw Error('Set IQ_CORE_TOKEN to at least 24 characters');
const source=readFileSync(new URL('../source.tar.gz',import.meta.url));
const equal=(s)=>{const a=Buffer.from(s||''),b=Buffer.from('Bearer '+token);return a.length===b.length&&timingSafeEqual(a,b);};
let active=0;
export const server=http.createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 if(req.method==='GET'&&req.url==='/source'){res.writeHead(200,{'Content-Type':'application/gzip','Content-Disposition':'attachment; filename="iq-canvas-core-source.tar.gz"'});res.end(source);return;}
 if(req.method==='GET'&&req.url==='/'){send(200,{name:'IQ Canvas Core',license:'AGPL-3.0-only',source:'/source',engines:['jscad']});return;}
 if(req.method!=='POST'||req.url!=='/v1/generate'){send(404,{error:'Not found'});return;}
 if(!equal(req.headers.authorization)){send(401,{error:'Unauthorized'});return;}
 if(active>=2){send(429,{error:'Busy'});return;}active++;
 try{let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>20000)throw Error('Request too large');}const d=JSON.parse(raw);if(d.engine!=='jscad')throw Error('Engine unavailable');
 const value=await new Promise((resolve,reject)=>{const w=new Worker(new URL('./worker.mjs',import.meta.url),{workerData:d.model,resourceLimits:{maxOldGenerationSizeMb:128}});const timer=setTimeout(()=>{void w.terminate();reject(Error('Generation timeout'));},10000);w.once('message',m=>{clearTimeout(timer);void w.terminate();m.error?reject(Error(m.error)):resolve(m.result);});w.once('error',e=>{clearTimeout(timer);reject(e);});w.once('exit',()=>{clearTimeout(timer);reject(Error('Worker exited'));});});send(200,value);
 }catch(e){send(400,{error:e.message});}finally{active--;}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.listen(Number(process.env.PORT||8789),process.env.IQ_CORE_HOST||'127.0.0.1');
