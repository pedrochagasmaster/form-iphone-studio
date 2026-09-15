import {useEditorStore,type Vec3} from '../../store/editorStore';
import Slider from '../controls/Slider';
const deg=(v:number)=>`${Math.round(v*180/Math.PI)}°`;
export default function TransformPanel(){const d=useEditorStore(s=>s.device),set=useEditorStore(s=>s.setDevice);const axis=(kind:'rotation'|'position',index:number,v:number)=>{const next=[...d[kind]] as Vec3;next[index]=v;set({[kind]:next})};return <>
 <p className="hint">Drag to rotate. Use two fingers to move, pinch, and roll.</p>
 <Slider label="Scale" value={d.scale} min={.35} max={2} onChange={scale=>set({scale})} format={v=>`${v.toFixed(2)}×`}/>
 {['Tilt','Turn','Roll'].map((name,i)=><Slider key={name} label={name} value={d.rotation[i]} min={-Math.PI} max={Math.PI} onChange={v=>axis('rotation',i,v)} format={deg}/>)}
 {['Horizontal position','Vertical position'].map((name,i)=><Slider key={name} label={name} value={d.position[i]} min={-2} max={2} onChange={v=>axis('position',i,v)}/>)}
 <button className="secondaryButton full" onClick={()=>set({position:[0,0,0]})}>Center device</button>
 </>}
