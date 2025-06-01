"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

// Hücre tipi
interface Cell {
  value: any
  type: "text" | "number" | "json" | "formula"
}

// E-tablo tipi
interface Spreadsheet {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: Record<string, Cell>
  settings: {
    headerColor?: string
    rowColor?: string
    alternateRowColor?: string
    textColor?: string
    fontSize?: string
    cellPadding?: string
  }
}

// Örnek e-tablo verileri
const SAMPLE_SPREADSHEETS: Record<string, Spreadsheet> = {
  "sheet-1": {
    id: "sheet-1",
    name: "Tech Test E-Tablo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      A1: { value: "Takım Adı", type: "text" },
      B1: { value: "Tag", type: "text" },
      C1: { value: "1. Maç Sıralama", type: "text" },
      D1: { value: "1. Maç Leş", type: "text" },
      A2: { value: "Tech Development", type: "text" },
      B2: { value: "Tech", type: "text" },
      C2: { value: "1", type: "number" },
      D2: { value: "5", type: "number" },
      A3: { value: "Tech Team", type: "text" },
      B3: { value: "Tech", type: "text" },
      C3: { value: "2", type: "number" },
      D3: { value: "3", type: "number" },
    },
    settings: {
      headerColor: "#f3f4f6",
      rowColor: "#ffffff",
      alternateRowColor: "#f9fafb",
      textColor: "#111827",
      fontSize: "14px",
      cellPadding: "8px",
    },
  },
  "sheet-2": {
    id: "sheet-2",
    name: "Discord Bot Verileri",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      A1: { value: "Kullanıcı ID", type: "text" },
      B1: { value: "Kullanıcı Adı", type: "text" },
      C1: { value: "Puan", type: "text" },
      D1: { value: "JSON Veri", type: "text" },
      A2: { value: "123456789", type: "text" },
      B2: { value: "TechDev", type: "text" },
      C2: { value: "1500", type: "number" },
      D2: { value: JSON.stringify({ level: 25, achievements: ["first_win", "pro_player"] }), type: "json" },
    },
    settings: {
      headerColor: "#f3f4f6",
      rowColor: "#ffffff",
      alternateRowColor: "#f9fafb",
      textColor: "#111827",
      fontSize: "14px",
      cellPadding: "8px",
    },
  },
}

export default function LivePage({ params }: { params: { id: string } }) {
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Kullanıcı kontrolü
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      router.push("/login")
      return
    }

    // E-tablo verilerini yükle
    const sheetId = params.id
    const sheet = SAMPLE_SPREADSHEETS[sheetId]

    if (sheet) {
      setSpreadsheet(sheet)
    } else {
      alert("E-tablo bulunamadı")
      router.push("/dashboard")
    }

    setLoading(false)

    // Otomatik yenileme
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        // Gerçek bir API çağrısı olsaydı burada yapılırdı
        console.log("Otomatik yenileme...")
      }, 5000) // 5 saniyede bir yenile
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [params.id, router, autoRefresh])

  const generateColumnHeaders = (count: number) => {
    const headers = []
    for (let i = 0; i < count; i++) {
      headers.push(String.fromCharCode(65 + i))
    }
    return headers
  }

  const generateCellId = (col: string, row: number) => `${col}${row}`

  const getCellData = (cellId: string) => {
    return spreadsheet?.data[cellId] || { value: "", type: "text" }
  }

  const refreshData = () => {
    // Gerçek bir API çağrısı olsaydı burada yapılırdı
    alert("Veriler yenilendi")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  if (!spreadsheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>E-tablo bulunamadı</p>
      </div>
    )
  }

  const columnHeaders = generateColumnHeaders(10)
  const rowCount = 20

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <h1 className="font-semibold">{spreadsheet.name} - Live Ekran</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={autoRefresh ? "default" : "outline"} onClick={() => setAutoRefresh(!autoRefresh)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {autoRefresh ? "Otomatik Yenileme Açık" : "Otomatik Yenileme Kapalı"}
            </Button>
            <Button variant="outline" onClick={refreshData}>
              Manuel Yenile
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: spreadsheet.settings.headerColor }}>
                <th className="border p-2 text-center font-bold">#</th>
                <th className="border p-2 text-center font-bold">Takımlar</th>
                <th className="border p-2 text-center font-bold">Taglar</th>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="border p-2 text-center font-bold">
                    {i === 4 ? "5. Maç" : `${i + 1}. Maç`}
                    <br />
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <span className="text-xs">Sıralama</span>
                      <span className="text-xs">Leş</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    backgroundColor:
                      rowIndex % 2 === 0 ? spreadsheet.settings.rowColor : spreadsheet.settings.alternateRowColor,
                  }}
                >
                  <td className="border p-2 text-center font-semibold">{rowIndex + 3}</td>
                  {columnHeaders.slice(0, 7).map((col, colIndex) => {
                    const cellId = generateCellId(col, rowIndex + 3)
                    const cellData = getCellData(cellId)

                    if (colIndex === 0) {
                      // Takım adı sütunu
                      return (
                        <td key={cellId} className="border p-2" style={{ color: spreadsheet.settings.textColor }}>
                          {cellData.value || "techdev"}
                        </td>
                      )
                    } else if (colIndex === 1) {
                      // Tag sütunu
                      return (
                        <td key={cellId} className="border p-2" style={{ color: spreadsheet.settings.textColor }}>
                          {cellData.value || "tech"}
                        </td>
                      )
                    } else {
                      // Maç sonuçları
                      const siralamaCellId = generateCellId(col, rowIndex + 3)
                      const lesCellId = generateCellId(String.fromCharCode(col.charCodeAt(0) + 1), rowIndex + 3)
                      const siralamaData = getCellData(siralamaCellId)
                      const lesData = getCellData(lesCellId)

                      return (
                        <td key={cellId} className="border p-0">
                          <div className="grid grid-cols-2">
                            <div className="p-2 text-center border-r" style={{ color: spreadsheet.settings.textColor }}>
                              {siralamaData.value || "1"}
                            </div>
                            <div className="p-2 text-center" style={{ color: spreadsheet.settings.textColor }}>
                              {lesData.value || "2"}
                            </div>
                          </div>
                        </td>
                      )
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Son güncelleme: {new Date(spreadsheet.updatedAt).toLocaleString("tr-TR")}</p>
          {autoRefresh && <p>Otomatik yenileme: 5 saniyede bir</p>}
        </div>
      </main>
    </div>
  )
}
