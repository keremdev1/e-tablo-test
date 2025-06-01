import { NextResponse } from "next/server"
import { userOperations, sessionOperations } from "@/lib/database"

export async function POST(request: Request) {
  try {
    console.log("Login API çağrıldı")

    const body = await request.json()
    console.log("Gelen veri:", { username: body.username, passwordLength: body.password?.length })

    const { username, password } = body

    if (!username || !password) {
      console.log("Kullanıcı adı veya şifre eksik")
      return NextResponse.json({ success: false, error: "Kullanıcı adı ve şifre gereklidir" }, { status: 400 })
    }

    console.log("Kullanıcı aranıyor:", username)
    const user = userOperations.getByUsername(username)

    if (!user) {
      console.log("Kullanıcı bulunamadı:", username)
      return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    console.log("Kullanıcı bulundu, şifre kontrol ediliyor")
    const isPasswordValid = userOperations.validatePassword(user, password)

    if (!isPasswordValid) {
      console.log("Geçersiz şifre")
      return NextResponse.json({ success: false, error: "Geçersiz şifre" }, { status: 401 })
    }

    console.log("Şifre doğru, session oluşturuluyor")
    const token = sessionOperations.create(user.id)

    // Şifreyi çıkararak kullanıcı bilgilerini döndür
    const { password: _, ...userWithoutPassword } = user

    console.log("Giriş başarılı")
    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Giriş yapılırken bir hata oluştu: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
