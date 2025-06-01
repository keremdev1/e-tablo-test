"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2, AlertTriangle, Palette, Database, RotateCcw, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

// Hücre tipi
interface Cell {
  value: any
  type: "text" | "number" | "json" | "formula"
}

// E-tablo ayarları tipi
interface SpreadsheetSettings {
  headerColor: string
  teamColumnColor: string
  rankingColumnColor: string
  killColumnColor: string
  backgroundColor: string
  buttonColor: string
  textColor: string
  borderColor: string
  fontSize: string
  fontWeight: string
  fontStyle: string
  fontFamily: string
}

// Yedekleme tipi
interface Backup {
  id: string
  timestamp: string
  data: Record<string, Cell>
  name?: string
}

// E-tablo tipi
interface Spreadsheet {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  organizationId: string
  data: Record<string, Cell>
  settings: SpreadsheetSettings
  backups?: Backup[]
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS: SpreadsheetSettings = {
  headerColor: "#f3f4f6",
  teamColumnColor: "#ffffff",
  rankingColumnColor: "#f9fafb",
  killColumnColor: "#ffffff",
  backgroundColor: "#ffffff",
  buttonColor: "#3b82f6",
  textColor: "#111827",
  borderColor: "#e5e7eb",
  fontSize: "14px",
  fontWeight: "400",
  fontStyle: "normal",
  fontFamily: "Inter",
}

// Örnek e-tablo verileri
const SAMPLE_SPREADSHEETS: Record<string, Spreadsheet> = {
  "sheet-1": {
    id: "sheet-1",
    name: "Tech E-Tablo",
    organizationId: "org-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      "1-1": { value: "Takım Adı", type: "text" },
      "1-2": { value: "Takım Tagı", type: "text" },
      "1-3": { value: "1.Maç", type: "text" },
      "1-4": { value: "2.Maç", type: "text" },
      "1-5": { value: "3.Maç", type: "text" },
      "1-6": { value: "5.Maç", type: "text" },
      "2-1": { value: "Tech Development", type: "text" },
      "2-2": { value: "Tech", type: "text" },
      "2-3": { value: "6", type: "number" },
      "2-4": { value: "1", type: "number" },
      "2-5": { value: "6", type: "number" },
      "2-6": { value: "1", type: "number" },
    },
    settings: DEFAULT_SETTINGS,
    backups: [],
  },
}

