import {useRef} from 'react';
import {Sun} from 'lucide-react';
import {useEditorStore} from '../../store/editorStore';
import {lightingPresets} from '../../lib/presets';
import Slider from '../controls/Slider';
import SegmentedControl from '../controls/SegmentedControl';
import PresetCarousel from '../controls/PresetCarousel';
export default function LightingPanel(){const l=useEditorStore(s=>s.lighting),set=useEditorStore(s=>s.setLighting),last=useEditorStore(s=>s.lastLighting),apply=useEditorStore(s=>s.applyLightingPreset);const pad=useRef<HTMLDivElement>(null);
 const move=(x:number,y:number)=>{const r=pad.current!.getBoundingClientRect();const dx=(x-r.left-r.width/2)/(r.width/2),dy=(y-r.top-r.height/2)/(r.height/2);set({keyAzimuth:Math.atan2(dx,-dy)*180/Math.PI,keyElevation:Math.max(5,Math.min(85,90-Math.hypot(dx,dy)*85))})};const radius=(90-l.keyElevation)/85*43,a=l.keyAzimuth*Math.PI/180;
 return <><PresetCarousel names={Object.keys(lightingPresets)} kind="light" value={last} onChange={n=>apply(n,lightingPresets[n])}/>
 <div className="lightDirection"><div className="directionPad" ref={pad} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientX,e.clientY)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.clientX,e.clientY)}}><span className="directionAxis"/><span className="directionCenter"/><span className="lightHandle" style={{left:`${50+Math.sin(a)*radius}%`,top:`${50-Math.cos(a)*radius}%`}}><Sun size={19}/></span></div><div><strong>Key light direction</strong><p>Move the light around your phone.</p><small>{Math.round(l.keyAzimuth)}° around · {Math.round(l.keyElevation)}° high</small></div></div>
 <Slider label="Key light" value={l.keyIntensity} min={0} max={6} onChange={keyIntensity=>set({keyIntensity})}/>
 <Slider label="Fill light" value={l.fillIntensity} min={0} max={4} onChange={fillIntensity=>set({fillIntensity})}/>
 <Slider label="Rim light" value={l.rimIntensity} min={0} max={6} onChange={rimIntensity=>set({rimIntensity})}/>
 <details><summary>Direction controls</summary><Slider label="Key azimuth" value={l.keyAzimuth} min={-180} max={180} step={1} onChange={keyAzimuth=>set({keyAzimuth})}/><Slider label="Key elevation" value={l.keyElevation} min={5} max={85} step={1} onChange={keyElevation=>set({keyElevation})}/><Slider label="Rim direction" value={l.rimAzimuth} min={-180} max={180} step={1} onChange={rimAzimuth=>set({rimAzimuth})}/></details>
 <div className="sectionTitle">Reflections & atmosphere</div>
 <SegmentedControl label="Environment" value={l.environment} options={[{value:'studio',label:'Studio'},{value:'softbox',label:'Softbox'},{value:'strip',label:'Strip'}]} onChange={environment=>set({environment})}/>
 <Slider label="Environment light" value={l.environmentIntensity} min={0} max={2.5} onChange={environmentIntensity=>set({environmentIntensity})}/>
 <Slider label="Reflections" value={l.reflectionIntensity} min={0} max={2} onChange={reflectionIntensity=>set({reflectionIntensity})}/>
 <Slider label="Screen brightness" value={l.screenGlow} min={.1} max={1.5} onChange={screenGlow=>set({screenGlow})}/>
 <Slider label="Shadow opacity" value={l.shadowOpacity} min={0} max={.7} onChange={shadowOpacity=>set({shadowOpacity})} format={v=>`${Math.round(v*100)}%`}/>
 <Slider label="Shadow softness" value={l.shadowSoftness} min={.5} max={5} step={.1} onChange={shadowSoftness=>set({shadowSoftness})}/>
 </>}
