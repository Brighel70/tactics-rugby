import {mkdir,rm,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dest=new URL('../dist/',import.meta.url);
await rm(dest,{recursive:true,force:true});
for(const dir of ['src','icons']) await mkdir(new URL(dir+'/',dest),{recursive:true});
for(const path of ['index.html','manifest.webmanifest','service-worker.js','src/styles.css','src/main.js','src/engine.js','src/field.js','src/plays.js','icons/icon.svg','icons/icon-t-180.png','icons/icon-t-192.png','icons/icon-t-512.png']) await copyFile(new URL('../'+path,import.meta.url),new URL(path,dest));
const version=createHash('sha256');
for(const path of ['index.html','manifest.webmanifest','src/styles.css','src/main.js','src/engine.js','src/field.js','src/plays.js']) version.update(await readFile(new URL(path,dest)));
const stamp=version.digest('hex').slice(0,12);
const index=new URL('index.html',dest);
await writeFile(index,(await readFile(index,'utf8'))
  .replace('./src/styles.css"',`./src/styles.css?v=${stamp}"`)
  .replace('./src/main.js"',`./src/main.js?v=${stamp}"`));
for(const path of ['src/main.js','src/engine.js','src/field.js']){
  const target=new URL(path,dest);
  await writeFile(target,(await readFile(target,'utf8')).replace(/from '(\.\/[^']+\.js)'/g,(_,url)=>`from '${url}?v=${stamp}'`));
}
const sw=new URL('service-worker.js',dest);
await writeFile(sw,(await readFile(sw,'utf8')).replaceAll('__CACHE_VERSION__',stamp));
console.log('Production build ready: dist/');
