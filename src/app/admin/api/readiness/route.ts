export const dynamic='force-dynamic'
export async function GET() {
 return Response.json({schema_version:1,ready:Boolean(process.env.OFFICE_BACKEND_ORIGIN)},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
}
