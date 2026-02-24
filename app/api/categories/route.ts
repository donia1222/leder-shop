import { NextResponse } from "next/server"

const PHP_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/get_categories.php"
const CACHE_TTL = 30_000 // 30 segundos

let cache: { data: unknown; at: number } | null = null

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }
  try {
    const res = await fetch(PHP_URL, { method: "POST", cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    cache = { data, at: Date.now() }
    return NextResponse.json(data)
  } catch (e: any) {
    if (cache) return NextResponse.json(cache.data) // serve stale on error
    return NextResponse.json({ success: false, error: e.message }, { status: 502 })
  }
}
