import{cpSync as e,createReadStream as t,createWriteStream as o,existsSync as s,mkdirSync as r,readFileSync as i,rmSync as n,writeFileSync as p}from"node:fs";import{basename as c,dirname as f}from"node:path";import{crc32 as l}from"node:zlib";import{fatal as m}from"@triforce-heroes/triforce-core/Console";import u from"archiver";import{globSync as a}from"glob";import{Extract as d}from"unzipper";import{BRSTMConvert as w}from"../tools/BRSTM.js";import{BYMLConvert as $}from"../tools/BYML.js";import{VGAConvert as g}from"../tools/VGA.js";import{ZSTDCompress as h,ZSTDDecompress as b}from"../tools/ZSTD.js";import{wavesHashes as v}from"../utils/hash.js";import{isModified as S}from"../utils/time.js";import{resourceADPCMSet as y,resourceLopusSet as z,resourcesHashes as I,resourcesWrite as L}from"../utils/yaml.js";export async function ConvertCommand(O){let N;void 0!==O.copy&&(s(O.copy)?(n(O.copy,{recursive:!0,force:!0}),r(O.copy,{recursive:!0})):m(`The path "${O.copy}" does not exist.`)),process.stdout.write("Searching by WAV files...\n");let U=a("**/*.wav",{ignore:["node_modules"],cwd:process.cwd(),absolute:!0});if(0===U.length){process.stdout.write("- None files found.");return}process.stdout.write(`- Found ${String(U.length)} files.

`),process.stdout.write("Converting...\n");let A=o("romfs.zip"),C=u("zip");C.pipe(A);let D=new Map,V=!1;for(let e of U){let t=[],o=`/${c(e,".wav")}`,r=`/${c(f(e))}${o}`;for(let e of v.keys()){if(e.endsWith(r)){t=[e];break}e.endsWith(o)&&t.push(e)}if(t.length>1){for(let e of(process.stdout.write(`
- ${r}... CONFLICTS
`),t))process.stdout.write(`  -> ${e}.bwav
`);continue}let n=t[0];if(o.startsWith("/NV_USen_Custom_")){let t;let o=c(e,".wav"),n=`${f(e)}/${o.replace(/_[a-z0-9]+$/i,".bars.zs")}`;if(!s(n)){process.stdout.write(`
- ${r}... INVALID, BARS NOT FOUND
`);continue}let p=b(n);D.has(p)||D.set(p,i(p));let m=D.get(p),u=l(o),a=m.readUint32LE(12);for(let e=0;e<a;e++)if(m.readUInt32LE(16+4*e)===u){t=e;break}if(void 0===t){process.stdout.write(`
- ${r}... INVALID, BARS HASH NOT FOUND
`);continue}let d=m.readUInt32LE(16+4*a+8*t+4),$=m.readUInt16LE(d+14),g=`${f(e)}/${o}.c.bwav`,h=!0===O.force||!s(g)||S(e,g);(h||O.debug)&&process.stdout.write(`
- [D${String($)}] ${r}... `),w(e,g,$);let v=64+64*$;i(g).subarray(0,v).copy(m,d,0,v),C.file(g,{name:`romfs/Sound/Resource/Stream/${o}.bwav`}),(h||O.debug)&&process.stdout.write("OK\n");continue}if(!v.has(n)){process.stdout.write(`
- ${r}... INVALID
`);continue}let p=I[v.get(n)],m=p.items[0].value,u=m.items.length,a=4===m.items[0].items.length,d=f(f(e)),$=`${d}${r}.c.bwav`,h=!0===O.force||!s($)||S(e,$);if(V=!0,(h||O.debug)&&process.stdout.write(`
- [${a?"D":"L"}${String(u)}] ${r}... `),a)h&&w(e,$,u),y(p,i($));else{h&&g(e,$,u);let t=i($);z(p,t,t.readUInt32LE(24),u)}C.file($,{name:`romfs/Voice/Resource/USen/${n}.bwav`}),(h||O.debug)&&process.stdout.write("OK\n")}if(process.stdout.write(`
`),D.size>0){for(let[e,t]of(process.stdout.write("Generating BARS... "),D)){let o=`${e.slice(0,-5)}.c.bars`;p(o,t);let s=h(o,"bars.zs");C.file(s,{name:`romfs/Sound/Resource/${c(e)}.zs`})}process.stdout.write(`OK
`)}if(V){process.stdout.write("Patching YAML... ");let t=L(),o=$(t);N=h(o),C.file(N,{name:"romfs/Voice/BwavInfo/USen.byml.zs"}),!0===O.keepTemps&&e(t,"USen.yaml",{force:!0}),n(t),n(o),process.stdout.write(`OK
`)}process.stdout.write("Compressing... "),await C.finalize(),process.stdout.write(`OK
`),void 0!==N&&n(N),void 0!==O.copy&&(process.stdout.write("Copying... "),await t("romfs.zip").pipe(d({path:O.copy})).promise(),process.stdout.write(`OK
`)),process.stdout.write(`
DONE!`)}