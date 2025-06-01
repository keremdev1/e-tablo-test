import { NextResponse } from "next/server"
import { spreadsheetDb } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

// GET: E-tablo detaylarını al
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const spreadsheetId = params.id

    // Token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Yetkilendirme gereklidir" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 })
    }

    // E-tablo verilerini al
    const spreadsheet = spreadsheetDb.getById(spreadsheetId)

    if (!spreadsheet) {
      return NextResponse.json({ success: false, error: "E-tablo bulunamadı" }, { status: 404 })
    }

    // E-tablo sahibi kontrolü
    if (spreadsheet.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: "Bu e-tabloya erişim izniniz yok" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      spreadsheet,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}

// PUT: E-tablo güncelle
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const spreadsheetId = params.id
    const updates = await request.json()

    // Token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Yetkilendirme gereklidir" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 })
    }

    // E-tablo verilerini al
    const spreadsheet = spreadsheetDb.getById(spreadsheetId)

    if (!spreadsheet) {
      return NextResponse.json({ success: false, error: "E-tablo bulunamadı" }, { status: 404 })
    }

    // E-tablo sahibi kontrolü
    if (spreadsheet.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: "Bu e-tabloya erişim izniniz yok" }, { status: 403 })
    }

    // E-tabloyu güncelle
    const updatedSpreadsheet = spreadsheetDb.update(spreadsheetId, updates)

    return NextResponse.json({
      success: true,
      spreadsheet: updatedSpreadsheet,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}

// DELETE: E-tablo sil
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const spreadsheetId = params.id

    // Token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Yetkilendirme gereklidir" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 })
    }

    // E-tablo verilerini al
    const spreadsheet = spreadsheetDb.getById(spreadsheetId)

    if (!spreadsheet) {
      return NextResponse.json({ success: false, error: "E-tablo bulunamadı" }, { status: 404 })
    }

    // E-tablo sahibi kontrolü
    if (spreadsheet.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: "Bu e-tabloya erişim izniniz yok" }, { status: 403 })
    }

    // E-tabloyu sil
    spreadsheetDb.delete(spreadsheetId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}
