import{spawnSync as o}from"node:child_process";import{root as t}from"../utils/path.js";import{createTemporaryFile as r}from"../utils/temp.js";let e=t("tools/sox/sox.exe");export function soxConvert(t,s){let i=r();return o(e,[t,"-r","48000","-c",String(s),i]),i}export function soxSamples(t){return Number(/[=]\s(\d+)/.exec(o(e,["--info",t]).output.toString())[1])}