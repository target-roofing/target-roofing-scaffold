import test from 'node:test';
import assert from 'node:assert/strict';
const module=await import('../src/lib/ops/office-admin-client.mjs').catch(()=>({}));
const cookie='__Secure-target-office-session=signed';
const authority={schema_version:1,verified:true,scope:'admin-console',staff:{id:'staff-1',email:'darian@targetroofers.com',name:'Darian',portal_role:'admin'}};
const legacySession={email:'admin@targetroofers.com'};
const resolve=(overrides={})=>module.resolveAdminSession({cookieHeader:cookie,officeOrigin:'https://office-backend.vercel.app',legacySession,fetchImpl:async()=>Response.json(authority),...overrides});
test('verified Office administrator uses the same console session without a second login',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function','Office console session adapter is not implemented');
 assert.deepEqual(await resolve(),{email:'darian@targetroofers.com',name:'Darian',staff_id:'staff-1',source:'office'});
});
test('legacy console remains available only without an Office session',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function');
 assert.deepEqual(await resolve({cookieHeader:'tr_admin=signed',fetchImpl:async()=>{throw Error('must not call')} }),{email:'admin@targetroofers.com',name:'Administrator',source:'legacy'});
});
test('Office denials and outages never inherit a valid legacy session',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function');
 for(const fetchImpl of [async()=>Response.json({verified:false},{status:403}),async()=>Response.json({verified:false},{status:401}),async()=>Response.json({},{status:503}),async()=>{throw Error('timeout')},async()=>Response.json({...authority,staff:{...authority.staff,portal_role:'member'}}),async()=>Response.json({...authority,schema_version:2})]){
  assert.equal(await resolve({fetchImpl}),null);
 }
});
test('only Office session chunks are forwarded to the fixed authority endpoint',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function');
 let captured;
 const result=await resolve({cookieHeader:'tr_admin=private; __Secure-target-office-session.0=part0; tracking=private; __Secure-target-office-session.1=part1; __Secure-target-office-session.role=admin',fetchImpl:async(url,init)=>{captured={url,init};return Response.json(authority)}});
 assert.equal(result.source,'office');assert.equal(captured.url,'https://office-backend.vercel.app/office/internal/admin-context');
 assert.equal(captured.init.headers.cookie,'__Secure-target-office-session.0=part0; __Secure-target-office-session.1=part1');
 assert.equal(captured.init.method,'POST');assert.equal(captured.init.body,'{}');assert.equal(captured.init.redirect,'error');
});
test('unsafe or unconfigured authority origin cannot disclose cookies or fall back',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function');
 for(const officeOrigin of ['', 'http://evil.example','https://user:pass@office.example','https://office.example/path','https://office.example?token=x']){
  assert.equal(await resolve({officeOrigin,fetchImpl:async()=>{throw Error('must not fetch')}}),null);
 }
});
test('spoofed header text and malformed context cannot establish an admin identity',async()=>{
 assert.equal(typeof module.resolveAdminSession,'function');
 assert.equal(await resolve({cookieHeader:'x-user-role=admin',legacySession:null}),null);
 for(const body of [{...authority,scope:'marketing'},{...authority,verified:false},{...authority,staff:{...authority.staff,email:'not-a-work-address@example.com'}},null]){
  assert.equal(await resolve({fetchImpl:async()=>Response.json(body)}),null);
 }
});
test('oversized Office cookie headers fail closed instead of falling back to legacy',async()=>{
 assert.equal(await resolve({cookieHeader:cookie+'; tracking='+ 'x'.repeat(32768)}),null);
});
