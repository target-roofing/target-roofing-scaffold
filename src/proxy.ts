import {NextResponse,type NextRequest} from 'next/server'
import {consoleRequestHeaders} from '@/lib/ops/console-paths.mjs'
export function proxy(request:NextRequest) {
 const requestHeaders=consoleRequestHeaders(request.headers,request.nextUrl.pathname+request.nextUrl.search)
 const response=NextResponse.next({request:{headers:requestHeaders}})
 response.headers.set('Cache-Control','private, no-store')
 return response
}
export const config={matcher:['/admin/:path*','/office/administration/:path*']}
