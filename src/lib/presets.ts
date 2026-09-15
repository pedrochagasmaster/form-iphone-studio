import data from '../../shared/presets.json';
import {defaultCamera as c,defaultDevice as d,defaultLighting as l,type CameraState,type DeviceTransform,type LightingState} from '../store/editorStore';
export type CameraPreset={camera:CameraState;device:DeviceTransform};
export const cameraPresets=Object.fromEntries(Object.entries(data.camera).map(([name,p])=>[name,{camera:{...c,...p.camera},device:{position:[...d.position],rotation:[...d.rotation],scale:d.scale,...p.device}}])) as Record<string,CameraPreset>;
export const lightingPresets=Object.fromEntries(Object.entries(data.lighting).map(([name,p])=>[name,{...l,...p}])) as Record<string,LightingState>;
