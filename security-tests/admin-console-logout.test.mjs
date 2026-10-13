import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
import * as client from '../src/lib/ops/office-admin-client.mjs';
test('console sign-out clears legacy and every Office session chunk without clearing unrelated cookies',async()=>{
 const cookies=[{name:'tr_admin',value:'signed'},{name:'__Secure-target-office-session.0',value:'a'},{name:'__Secure-target-office-session.1',value:'b'},{name:'preference',value:'private'}];
 const removed=[];const sets=[];const jar={getAll:()=>cookies,delete:name=>removed.push(name),set:(...args)=>sets.push(args)};
 const source=fs.readFileSync(new URL('../src/lib/ops/session.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const deps={'server-only':{},'next/headers':{cookies:async()=>jar},crypto,react:{cache:fn=>fn},'./office-admin-client.mjs':client};const m={exports:{}};
 vm.runInNewContext(compiled,{module:m,exports:m.exports,require:name=>deps[name],process,Buffer});
 await m.exports.clearAdminSession();
 assert.deepEqual(removed,['tr_admin']);
 assert.deepEqual(sets.map(s=>s[0]),['__Secure-target-office-session.0','__Secure-target-office-session.1']);
 assert.ok(sets.every(s=>s[1]===''&&s[2].maxAge===0&&s[2].secure&&s[2].path==='/'));
});
