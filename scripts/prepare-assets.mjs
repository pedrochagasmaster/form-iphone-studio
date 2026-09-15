import {createHash} from 'node:crypto';
import {copyFile,mkdir,readFile,rename,rm,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const model={url:'https://raw.githubusercontent.com/adrianhajdin/iphone/main/public/models/scene.glb',path:join(root,'public/models/iphone.glb'),sha256:'a628339ba9960424b1e6285d31423be0dedf02a71b02e4e61f706a2e4bb8770e'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function ensureModel(){
 if(existsSync(model.path)&&hash(await readFile(model.path))===model.sha256)return;
 const response=await fetch(model.url);if(!response.ok)throw Error(`Model download failed: ${response.status} ${response.statusText}`);const bytes=Buffer.from(await response.arrayBuffer());if(hash(bytes)!==model.sha256)throw Error('Downloaded model checksum does not match the pinned asset.');
 await mkdir(dirname(model.path),{recursive:true});const temp=`${model.path}.tmp-${process.pid}`;try{await writeFile(temp,bytes);await rename(temp,model.path)}catch(error){await rm(temp,{force:true});throw error}
}
async function ensureDraco(){const source=join(root,'node_modules/three/examples/jsm/libs/draco/gltf'),target=join(root,'public/draco');await mkdir(target,{recursive:true});for(const name of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])await copyFile(join(source,name),join(target,name))}
await Promise.all([ensureModel(),ensureDraco()]);
console.log('Prepared pinned iPhone model and local Draco decoders.');
