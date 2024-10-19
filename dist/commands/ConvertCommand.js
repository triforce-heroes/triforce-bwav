import{cpSync as o,createReadStream as e,createWriteStream as t,existsSync as s,mkdirSync as r,readFileSync as i,rmSync as p}from"node:fs";import{basename as c,dirname as m}from"node:path";import{fatal as n}from"@triforce-heroes/triforce-core/Console";import f from"archiver";import{globSync as l}from"glob";import{Extract as u}from"unzipper";import{BRSTMConvert as d}from"../tools/BRSTM.js";import{BYMLConvert as a}from"../tools/BYML.js";import{VGAConvert as w}from"../tools/VGA.js";import{ZSTDCompress as h}from"../tools/ZSTD.js";import{wavesHashes as g}from"../utils/hash.js";import{isModified as v}from"../utils/time.js";import{resourceADPCMSet as y,resourceLopusSet as $,resourcesHashes as b,resourcesWrite as S}from"../utils/yaml.js";export async function ConvertCommand(C){void 0!==C.copy&&(s(C.copy)?(p(C.copy,{recursive:!0,force:!0}),r(C.copy,{recursive:!0})):n(`The path "${C.copy}" does not exist.`)),process.stdout.write("Searching by WAV files...\n");let j=l("**/*.wav",{ignore:["node_modules"],cwd:process.cwd(),posix:!0,absolute:!0});if(0===j.length){process.stdout.write("- None files found.");return}process.stdout.write(`- Found ${String(j.length)} files.

`),process.stdout.write("Converting...\n");let z=t("romfs.zip"),L=f("zip");for(let o of(L.pipe(z),j)){let e=[],t=`/${c(o,".wav")}`,r=`/${c(m(o.slice(4)))}${t}`;for(let o of g.keys()){if(o.endsWith(r)){e=[o];break}o.endsWith(t)&&e.push(o)}if(e.length>1){for(let o of(process.stdout.write(`
- ${r}... CONFLICTS
`),e))process.stdout.write(`  -> ${o}.bwav
`);continue}let p=e[0];if(!g.has(p)){process.stdout.write(`
- ${r}... INVALID
`);continue}let n=b[g.get(p)],f=n.items[0].value,l=f.items.length,u=4===f.items[0].items.length,a=m(m(o.slice(4))),h=`${a}${r}.c.bwav`,S=!0===C.force||!s(h)||v(o,h);if((S||C.debug)&&process.stdout.write(`
- [${u?"D":"L"}${String(l)}] ${r}... `),u)S&&d(o,h,l),y(n,i(h));else{S&&w(o,h,l);let e=i(h);$(n,e,e.readUInt32LE(24),l)}L.file(h,{name:`romfs/Voice/Resource/USen/${p}.bwav`}),(S||C.debug)&&process.stdout.write("OK\n")}process.stdout.write(`
`),process.stdout.write("Patching YAML... ");let O=S(),I=a(O),T=h(I);L.file(T,{name:"romfs/Voice/BwavInfo/USen.byml.zs"}),!0===C.keepTemps&&o(O,"USen.yaml",{force:!0}),p(O),p(I),process.stdout.write(`OK
`),process.stdout.write("Compressing... "),await L.finalize(),p(T),process.stdout.write(`OK
`),void 0!==C.copy&&(process.stdout.write("Copying... "),await e("romfs.zip").pipe(u({path:C.copy})).promise(),process.stdout.write(`OK
`)),process.stdout.write(`
DONE!`)}