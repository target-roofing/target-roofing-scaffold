const OFFICE_COOKIE='__Secure-target-office-session';
export function officeSessionCookies(cookieHeader) {
 if(typeof cookieHeader!=='string'||cookieHeader.length>32768)return '';
 return cookieHeader.split(';').map(p=>p.trim()).filter(p=>{
  const name=p.slice(0,p.indexOf('='));
  return name===OFFICE_COOKIE||/^__Secure-target-office-session\.\d{1,2}$/.test(name);
 }).join('; ');
}
function officeOrigin(value) {
 if(!value)return null;
 try {
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)return null;
  return url.origin;
 } catch {return null;}
}
/** @returns {Promise<{email:string,name:string,source:'office'|'legacy',staff_id?:string}|null>} */
export async function resolveAdminSession({cookieHeader,officeOrigin:configuredOrigin,legacySession,fetchImpl=fetch}) {
 const cookie=officeSessionCookies(cookieHeader);
 if(!cookie){
  if(typeof cookieHeader==='string'&&/(?:^|;\s*)__Secure-target-office-session(?:\.\d+)?=/.test(cookieHeader))return null;
  return legacySession?{email:legacySession.email,name:'Administrator',source:'legacy'}:null;
 }
 const origin=officeOrigin(configuredOrigin);if(!origin)return null;
 try {
  const response=await fetchImpl(origin+'/office/internal/admin-context',{method:'POST',headers:{'content-type':'application/json',cookie},body:'{}',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(3500)});
  if(!response.ok)return null;
  const body=await response.json();const staff=body?.staff;
  if(body?.schema_version!==1||body.verified!==true||body.scope!=='admin-console'||staff?.portal_role!=='admin'||
    typeof staff.id!=='string'||!staff.id||staff.id.length>100||typeof staff.name!=='string'||staff.name.length>100||
    typeof staff.email!=='string'||!/^[-a-z0-9._+]+@targetroofers\.com$/.test(staff.email))return null;
  return {email:staff.email,name:staff.name,staff_id:staff.id,source:'office'};
 } catch {return null;}
}
