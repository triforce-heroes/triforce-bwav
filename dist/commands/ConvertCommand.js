import{cpSync as e,createReadStream as t,createWriteStream as o,existsSync as s,mkdirSync as r,readFileSync as i,rmSync as p,writeFileSync as n}from"node:fs";import{basename as c,dirname as f}from"node:path";import{crc32 as l}from"node:zlib";import{fatal as m}from"@triforce-heroes/triforce-core/Console";import u from"archiver";import{globSync as a}from"glob";import{Extract as d}from"unzipper";import{BRSTMConvert as w}from"../tools/BRSTM.js";import{BYMLConvert as $}from"../tools/BYML.js";import{VGAConvert as g}from"../tools/VGA.js";import{ZSTDCompress as h,ZSTDDecompress as b}from"../tools/ZSTD.js";import{wavesHashes as S}from"../utils/hash.js";import{isModified as v}from"../utils/time.js";import{resourceADPCMSet as y,resourceLopusSet as L,resourcesHashes as z,resourcesWrite as I}from"../utils/yaml.js";export async function ConvertCommand(O){void 0!==O.copy&&(s(O.copy)?(p(O.copy,{recursive:!0,force:!0}),r(O.copy,{recursive:!0})):m(`The path "${O.copy}" does not exist.`)),process.stdout.write("Searching by WAV files...\n");let N=a("**/*.wav",{ignore:["node_modules"],cwd:process.cwd(),posix:!0,absolute:!0});if(0===N.length){process.stdout.write("- None files found.");return}process.stdout.write(`- Found ${String(N.length)} files.

`),process.stdout.write("Converting...\n");let U=o("romfs.zip"),A=u("zip");A.pipe(U);let C=new Map;for(let e of N){let t=[],o=`/${c(e,".wav")}`,r=`/${c(f(e.slice(4)))}${o}`;for(let e of S.keys()){if(e.endsWith(r)){t=[e];break}e.endsWith(o)&&t.push(e)}if(t.length>1){for(let e of(process.stdout.write(`
- ${r}... CONFLICTS
`),t))process.stdout.write(`  -> ${e}.bwav
`);continue}let p=t[0];if(o.startsWith("/NV_USen_Custom_")){let t;let p=o.slice(1),n=p.replace(/_[a-z0-9]+$/i,".bars.zs");if(!s(n)){process.stdout.write(`
- ${r}... INVALID, BARS NOT FOUND
`);continue}let c=b(n);C.has(c)||C.set(c,i(c));let f=C.get(c),m=l(p),u=f.readUint32LE(12);for(let e=0;e<u;e++)if(f.readUInt32LE(16+4*e)===m){t=e;break}if(void 0===t){process.stdout.write(`
- ${r}... INVALID, BARS HASH NOT FOUND
`);continue}let a=f.readUInt32LE(16+4*u+8*t+4),d=f.readUInt16LE(a+14),$=`${p}.c.bwav`,g=!0===O.force||!s($)||v(e,$);(g||O.debug)&&process.stdout.write(`
- [L${String(d)}] ${r}... `),w(e,$,d);let h=64+64*d;i($).subarray(0,h).copy(f,a,0,h),A.file($,{name:`romfs/Sound/Resource/Stream/${p}.bwav`}),(g||O.debug)&&process.stdout.write("OK\n");continue}if(!S.has(p)){process.stdout.write(`
- ${r}... INVALID
`);continue}let n=z[S.get(p)],m=n.items[0].value,u=m.items.length,a=4===m.items[0].items.length,d=f(f(e.slice(4))),$=`${d}${r}.c.bwav`,h=!0===O.force||!s($)||v(e,$);if((h||O.debug)&&process.stdout.write(`
- [${a?"D":"L"}${String(u)}] ${r}... `),a)h&&w(e,$,u),y(n,i($));else{h&&g(e,$,u);let t=i($);L(n,t,t.readUInt32LE(24),u)}A.file($,{name:`romfs/Voice/Resource/USen/${p}.bwav`}),(h||O.debug)&&process.stdout.write("OK\n")}if(process.stdout.write(`
`),C.size>0){for(let[e,t]of(process.stdout.write("Generating BARS... "),C)){let o=`${e.slice(0,-5)}.c.bars`;n(o,t);let s=h(o,"bars.zs");A.file(s,{name:`romfs/Sound/Resource/${c(e)}.zs`})}process.stdout.write(`OK
`)}process.stdout.write("Patching YAML... ");let D=I(),V=$(D),j=h(V);A.file(j,{name:"romfs/Voice/BwavInfo/USen.byml.zs"}),!0===O.keepTemps&&e(D,"USen.yaml",{force:!0}),p(D),p(V),process.stdout.write(`OK
`),process.stdout.write("Compressing... "),await A.finalize(),p(j),process.stdout.write(`OK
`),void 0!==O.copy&&(process.stdout.write("Copying... "),await t("romfs.zip").pipe(d({path:O.copy})).promise(),process.stdout.write(`OK
`)),process.stdout.write(`
DONE!`)}