export default function SpreadsheetPage({ params }: { params: { id: string } }) {
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [rowCount] = useState(20)
  const [colCount] = useState(7)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [customSettings, setCustomSettings] = useState<SpreadsheetSettings>(DEFAULT_SETTINGS)
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [backups, setBackups] = useState<Backup[]>([])
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [backupName, setBackupName] = useState("")
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [showBackupList, setShowBackupList] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const cellRefs = useRef<Record<string, HTMLDivElement>>({})
  const autoBackupIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Hücre ID'sini satır ve sütun numarasına çevirme
  const parseCellId = (cellId: string): [number, number] => {
    const [row, col] = cellId.split("-").map(Number)
    return [row, col]
  }

  // Satır ve sütun numarasını hücre ID'sine çevirme
  const getCellId = (row: number, col: number): string => {
    return `${row}-${col}`
  }

  // Aktif hücreyi değiştirme
  const changeActiveCell = useCallback(
    (rowDelta: number, colDelta: number) => {
      if (!activeCell) return

      const [currentRow, currentCol] = parseCellId(activeCell)
      const newRow = Math.max(1, Math.min(rowCount, currentRow + rowDelta))
      const newCol = Math.max(1, Math.min(colCount, currentCol + colDelta))

      const newCellId = getCellId(newRow, newCol)
      setActiveCell(newCellId)

      // Yeni hücreye odaklan
      setTimeout(() => {
        if (cellRefs.current[newCellId]) {
          cellRefs.current[newCellId].focus()
        }
      }, 0)
    },
    [activeCell, rowCount, colCount],
  )

  // Klavye olaylarını dinleme
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!activeCell) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          changeActiveCell(-1, 0)
          break
        case "ArrowDown":
          e.preventDefault()
          changeActiveCell(1, 0)
          break
        case "ArrowLeft":
          e.preventDefault()
          changeActiveCell(0, -1)
          break
        case "ArrowRight":
          e.preventDefault()
          changeActiveCell(0, 1)
          break
        case "Tab":
          e.preventDefault()
          changeActiveCell(0, e.shiftKey ? -1 : 1)
          break
        case "Enter":
          e.preventDefault()
          changeActiveCell(1, 0)
          break
      }
    },
    [activeCell, changeActiveCell],
  )

  // Otomatik yedekleme
  const createBackup = useCallback(
    (name?: string) => {
      if (!spreadsheet) return

      const timestamp = new Date().toISOString()
      const newBackup: Backup = {
        id: `backup-${Date.now()}`,
        timestamp,
        data: { ...spreadsheet.data },
        name,
      }

      const updatedBackups = [...(spreadsheet.backups || []), newBackup]

      // En fazla 10 yedek tutma
      if (updatedBackups.length > 10) {
        updatedBackups.shift()
      }

      setSpreadsheet({
        ...spreadsheet,
        backups: updatedBackups,
      })

      setBackups(updatedBackups)
      setLastBackupTime(timestamp)

      // LocalStorage'a yedekleri kaydet
      try {
        localStorage.setItem(`spreadsheet-backups-${spreadsheet.id}`, JSON.stringify(updatedBackups))
      } catch (error) {
        console.error("Yedekleme hatası:", error)
      }

      return newBackup
    },
    [spreadsheet],
  )

  // Otomatik yedekleme zamanlayıcısı
  const setupAutoBackup = useCallback(() => {
    if (autoBackupIntervalRef.current) {
      clearInterval(autoBackupIntervalRef.current)
    }

    if (autoBackupEnabled) {
      // 5 dakikada bir otomatik yedekleme
      autoBackupIntervalRef.current = setInterval(
        () => {
          const backup = createBackup("Otomatik Yedek")
          if (backup) {
            toast({
              title: "Otomatik Yedekleme",
              description: "E-tablo verileri otomatik olarak yedeklendi.",
              duration: 3000,
            })
          }
        },
        5 * 60 * 1000,
      ) // 5 dakika
    }
  }, [autoBackupEnabled, createBackup])

  // Yedeği geri yükleme
  const restoreBackup = (backup: Backup) => {
    if (!spreadsheet || !backup) return

    // Mevcut durumu yedekle
    createBackup("Geri Yükleme Öncesi")

    setSpreadsheet({
      ...spreadsheet,
      data: { ...backup.data },
      updatedAt: new Date().toISOString(),
    })

    setShowBackupList(false)
    setSelectedBackup(null)

    toast({
      title: "Yedek Geri Yüklendi",
      description: `${backup.name || formatDate(backup.timestamp)} yedeği başarıyla geri yüklendi.`,
      duration: 3000,
    })
  }

  // Manuel yedekleme
  const handleManualBackup = () => {
    setBackupName("")
    setShowBackupDialog(true)
  }

  // Yedekleme işlemini tamamla
  const completeBackup = () => {
    const backup = createBackup(backupName || `Manuel Yedek ${new Date().toLocaleTimeString()}`)
    setShowBackupDialog(false)

    if (backup) {
      toast({
        title: "Yedekleme Başarılı",
        description: "E-tablo verileri başarıyla yedeklendi.",
        duration: 3000,
      })
    }
  }

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Zaman farkı formatı
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)

    if (diffMin < 1) {
      return "Az önce"
    } else if (diffMin < 60) {
      return `${diffMin} dakika önce`
    } else {
      const diffHour = Math.floor(diffMin / 60)
      if (diffHour < 24) {
        return `${diffHour} saat önce`
      } else {
        const diffDay = Math.floor(diffHour / 24)
        return `${diffDay} gün önce`
      }
    }
  }

  useEffect(() => {
    console.log("E-tablo sayfası yükleniyor, ID:", params.id)

    // E-tablo erişim kontrolü
    const accessData = localStorage.getItem("spreadsheet-access")
    if (!accessData) {
      console.log("❌ E-tablo erişim izni yok")
      router.push(`/spreadsheet-login/${params.id}`)
      return
    }

    const access = JSON.parse(accessData)
    if (access.spreadsheetId !== params.id) {
      console.log("❌ Farklı e-tablo erişim izni")
      router.push(`/spreadsheet-login/${params.id}`)
      return
    }

    // E-tablo verilerini yükle
    const sheet = SAMPLE_SPREADSHEETS[params.id]
    if (sheet) {
      console.log("✅ E-tablo bulundu:", sheet.name)

      // LocalStorage'dan yedekleri yükle
      try {
        const savedBackups = localStorage.getItem(`spreadsheet-backups-${sheet.id}`)
        if (savedBackups) {
          const parsedBackups = JSON.parse(savedBackups) as Backup[]
          sheet.backups = parsedBackups
          setBackups(parsedBackups)

          if (parsedBackups.length > 0) {
            setLastBackupTime(parsedBackups[parsedBackups.length - 1].timestamp)
          }
        }
      } catch (error) {
        console.error("Yedekleri yükleme hatası:", error)
      }

      setSpreadsheet(sheet)
      setCustomSettings(sheet.settings)
    } else {
      console.log("❌ E-tablo bulunamadı:", params.id)
      alert("E-tablo bulunamadı")
      router.push("/")
    }

    setLoading(false)

    // Klavye olaylarını dinle
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)

      // Zamanlayıcıyı temizle
      if (autoBackupIntervalRef.current) {
        clearInterval(autoBackupIntervalRef.current)
      }
    }
  }, [params.id, router, handleKeyDown])

  // Otomatik yedekleme zamanlayıcısını ayarla
  useEffect(() => {
    setupAutoBackup()

    return () => {
      if (autoBackupIntervalRef.current) {
        clearInterval(autoBackupIntervalRef.current)
      }
    }
  }, [autoBackupEnabled, setupAutoBackup])

  const handleCellClick = (cellId: string) => {
    setActiveCell(cellId)
    setTimeout(() => {
      if (cellRefs.current[cellId]) {
        cellRefs.current[cellId].focus()
      }
    }, 0)
  }

  const handleCellChange = (cellId: string, value: string) => {
    if (spreadsheet) {
      const newData = { ...spreadsheet.data }
      newData[cellId] = {
        value,
        type: !isNaN(Number(value)) ? "number" : "text",
      }

      setSpreadsheet({
        ...spreadsheet,
        data: newData,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const handleCellBlur = () => {
    // Aktif hücreyi sıfırlama - bunu kaldırdık çünkü ok tuşları ile gezinme için aktif hücreyi tutmamız gerekiyor
    // setActiveCell(null)
  }

  const saveSpreadsheet = () => {
    if (!spreadsheet) return

    setSaving(true)

    // Kaydetmeden önce yedek al
    createBackup("Kaydetme Öncesi")

    setTimeout(() => {
      SAMPLE_SPREADSHEETS[spreadsheet.id] = {
        ...spreadsheet,
        settings: customSettings,
        updatedAt: new Date().toISOString(),
      }

      toast({
        title: "Başarıyla Kaydedildi",
        description: "E-tablo verileri başarıyla kaydedildi.",
        duration: 3000,
      })

      setSaving(false)
    }, 500)
  }

  const clearSpreadsheet = () => {
    if (!spreadsheet) return

    // Temizlemeden önce yedek al
    createBackup("Temizleme Öncesi")

    // Tüm verileri temizle (başlık satırı dahil)
    setSpreadsheet({
      ...spreadsheet,
      data: {},
      updatedAt: new Date().toISOString(),
    })

    setShowClearDialog(false)

    toast({
      title: "E-tablo Temizlendi",
      description: "E-tablo verileri tamamen temizlendi.",
      duration: 3000,
    })
  }

  const testSettings = () => {
    if (spreadsheet) {
      setSpreadsheet({
        ...spreadsheet,
        settings: customSettings,
      })
    }
  }

  const saveSettings = () => {
    if (spreadsheet) {
      setSpreadsheet({
        ...spreadsheet,
        settings: customSettings,
        updatedAt: new Date().toISOString(),
      })
      setShowColorPanel(false)

      toast({
        title: "Ayarlar Kaydedildi",
        description: "E-tablo renk ayarları başarıyla kaydedildi.",
        duration: 3000,
      })
    }
  }

  const resetSettings = () => {
    setCustomSettings(DEFAULT_SETTINGS)
    if (spreadsheet) {
      setSpreadsheet({
        ...spreadsheet,
        settings: DEFAULT_SETTINGS,
      })
    }
  }

  const getCellData = (cellId: string): Cell => {
    return spreadsheet?.data[cellId] || { value: "", type: "text" }
  }

  const getCellStyle = (rowIndex: number, colIndex: number) => {
    const settings = spreadsheet?.settings || DEFAULT_SETTINGS

    let backgroundColor = settings.backgroundColor

    // Başlık satırı
    if (rowIndex === 0) {
      backgroundColor = settings.headerColor
    }
    // Takım adı sütunu
    else if (colIndex === 0) {
      backgroundColor = settings.teamColumnColor
    }
    // Sıralama sütunları (1.Maç, 2.Maç, 3.Maç, 5.Maç)
    else if (colIndex >= 2) {
      backgroundColor = rowIndex % 2 === 0 ? settings.rankingColumnColor : settings.killColumnColor
    }

    return {
      backgroundColor,
      color: settings.textColor,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      fontStyle: settings.fontStyle,
      fontFamily: settings.fontFamily,
      borderColor: settings.borderColor,
    }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <div className="w-6 h-6 relative mr-2">
              <Image
                src="/images/tech-logo.png"
                alt="Tech Development Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <h1 className="font-semibold">{spreadsheet.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Yedekleme Butonu */}
            <Popover open={showBackupList} onOpenChange={setShowBackupList}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Yedekler</span>
                  {lastBackupTime && (
                    <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full hidden sm:inline">
                      {formatTimeAgo(lastBackupTime)}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Yedekler</h4>
                    <Button size="sm" variant="ghost" onClick={handleManualBackup}>
                      <Save className="w-4 h-4 mr-1" />
                      Yeni Yedek
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={autoBackupEnabled}
                      onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="autoBackup" className="text-sm">
                      Otomatik yedekleme (5 dakikada bir)
                    </Label>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pt-2">
                    {backups.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">Henüz yedek bulunmuyor.</p>
                    ) : (
                      [...backups].reverse().map((backup) => (
                        <div
                          key={backup.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                          onClick={() => setSelectedBackup(backup)}
                        >
                          <div>
                            <p className="text-sm font-medium">{backup.name || "Yedek"}</p>
                            <p className="text-xs text-gray-500">{formatDate(backup.timestamp)}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              restoreBackup(backup)
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Renk Özelleştirme */}
            <Sheet open={showColorPanel} onOpenChange={setShowColorPanel}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Renk Özelleştir</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>E-Tablo Renk Özelleştirme</SheetTitle>
                  <SheetDescription>E-tablonuzun görünümünü özelleştirin</SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="headerColor">Başlıkların Rengi:</Label>
                    <Input
                      id="headerColor"
                      type="color"
                      value={customSettings.headerColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, headerColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="teamColumnColor">Takım Sütun Rengi:</Label>
                    <Input
                      id="teamColumnColor"
                      type="color"
                      value={customSettings.teamColumnColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, teamColumnColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="rankingColumnColor">Sıralama Sütun Rengi:</Label>
                    <Input
                      id="rankingColumnColor"
                      type="color"
                      value={customSettings.rankingColumnColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, rankingColumnColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="killColumnColor">Leş Sütun Rengi:</Label>
                    <Input
                      id="killColumnColor"
                      type="color"
                      value={customSettings.killColumnColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, killColumnColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="backgroundColor">Arka Planının Rengi:</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={customSettings.backgroundColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, backgroundColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="buttonColor">Buton Rengi:</Label>
                    <Input
                      id="buttonColor"
                      type="color"
                      value={customSettings.buttonColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, buttonColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="textColor">Yazı Rengi:</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={customSettings.textColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, textColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="borderColor">Hücreler Arası Çizgi:</Label>
                    <Input
                      id="borderColor"
                      type="color"
                      value={customSettings.borderColor}
                      onChange={(e) => setCustomSettings({ ...customSettings, borderColor: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="fontFamily">Yazı Tipi:</Label>
                    <Select
                      value={customSettings.fontFamily}
                      onValueChange={(value) => setCustomSettings({ ...customSettings, fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="fontWeight">Yazı Kalınlığı:</Label>
                    <Select
                      value={customSettings.fontWeight}
                      onValueChange={(value) => setCustomSettings({ ...customSettings, fontWeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">İnce</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Orta</SelectItem>
                        <SelectItem value="600">Kalın</SelectItem>
                        <SelectItem value="700">Çok Kalın</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="fontStyle">Yazı Stili:</Label>
                    <Select
                      value={customSettings.fontStyle}
                      onValueChange={(value) => setCustomSettings({ ...customSettings, fontStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">İtalik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="fontSize">Yazı Boyutu:</Label>
                    <Select
                      value={customSettings.fontSize}
                      onValueChange={(value) => setCustomSettings({ ...customSettings, fontSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12px">12px</SelectItem>
                        <SelectItem value="14px">14px</SelectItem>
                        <SelectItem value="16px">16px</SelectItem>
                        <SelectItem value="18px">18px</SelectItem>
                        <SelectItem value="20px">20px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={testSettings} variant="outline" className="flex-1">
                    Test Et
                  </Button>
                  <Button onClick={saveSettings} className="flex-1">
                    Kaydet
                  </Button>
                  <Button onClick={resetSettings} variant="outline" className="flex-1">
                    Sıfırla
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Temizle Butonu */}
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Temizle</span>
            </Button>

            {/* Kaydet Butonu */}
            <Button onClick={saveSpreadsheet} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Klavye Kısayolları:</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <span className="inline-flex items-center justify-center h-6 w-6 border rounded mr-1">↑</span>
                <span>Yukarı</span>
              </div>
              <div>
                <span className="inline-flex items-center justify-center h-6 w-6 border rounded mr-1">↓</span>
                <span>Aşağı</span>
              </div>
              <div>
                <span className="inline-flex items-center justify-center h-6 w-6 border rounded mr-1">←</span>
                <span>Sol</span>
              </div>
              <div>
                <span className="inline-flex items-center justify-center h-6 w-6 border rounded mr-1">→</span>
                <span>Sağ</span>
              </div>
              <div>
                <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] border rounded mr-1">
                  Tab
                </span>
                <span>Sonraki hücre</span>
              </div>
              <div>
                <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] border rounded mr-1">
                  Enter
                </span>
                <span>Alt hücre</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="spreadsheet">
          <TabsList className="mb-4">
            <TabsTrigger value="spreadsheet">E-Tablo</TabsTrigger>
          </TabsList>

          <TabsContent value="spreadsheet">
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className="border p-2 text-center w-12"
                      style={{
                        ...getCellStyle(0, -1),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      #
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 0),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      Takım İsmi
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 1),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      Takım Tagı
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 2),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      1.Maç
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 3),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      2.Maç
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 4),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      3.Maç
                    </th>
                    <th
                      className="border p-2 text-center min-w-32"
                      style={{
                        ...getCellStyle(0, 5),
                        borderColor: spreadsheet.settings.borderColor,
                      }}
                    >
                      5.Maç
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      <td
                        className="border p-2 text-center font-semibold"
                        style={{
                          ...getCellStyle(rowIndex + 1, -1),
                          borderColor: spreadsheet.settings.borderColor,
                        }}
                      >
                        {rowIndex + 1}
                      </td>
                      {Array.from({ length: colCount }).map((_, colIndex) => {
                        const cellId = `${rowIndex + 1}-${colIndex + 1}`
                        const cellData = getCellData(cellId)
                        const isActive = activeCell === cellId

                        return (
                          <td
                            key={cellId}
                            className="border p-0 relative"
                            style={{
                              borderColor: spreadsheet.settings.borderColor,
                            }}
                          >
                            <div
                              ref={(el) => {
                                if (el) cellRefs.current[cellId] = el
                              }}
                              className={`w-full h-full p-2 outline-none ${isActive ? "ring-2 ring-blue-500" : ""}`}
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onClick={() => handleCellClick(cellId)}
                              onBlur={handleCellBlur}
                              onInput={(e) => handleCellChange(cellId, e.currentTarget.textContent || "")}
                              style={{
                                ...getCellStyle(rowIndex + 1, colIndex),
                                minWidth: "120px",
                                minHeight: "32px",
                              }}
                              tabIndex={0}
                            >
                              {cellData.value}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Temizleme Onay Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              E-Tablo Verilerini Temizle
            </DialogTitle>
            <DialogDescription>
              Bu işlem, başlık satırı dahil tüm e-tablo verilerini silecektir. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={clearSpreadsheet}>
              <Trash2 className="w-4 h-4 mr-2" />
              Tümünü Temizle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manuel Yedekleme Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Yeni Yedek Oluştur
            </DialogTitle>
            <DialogDescription>
              Mevcut e-tablo verilerinizin bir yedeğini oluşturun. İsterseniz yedek için bir isim belirleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="backupName" className="text-sm font-medium">
              Yedek İsmi (Opsiyonel)
            </Label>
            <Input
              id="backupName"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="Örn: Turnuva Öncesi Yedek"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              İptal
            </Button>
            <Button onClick={completeBackup}>
              <Save className="w-4 h-4 mr-2" />
              Yedekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Yedek Geri Yükleme Dialog */}
      <Dialog open={!!selectedBackup} onOpenChange={(open) => !open && setSelectedBackup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-500" />
              Yedeği Geri Yükle
            </DialogTitle>
            <DialogDescription>
              {selectedBackup?.name || formatDate(selectedBackup?.timestamp || "")} tarihli yedeği geri yüklemek
              istediğinizden emin misiniz? Mevcut verileriniz kaybolacaktır.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBackup(null)}>
              İptal
            </Button>
            <Button onClick={() => selectedBackup && restoreBackup(selectedBackup)}>
              <Check className="w-4 h-4 mr-2" />
              Geri Yükle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
