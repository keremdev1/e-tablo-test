import jwt from "jsonwebtoken"

// JWT_SECRET çevre değişkenini kullan
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development"

// Kullanıcı tipi
interface User {
  id: string
  username: string
}

// Server-side token oluşturma
export function generateToken(user: User): string {
  console.log("Token oluşturuluyor:", { userId: user.id, username: user.username })

  const payload = {
    id: user.id,
    username: user.username,
  }

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
    console.log("Token başarıyla oluşturuldu")
    return token
  } catch (error) {
    console.error("Token oluşturma hatası:", error)
    throw new Error("Token oluşturulamadı")
  }
}

// Server-side token doğrulama
export function verifyToken(token: string): { id: string; username: string } | null {
  console.log("Token doğrulanıyor")

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string }
    console.log("Token doğrulandı:", { userId: decoded.id, username: decoded.username })
    return decoded
  } catch (error) {
    console.error("Token doğrulama hatası:", error)
    return null
  }
}
