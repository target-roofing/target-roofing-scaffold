export const OFFICE_CONSOLE_PATH='/office/administration';
export function isOfficeConsolePath(path) {
 return typeof path==='string'&&(path===OFFICE_CONSOLE_PATH||path.startsWith(OFFICE_CONSOLE_PATH+'/'));
}
export function consolePathname(path) {
 return isOfficeConsolePath(path)?'/admin'+path.slice(OFFICE_CONSOLE_PATH.length):path;
}
export function consoleHref(href,surface) {
 return surface==='office'&&/^\/admin(?:$|[/?#])/.test(href)?OFFICE_CONSOLE_PATH+href.slice('/admin'.length):href;
}
export function consoleRequestHeaders(existing,path) {
 const headers=new Headers(existing);const pathname=path.split('?')[0];
 headers.set('x-tr-console-surface',isOfficeConsolePath(pathname)?'office':'console');
 headers.set('x-tr-console-path',path);
 return headers;
}
