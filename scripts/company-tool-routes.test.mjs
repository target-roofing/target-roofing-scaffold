import test from 'node:test';
import assert from 'node:assert/strict';
import { companyToolRewrites } from '../config/company-tool-routes.mjs';

test('each office tool keeps pages, API and assets within its company path', () => {
  const routes = companyToolRewrites({
    OFFICE_BACKEND_ORIGIN: 'https://office-backend.vercel.app',
    RADAR_BACKEND_ORIGIN: 'https://radar-backend.vercel.app',
    COMMISSIONS_BACKEND_ORIGIN: 'https://commissions-backend.vercel.app',
  });
  assert.deepEqual(routes.map(r => r.source), [
    '/office/administration', '/office/administration/:path+',
    '/office', '/office/:path+', '/office-assets/:path+',
    '/radar', '/radar/:path+', '/commissions', '/commissions/:path+',
  ]);
  assert.equal(routes.find(r => r.source === '/radar/:path+').destination, 'https://radar-backend.vercel.app/radar/:path+');
  assert.ok(routes.every(r => r.source !== '/' && !r.source.startsWith('/api')));
});

test('only configured backend origins are routed and unsafe origin values fail', () => {
  assert.deepEqual(companyToolRewrites({}), []);
  assert.equal(companyToolRewrites({ OFFICE_BACKEND_ORIGIN: 'https://office-backend.vercel.app' }).length, 5);
  for (const value of ['http://evil.example', 'https://user:password@backend.example', 'https://backend.example/other', 'https://backend.example?token=x']) {
    assert.throws(() => companyToolRewrites({ OFFICE_BACKEND_ORIGIN: value }));
  }
});
