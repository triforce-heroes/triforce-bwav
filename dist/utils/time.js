import{statSync as t,utimesSync as i}from"node:fs";export function isModified(i,e){let o=t(i),m=t(e);return o.mtime.toISOString()!==m.mtime.toISOString()}export function copyModifiedTime(e,o){let m=t(o);i(e,m.atime,m.mtime)}