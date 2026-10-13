import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(session){
 const source=fs.readFileSync(new URL('../src/app/api/admin/assistant/route.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const calls=[];const route={exports:{}};
 const deps={'next/server':{NextResponse:{json:Response.json}},'@/lib/ops/session':{getAdminSession:async()=>session},'@/lib/ops/chat':{chatWithTools:async(history,context)=>{calls.push(context);return 'reply'}}};
 vm.runInNewContext(compiled,{module:route,exports:route.exports,require:name=>deps[name],console});
 return {route:route.exports,calls};
}
const request=()=>new Request('https://targetroofers.com/api/admin/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',text:'List my tasks'}],actor:'Claimed other person'})});
test('Office assistant uses verified staff identity rather than a caller supplied actor',async()=>{
 const {route,calls}=load({email:'darian@targetroofers.com',name:'Darian Gray',source:'office'});
 assert.equal((await route.POST(request())).status,200);
 assert.equal(calls[0].actorName,'Darian Gray');
});
test('denied Office callers never reach assistant or business tools',async()=>{
 const {route,calls}=load(null);
 assert.equal((await route.POST(request())).status,401);assert.equal(calls.length,0);
});
