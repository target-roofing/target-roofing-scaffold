import test from 'node:test';
import assert from 'node:assert/strict';
const module=await import('../src/lib/ops/console-paths.mjs').catch(()=>({}));
test('one grouped Office console keeps website tabs and operation links in the workspace',()=>{
 assert.equal(typeof module.consoleHref,'function','Grouped console navigation is not implemented');
 assert.equal(module.consoleHref('/admin?tab=seo','office'),'/office/administration?tab=seo');
 assert.equal(module.consoleHref('/admin/tasks','office'),'/office/administration/tasks');
 assert.equal(module.consoleHref('/admin/meetings/123','office'),'/office/administration/meetings/123');
 assert.equal(module.consoleHref('/admin/tasks','console'),'/admin/tasks');
 assert.equal(module.consoleHref('/office/admin','office'),'/office/admin');
 assert.equal(module.consoleHref('https://example.com/admin','office'),'https://example.com/admin');
});
test('only the grouped prefix is recognized and proxy context replaces caller headers',()=>{
 assert.equal(typeof module.consoleRequestHeaders,'function');
 let h=module.consoleRequestHeaders(new Headers({'x-tr-console-surface':'office','x-tr-console-path':'https://evil.example'}),'/admin/tasks?tag=roof');
 assert.equal(h.get('x-tr-console-surface'),'console');assert.equal(h.get('x-tr-console-path'),'/admin/tasks?tag=roof');
 h=module.consoleRequestHeaders(h,'/office/administration/meetings/123');
 assert.equal(h.get('x-tr-console-surface'),'office');
 assert.equal(module.consolePathname('/office/administration/tasks'),'/admin/tasks');
 assert.equal(module.consolePathname('/office/administration-other'),'/office/administration-other');
});
