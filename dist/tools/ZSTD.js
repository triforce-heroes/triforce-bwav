import{spawnSync as o}from"node:child_process";import{root as s}from"../utils/path.js";import{createTemporaryFile as t}from"../utils/temp.js";let r=s("tools/zstd.exe"),e=s("tools/zs.zsdic");export function ZSTDCompress(s){let m=t("byml.zs");return o(r,["--compress",s,"-D",e,"-o",m]),m}