// SPDX-License-Identifier: AGPL-3.0-only
import {test} from 'node:test';import assert from 'node:assert/strict';
import {generate,buildModel} from '../src/model.mjs';
test('JSCAD produces an STL with a cylindrical through hole',()=>{const r=generate({type:'subtract',children:[{type:'box',size:[30,30,10]},{type:'cylinder',height:12,radius:4}]});assert.equal(r.mime,'model/stl');assert.match(r.content,/facet normal/);assert.match(r.content,/endsolid/);});
test('reject executable code and invalid parameters',()=>{for(const spec of [{type:'javascript',code:'process.exit()'},{type:'box',size:[1,-2,3]},{type:'sphere',radius:Infinity},{type:'union',children:[]}])assert.throws(()=>buildModel(spec));});
test('reject excessively nested and broad models',()=>{let s={type:'box'};for(let i=0;i<14;i++)s={type:'union',children:[s,{type:'box'}]};assert.throws(()=>buildModel(s));});
