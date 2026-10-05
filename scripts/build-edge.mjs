// SPDX-License-Identifier: AGPL-3.0-only
import {build} from 'esbuild';
import {mkdirSync,readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/client',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
await build({entryPoints:['src/edge.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/server/index.js',legalComments:'inline'});
const config=JSON.parse(readFileSync('.openai/hosting.json','utf8'));writeFileSync('dist/.openai/hosting.json',JSON.stringify(config,null,2));
writeFileSync('dist/server/wrangler.json',JSON.stringify({name:'iq-canvas-core',main:'index.js',compatibility_date:'2026-05-15',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true}},null,2));
// Complete corresponding source, excluding outputs, downloaded dependencies and secrets.
execFileSync('python3',['-c',`from pathlib import Path
import zipfile
with zipfile.ZipFile('dist/client/source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in Path('.').rglob('*'):
  if p.is_file() and not any(s in p.parts for s in ['node_modules','dist','.git']) and not p.name.startswith('.env') and p.name != 'source.tar.gz':
   z.write(p,Path('iq-canvas-core')/p)
`]);
console.log('Edge worker and corresponding source built.');
