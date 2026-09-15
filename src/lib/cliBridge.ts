import {useEditorStore,useUIStore,type BackgroundState,type CameraState,type DeviceState,type ExportState,type LightingState,type ScreenFit} from '../store/editorStore';
import {cameraPresets,lightingPresets} from './presets';
import {exportScene} from './exportScene';

type CliConfig={
 cameraPreset?:string;lightingPreset?:string;
 device?:Partial<DeviceState>;camera?:Partial<CameraState>;lighting?:Partial<LightingState>;
 background?:Partial<BackgroundState>;screenFit?:Partial<ScreenFit>;export?:Partial<ExportState>;
};
type CliBridge={version:string;presets:()=>{camera:string[];lighting:string[]};state:()=>unknown;waitUntilReady:(timeout?:number)=>Promise<void>;render:(config:CliConfig)=>Promise<string>};
declare global{interface Window{__FORM_STUDIO__?:CliBridge}}
const frame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
async function waitFor(predicate:()=>boolean,timeout=30_000){const start=performance.now();while(!predicate()){if(performance.now()-start>timeout)throw Error('Studio rendering timed out.');await new Promise(r=>setTimeout(r,25))}}
export function registerCliBridge(){
 const bridge:CliBridge={
  version:'1.1.0',
  presets:()=>({camera:Object.keys(cameraPresets),lighting:Object.keys(lightingPresets)}),
  state:()=>{const s=useEditorStore.getState();return {device:s.device,camera:s.camera,lighting:s.lighting,background:s.background,screenFit:s.screenFit,export:s.export}},
  waitUntilReady:async(timeout=30_000)=>waitFor(()=>useUIStore.getState().ready&&useUIStore.getState().screenReady,timeout),
  render:async(config)=>{
   await bridge.waitUntilReady();const s=useEditorStore.getState();s.resetScene();
   if(config.cameraPreset){const p=cameraPresets[config.cameraPreset];if(!p)throw Error(`Unknown camera preset: ${config.cameraPreset}`);s.applyCameraPreset(config.cameraPreset,p.camera,p.device)}
   if(config.lightingPreset){const p=lightingPresets[config.lightingPreset];if(!p)throw Error(`Unknown lighting preset: ${config.lightingPreset}`);s.applyLightingPreset(config.lightingPreset,p)}
   if(config.device)s.setDevice(config.device);if(config.camera)s.setCamera(config.camera);if(config.lighting)s.setLighting(config.lighting);if(config.background)s.setBackground(config.background);if(config.screenFit)s.setScreenFit(config.screenFit);if(config.export)s.setExport(config.export);
   await frame();await frame();await new Promise(r=>setTimeout(r,80));
   const blob=await exportScene();return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})
  }
 };window.__FORM_STUDIO__=bridge;return()=>{delete window.__FORM_STUDIO__}
}
