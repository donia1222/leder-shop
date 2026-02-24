import { NextRequest, NextResponse } from "next/server"

const PHP_BASE = process.env.NEXT_PUBLIC_API_BASE_URL + "/get_products.php"
const CACHE_TTL = 30_000 // 30 segundos

// Cache keyed by query string so ?stock_status=X is cached separately
const cache = new Map<string, { data: unknown; at: number }>()

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString()
  const url = qs ? `${PHP_BASE}?${qs}` : PHP_BASE
  const hit = cache.get(qs)

  if (hit && Date.now() - hit.at < CACHE_TTL) {
    return NextResponse.json(hit.data)
  }
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    cache.set(qs, { data, at: Date.now() })
    return NextResponse.json(data)
  } catch (e: any) {
    if (hit) return NextResponse.json(hit.data) // serve stale on error
    return NextResponse.json({ success: false, error: e.message }, { status: 502 })
  }
}
