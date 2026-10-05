// SPDX-License-Identifier: AGPL-3.0-only
import modeling from '@jscad/modeling';
import serializer from '@jscad/stl-serializer';
const {primitives,booleans,transforms}=modeling;
const number=(v,fallback)=>{const n=v??fallback;if(typeof n!=='number'||!Number.isFinite(n)||n<=0||n>10000)throw Error('Dimensions must be positive finite numbers <=10000');return n;};
export function buildModel(spec,depth=0,budget={nodes:0}){
 if(depth>12||++budget.nodes>100||!spec||Array.isArray(spec)||typeof spec!=='object')throw Error('Invalid or too complex model');
 let shape;
 if(['union','subtract','intersect'].includes(spec.type)){
  if(!Array.isArray(spec.children)||spec.children.length<2||spec.children.length>20)throw Error('Boolean operation requires 2..20 children');
  const children=spec.children.map(s=>buildModel(s,depth+1,budget));shape=booleans[spec.type](...children);
 }else if(spec.type==='box'){
  const size=spec.size??[20,20,20];if(!Array.isArray(size)||size.length!==3)throw Error('size needs three dimensions');shape=primitives.cuboid({size:size.map(v=>number(v))});
 }else if(spec.type==='sphere')shape=primitives.sphere({radius:number(spec.radius,10),segments:32});
 else if(spec.type==='cylinder')shape=primitives.cylinder({radius:number(spec.radius,10),height:number(spec.height,20),segments:64});
 else throw Error('Unsupported primitive');
 if(spec.translate!==undefined){if(!Array.isArray(spec.translate)||spec.translate.length!==3||spec.translate.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>10000))throw Error('Invalid translation');shape=transforms.translate(spec.translate,shape);}
 return shape;
}
export function generate(spec){return {engine:'jscad',mime:'model/stl',filename:'iq-canvas-model.stl',content:serializer.serialize({binary:false},buildModel(spec)).join('')};}
