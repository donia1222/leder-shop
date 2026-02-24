export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

function toSlug(sheetName: string): string {
  return sheetName
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getCol(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key]
    }
  }
  return undefined
}

function transformImageUrl(url: string): string {
  if (!url) return ""
  return url.replace(
    /^https?:\/\/usfh\.ch\/img\/([^/]+)\//i,
    (_, folder) => `https://web.lweb.ch/usa/img/${folder.toLowerCase()}/`
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ success: false, error: "El archivo debe ser .xlsx o .xls" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })

    const allProducts: object[] = []

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

      const categorySlug = toSlug(sheetName)
      const categoryName = sheetName.trim()

      const artikelToUrl = new Map<string, string>()
      const sheetRef = ws["!ref"]
      if (sheetRef) {
        const range = XLSX.utils.decode_range(sheetRef)
        let artikelCol = -1
        for (let c = range.s.c; c <= range.e.c; c++) {
          const h = (ws[XLSX.utils.encode_cell({ r: range.s.r, c })] as any)?.v
          if (h === "Artikel-Nr.") { artikelCol = c; break }
        }
        if (artikelCol >= 0) {
          for (let r = range.s.r + 1; r <= range.e.r; r++) {
            const artCell = ws[XLSX.utils.encode_cell({ r, c: artikelCol })] as any
            if (!artCell) continue
            const artNr = String(artCell.v ?? "").trim()
            if (!artNr) continue
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cell = ws[XLSX.utils.encode_cell({ r, c })] as any
              if (!cell) continue
              const val = String(cell.v ?? cell.l?.Target ?? cell.f ?? "").trim()
              if (val.toLowerCase().includes("usfh.ch/img")) {
                artikelToUrl.set(artNr, val)
                break
              }
            }
          }
        }
      }

      for (const row of rows) {
        const id = getCol(row, "Artikel-Nr.", "ID", "id")
        const name = getCol(row, "Name", "name")

        if (!id || !name) continue

        const numId = parseInt(String(id), 10)
        if (isNaN(numId) || numId <= 0) continue

        const price = parseFloat(String(getCol(row, "Preis inkl. MwSt.", "Preis zzgl. MwSt.") ?? 0)) || 0
        const stock = parseInt(String(getCol(row, "Lager", "Lagerbestand") ?? 0), 10) || 0
        const description = String(getCol(row, "Beschreibung") ?? "").trim()
        const supplier = String(getCol(row, "Lieferant") ?? "").trim()
        const origin = String(getCol(row, "Hersteller") ?? "").trim()

        const artikelNr = String(id).trim()
        const rawImage = artikelToUrl.get(artikelNr)
          || String(getCol(row, "URLs der Bilder", "Bild", "Bild URL", "Image", "image_url", "Foto") ?? "").trim()
        const folder = categorySlug.split("-")[0]
        const image_url = rawImage
          ? transformImageUrl(rawImage).replace(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/, "")
          : `https://web.lweb.ch/usa/img/${folder}/${artikelNr}`

        allProducts.push({
          id: numId,
          name: String(name).trim(),
          description,
          price,
          stock,
          supplier,
          origin,
          category: categorySlug,
          category_name: categoryName,
          image_url,
        })
      }
    }

    if (allProducts.length === 0) {
      return NextResponse.json({ success: false, error: "No se encontraron productos válidos en el archivo" }, { status: 400 })
    }

    // Llama al PHP que NO borra nada
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL
    const phpResponse = await fetch(`${apiBase}/add_products_excel.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: allProducts }),
    })

    const result = await phpResponse.json()

    return NextResponse.json({
      ...result,
      parsed: allProducts.length,
    })
  } catch (error) {
    console.error("Error añadiendo productos:", error)
    return NextResponse.json({ success: false, error: "Error interno al procesar el archivo" }, { status: 500 })
  }
}
