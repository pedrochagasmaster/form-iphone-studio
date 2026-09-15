import * as THREE from 'three';
export function configureScreen(material:THREE.MeshPhysicalMaterial,transform:THREE.Vector4){
 material.onBeforeCompile=shader=>{shader.uniforms.screenTransform={value:transform};shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 screenUV;').replace('#include <uv_vertex>','#include <uv_vertex>\nscreenUV = uv;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 screenUV; uniform vec4 screenTransform;').replace('#include <map_fragment>',`vec2 st = screenUV * screenTransform.xy + screenTransform.zw;
 vec4 screenPixel = texture2D(map, clamp(st, 0.0, 1.0));
 float inside = step(0.0,st.x)*step(st.x,1.0)*step(0.0,st.y)*step(st.y,1.0);
 diffuseColor *= vec4(mix(vec3(0.015), screenPixel.rgb, inside), 1.0);`).replace('#include <emissivemap_fragment>','totalEmissiveRadiance *= mix(vec3(0.015), screenPixel.rgb, inside);').replace('#include <opaque_fragment>',`outgoingLight = totalEmissiveRadiance / 0.65 + (reflectedLight.directSpecular + reflectedLight.indirectSpecular) * 0.15;
#ifdef USE_CLEARCOAT
 outgoingLight += (clearcoatSpecularDirect + clearcoatSpecularIndirect) * 0.35;
#endif
#include <opaque_fragment>`);};
 material.customProgramCacheKey=()=> 'form-screen-v1';material.needsUpdate=true;
}

export function createScreenTexture(image:HTMLImageElement|HTMLCanvasElement){
 const texture=new THREE.Texture(image);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.magFilter=THREE.LinearFilter;
 texture.needsUpdate=true;
 return texture;
}
