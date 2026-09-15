import {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {useGLTF} from '@react-three/drei';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useEditorStore,useUIStore} from '../../store/editorStore';
import {deviceSpecs,screenAspect} from '../../lib/three';
import {configureScreen,useScreenTexture} from './ScreenMaterial';
export default function IPhoneModel(){
 const {scene}=useGLTF('/models/iphone.glb','/draco/');const group=useRef<THREE.Group>(null);const invalidate=useThree(s=>s.invalidate);const variant=useEditorStore(s=>s.device.variant);const finish=useEditorStore(s=>s.device.finish);const lighting=useEditorStore(s=>s.lighting);const {texture,transform}=useScreenTexture();
 const model=useMemo(()=>{const copy=scene.clone(true);copy.rotation.y=Math.PI;copy.scale.setScalar(18.2);
 copy.traverse(obj=>{if(!(obj instanceof THREE.Mesh))return;obj.castShadow=true;obj.receiveShadow=false;const old=obj.material as THREE.MeshStandardMaterial;
 if(obj.name==='xXDHkMplTIDAXLN'){
 obj.geometry=obj.geometry.clone();obj.geometry.computeBoundingBox();const box=obj.geometry.boundingBox!;const pos=obj.geometry.attributes.position;const uv=new Float32Array(pos.count*2);for(let i=0;i<pos.count;i++){uv[i*2]=1-(pos.getX(i)-box.min.x)/(box.max.x-box.min.x);uv[i*2+1]=(pos.getY(i)-box.min.y)/(box.max.y-box.min.y)}obj.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 obj.material=new THREE.MeshPhysicalMaterial({emissive:'#ffffff',emissiveIntensity:.65,roughness:.3,metalness:0,clearcoat:1,clearcoatRoughness:.16,toneMapped:false});configureScreen(obj.material as THREE.MeshPhysicalMaterial,transform);obj.name='Display';obj.renderOrder=1;
 }else{const m=new THREE.MeshPhysicalMaterial();m.color.copy(old.color);m.map=old.map;m.normalMap=old.normalMap;m.metalness=Math.min(1,old.metalness);m.roughness=Math.max(.18,old.roughness);m.clearcoat=.35;m.envMapIntensity=.8;
 if(['ttmRoLdJipiIOmf','buRWvyqhBBgcJFo','GuYJryuYunhpphO','MrMmlCAsAxJpYqQ_0'].includes(obj.name)){m.map=null;m.metalness=.95;m.roughness=.26;obj.userData.finish=true}
 if(['vELORlCJixqPHsZ','usFLmqcyrnltBUr','EbQGKrWAqhBHiMv','NtjcIgolNGgYlCg'].includes(obj.name)){m.roughness=.13;m.clearcoat=1;m.ior=1.5;m.transmission=.15;m.thickness=.01}
 obj.material=m;
 }
 });return copy},[scene,transform]);
 useLayoutEffect(()=>{const display=model.getObjectByName('Display') as THREE.Mesh;const material=display.material as THREE.MeshPhysicalMaterial;material.map=texture;material.emissiveMap=texture;material.needsUpdate=true;invalidate()},[model,texture,invalidate]);
 useEffect(()=>{const spec=deviceSpecs[variant??'proMax'],base=deviceSpecs.proMax;const sx=spec.width/base.width,sy=spec.height/base.height,sz=spec.depth/base.depth;model.scale.set(18.2*sx,18.2*sy,18.2*sz);model.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const m=o.material as THREE.MeshPhysicalMaterial;if(o.userData.finish)m.color.set(finish);m.envMapIntensity=lighting.reflectionIntensity;if(o.name==='Display'){const box=o.geometry.boundingBox!;const nativeAspect=(box.max.x-box.min.x)/(box.max.y-box.min.y);o.scale.x=.01*screenAspect(variant??'proMax')/nativeAspect/(sx/sy);m.emissiveIntensity=lighting.screenGlow}});invalidate()},[model,variant,finish,lighting,transform,invalidate]);
 useEffect(()=>{useUIStore.getState().setReady(true);return()=>{model.traverse(o=>{if(o instanceof THREE.Mesh){(o.material as THREE.Material).dispose();if(o.name==='Display')o.geometry.dispose()}})}},[model]);
 useFrame((_,dt)=>{if(!group.current)return;const d=useEditorStore.getState().device;const g=group.current;let moving=false;for(let i=0;i<3;i++){const axis=(['x','y','z'] as const)[i];g.position[axis]=THREE.MathUtils.damp(g.position[axis],d.position[i],16,Math.min(dt,.05));g.rotation[axis]=THREE.MathUtils.damp(g.rotation[axis],d.rotation[i],16,Math.min(dt,.05));if(Math.abs(g.position[axis]-d.position[i])>.0001||Math.abs(g.rotation[axis]-d.rotation[i])>.0001)moving=true}g.scale.setScalar(THREE.MathUtils.damp(g.scale.x,d.scale,16,Math.min(dt,.05)));if(Math.abs(g.scale.x-d.scale)>.0001)moving=true;if(moving)invalidate()});
 const initial=useEditorStore.getState().device;
 return <group name="DeviceTransform" ref={group} position={initial.position} rotation={initial.rotation} scale={initial.scale}><primitive object={model}/></group>
}
useGLTF.preload('/models/iphone.glb','/draco/');
