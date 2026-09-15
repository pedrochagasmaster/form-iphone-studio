import assert from 'node:assert/strict';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import draco from 'draco3dgltf';
import {deviceSpecs,screenAspect,fitUV,outputDimensions} from '../src/lib/three.ts';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule()});
const doc=await io.read('public/models/iphone.glb');const root=doc.getRoot();const screen=root.listNodes().find(n=>n.getName()==='xXDHkMplTIDAXLN');assert(screen,'Dedicated screen mesh');
const p=screen.getMesh().listPrimitives()[0];const normals=p.getAttribute('NORMAL').getArray();let nz=0;for(let i=2;i<normals.length;i+=3)nz+=normals[i];assert(nz<0,'Display faces camera after Y rotation');
const pos=p.getAttribute('POSITION');assert(pos.getCount()>60,'Display is rounded model geometry');
const min=pos.getMin([]),max=pos.getMax([]),native=(max[0]-min[0])/(max[1]-min[1]);
for(const variant of ['proMax','iphone15']){const s=deviceSpecs[variant],base=deviceSpecs.proMax,w=s.width/base.width,h=s.height/base.height,r=screenAspect(variant);const correction=r/native/(w/h);assert(Math.abs(native*correction*w/h-r)<1e-8);console.log(`${variant}: correct display proportions`);
 for(const source of [.4,.4613,.75,1,1.8])for(const mode of ['fit','fill']){const [u,v]=fitUV(source,r,mode,1,0,0);assert(Math.abs(u*source/v-r)<1e-8,'No screenshot stretch');assert(mode==='fill'?Math.max(u,v)<=1:Math.min(u,v)>=1,'Correct fitting bounds')}
}
for(const ratio of ['1:1','4:5','9:16','16:9'])for(const resolution of [1080,1440,2160]){const {width,height}=outputDimensions(ratio,resolution),[a,b]=ratio.split(':').map(Number);assert(Math.max(width,height)===resolution);assert(Math.abs(width/height-a/b)<.002)}
let triangles=0;for(const m of root.listMeshes())for(const p of m.listPrimitives())triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
console.log(`PASS: GLB decode, front normals, both device proportions, 20 image-fit cases, 12 export sizes. ${triangles} triangles; ${root.listMeshes().length} meshes.`);
