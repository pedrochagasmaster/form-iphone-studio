import {useEditorStore} from '../../store/editorStore';
import {cameraPresets} from '../../lib/presets';
import Slider from '../controls/Slider';
import PresetCarousel from '../controls/PresetCarousel';
export default function CameraPanel(){const c=useEditorStore(s=>s.camera),set=useEditorStore(s=>s.setCamera),last=useEditorStore(s=>s.lastCamera),apply=useEditorStore(s=>s.applyCameraPreset);return <>
 <PresetCarousel names={Object.keys(cameraPresets)} kind="camera" value={last} onChange={n=>apply(n,cameraPresets[n].camera,cameraPresets[n].device)}/>
 <Slider label="Field of view" value={c.fov} min={15} max={65} step={1} onChange={fov=>set({fov})} format={v=>`${v}° · ${Math.round(24/(2*Math.tan(v*Math.PI/360)))} mm`}/>
 <Slider label="Distance" value={c.distance} min={3} max={14} onChange={distance=>set({distance})}/>
 <Slider label="Elevation" value={c.positionY} min={-3} max={3} onChange={positionY=>set({positionY})}/>
 <Slider label="Horizontal offset" value={c.positionX} min={-3} max={3} onChange={positionX=>set({positionX})}/>
 <Slider label="Camera roll" value={c.roll} min={-.8} max={.8} onChange={roll=>set({roll})} format={v=>`${Math.round(v*180/Math.PI)}°`}/>
 <div className="sectionTitle">Depth of field</div>
 <Slider label="Bokeh strength" value={c.depthOfField} min={0} max={4} step={.1} onChange={depthOfField=>set({depthOfField})} format={v=>v===0?'Off':v.toFixed(1)}/>
 <Slider label="Focus distance" value={c.focusDistance} min={2} max={15} onChange={focusDistance=>set({focusDistance})}/>
 <Slider label="Focus range" value={c.aperture} min={.01} max={.1} step={.001} onChange={aperture=>set({aperture})} format={v=>v.toFixed(3)}/>
 <button className="secondaryButton full" onClick={()=>set({focusDistance:Math.hypot(c.positionX,c.positionY,c.distance)})}>Focus on device</button>
 </>}
