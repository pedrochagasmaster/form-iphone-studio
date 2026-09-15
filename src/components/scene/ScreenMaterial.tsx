import {useEffect,useLayoutEffect,useMemo,useState} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useEditorStore,useUIStore} from '../../store/editorStore';
import {screenAspect,fitUV} from '../../lib/three';
import {makePlaceholder} from '../../lib/image';
import {createScreenTexture} from '../../lib/screenMaterial';
export {configureScreen} from '../../lib/screenMaterial';

export function useScreenTexture(){
 const variant=useEditorStore(s=>s.device.variant);
 const screenshot=useEditorStore(s=>s.screenshot);
 const fit=useEditorStore(s=>s.screenFit);
 const invalidate=useThree(s=>s.invalidate);
 const [texture,setTexture]=useState(()=>createScreenTexture(makePlaceholder()));
 // Dimensions cannot change after a Three.js texture has been uploaded. Each
 // decoded image gets an independent Source and GPU allocation.
 useEffect(()=>()=>texture.dispose(),[texture]);
 useEffect(()=>{
  let cancelled=false;
  if(!screenshot){setTexture(createScreenTexture(makePlaceholder()));useUIStore.getState().setScreenReady(true);return}
  const img=new Image();
  img.onload=()=>{if(!cancelled){setTexture(createScreenTexture(img));useUIStore.getState().setScreenReady(true)}};
  img.onerror=()=>{if(!cancelled)useUIStore.getState().notify('The screen texture could not be loaded. Try another image.')};
  img.src=screenshot.url;
  return()=>{cancelled=true;img.onload=null;img.onerror=null};
 },[screenshot]);
 const sourceAspect=texture.image.width/texture.image.height;
 const uv=fitUV(sourceAspect,screenAspect(variant??'proMax'),fit.mode,fit.zoom,fit.x,fit.y);
 // The compiled shader holds this exact Vector4. Mutate its value instead of
 // replacing onBeforeCompile closures, which a cached program does not rerun.
 const transform=useMemo(()=>new THREE.Vector4(1,1,0,0),[]);
 useLayoutEffect(()=>{transform.set(...uv);invalidate()},[transform,uv[0],uv[1],uv[2],uv[3],texture,invalidate]);
 return {texture,transform};
}
