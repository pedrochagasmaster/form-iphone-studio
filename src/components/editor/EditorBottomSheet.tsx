import {lazy,Suspense,useEffect,useRef} from 'react';
import {AnimatePresence,motion,useDragControls,useReducedMotion} from 'framer-motion';
import {ChevronUp,ChevronDown,X} from 'lucide-react';
import {useUIStore} from '../../store/editorStore';
import styles from './Editor.module.css';
const Device=lazy(()=>import('../panels/DevicePanel')),Transform=lazy(()=>import('../panels/TransformPanel')),Camera=lazy(()=>import('../panels/CameraPanel')),Light=lazy(()=>import('../panels/LightingPanel')),Background=lazy(()=>import('../panels/BackgroundPanel')),Export=lazy(()=>import('../panels/ExportPanel'));
const panels={device:Device,transform:Transform,camera:Camera,lighting:Light,background:Background,export:Export};
const titles={device:'Device & screen',transform:'Transform',camera:'Camera',lighting:'Lighting',background:'Background',export:'Export image'};
export default function EditorBottomSheet(){const panel=useUIStore(s=>s.activePanel),sheet=useUIStore(s=>s.sheet),set=useUIStore(s=>s.setSheet),close=useUIStore(s=>s.setPanel);const drag=useDragControls();const reduced=useReducedMotion();const title=useRef<HTMLHeadingElement>(null);const Content=panel?panels[panel]:null;
 useEffect(()=>{if(panel)title.current?.focus({preventScroll:true})},[panel]);
 return <AnimatePresence>{panel&&<motion.section id="editor-panel" key="sheet" className={styles.sheet} role="region" aria-labelledby="panel-title" onKeyDown={e=>{if(e.key==='Escape')close(null)}} initial={{y:'100%'}} animate={{y:0,height:sheet==='expanded'?'76dvh':sheet==='medium'?'46dvh':'100px'}} exit={{y:'100%'}} transition={reduced?{duration:0}:{type:'spring',stiffness:360,damping:38}} drag="y" dragListener={false} dragControls={drag} dragConstraints={{top:0,bottom:0}} dragElastic={.12} onDragEnd={(_,info)=>{if(info.offset.y< -35)set(sheet==='collapsed'?'medium':'expanded');if(info.offset.y>35){if(sheet==='collapsed')close(null);else set(sheet==='expanded'?'medium':'collapsed')}}}>
 <div className={styles.sheetHandle} onPointerDown={e=>drag.start(e)}><span/></div>
 <header className={styles.sheetHeader}><h2 id="panel-title" tabIndex={-1} ref={title}>{titles[panel]}</h2><div><button aria-label={sheet==='expanded'?'Reduce panel':'Expand panel'} onClick={()=>set(sheet==='expanded'?'medium':'expanded')}>{sheet==='expanded'?<ChevronDown size={19}/>:<ChevronUp size={19}/>}</button><button aria-label="Close panel" onClick={()=>close(null)}><X size={19}/></button></div></header>
 <div className={styles.sheetContent}><Suspense fallback={<p className="hint">Loading controls…</p>}>{Content&&<Content/>}</Suspense></div>
 </motion.section>}</AnimatePresence>}
