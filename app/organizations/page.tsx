"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, LogOut } from "lucide-react"
import Image from "next/image"

// Organizasyon tipi
interface Organization {
  id: string
  name: string
  logo: string
  description: string
}

// E-tablo tipi
interface Spreadsheet {
  id: string
  name: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Örnek organizasyon verileri
const ORGANIZATIONS: Organization[] = [
  {
    id: "org-a",
    name: "Alpha Organization",
    logo: "/images/tech-logo.png",
    description: "Alpha Organization turnuva ve etkinlikleri",
  },
  {
    id: "org-b",
    name: "Beta Organization",
    logo: "/images/tech-logo.png",
    description: "Beta Organization turnuva ve etkinlikleri",
  },
]

// Örnek e-tablo verileri
const SPREADSHEETS: Spreadsheet[] = [
  {
    id: "sheet-1",
    name: "Tech E-Tablo",
    organizationId: "org-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), // 15 saat önce
  },
  {
    id: "sheet-2",
    name: "Alpha Organization E-Tablo",
    organizationId: "org-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
  },
  {
    id: "sheet-3",
    name: "Beta Organization E-Tablo",
    organizationId: "org-b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
  },
]

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<string>("a-z")
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // E-tabloları yükle
    setSpreadsheets(SPREADSHEETS)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `Son düzenlemenin üzerinden ${diffDay} gün${diffDay > 1 ? "" : ""} geçti.`
    } else if (diffHour > 0) {
      return `Son düzenlemenin üzerinden ${diffHour} saat ${diffMin % 60} dakika geçti.`
    } else if (diffMin > 0) {
      return `Son düzenlemenin üzerinden ${diffMin} dakika geçti.`
    } else {
      return `Son düzenlemenin üzerinden ${diffSec} saniye geçti.`
    }
  }

  const getOrganizationById = (id: string) => {
    return ORGANIZATIONS.find((org) => org.id === id)
  }

  const filteredSpreadsheets = spreadsheets
    .filter((sheet) => sheet.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "a-z") {
        return a.name.localeCompare(b.name)
      } else if (sortOrder === "z-a") {
        return b.name.localeCompare(a.name)
      } else if (sortOrder === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
    })

  // Organizasyonlara göre gruplandır
  const groupedSpreadsheets: Record<string, Spreadsheet[]> = {}

  filteredSpreadsheets.forEach((sheet) => {
    const org = getOrganizationById(sheet.organizationId)
    if (org) {
      const firstLetter = org.name.charAt(0).toUpperCase()
      if (!groupedSpreadsheets[firstLetter]) {
        groupedSpreadsheets[firstLetter] = []
      }
      groupedSpreadsheets[firstLetter].push(sheet)
    }
  })

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
            <Button variant="ghost" onClick={() => router.push("/help")}>
              Yardım
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tech E-Tablolar</h1>
          <p className="text-gray-600">
            E-Tablonuzu filtreleme veya arama seçenekleri ile hızlıca bulabilir, hızlı ve pratik bir şekilde yönetmeye
            başlayabilirsiniz.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="E-Tablolarda ara..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-z">A - Z</SelectItem>
              <SelectItem value="z-a">Z - A</SelectItem>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {Object.keys(groupedSpreadsheets)
          .sort()
          .map((letter) => (
            <div key={letter} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">
                  {letter}
                </span>
              </h2>

              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-Tablo Adı
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-Tablo Bilgi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedSpreadsheets[letter].map((sheet) => {
                      const organization = getOrganizationById(sheet.organizationId)

                      return (
                        <tr key={sheet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 relative mr-3">
                                <Image
                                  src={organization?.logo || "/images/tech-logo.png"}
                                  alt={organization?.name || "Organization"}
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{sheet.name}</div>
                                <div className="text-sm text-gray-500">{organization?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{formatTimeAgo(sheet.updatedAt)}</span>
                              <Button
                                onClick={() => {
                                  // E-tablo erişim bilgilerini kaydet
                                  localStorage.setItem(
                                    "spreadsheet-access",
                                    JSON.stringify({
                                      spreadsheetId: sheet.id,
                                      username: "user",
                                      loginTime: new Date().toISOString(),
                                    }),
                                  )
                                  router.push(`/spreadsheet/${sheet.id}`)
                                }}
                              >
                                E-Tabloya Gir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {Object.keys(groupedSpreadsheets).length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Arama kriterlerinize uygun e-tablo bulunamadı.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>Tech Development. Tüm Hakları Saklıdır © 2023</p>
        </div>
      </footer>
    </div>
  )
}
