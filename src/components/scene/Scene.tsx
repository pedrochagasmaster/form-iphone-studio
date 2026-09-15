import {useEffect,useMemo,useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {EffectComposer,DepthOfField} from '@react-three/postprocessing';
import type {EffectComposer as Composer} from 'postprocessing';
import * as THREE from 'three';
import {useEditorStore} from '../../store/editorStore';
import {setRenderContext} from '../../lib/exportScene';
import IPhoneModel from './IPhoneModel';
import CameraRig from './CameraRig';
import LightingRig from './LightingRig';
import Environment from './Environment';
import ShadowPlane from './ShadowPlane';
export default function Scene(){const {gl,scene,camera,invalidate}=useThree();const background=useEditorStore(s=>s.background);const transparent=useEditorStore(s=>s.export.transparent);const c=useEditorStore(s=>s.camera);const composer=useRef<Composer>(null);
 const bg=useMemo(()=>{if(transparent||background.type==='transparent')return null;if(background.type==='solid')return new THREE.Color(background.colorA);const el=document.createElement('canvas');el.width=1024;el.height=1024;const ctx=el.getContext('2d')!;const a=background.gradientAngle*Math.PI/180;const g=ctx.createLinearGradient(512-Math.sin(a)*724,512+Math.cos(a)*724,512+Math.sin(a)*724,512-Math.cos(a)*724);g.addColorStop(0,background.colorA);g.addColorStop(1,background.colorB);ctx.fillStyle=g;ctx.fillRect(0,0,1024,1024);const t=new THREE.CanvasTexture(el);t.colorSpace=THREE.SRGBColorSpace;return t},[background,transparent]);
 useEffect(()=>{scene.background=bg;gl.setClearAlpha(bg?1:0);invalidate();return()=>{if(bg instanceof THREE.Texture)bg.dispose()}},[bg,scene,gl,invalidate]);
 useEffect(()=>useEditorStore.subscribe(()=>invalidate()),[invalidate]);
 useEffect(()=>{setRenderContext({gl,scene,camera:camera as THREE.PerspectiveCamera,composer:()=>composer.current,invalidate});return()=>setRenderContext(null)},[gl,scene,camera,invalidate]);
 return <><CameraRig/><Environment/><LightingRig/><IPhoneModel/><ShadowPlane/>{c.depthOfField>0&&<EffectComposer ref={composer} multisampling={0}><DepthOfField target={[c.targetX,c.targetY,c.distance-c.focusDistance]} focalLength={c.aperture} bokehScale={c.depthOfField} height={480}/></EffectComposer>}</>
}
