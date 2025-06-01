"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Users, Settings, Eye, BarChart3, Database } from "lucide-react"
import { clientAuth } from "@/lib/client-auth"
import Image from "next/image"

// Organizasyon tipi
interface Organization {
  id: string
  name: string
  logo: string
  description: string
  spreadsheetCount: number
  userCount: number
}

// E-tablo tipi
interface Spreadsheet {
  id: string
  name: string
  organizationId: string
  createdAt: string
  updatedAt: string
  users: { username: string; password: string }[]
}

// Kullanıcı tipi
interface User {
  id: string
  username: string
  email: string
  role: string
  organizationId: string
  lastLogin: string
}

// Örnek organizasyon verileri
const ORGANIZATIONS: Organization[] = [
  {
    id: "org-a",
    name: "Alpha Organization",
    logo: "/images/tech-logo.png",
    description: "Alpha Organization turnuva ve etkinlikleri",
    spreadsheetCount: 2,
    userCount: 5,
  },
  {
    id: "org-b",
    name: "Beta Organization",
    logo: "/images/tech-logo.png",
    description: "Beta Organization turnuva ve etkinlikleri",
    spreadsheetCount: 1,
    userCount: 3,
  },
]

// Örnek e-tablo verileri
const SAMPLE_SPREADSHEETS: Spreadsheet[] = [
  {
    id: "sheet-1",
    name: "Tech E-Tablo",
    organizationId: "org-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    users: [
      { username: "tech", password: "tech123" },
      { username: "dev", password: "dev123" },
    ],
  },
  {
    id: "sheet-2",
    name: "Alpha Organization E-Tablo",
    organizationId: "org-a",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    users: [
      { username: "alpha", password: "alpha123" },
      { username: "team", password: "team123" },
    ],
  },
  {
    id: "sheet-3",
    name: "Beta Organization E-Tablo",
    organizationId: "org-b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    users: [
      { username: "beta", password: "beta123" },
      { username: "squad", password: "squad123" },
    ],
  },
]

