import {Component,Suspense,type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import * as THREE from 'three';
import {useProgress} from '@react-three/drei';
import {useUIStore} from '../../store/editorStore';
import Scene from '../scene/Scene';
import styles from './Editor.module.css';
class Boundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true}}render(){return this.state.error?<div className={styles.canvasError}><strong>The 3D studio couldn’t start.</strong><p>Check your connection and enable WebGL in your browser.</p><button onClick={()=>location.reload()}>Reload studio</button></div>:this.props.children}}
function Progress(){const {progress}=useProgress();const ready=useUIStore(s=>s.ready);return !ready?<div className={styles.loading}><span className={styles.spinner}/><span>Preparing your studio</span><small>{Math.round(progress)}%</small></div>:null}
export default function EditorCanvas(){return <Boundary><Canvas shadows frameloop="demand" dpr={[1,2]} camera={{fov:35,position:[0,.25,6],near:.05,far:100}} gl={{antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1;gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();useUIStore.getState().notify('Graphics were interrupted. Reload the studio to continue.');useUIStore.getState().setReady(false)})}} fallback={<div className={styles.canvasError}>WebGL is unavailable. Try Safari or Chrome with graphics acceleration enabled.</div>}><Suspense fallback={null}><Scene/></Suspense></Canvas><Progress/></Boundary>}
