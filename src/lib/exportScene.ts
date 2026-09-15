import * as THREE from 'three';
import type {EffectComposer} from 'postprocessing';
import {useEditorStore} from '../store/editorStore';
import {updateCamera} from '../components/scene/CameraRig';
export type RenderContext={gl:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.PerspectiveCamera;composer:()=>EffectComposer|null;invalidate:()=>void};
let context:RenderContext|null=null;let exporting=false;
export function setRenderContext(c:RenderContext|null){context=c}
export function isExporting(){return exporting}
export {outputDimensions} from './three';
import {outputDimensions} from './three';
export async function exportScene():Promise<Blob>{
 if(!context)throw Error('The studio is still loading. Try again in a moment.');if(exporting)throw Error('An export is already in progress.');
 const {gl,scene,camera,composer,invalidate}=context;const state=useEditorStore.getState();const {width,height}=outputDimensions(state.export.ratio,state.export.resolution);if(gl.getContext().isContextLost())throw Error('The graphics context was interrupted. Reload the studio.');
 const max=gl.capabilities.maxTextureSize;if(width>max||height>max)throw Error('Choose a lower export resolution for this device.');
 const size=gl.getSize(new THREE.Vector2()),dpr=gl.getPixelRatio(),aspect=camera.aspect,bg=scene.background,alpha=gl.getClearAlpha();const comp=composer();
 exporting=true;
 try{const device=scene.getObjectByName('DeviceTransform');if(device){device.position.fromArray(state.device.position);device.rotation.set(...state.device.rotation);device.scale.setScalar(state.device.scale)}
 updateCamera(camera,state.camera);camera.aspect=width/height;camera.updateProjectionMatrix();scene.updateMatrixWorld(true);
 gl.setPixelRatio(1);gl.setSize(width,height,false);if(state.export.transparent||state.background.type==='transparent'){scene.background=null;gl.setClearAlpha(0)}
 if(comp){
  comp.setSize(width,height);comp.render(0);
  if(state.export.transparent||state.background.type==='transparent'){
   const output=document.createElement('canvas');output.width=width;output.height=height;const ctx=output.getContext('2d');if(!ctx)throw Error('Transparent export is unavailable on this browser.');
   ctx.drawImage(gl.domElement,0,0,width,height);gl.clear(true,true,true);gl.render(scene,camera);ctx.globalCompositeOperation='destination-in';ctx.drawImage(gl.domElement,0,0,width,height);
   return await new Promise<Blob>((resolve,reject)=>output.toBlob(b=>b?resolve(b):reject(Error('Export failed. Try a lower resolution.')),'image/png'));
  }
 }else gl.render(scene,camera);
 return await new Promise<Blob>((resolve,reject)=>gl.domElement.toBlob(b=>b?resolve(b):reject(Error('Export failed. Try a lower resolution.')),'image/png'));
 }finally{scene.background=bg;gl.setClearAlpha(alpha);gl.setPixelRatio(dpr);gl.setSize(size.x,size.y,false);camera.aspect=aspect;camera.updateProjectionMatrix();if(comp)comp.setSize(size.x,size.y,false);exporting=false;invalidate()}
}
