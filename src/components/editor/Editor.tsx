import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ImagePlus,RotateCcw,Check,X,MoveUpRight,Camera,Sun} from 'lucide-react';
import {useEditorStore,useUIStore} from '../../store/editorStore';
import {registerCliBridge} from '../../lib/cliBridge';
import {useDeviceGestures} from '../../lib/gestures';
import {prepareImage} from '../../lib/image';
import EditorCanvas from './EditorCanvas';
import EditorToolbar from './EditorToolbar';
import EditorBottomSheet from './EditorBottomSheet';
import styles from './Editor.module.css';
export default function Editor(){const screenshot=useEditorStore(s=>s.screenshot),ratio=useEditorStore(s=>s.export.ratio),variant=useEditorStore(s=>s.device.variant),lastCamera=useEditorStore(s=>s.lastCamera),lastLight=useEditorStore(s=>s.lastLighting);const background=useEditorStore(s=>s.background);const clear=useEditorStore(s=>s.export.transparent);const active=useUIStore(s=>s.activePanel),message=useUIStore(s=>s.message),setPanel=useUIStore(s=>s.setPanel);const [uploading,setUploading]=useState(false);const [resetConfirm,setResetConfirm]=useState(false);const stage=useRef<HTMLDivElement>(null);const [dimensions,setDimensions]=useState({width:340,height:425});const bind=useDeviceGestures();const uploadSequence=useRef(0);
 useEffect(()=>{const el=stage.current;if(!el)return;const observer=new ResizeObserver(([entry])=>{const [a,b]=ratio.split(':').map(Number),r=a/b;const width=Math.min(entry.contentRect.width-32,(entry.contentRect.height-40)*r);setDimensions({width:Math.max(1,width),height:Math.max(1,width/r)})});observer.observe(el);return()=>observer.disconnect()},[ratio]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>useUIStore.getState().notify(''),6500);return()=>clearTimeout(timer)},[message]);
 useEffect(()=>{if(!resetConfirm)return;const timer=setTimeout(()=>setResetConfirm(false),4500);return()=>clearTimeout(timer)},[resetConfirm]);
 async function upload(file?:File){if(!file)return;const request=++uploadSequence.current;setUploading(true);useUIStore.getState().setScreenReady(false);try{const img=await prepareImage(file);if(request!==uploadSequence.current){URL.revokeObjectURL(img.url);return}useEditorStore.getState().setScreenshot(img);useUIStore.getState().notify('Screenshot added. Your composition is unchanged.')}catch(err){useUIStore.getState().setScreenReady(true);useUIStore.getState().notify(err instanceof Error?err.message:'This image could not be opened.')}finally{if(request===uploadSequence.current)setUploading(false)}}
 useEffect(()=>registerCliBridge(),[]);
 const bg=clear||background.type==='transparent'?'#e8e8e5':background.colorA;
 return <main className={styles.editor} style={{'--stage-color':bg} as React.CSSProperties}>
 <header className={styles.topbar}><div className={styles.brand}><span className={styles.brandMark}>f</span><span>form<span className={styles.brandDot}>.</span></span><span className={styles.studioLabel}>STUDIO</span></div><div className={styles.topActions}><button className={styles.reset} aria-label={resetConfirm?'Confirm reset':'Reset scene'} title="Reset scene" onClick={()=>{if(resetConfirm){useEditorStore.getState().resetScene();setResetConfirm(false);useUIStore.getState().notify('Studio composition reset.')}else setResetConfirm(true)}}>{resetConfirm?<Check size={18}/>:<RotateCcw size={18}/>} {resetConfirm&&<span>Reset?</span>}</button><button className={styles.exportButton} onClick={()=>setPanel('export')}>Export<ArrowUpRight size={17}/></button></div></header>
 <div className={styles.sceneMeta}><span>{variant==='iphone15'?'iPhone 15':'iPhone 15 Pro Max'}</span><button onClick={()=>setPanel('export')}>{ratio}<span>PNG</span></button></div>
 <div className={styles.stage} ref={stage}>
 <div className={`${styles.canvasFrame} ${clear||background.type==='transparent'?styles.checker:''}`} style={dimensions} {...bind()} role="img" aria-label="Interactive 3D iPhone composition. Drag to rotate; use two fingers to move and scale. All adjustments are also available in the toolbar."><EditorCanvas/><span className={`${styles.crop} ${styles.cropTL}`}/><span className={`${styles.crop} ${styles.cropTR}`}/><span className={`${styles.crop} ${styles.cropBL}`}/><span className={`${styles.crop} ${styles.cropBR}`}/></div>
 </div>
 <div className={styles.bottomDock} aria-hidden={active!==null} inert={active!==null}>
 <div className={styles.gestureHint}><MoveUpRight size={13}/><span>Drag to rotate</span><i/><span>Pinch to scale</span></div>
 <div className={styles.quickSettings}><button onClick={()=>setPanel('camera')}><Camera size={15}/>{lastCamera}<span>⌄</span></button><button onClick={()=>setPanel('lighting')}><Sun size={15}/>{lastLight}<span>⌄</span></button></div>
 <button className={styles.uploadButton} onClick={()=>document.getElementById('screenshot-upload')?.click()} disabled={uploading}><ImagePlus size={19} strokeWidth={1.7}/>{uploading?'Preparing image…':screenshot?'Replace screenshot':'Add your screenshot'}<span>+</span></button>
 <p className={styles.localNote}>{screenshot?'Image stays on this device':'PNG, JPG, WebP · Your image stays on this device'}</p>
 </div>
 <input id="screenshot-upload" className="srOnly" type="file" accept="image/*" aria-label="Upload screenshot" onChange={e=>{upload(e.target.files?.[0]);e.target.value=''}}/>
 <EditorBottomSheet/><EditorToolbar/>
 {message&&<div className={styles.toast} role="status"><span>{message}</span><button aria-label="Dismiss message" onClick={()=>useUIStore.getState().notify('')}><X size={16}/></button></div>}
 </main>
}
