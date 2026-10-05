// SPDX-License-Identifier: AGPL-3.0-only
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const r=spawnSync('tar',['--exclude=node_modules','--exclude=source.tar.gz','--exclude=.git','-czf','source.tar.gz','src','scripts','tests','package.json','package-lock.json','LICENSE','LICENSES','README.md','ENGINE-MATRIX.md'],{cwd:root,stdio:'inherit'});
if(r.status!==0)process.exit(r.status||1);
