#!/usr/bin/env node
import {createServer} from 'node:http';
import {readFile,stat,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {extname,resolve,dirname,basename,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {spawn} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const defaults={
 cameraPreset:'Three Quarter',lightingPreset:'Soft Studio',
 device:{variant:'proMax',finish:'#96928a',position:[0,0.06,0],rotation:[-0.10,-0.36,-0.075],scale:1},
 camera:{fov:35,distance:6,positionX:0,positionY:0.25,targetX:0,targetY:0,roll:0,focusDistance:6,aperture:0.025,depthOfField:0},
 lighting:{keyIntensity:2.2,keyAzimuth:45,keyElevation:50,fillIntensity:0.8,rimIntensity:1.1,rimAzimuth:150,environmentIntensity:0.9,shadowOpacity:0.2,shadowSoftness:3,reflectionIntensity:0.7,screenGlow:0.65,temperature:'#fffaf2',environment:'studio'},
 background:{type:'solid',colorA:'#eae8e2',colorB:'#a7b2c2',gradientAngle:135,ground:true},
 screenFit:{mode:'fill',x:0,y:0,zoom:1},export:{ratio:'4:5',resolution:1440,transparent:false}
};
const optionSpec={
 output:{type:'string',short:'o'},config:{type:'string'},browser:{type:'string'},timeout:{type:'string',default:'30000'},build:{type:'boolean',default:true},json:{type:'boolean'},'dry-run':{type:'boolean'},
 device:{type:'string'},finish:{type:'string'},'device-x':{type:'string'},'device-y':{type:'string'},'device-z':{type:'string'},'rotate-x':{type:'string'},'rotate-y':{type:'string'},'rotate-z':{type:'string'},scale:{type:'string'},
 fit:{type:'string'},'screen-x':{type:'string'},'screen-y':{type:'string'},zoom:{type:'string'},
 camera:{type:'string'},fov:{type:'string'},distance:{type:'string'},'camera-x':{type:'string'},'camera-y':{type:'string'},'target-x':{type:'string'},'target-y':{type:'string'},'camera-roll':{type:'string'},'focus-distance':{type:'string'},aperture:{type:'string'},dof:{type:'string'},
 lighting:{type:'string'},'key-intensity':{type:'string'},'key-azimuth':{type:'string'},'key-elevation':{type:'string'},'fill-intensity':{type:'string'},'rim-intensity':{type:'string'},'rim-azimuth':{type:'string'},'environment-intensity':{type:'string'},'shadow-opacity':{type:'string'},'shadow-softness':{type:'string'},'reflection-intensity':{type:'string'},'screen-glow':{type:'string'},temperature:{type:'string'},environment:{type:'string'},
 background:{type:'string'},'color-a':{type:'string'},'color-b':{type:'string'},'gradient-angle':{type:'string'},ground:{type:'boolean'},transparent:{type:'boolean'},ratio:{type:'string'},resolution:{type:'string'},help:{type:'boolean',short:'h'}
};
const help=`Form Studio CLI

Usage:
  form-studio render <screenshot> [options]
  form-studio dev [--host <host>] [--port <port>]
  form-studio build
  form-studio validate
  form-studio presets [camera|lighting] [--json]
  form-studio config [--json]

Render options:
  -o, --output <file>            Output PNG (default: <input>-mockup.png)
  --config <file>                JSON scene configuration; flags override it
  --browser <path>               Chrome/Chromium executable
  --no-build                     Reuse the existing dist directory
  --timeout <ms>                 Browser/render timeout (default: 30000)
  --dry-run                      Validate and print the resolved JSON without rendering
  --json                         Print machine-readable output metadata

Device and screen:
  --device iphone15|proMax       Device dimensions
  --finish <#rrggbb>             Metal finish
  --device-x/y/z <number>        Device position
  --rotate-x/y/z <degrees>       Device rotation
  --scale <0.35..2>
  --fit fill|fit                 Screenshot fitting mode
  --screen-x/y <-1..1>           Screenshot position
  --zoom <1..3>                  Screenshot zoom

Camera:
  --camera <preset>              Camera preset
  --fov <15..65>                 Vertical field of view
  --distance <3..14>
  --camera-x/y <-3..3>
  --target-x/y <number>
  --camera-roll <degrees>
  --focus-distance <2..15>
  --aperture <0.01..0.1>
  --dof <0..4>                   Depth-of-field strength

Lighting:
  --lighting <preset>            Lighting preset
  --key-intensity <0..6>
  --key-azimuth <-180..180>
  --key-elevation <5..85>
  --fill-intensity <0..4>
  --rim-intensity <0..6>
  --rim-azimuth <-180..180>
  --environment-intensity <0..2.5>
  --shadow-opacity <0..0.7>
  --shadow-softness <0.5..5>
  --reflection-intensity <0..2>
  --screen-glow <0.1..1.5>
  --temperature <#rrggbb>
  --environment studio|softbox|strip

Background and export:
  --background solid|gradient|transparent
  --color-a/b <#rrggbb>
  --gradient-angle <0..360>
  --ground / --no-ground
  --ratio 1:1|4:5|9:16|16:9
  --resolution 1080|1440|2160     Longest output edge
  --transparent / --no-transparent

Examples:
  form-studio render screen.png -o mockup.png
  form-studio render screen.png --device iphone15 --camera Isometric --lighting Moody --background gradient --color-a '#1b1a17' --color-b '#5b4436' --ratio 9:16 --resolution 2160
  form-studio render screen.png --config scene.json --screen-y -0.25 --zoom 1.3
`;
const fail=m=>{console.error(`form-studio: ${m}`);process.exitCode=1};
const number=(values,key,min=-Infinity,max=Infinity)=>{if(values[key]===undefined)return undefined;const n=Number(values[key]);if(!Number.isFinite(n)||n<min||n>max)throw Error(`--${key} must be between ${min} and ${max}.`);return n};
const choice=(value,label,choices)=>{if(value!==undefined&&!choices.includes(value))throw Error(`${label} must be one of: ${choices.join(', ')}.`);return value};
const color=(value,label)=>{if(value!==undefined&&!/^#[0-9a-f]{6}$/i.test(value))throw Error(`${label} must be a six-digit hex color such as #eae8e2.`);return value};
const rad=d=>d*Math.PI/180;
const normalizeNegativeValues=args=>args.map((arg,i)=>{const next=args[i+1];if(arg.startsWith('--')&&optionSpec[arg.slice(2)]?.type==='string'&&next&&/^-\d/.test(next)){args[i+1]='';return `${arg}=${next}`}return arg}).filter(Boolean);
const merge=(base,extra)=>{const out=structuredClone(base);for(const [key,value] of Object.entries(extra??{})){if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof out[key]==='object')out[key]={...out[key],...value};else out[key]=value}return out};
function set(target,key,value){if(value!==undefined)target[key]=value}
async function makeConfig(values){
 let config={};
 if(values.config){const path=resolve(values.config);try{config=JSON.parse(await readFile(path,'utf8'))}catch(e){throw Error(`Cannot read --config ${path}: ${e.message}`)}if(!config||typeof config!=='object'||Array.isArray(config))throw Error('--config must contain a JSON object.')}
 const presets=JSON.parse(await readFile(join(root,'shared/presets.json'),'utf8'));
 if(values.camera!==undefined){if(!presets.camera[values.camera])throw Error(`Unknown camera preset: ${values.camera}. Run "form-studio presets camera".`);config.cameraPreset=values.camera}
 if(values.lighting!==undefined){if(!presets.lighting[values.lighting])throw Error(`Unknown lighting preset: ${values.lighting}. Run "form-studio presets lighting".`);config.lightingPreset=values.lighting}
 const part=key=>config[key]??=(structuredClone(defaults[key])&&{});
 const device=part('device');set(device,'variant',choice(values.device,'--device',['iphone15','proMax']));set(device,'finish',color(values.finish,'--finish'));
 const position=device.position?[...device.position]:undefined,rotation=device.rotation?[...device.rotation]:undefined;
 for(const [i,key] of ['device-x','device-y','device-z'].entries()){const n=number(values,key,-5,5);if(n!==undefined)(device.position??=[...defaults.device.position])[i]=n}
 for(const [i,key] of ['rotate-x','rotate-y','rotate-z'].entries()){const n=number(values,key,-360,360);if(n!==undefined)(device.rotation??=[...defaults.device.rotation])[i]=rad(n)}
 set(device,'scale',number(values,'scale',0.35,2));if(position&&values['device-x']===undefined&&values['device-y']===undefined&&values['device-z']===undefined)device.position=position;if(rotation&&values['rotate-x']===undefined&&values['rotate-y']===undefined&&values['rotate-z']===undefined)device.rotation=rotation;
 const screenFit=part('screenFit');set(screenFit,'mode',choice(values.fit,'--fit',['fill','fit']));set(screenFit,'x',number(values,'screen-x',-1,1));set(screenFit,'y',number(values,'screen-y',-1,1));set(screenFit,'zoom',number(values,'zoom',1,3));
 const camera=part('camera'),cameraMap={fov:['fov',15,65],distance:['distance',3,14],positionX:['camera-x',-3,3],positionY:['camera-y',-3,3],targetX:['target-x',-5,5],targetY:['target-y',-5,5],focusDistance:['focus-distance',2,15],aperture:['aperture',.01,.1],depthOfField:['dof',0,4]};for(const [prop,[flag,min,max]]of Object.entries(cameraMap))set(camera,prop,number(values,flag,min,max));const roll=number(values,'camera-roll',-360,360);if(roll!==undefined)camera.roll=rad(roll);
 const lighting=part('lighting'),lightMap={keyIntensity:['key-intensity',0,6],keyAzimuth:['key-azimuth',-180,180],keyElevation:['key-elevation',5,85],fillIntensity:['fill-intensity',0,4],rimIntensity:['rim-intensity',0,6],rimAzimuth:['rim-azimuth',-180,180],environmentIntensity:['environment-intensity',0,2.5],shadowOpacity:['shadow-opacity',0,.7],shadowSoftness:['shadow-softness',.5,5],reflectionIntensity:['reflection-intensity',0,2],screenGlow:['screen-glow',.1,1.5]};for(const [prop,[flag,min,max]]of Object.entries(lightMap))set(lighting,prop,number(values,flag,min,max));set(lighting,'temperature',color(values.temperature,'--temperature'));set(lighting,'environment',choice(values.environment,'--environment',['studio','softbox','strip']));
 const background=part('background');set(background,'type',choice(values.background,'--background',['solid','gradient','transparent']));set(background,'colorA',color(values['color-a'],'--color-a'));set(background,'colorB',color(values['color-b'],'--color-b'));set(background,'gradientAngle',number(values,'gradient-angle',0,360));if(values.ground!==undefined)background.ground=values.ground;
 const output=part('export');set(output,'ratio',choice(values.ratio,'--ratio',['1:1','4:5','9:16','16:9']));const resolution=number(values,'resolution',1080,2160);if(resolution!==undefined&&!([1080,1440,2160].includes(resolution)))throw Error('--resolution must be 1080, 1440, or 2160.');set(output,'resolution',resolution);if(values.transparent!==undefined)output.transparent=values.transparent;if(background.type==='transparent')output.transparent=true;
 for(const key of ['device','camera','lighting','background','screenFit','export'])if(Object.keys(config[key]??{}).length===0)delete config[key];
 return config;
}
function run(bin,args,options={}){return new Promise((resolve,reject)=>{const p=spawn(bin,args,{cwd:root,stdio:'inherit',...options});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error(`${bin} exited with code ${code}`)))})}
async function build(){await run(process.platform==='win32'?'npm.cmd':'npm',['run','build'])}
async function validate(){await run(process.execPath,['scripts/check-model.mjs']);await run(process.execPath,['scripts/check-screen-regressions.mjs']);console.log('PASS: project validation complete.');}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
async function serveDist(){const dist=join(root,'dist');const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let path=resolve(dist,'.'+pathname);if(relative(dist,path).startsWith('..'))throw Error('Invalid path');const info=await stat(path).catch(()=>null);if(!info||info.isDirectory())path=join(dist,'index.html');const bytes=await readFile(path);res.writeHead(200,{'content-type':mime[extname(path)]??'application/octet-stream','cache-control':'no-store'});res.end(bytes)}catch{res.writeHead(404);res.end('Not found')}});await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok)});const address=server.address();return {server,url:`http://127.0.0.1:${address.port}`}}
async function render(input,values){
 const source=resolve(input);if(!existsSync(source))throw Error(`Screenshot not found: ${source}`);if(!['.png','.jpg','.jpeg','.webp','.avif'].includes(extname(source).toLowerCase()))throw Error('Screenshot must be PNG, JPG, WebP, or AVIF.');
 const config=await makeConfig(values);if(values['dry-run']){console.log(JSON.stringify(merge(defaults,config),null,2));return}
 if(values.build!==false)await build();else if(!existsSync(join(root,'dist/index.html')))throw Error('dist/index.html is missing; remove --no-build.');
 const timeout=number(values,'timeout',1000,300000);const {chromium}=await import('playwright');const {server,url}=await serveDist();let browser;
 try{const launch={headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader-webgl','--disable-dev-shm-usage']};const executable=values.browser||process.env.FORM_STUDIO_BROWSER;if(executable)launch.executablePath=resolve(executable);
  try{browser=await chromium.launch(launch)}catch(e){throw Error(`Chromium could not start. Run "npx playwright install chromium" or pass --browser /path/to/chrome. ${e.message}`)}
  const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1});page.setDefaultTimeout(timeout);await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>window.__FORM_STUDIO__?.version);await page.setInputFiles('#screenshot-upload',source);await page.evaluate(t=>window.__FORM_STUDIO__.waitUntilReady(t),timeout);const data=await page.evaluate(c=>window.__FORM_STUDIO__.render(c),config);const output=resolve(values.output??join(dirname(source),`${basename(source,extname(source))}-mockup.png`));const bytes=Buffer.from(data.slice(data.indexOf(',')+1),'base64');await writeFile(output,bytes);const metadata={output,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length};console.log(values.json?JSON.stringify(metadata):output);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
}
async function main(){
 const argv=process.argv.slice(2),command=argv.shift()??'help';if(command==='version'||command==='--version'||command==='-v'){console.log('form-studio 1.1.0');return}
 if(command==='help'||command==='--help'||command==='-h'||argv.includes('--help')||argv.includes('-h')){console.log(help);return}
 if(command==='dev'){const {values}=parseArgs({args:argv,options:{host:{type:'string',default:'0.0.0.0'},port:{type:'string',default:'5173'}},strict:true});await run(process.platform==='win32'?'npm.cmd':'npm',['run','dev','--','--host',values.host,'--port',values.port]);return}
 if(command==='build'){await build();return}if(command==='validate'){await validate();return}
 if(command==='presets'){const {values,positionals}=parseArgs({args:argv,options:{json:{type:'boolean'}},allowPositionals:true,strict:true});const data=JSON.parse(await readFile(join(root,'shared/presets.json'),'utf8'));const type=positionals[0];if(type&&!['camera','lighting'].includes(type))throw Error('Preset type must be camera or lighting.');const out=type?data[type]:data;const plain=type?Object.keys(out).join('\n'):Object.entries(out).flatMap(([k,v])=>[`${k}:`,...Object.keys(v).map(x=>`  ${x}`)]).join('\n');console.log(values.json?JSON.stringify(out,null,2):plain);return}
 if(command==='config'){const {values}=parseArgs({args:argv,options:{json:{type:'boolean'}},strict:true});console.log(JSON.stringify(defaults,null,2));return}
 if(command==='render'){const {values,positionals}=parseArgs({args:normalizeNegativeValues(argv),options:optionSpec,allowPositionals:true,allowNegative:true,strict:true});if(!positionals[0])throw Error('render requires a screenshot path.');if(positionals.length>1)throw Error('render accepts one screenshot path.');await render(positionals[0],values);return}
 throw Error(`Unknown command: ${command}. Run form-studio --help.`)
}
main().catch(e=>fail(e.message));
