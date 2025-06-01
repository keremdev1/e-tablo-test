"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientAuth } from "@/lib/client-auth"
import Image from "next/image"

// E-tablo tipi
interface Spreadsheet {
  id: string
  name: string
  users: { username: string; password: string }[]
}

// Örnek e-tablo verileri
const SAMPLE_SPREADSHEETS: Spreadsheet[] = [
  {
    id: "sheet-1",
    name: "Tech E-Tablo",
    users: [
      { username: "tech", password: "tech123" },
      { username: "dev", password: "dev123" },
    ],
  },
]

export default function DashboardPage() {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Token kontrolü
    if (!clientAuth.isLoggedIn()) {
      console.log("Token bulunamadı, login sayfasına yönlendiriliyor")
      router.push("/login")
      return
    }

    // Kullanıcı bilgilerini al
    const user = clientAuth.getUser()
    if (user) {
      setUsername(user.username)
    }

    // E-tabloları yükle
    setSpreadsheets(SAMPLE_SPREADSHEETS)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clientAuth.logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/images/tech-logo.png"
                alt="Tech Development Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="font-semibold">Tech Development</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Ana Sayfa
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tech E-Tablolar</h1>
          <p className="text-xl font-semibold mb-4">{username}</p>
          <p className="text-gray-600">Erişim izniniz olan e-tablolar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spreadsheets.length === 0 ? (
            <p className="text-center col-span-full">Size atanmış e-tablo bulunmuyor.</p>
          ) : (
            spreadsheets.map((sheet, index) => (
              <Card key={sheet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 text-blue-600">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-2xl font-bold">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{sheet.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{sheet.users.length} kullanıcı erişimi</p>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/spreadsheet-login/${sheet.id}`)}
                  >
                    E-Tabloya Gir
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>Tech Development. Tüm Hakları Saklıdır © 2023</p>
        </div>
      </footer>
    </div>
  )
}
