import {useEffect,useState} from 'react';
import {Download,Share2,Check} from 'lucide-react';
import {useEditorStore,useUIStore} from '../../store/editorStore';
import {exportScene,outputDimensions} from '../../lib/exportScene';
import SegmentedControl from '../controls/SegmentedControl';
import Toggle from '../controls/Toggle';
export default function ExportPanel(){const e=useEditorStore(s=>s.export),set=useEditorStore(s=>s.setExport),busy=useUIStore(s=>s.busy),ready=useUIStore(s=>s.ready);const [result,setResult]=useState<{blob:Blob;url:string}|null>(null);const size=outputDimensions(e.ratio,e.resolution);
 useEffect(()=>()=>{if(result)URL.revokeObjectURL(result.url)},[result]);
 async function render(){useUIStore.getState().setBusy(true);try{const blob=await exportScene();setResult({blob,url:URL.createObjectURL(blob)})}catch(err){useUIStore.getState().notify(err instanceof Error?err.message:'Export failed. Try again.')}finally{useUIStore.getState().setBusy(false)}}
 async function share(){if(!result)return;const file=new File([result.blob],'form-mockup.png',{type:'image/png'});try{if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'iPhone mockup'});else useUIStore.getState().notify('Use Save PNG to download this image on your browser.')}catch(err){if((err as Error).name!=='AbortError')useUIStore.getState().notify('Sharing failed. Use Save PNG instead.')}}
 return <><SegmentedControl label="Aspect ratio" value={e.ratio} options={(['1:1','4:5','9:16','16:9'] as const).map(value=>({value,label:value}))} onChange={ratio=>{set({ratio});setResult(null)}}/>
 <SegmentedControl label="Resolution · longest edge" value={e.resolution} options={([1080,1440,2160] as const).map(value=>({value,label:`${value}`}))} onChange={resolution=>{set({resolution});setResult(null)}}/>
 <Toggle label="Transparent background" value={e.transparent} onChange={transparent=>{set({transparent});if(!transparent&&useEditorStore.getState().background.type==='transparent')useEditorStore.getState().setBackground({type:'solid'});setResult(null)}}/>
 <div className="exportInfo"><span>PNG · {size.width} × {size.height} px</span><span>Full quality</span></div>
 <button className="primaryButton full" disabled={busy||!ready} onClick={render}><Download size={18}/>{busy?'Rendering…':'Create image'}</button>
 {result&&<div className="exportResult"><span><Check size={16}/> Your image is ready</span><div><a className="primaryButton" href={result.url} download="form-mockup.png">Save PNG</a><button className="secondaryButton" onClick={share}><Share2 size={17}/> Share</button></div><img src={result.url} alt="Exported iPhone mockup"/></div>}
 <p className="hint">The preview uses your selected aspect ratio. Transparent PNGs include the ground shadow when enabled.</p>
 </>}
