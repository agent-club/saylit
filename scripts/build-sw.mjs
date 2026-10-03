import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('../out/',import.meta.url).pathname;
async function walk(dir) {
  const files=[];
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,entry.name);
    if(entry.isDirectory())files.push(...await walk(path));
    else if(entry.name!=='sw.js'&& /\.(html|js|css|svg|png|webmanifest)$/.test(entry.name))files.push(path);
  }
  return files;
}
const files=await walk(root);
const digest=createHash('sha256');
for(const file of files.sort())digest.update(await readFile(file));
const cache=`inkflow-${digest.digest('hex').slice(0,12)}`;
const assets=files.map(file=>'/'+relative(root,file));
// Only cache this build's own static assets. Document content and external image URLs are never uploaded or cached here.
await writeFile(join(root,'sw.js'),`const CACHE=${JSON.stringify(cache)};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('inkflow-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));
  else if(ASSETS.includes(new URL(event.request.url).pathname))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
`);
console.log('Offline shell generated: '+files.length+' assets.');
