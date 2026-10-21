import test from 'node:test';
import assert from 'node:assert/strict';
import {companyToolRewrites} from '../config/company-tool-routes.mjs';
test('grouped console routes resolve locally before Office forwarding and retain every existing backend',()=>{
 const routes=companyToolRewrites({OFFICE_BACKEND_ORIGIN:'https://office-backend.vercel.app',MARKETING_BACKEND_ORIGIN:'https://marketing-backend.vercel.app',RADAR_BACKEND_ORIGIN:'https://radar-backend.vercel.app'});
 const consoleRoute=routes.find(r=>r.source==='/office/administration');
 assert.ok(consoleRoute,'Grouped console local route is missing');assert.equal(consoleRoute.destination,'/admin');
 const nested=routes.find(r=>r.source==='/office/administration/:path+');assert.equal(nested.destination,'/admin/:path+');
 assert.ok(routes.indexOf(consoleRoute)<routes.findIndex(r=>r.source==='/office/:path+'));
 assert.equal(routes.find(r=>r.source==='/office').destination,'https://office-backend.vercel.app/office');
 assert.equal(routes.find(r=>r.source==='/office/marketing').destination,'https://marketing-backend.vercel.app/office/marketing');
 assert.equal(routes.find(r=>r.source==='/radar').destination,'https://radar-backend.vercel.app/radar');
 assert.ok(!routes.some(r=>r.source==='/admin'));
});
