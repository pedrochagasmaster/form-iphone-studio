import {useGesture} from '@use-gesture/react';
import {useEditorStore} from '../store/editorStore';
export const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export function useDeviceGestures(){return useGesture({
 onDrag:({delta:[dx,dy],touches,pinching,event})=>{if(pinching||touches>1)return;event.preventDefault();const d=useEditorStore.getState().device;useEditorStore.getState().setDevice({rotation:[clamp(d.rotation[0]+dy*.007,-Math.PI,Math.PI),d.rotation[1]+dx*.007,d.rotation[2]]})},
 onPinch:({first,memo,offset:[scale,angle],origin:[x,y],event})=>{event.preventDefault();const s=useEditorStore.getState();if(first)memo={origin:[x,y],position:[...s.device.position],roll:s.device.rotation[2],angle};s.setDevice({scale:clamp(scale,.35,2),position:[clamp(memo.position[0]+(x-memo.origin[0])*.008,-2,2),clamp(memo.position[1]-(y-memo.origin[1])*.008,-2,2),memo.position[2]],rotation:[s.device.rotation[0],s.device.rotation[1],memo.roll-(angle-memo.angle)*Math.PI/180]});return memo}
 },{drag:{filterTaps:true},pinch:{scaleBounds:{min:.35,max:2},from:()=>[useEditorStore.getState().device.scale,0]},eventOptions:{passive:false}})}
