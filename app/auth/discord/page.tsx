"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function DiscordAuthPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      setError("Discord yetkilendirme iptal edildi.")
      setLoading(false)
      return
    }

    if (!code) {
      setError("Discord yetkilendirme kodu bulunamadı.")
      setLoading(false)
      return
    }

    // Gerçek uygulamada burada Discord API'ye istek yapılır
    // Örnek olarak başarılı bir yetkilendirme simüle ediyoruz
    setTimeout(() => {
      // Örnek kullanıcı bilgileri
      const user = {
        id: "1004674837622567003",
        username: "kerem.dev",
        avatar: "https://cdn.discordapp.com/avatars/1004674837622567003/a_30b18b784378d1b6908ef6249e9fb75c.gif?size=1024",
        email: "keremlaicioglu@gmail.com",
        role: "admin",
        provider: "discord",
      }

      // Kullanıcı bilgilerini ve token'ı kaydet
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", "user-token")

      // Ana sayfaya yönlendir
      router.push("/")
    }, 2000)
  }, [searchParams, router])

  const handleRetry = () => {
    // Discord OAuth URL'sine yönlendir
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=1331345494533869598&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=identify%20email`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/tech-logo.png"
                alt="Tech Development Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle>Discord ile Giriş</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p>Discord hesabınız doğrulanıyor...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                <p className="text-red-700">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Ana Sayfa
                </Button>
                <Button onClick={handleRetry}>Tekrar Dene</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
