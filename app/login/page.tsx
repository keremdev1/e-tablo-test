"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HelpCircle, LogIn } from "lucide-react"
import { clientAuth } from "@/lib/client-auth"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Giriş denemesi:", username, password)

      // Admin giriş kontrolü
      if (username === "admin" && password === "admin123") {
        console.log("✅ Admin girişi başarılı!")

        const user = {
          id: "admin-1",
          username: "admin",
          role: "admin",
          createdAt: new Date().toISOString(),
        }

        clientAuth.setToken("admin-token-123")
        clientAuth.setUser(user)

        setTimeout(() => {
          router.push("/organizations")
        }, 100)
      }
      // Normal kullanıcı girişi
      else if (username === "TechUser" && password === "techdev123") {
        console.log("✅ Kullanıcı girişi başarılı!")

        const user = {
          id: "user-1",
          username: "TechUser",
          role: "user",
          createdAt: new Date().toISOString(),
        }

        clientAuth.setToken("user-token-123")
        clientAuth.setUser(user)

        setTimeout(() => {
          router.push("/organizations")
        }, 100)
      } else {
        console.log("❌ Geçersiz bilgiler")
        setError("Geçersiz kullanıcı adı veya şifre")
      }
    } catch (error) {
      console.error("Giriş hatası:", error)
      setError("Giriş yapılırken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordLogin = () => {
    // Discord OAuth URL'sine yönlendir
    // Gerçek uygulamada bu URL Discord Developer Portal'dan alınır
    window.location.href =
      "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify%20email"
  }

  const fillAdminData = () => {
    setUsername("admin")
    setPassword("admin123")
    setError("")
  }

  const fillUserData = () => {
    setUsername("TechUser")
    setPassword("techdev123")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/help")}
                className="text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Yardım
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-16 relative">
                <Image
                  src="/images/tech-logo.png"
                  alt="Tech Development Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl">Tech E-Tablo</CardTitle>
              <p className="text-sm text-gray-600">DOĞRULAMA SİSTEMİ</p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] flex items-center justify-center gap-2"
                onClick={handleDiscordLogin}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.9519 5.34446C18.4973 4.66798 16.9371 4.17535 15.3103 3.90446C15.2983 3.90217 15.2863 3.90446 15.2766 3.91362C15.0919 4.25217 14.8863 4.69217 14.7423 5.04217C13.0063 4.79217 11.2799 4.79217 9.57833 5.04217C9.43433 4.68535 9.22193 4.25217 9.03593 3.91362C9.02626 3.90446 9.01426 3.90217 9.00226 3.90446C7.37626 4.17535 5.81606 4.66798 4.36033 5.34446C4.35183 5.34675 4.34453 5.35217 4.33966 5.35981C1.48626 9.64675 0.68626 13.8274 1.08226 17.9524C1.08346 17.9669 1.09183 17.9815 1.10383 17.9907C3.00226 19.3815 4.84226 20.2024 6.65183 20.7524C6.66383 20.7559 6.67703 20.7524 6.68426 20.7421C7.12626 20.1467 7.52226 19.5192 7.86383 18.8598C7.87583 18.8361 7.86383 18.8078 7.83863 18.7978C7.21583 18.5524 6.62226 18.2598 6.05183 17.9258C6.02426 17.9098 6.02183 17.8698 6.04703 17.8503C6.15583 17.7698 6.26463 17.6855 6.36863 17.6001C6.38183 17.5887 6.40103 17.5864 6.41663 17.5944C10.1783 19.3144 14.2463 19.3144 17.9639 17.5944C17.9795 17.5852 17.9987 17.5875 18.0131 17.5989C18.1171 17.6844 18.2259 17.7698 18.3359 17.8503C18.3611 17.8698 18.3599 17.9098 18.3323 17.9258C17.7619 18.2655 17.1683 18.5524 16.5443 18.7966C16.5191 18.8055 16.5083 18.8349 16.5203 18.8586C16.8679 19.518 17.2639 20.1444 17.6987 20.7409C17.7047 20.7524 17.7191 20.7559 17.7311 20.7524C19.5479 20.2024 21.3879 19.3815 23.2863 17.9907C23.2995 17.9815 23.3067 17.9681 23.3079 17.9536C23.7863 13.1815 22.5223 9.03217 19.9471 5.36098C19.9435 5.35217 19.9363 5.34675 19.9519 5.34446ZM8.46583 15.3967C7.33983 15.3967 6.41183 14.3681 6.41183 13.1121C6.41183 11.8561 7.32783 10.8274 8.46583 10.8274C9.61583 10.8274 10.5319 11.8669 10.5199 13.1121C10.5199 14.3681 9.60383 15.3967 8.46583 15.3967ZM15.8463 15.3967C14.7203 15.3967 13.7923 14.3681 13.7923 13.1121C13.7923 11.8561 14.7083 10.8274 15.8463 10.8274C16.9963 10.8274 17.9123 11.8669 17.9003 13.1121C17.9003 14.3681 16.9963 15.3967 15.8463 15.3967Z"
                    fill="white"
                  />
                </svg>
                Discord ile Giriş Yap
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-100 px-2 text-gray-500">veya</span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-red-800 mb-1">👑 Admin Hesabı</h4>
                <p className="text-sm text-red-700">
                  <strong>Kullanıcı Adı:</strong> admin
                  <br />
                  <strong>Şifre:</strong> admin123
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-700 border-red-300"
                  onClick={fillAdminData}
                >
                  Admin Bilgilerini Doldur
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-blue-800 mb-1">👤 Kullanıcı Hesabı</h4>
                <p className="text-sm text-blue-700">
                  <strong>Kullanıcı Adı:</strong> TechUser
                  <br />
                  <strong>Şifre:</strong> techdev123
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-blue-700 border-blue-300"
                  onClick={fillUserData}
                >
                  Kullanıcı Bilgilerini Doldur
                </Button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">* Kullanıcı Adı</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin veya TechUser"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">* Şifre</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    * İşaretli ile işaretlenmiş bölgelerin doldurulması <strong>zorunludur</strong>.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Tech Development. Tüm Hakları Saklıdır © 2023</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-blue-600">
              Gizlilik Politikası
            </a>
            <a href="#" className="hover:text-blue-600">
              Hizmet Şartları
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
