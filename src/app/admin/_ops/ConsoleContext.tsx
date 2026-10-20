'use client'
import {createContext,useContext} from 'react'
import {consoleHref} from '@/lib/ops/console-paths.mjs'
export type ConsoleSurface='console'|'office'
export const ConsoleSurfaceContext=createContext<ConsoleSurface>('console')
export function useConsoleHref() {
 const surface=useContext(ConsoleSurfaceContext)
 return (href:string)=>consoleHref(href,surface)
}
