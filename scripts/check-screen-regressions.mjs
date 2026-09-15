import assert from 'node:assert/strict';
import {MeshPhysicalMaterial,ShaderLib,Vector4,SRGBColorSpace} from 'three';
import {createScreenTexture,configureScreen} from '../src/lib/screenMaterial.ts';
import {fitUV,screenAspect} from '../src/lib/three.ts';

// Exercise real Three.js Source identity for the sample, the supplied screenshot
// dimensions, and a larger second upload. No existing GPU source is resized.
const images=[{width:940,height:2030},{width:708,height:1536},{width:1179,height:2556}];
const textures=images.map(createScreenTexture);
assert.equal(new Set(textures.map(t=>t.uuid)).size,3);
assert.equal(new Set(textures.map(t=>t.source.uuid)).size,3);
textures.forEach((t,i)=>{assert.equal(t.image,images[i]);assert.equal(t.colorSpace,SRGBColorSpace);assert(t.version>0)});
assert.equal(textures[0].image.width,940,'Replacing an upload cannot modify the sample allocation');

// Simulate a compiled, cached material. Slider edits must reach its original
// uniform object without recompiling or re-running onBeforeCompile.
const vector=new Vector4(1,1,0,0),material=new MeshPhysicalMaterial();
configureScreen(material,vector);
const shader={uniforms:{},vertexShader:ShaderLib.physical.vertexShader,fragmentShader:ShaderLib.physical.fragmentShader};
material.onBeforeCompile(shader,{});
const compiled=shader.uniforms.screenTransform.value,version=material.version;
for(const variant of ['proMax','iphone15']){
 const aspect=screenAspect(variant);
 const base=fitUV(708/1536,aspect,'fill',1,0,0);vector.set(...base);
 assert(compiled.equals(vector));
 const zoom=fitUV(708/1536,aspect,'fill',2,0,0);vector.set(...zoom);
 assert.equal(compiled.x,base[0]/2);assert.equal(compiled.y,base[1]/2);
 const moved=fitUV(708/1536,aspect,'fill',2,1,-1);vector.set(...moved);
 assert.notEqual(compiled.z,zoom[2]);assert.notEqual(compiled.w,zoom[3]);
 vector.set(...fitUV(708/1536,aspect,'fit',1,0,0));assert(compiled.equals(vector));
}
assert.equal(material.version,version,'Slider edits do not require shader recompilation');
assert(shader.fragmentShader.includes('screenUV * screenTransform.xy + screenTransform.zw'));
textures.forEach(t=>t.dispose());material.dispose();
console.log('PASS: fresh GPU source per upload; compiled uniform receives zoom, X, Y and Fit/Fill changes on both devices.');
