import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';
import * as THREE from 'three';
import {useEditorStore,type CameraState} from '../../store/editorStore';
export function updateCamera(camera:THREE.PerspectiveCamera,c:CameraState){camera.fov=c.fov;camera.position.set(c.positionX,c.positionY,c.distance);camera.up.set(0,1,0);camera.lookAt(c.targetX,c.targetY,0);camera.rotateZ(c.roll);camera.updateProjectionMatrix();camera.updateMatrixWorld()}
export default function CameraRig(){const camera=useThree(s=>s.camera) as THREE.PerspectiveCamera;const invalidate=useThree(s=>s.invalidate);const c=useEditorStore(s=>s.camera);useEffect(()=>{updateCamera(camera,c);invalidate()},[c,camera,invalidate]);return null}
