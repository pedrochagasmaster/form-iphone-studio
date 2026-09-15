import {SoftShadows} from '@react-three/drei';
import {useEditorStore} from '../../store/editorStore';
export function polar(azimuth:number,elevation:number,radius=6):[number,number,number]{const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;return[Math.sin(a)*Math.cos(e)*radius,Math.sin(e)*radius,Math.cos(a)*Math.cos(e)*radius]}
export default function LightingRig(){const l=useEditorStore(s=>s.lighting);return <>
 <SoftShadows size={l.shadowSoftness*7} samples={6} focus={0}/>
 <directionalLight position={polar(l.keyAzimuth,l.keyElevation)} color={l.temperature} intensity={l.keyIntensity} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={.1} shadow-camera-far={20} shadow-bias={-.0003} shadow-normalBias={.015}/>
 <rectAreaLight position={[-4,1,3]} rotation={[0,-.7,0]} width={4} height={5} intensity={l.fillIntensity} color="#e8efff"/>
 <directionalLight position={polar(l.rimAzimuth,35)} intensity={l.rimIntensity} color="#ffffff"/>
 </>}