// Örnek kullanıcı verileri
const SAMPLE_USERS: User[] = [
  {
    id: "user-1",
    username: "tech_user",
    email: "tech@example.com",
    role: "user",
    organizationId: "org-a",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "user-2",
    username: "alpha_admin",
    email: "alpha@example.com",
    role: "admin",
    organizationId: "org-a",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-3",
    username: "beta_user",
    email: "beta@example.com",
    role: "user",
    organizationId: "org-b",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newOrgName, setNewOrgName] = useState("")
  const [newSpreadsheetName, setNewSpreadsheetName] = useState("")
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Admin kontrolü
    const user = clientAuth.getUser()
    if (!user || user.role !== "admin") {
      console.log("Admin yetkisi yok, login'e yönlendiriliyor")
      router.push("/login")
      return
    }

    // Verileri yükle
    setOrganizations(ORGANIZATIONS)
    setSpreadsheets(SAMPLE_SPREADSHEETS)
    setUsers(SAMPLE_USERS)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clientAuth.logout()
    router.push("/login")
  }

  const createOrganization = () => {
    if (!newOrgName.trim()) {
      alert("Organizasyon adı gereklidir")
      return
    }

    setCreating(true)

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      logo: "/images/tech-logo.png",
      description: `${newOrgName} turnuva ve etkinlikleri`,
      spreadsheetCount: 0,
      userCount: 0,
    }

    setOrganizations([...organizations, newOrg])
    setNewOrgName("")
    setCreating(false)

    alert("Organizasyon başarıyla oluşturuldu!")
  }

  const createSpreadsheet = () => {
    if (!newSpreadsheetName.trim() || !selectedOrgId || !newUsername.trim() || !newPassword.trim()) {
      alert("Tüm alanları doldurun")
      return
    }

    setCreating(true)

    const newSpreadsheet: Spreadsheet = {
      id: `sheet-${Date.now()}`,
      name: newSpreadsheetName,
      organizationId: selectedOrgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      users: [{ username: newUsername, password: newPassword }],
    }

    setSpreadsheets([...spreadsheets, newSpreadsheet])
    setNewSpreadsheetName("")
    setSelectedOrgId("")
    setNewUsername("")
    setNewPassword("")
    setCreating(false)

    alert("E-tablo başarıyla oluşturuldu!")
  }

  const deleteSpreadsheet = (id: string) => {
    if (confirm("Bu e-tabloyu silmek istediğinizden emin misiniz?")) {
      setSpreadsheets(spreadsheets.filter((sheet) => sheet.id !== id))
      alert("E-tablo silindi!")
    }
  }

  const deleteOrganization = (id: string) => {
    const orgSpreadsheets = spreadsheets.filter((sheet) => sheet.organizationId === id)
    if (orgSpreadsheets.length > 0) {
      alert("Bu organizasyona ait e-tablolar var. Önce e-tabloları silin.")
      return
    }

    if (confirm("Bu organizasyonu silmek istediğinizden emin misiniz?")) {
      setOrganizations(organizations.filter((org) => org.id !== id))
      alert("Organizasyon silindi!")
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) {
      return `${diffDay} gün önce`
    } else if (diffHour > 0) {
      return `${diffHour} saat önce`
    } else {
      return "Az önce"
    }
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
            <span className="font-semibold">Tech Development - Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/organizations")}>
              E-Tablolar
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tech Admin Panel</h1>
          <p className="text-gray-600">Organizasyon, e-tablo ve kullanıcı yönetimi</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Organizasyon</p>
                <p className="text-2xl font-bold">{organizations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam E-Tablo</p>
                <p className="text-2xl font-bold">{spreadsheets.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Oturum</p>
                <p className="text-2xl font-bold">
                  {
                    users.filter(
                      (user) => new Date().getTime() - new Date(user.lastLogin).getTime() < 24 * 60 * 60 * 1000,
                    ).length
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations">Organizasyonlar</TabsTrigger>
            <TabsTrigger value="spreadsheets">E-Tablolar</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            {/* Yeni Organizasyon Oluştur */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yeni Organizasyon Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Organizasyon adı"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={createOrganization} disabled={creating}>
                    {creating ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizasyon Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 relative">
                          <Image
                            src={org.logo || "/placeholder.svg"}
                            alt={org.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                        <span>{org.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOrganization(org.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>E-Tablolar: {spreadsheets.filter((s) => s.organizationId === org.id).length}</span>
                      <span>Kullanıcılar: {users.filter((u) => u.organizationId === org.id).length}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spreadsheets">
            {/* Yeni E-Tablo Oluştur */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yeni E-Tablo Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    type="text"
                    placeholder="E-Tablo adı"
                    value={newSpreadsheetName}
                    onChange={(e) => setNewSpreadsheetName(e.target.value)}
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                  >
                    <option value="">Organizasyon seçin</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="text"
                    placeholder="İlk kullanıcı adı"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="İlk kullanıcı şifresi"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Button className="mt-4" onClick={createSpreadsheet} disabled={creating}>
                  {creating ? "Oluşturuluyor..." : "E-Tablo Oluştur"}
                </Button>
              </CardContent>
            </Card>

            {/* E-Tablo Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spreadsheets.map((sheet) => {
                const org = organizations.find((o) => o.id === sheet.organizationId)
                return (
                  <Card key={sheet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{sheet.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSpreadsheet(sheet.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{org?.name}</Badge>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>Kullanıcılar: {sheet.users.length}</p>
                          <p>Son güncelleme: {formatTimeAgo(sheet.updatedAt)}</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              localStorage.setItem(
                                "spreadsheet-access",
                                JSON.stringify({
                                  spreadsheetId: sheet.id,
                                  username: "admin",
                                  loginTime: new Date().toISOString(),
                                }),
                              )
                              router.push(`/spreadsheet/${sheet.id}`)
                            }}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Düzenle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/live/${sheet.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Görüntüle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organizasyon
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Son Giriş</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const org = organizations.find((o) => o.id === user.organizationId)
                    const isOnline = new Date().getTime() - new Date(user.lastLogin).getTime() < 24 * 60 * 60 * 1000

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{org?.name}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatTimeAgo(user.lastLogin)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={isOnline ? "default" : "secondary"}>
                            {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
