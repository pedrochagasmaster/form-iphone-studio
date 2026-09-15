import {useEditorStore} from '../../store/editorStore';
import Slider from '../controls/Slider';
import SegmentedControl from '../controls/SegmentedControl';
import ColorControl from '../controls/ColorControl';
import Toggle from '../controls/Toggle';
export default function BackgroundPanel(){const b=useEditorStore(s=>s.background),set=useEditorStore(s=>s.setBackground);return <>
 <SegmentedControl label="Background" value={b.type} options={[{value:'solid',label:'Solid'},{value:'gradient',label:'Gradient'},{value:'transparent',label:'Clear'}]} onChange={type=>{set({type});useEditorStore.getState().setExport({transparent:type==='transparent'})}}/>
 {b.type!=='transparent'&&<><div className="backgroundSwatches">{['#eae8e2','#fcfcfc','#202124','#b9c5d0','#e2c9b5','#a2b2a5','#c4bdd4','#dfa180'].map(color=><button key={color} aria-label={`Set background ${color}`} aria-pressed={b.colorA===color} style={{background:color}} onClick={()=>set({colorA:color})}/>)}</div><ColorControl label={b.type==='gradient'?'First color':'Custom color'} value={b.colorA} onChange={colorA=>set({colorA})}/></>}
 {b.type==='gradient'&&<><ColorControl label="Second color" value={b.colorB} onChange={colorB=>set({colorB})}/><Slider label="Gradient angle" min={0} max={360} step={1} value={b.gradientAngle} onChange={gradientAngle=>set({gradientAngle})} format={v=>`${v}°`}/></>}
 <Toggle label="Ground shadow" value={b.ground} onChange={ground=>set({ground})}/>
 </>}
