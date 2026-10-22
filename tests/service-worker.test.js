import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('service worker serves cached resources when the network is unavailable',async()=>{
  const listeners={};
  const cached=new Response('TACTICS offline',{status:200});
  const context={
    self:{location:{origin:'https://example.com'},addEventListener:(type,handler)=>{listeners[type]=handler;}},
    caches:{match:async()=>cached},
    fetch:async()=>{throw new Error('offline');},
    URL,Response
  };
  vm.runInNewContext(await readFile(new URL('../service-worker.js',import.meta.url),'utf8'),context);
  let result;
  listeners.fetch({request:{method:'GET',url:'https://example.com/tactics-rugby/'},respondWith:promise=>{result=promise;}});
  assert.equal(await (await result).text(),'TACTICS offline');
});
