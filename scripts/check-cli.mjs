import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const cli=(args)=>spawnSync(process.execPath,['bin/form-studio.mjs',...args],{encoding:'utf8'});
let r=cli(['--help']);assert.equal(r.status,0);assert.match(r.stdout,/form-studio render/);assert.match(r.stdout,/--key-azimuth/);
r=cli(['presets','camera']);assert.equal(r.status,0);assert.match(r.stdout,/Three Quarter/);assert.match(r.stdout,/App Store/);
r=cli(['render','README.md','--dry-run']);assert.notEqual(r.status,0);assert.match(r.stderr,/Screenshot must be/);
r=cli(['render','/workspace/scratch/a386ac880623/upload/02-1000188568.jpg','--dry-run','--device','iphone15','--device-y','-0.2','--rotate-y','-42','--camera','Isometric','--fov','24','--lighting','Moody','--screen-y','-0.7','--zoom','1.4','--background','gradient','--no-ground','--ratio','9:16','--resolution','2160','--transparent']);
assert.equal(r.status,0,r.stderr);const c=JSON.parse(r.stdout);assert.equal(c.device.variant,'iphone15');assert.equal(c.device.position[1],-.2);assert(Math.abs(c.device.rotation[1]+42*Math.PI/180)<1e-10);assert.equal(c.cameraPreset,'Isometric');assert.equal(c.camera.fov,24);assert.equal(c.lightingPreset,'Moody');assert.equal(c.screenFit.y,-.7);assert.equal(c.screenFit.zoom,1.4);assert.equal(c.background.type,'gradient');assert.equal(c.background.ground,false);assert.equal(c.export.ratio,'9:16');assert.equal(c.export.resolution,2160);assert.equal(c.export.transparent,true);
console.log('PASS: CLI help, presets, input validation, negative values, and full scene option mapping.');
