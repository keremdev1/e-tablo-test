import { NextResponse } from "next/server"
import { spreadsheetOperations, sessionOperations } from "@/lib/database"

// GET: E-tablo verilerini al
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const spreadsheetId = params.id

    // API anahtarı kontrolü
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API anahtarı gereklidir" }, { status: 401 })
    }

    // Token doğrulama (API anahtarı olarak session token kullanıyoruz)
    const user = sessionOperations.validate(apiKey)
    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz API anahtarı" }, { status: 401 })
    }

    // E-tablo verilerini al
    const spreadsheet = spreadsheetOperations.getById(spreadsheetId)

    if (!spreadsheet) {
      return NextResponse.json({ success: false, error: "E-tablo bulunamadı" }, { status: 404 })
    }

    // E-tablo sahibi kontrolü
    if (spreadsheet.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: "Bu e-tabloya erişim izniniz yok" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: spreadsheet.data,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}

// PUT: E-tablo verilerini güncelle
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const spreadsheetId = params.id
    const { cell, value, data } = await request.json()

    // API anahtarı kontrolü
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API anahtarı gereklidir" }, { status: 401 })
    }

    // Token doğrulama
    const user = sessionOperations.validate(apiKey)
    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz API anahtarı" }, { status: 401 })
    }

    // E-tablo verilerini al
    const spreadsheet = spreadsheetOperations.getById(spreadsheetId)

    if (!spreadsheet) {
      return NextResponse.json({ success: false, error: "E-tablo bulunamadı" }, { status: 404 })
    }

    // E-tablo sahibi kontrolü
    if (spreadsheet.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: "Bu e-tabloya erişim izniniz yok" }, { status: 403 })
    }

    // Tek hücre güncelleme
    if (cell && value !== undefined) {
      const cellData = {
        value,
        type: typeof value === "number" ? "number" : "text",
      }

      if (typeof value === "object") {
        cellData.type = "json"
      }

      spreadsheetOperations.updateCell(spreadsheetId, cell, cellData)
    }

    // Tüm veriyi güncelleme
    if (data) {
      spreadsheetOperations.update(spreadsheetId, { data })
    }

    // Güncellenmiş e-tabloyu al
    const updatedSpreadsheet = spreadsheetOperations.getById(spreadsheetId)

    return NextResponse.json({
      success: true,
      data: updatedSpreadsheet?.data,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}
