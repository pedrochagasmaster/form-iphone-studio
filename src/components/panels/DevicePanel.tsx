import {ImagePlus,Trash2} from 'lucide-react';
import {useEditorStore} from '../../store/editorStore';
import Slider from '../controls/Slider';
import SegmentedControl from '../controls/SegmentedControl';
export default function DevicePanel(){const s=useEditorStore();return <>
 <SegmentedControl label="Device size" value={s.device.variant??'proMax'} options={[{value:'iphone15',label:'iPhone 15 · 6.1″'},{value:'proMax',label:'15 Pro Max · 6.7″'}]} onChange={variant=>s.setDevice({variant})}/>
 <p className="hint">Size and screen proportions follow Apple’s specifications. Both use the Pro camera housing.</p>
 <div className="controlGroup"><span className="controlLabel">Titanium finish</span><div className="swatches">{[{color:'#96928a',name:'Natural'},{color:'#30343c',name:'Black'},{color:'#c6c8ca',name:'White'},{color:'#4c566e',name:'Blue'}].map(f=><button key={f.name} aria-label={`${f.name} titanium`} aria-pressed={s.device.finish===f.color} onClick={()=>s.setDevice({finish:f.color})}><span style={{background:f.color}}/>{f.name}</button>)}</div></div>
 <div className="sectionTitle"><span>Screen</span><span>{s.screenshot?'Your image':'Sample design'}</span></div>
 <button className="secondaryButton full" onClick={()=>document.getElementById('screenshot-upload')?.click()}><ImagePlus size={18}/>{s.screenshot?'Replace screenshot':'Upload screenshot'}</button>
 {s.screenshot&&<div className="fileInfo"><span>{s.screenshot.name}</span><button aria-label="Remove screenshot" onClick={()=>s.setScreenshot(null)}><Trash2 size={18}/></button></div>}
 <SegmentedControl label="Image fitting" value={s.screenFit.mode} options={[{value:'fill',label:'Fill screen'},{value:'fit',label:'Fit image'}]} onChange={mode=>s.setScreenFit({mode})}/>
 <Slider label="Zoom" value={s.screenFit.zoom} min={1} max={3} onChange={zoom=>s.setScreenFit({zoom})} format={v=>`${v.toFixed(2)}×`}/>
 <p className="hint">Zoom in to reposition an image that already fills the screen.</p>
 <Slider label="Position X" value={s.screenFit.x} min={-1} max={1} onChange={x=>s.setScreenFit({x})}/>
 <Slider label="Position Y" value={s.screenFit.y} min={-1} max={1} onChange={y=>s.setScreenFit({y})}/>
 <a className="creditLink" href="/model-license.txt" target="_blank" rel="noreferrer">3D model by polyman · CC BY 4.0</a>
 </>}
