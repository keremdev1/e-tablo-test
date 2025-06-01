"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

// Örnek e-tablo verileri
const SAMPLE_SPREADSHEETS: Record<string, any> = {
  "sheet-1": {
    id: "sheet-1",
    name: "Tech E-Tablo",
    users: [
      { username: "tech", password: "tech123" },
      { username: "dev", password: "dev123" },
      { username: "admin", password: "admin123" },
    ],
  },
  "sheet-2": {
    id: "sheet-2",
    name: "Alpha Organization E-Tablo",
    users: [
      { username: "alpha", password: "alpha123" },
      { username: "team", password: "team123" },
      { username: "admin", password: "admin123" },
    ],
  },
  "sheet-3": {
    id: "sheet-3",
    name: "Beta Organization E-Tablo",
    users: [
      { username: "beta", password: "beta123" },
      { username: "squad", password: "squad123" },
      { username: "admin", password: "admin123" },
    ],
  },
}

export default function SpreadsheetLoginPage({ params }: { params: { id: string } }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [spreadsheet, setSpreadsheet] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const sheet = SAMPLE_SPREADSHEETS[params.id]
    if (sheet) {
      setSpreadsheet(sheet)
    } else {
      alert("E-tablo bulunamadı")
      router.push("/")
    }
  }, [params.id, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // E-tablo kullanıcı kontrolü
    const isValidUser = spreadsheet?.users.some((user: any) => user.username === username && user.password === password)

    if (isValidUser) {
      // E-tablo erişim bilgilerini kaydet
      localStorage.setItem(
        "spreadsheet-access",
        JSON.stringify({
          spreadsheetId: params.id,
          username,
          loginTime: new Date().toISOString(),
        }),
      )

      router.push(`/spreadsheet/${params.id}`)
    } else {
      setError("Bu e-tabloya erişim izniniz yok. Kullanıcı adı veya şifre hatalı.")
    }

    setLoading(false)
  }

  const fillTestData = () => {
    setUsername("tech")
    setPassword("tech123")
    setError("")
  }

  const fillAdminData = () => {
    setUsername("admin")
    setPassword("admin123")
    setError("")
  }

  if (!spreadsheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
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
            <div>
              <CardTitle className="text-xl">{spreadsheet.name}</CardTitle>
              <p className="text-sm text-gray-600">E-TABLO ERİŞİMİ</p>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Bu e-tabloya erişmek için size verilen kullanıcı adı ve şifrenizi girin.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <h4 className="font-semibold text-green-800 mb-1">🧪 Test Hesabı</h4>
                <p className="text-sm text-green-700">
                  <strong>Kullanıcı Adı:</strong> tech
                  <br />
                  <strong>Şifre:</strong> tech123
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-green-700 border-green-300"
                  onClick={fillTestData}
                >
                  Test Bilgilerini Doldur
                </Button>
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

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">* Kullanıcı Adı</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tech veya admin"
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
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/")}
                    disabled={loading}
                  >
                    Geri Dön
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                    {loading ? "Giriş Yapılıyor..." : "E-Tabloya Gir"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Tech Development. Tüm Hakları Saklıdır © 2023</p>
        </div>
      </div>
    </div>
  )
}
