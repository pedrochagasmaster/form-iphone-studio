import {Smartphone,Move3D,Camera,Sun,Layers} from 'lucide-react';
import {useUIStore,type Panel} from '../../store/editorStore';
import styles from './Editor.module.css';
const panels:{id:Panel;name:string;icon:typeof Smartphone}[]=[{id:'device',name:'Device',icon:Smartphone},{id:'transform',name:'Transform',icon:Move3D},{id:'camera',name:'Camera',icon:Camera},{id:'lighting',name:'Light',icon:Sun},{id:'background',name:'Background',icon:Layers}];
export default function EditorToolbar(){const active=useUIStore(s=>s.activePanel),set=useUIStore(s=>s.setPanel);return <nav className={styles.toolbar} aria-label="Studio controls">{panels.map(({id,name,icon:Icon})=><button key={id} onClick={()=>set(id)} aria-expanded={active===id} aria-controls="editor-panel" className={active===id?styles.activeTool:''}><Icon size={22} strokeWidth={1.6}/><span>{name}</span></button>)}</nav>}
