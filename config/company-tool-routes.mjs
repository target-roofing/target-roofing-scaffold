function backendOrigin(value) {
  if (!value) return null;
  const url = new URL(value);
  const local = ['127.0.0.1', 'localhost'].includes(url.hostname);
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && local && process.env.NODE_ENV !== 'production'))) {
    throw new Error('Set a backend origin without credentials, paths or query parameters.');
  }
  return url.origin;
}

// Independent apps use the existing website hostname; no DNS changes are needed.
// Unconfigured apps receive no route until their backend is ready.
export function companyToolRewrites(env = process.env) {
  const routes = [];
  for (const [prefix, variable] of [
    ['/office/marketing', 'MARKETING_BACKEND_ORIGIN'],
    ['/office', 'OFFICE_BACKEND_ORIGIN'],
    ['/radar', 'RADAR_BACKEND_ORIGIN'],
    ['/commissions', 'COMMISSIONS_BACKEND_ORIGIN'],
  ]) {
    const origin = backendOrigin(env[variable]);
    if (!origin) continue;
    if (prefix === '/office') {
      routes.push({ source: '/office/administration', destination: '/admin' });
      routes.push({ source: '/office/administration/:path+', destination: '/admin/:path+' });
    }
    routes.push({ source: prefix, destination: `${origin}${prefix}` });
    routes.push({ source: `${prefix}/:path+`, destination: `${origin}${prefix}/:path+` });
    if (prefix === '/office') {
      routes.push({ source: '/office-assets/:path+', destination: `${origin}/office-assets/:path+` });
    }
  }
  return routes;
}
