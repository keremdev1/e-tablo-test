import { NextResponse } from "next/server"
import { userDb } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Kullanıcı adı ve şifre gereklidir" }, { status: 400 })
    }

    // Kullanıcı adı kontrolü
    const existingUser = userDb.getByUsername(username)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Bu kullanıcı adı zaten kullanılıyor" }, { status: 409 })
    }

    // Yeni kullanıcı oluştur
    const user = await userDb.create(username, password)

    // Şifreyi çıkararak kullanıcı bilgilerini döndür
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ success: false, error: "Kayıt olurken bir hata oluştu" }, { status: 500 })
  }
}
