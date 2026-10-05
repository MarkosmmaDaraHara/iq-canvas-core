// SPDX-License-Identifier: AGPL-3.0-only
import {parentPort,workerData} from 'node:worker_threads';
import {generate} from './model.mjs';
try{parentPort.postMessage({result:generate(workerData)});}catch(e){parentPort.postMessage({error:e.message});}
