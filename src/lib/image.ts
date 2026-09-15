import type {ScreenshotState} from '../store/editorStore';
export async function prepareImage(file:File):Promise<ScreenshotState>{
 if(!/^image\/(png|jpeg|webp|avif|gif|heic|heif)$/.test(file.type))throw Error('Choose a PNG, JPG, WebP, or AVIF image.');
 if(file.size>60*1024*1024)throw Error('This image is too large. Choose one smaller than 60 MB.');
 let source:ImageBitmap|HTMLImageElement;let original:string|undefined;
 try{source=await createImageBitmap(file)}catch{original=URL.createObjectURL(file);const img=new Image();img.src=original;try{await img.decode();source=img}catch{URL.revokeObjectURL(original);throw Error('This image could not be opened. Try exporting it as PNG or JPG.')}}
 try{const w=source instanceof HTMLImageElement?source.naturalWidth:source.width,h=source instanceof HTMLImageElement?source.naturalHeight:source.height;
 if(!w||!h)throw Error('This image has no readable pixels.');
 const factor=Math.min(1,2048/Math.max(w,h));const canvas=document.createElement('canvas');canvas.width=Math.round(w*factor);canvas.height=Math.round(h*factor);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing is unavailable.');ctx.drawImage(source,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not process this image.')),'image/png'));
 return{url:URL.createObjectURL(blob),name:file.name,width:canvas.width,height:canvas.height};
 }finally{if('close'in source)source.close();if(original)URL.revokeObjectURL(original)}
}
export function makePlaceholder(){
 const canvas=document.createElement('canvas');canvas.width=940;canvas.height=2030;const x=canvas.getContext('2d')!;
 x.fillStyle='#f3f0e8';x.fillRect(0,0,940,2030);
 x.fillStyle='#252e29';x.font='600 31px system-ui';x.fillText('9:41',72, 70);x.fillText('•••  ▰',755,70);
 x.font='500 27px system-ui';x.fillText('SUNDAY, SEPTEMBER 14',72,225);
 x.font='500 106px Georgia';x.fillText('A little',70,355);x.fillText('more stillness.',70,475);
 x.fillStyle='#6b7168';x.font='30px system-ui';x.fillText('Make room for a slower day.',75,548);
 const g=x.createLinearGradient(0,640,900,1600);g.addColorStop(0,'#263b32');g.addColorStop(.6,'#668575');g.addColorStop(1,'#b5b9a0');x.fillStyle=g;x.beginPath();x.roundRect(60,630,820,920,32);x.fill();
 x.save();x.beginPath();x.roundRect(60,630,820,920,32);x.clip();
 for(let i=0;i<7;i++){x.beginPath();x.ellipse(500+i*105,1230+i*25,300,710,-.7,0,Math.PI*2);x.strokeStyle=`rgba(229,235,210,${.1+i*.055})`;x.lineWidth=35;x.stroke()}x.restore();
 x.fillStyle='#f3f0e8';x.font='24px system-ui';x.fillText('THE SLOW COLLECTION',103,1438);x.font='42px Georgia';x.fillText('Find your quiet.',101,1498);
 x.fillStyle='#252e29';x.font='500 34px system-ui';x.fillText('A moment, just for you',72,1655);x.fillStyle='#74796f';x.font='28px system-ui';x.fillText('Small rituals. A different rhythm.',72,1712);
 x.fillStyle='#283c32';x.beginPath();x.roundRect(60,1790,820,100,50);x.fill();x.fillStyle='#fff';x.font='500 29px system-ui';x.textAlign='center';x.fillText('Explore the collection',470,1852);
 x.fillStyle='#303a32';x.beginPath();x.roundRect(330,1980,280,10,5);x.fill();return canvas;
}
