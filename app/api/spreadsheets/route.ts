import { NextResponse } from "next/server"
import { spreadsheetOperations, sessionOperations } from "@/lib/database"

// GET: Kullanıcının e-tablolarını listele
export async function GET(request: Request) {
  try {
    // Token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Yetkilendirme gereklidir" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = sessionOperations.validate(token)

    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 })
    }

    // Kullanıcının e-tablolarını al
    const spreadsheets = spreadsheetOperations.getByUserId(user.id)

    return NextResponse.json({
      success: true,
      spreadsheets,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}

// POST: Yeni e-tablo oluştur
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ success: false, error: "E-tablo adı gereklidir" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Yetkilendirme gereklidir" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = sessionOperations.validate(token)

    if (!user) {
      return NextResponse.json({ success: false, error: "Geçersiz token" }, { status: 401 })
    }

    // ✅ Kullanıcıyı Spreadsheet'e ekle
    const spreadsheet = spreadsheetOperations.create(name, [
      {
        username: user.username,
        password: user.password,
      },
    ])

    return NextResponse.json({
      success: true,
      spreadsheet,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 })
  }
}
