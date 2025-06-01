import { Database } from "croxydb"
import { v4 as uuidv4 } from "uuid"

// Veritabanı bağlantıları
const usersDb = new Database("./data/users.json")
const spreadsheetsDb = new Database("./data/spreadsheets.json")
const sessionsDb = new Database("./data/sessions.json")

// Kullanıcı tipi
export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
}

// Session tipi
export interface Session {
  id: string
  userId: string
  token: string
  createdAt: string
  expiresAt: string
}

// E-tablo hücre tipi
export interface Cell {
  value: any
  type: "text" | "number" | "json" | "formula"
}

// E-tablo kullanıcısı
export interface SpreadsheetUser {
  username: string
  password: string
}

// E-tablo tipi
export interface Spreadsheet {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: Record<string, Cell>
  users: SpreadsheetUser[] // Her e-tablo için özel kullanıcılar
  settings: {
    headerColor?: string
    rowColor?: string
    alternateRowColor?: string
    textColor?: string
    fontSize?: string
    cellPadding?: string
  }
}

// Kullanıcı işlemleri
export const userOperations = {
  // Tüm kullanıcıları getir
  getAll: (): User[] => {
    try {
      return usersDb.get("users") || []
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error)
      return []
    }
  },

  // ID ile kullanıcı getir
  getById: (id: string): User | null => {
    const users = userOperations.getAll()
    return users.find((user) => user.id === id) || null
  },

  // Kullanıcı adı ile kullanıcı getir
  getByUsername: (username: string): User | null => {
    const users = userOperations.getAll()
    const user = users.find((user) => user.username === username) || null
    console.log("Kullanıcı arama sonucu:", username, user ? "bulundu" : "bulunamadı")
    return user
  },

  // Yeni kullanıcı oluştur
  create: (username: string, password: string, role: "admin" | "user" = "user"): User => {
    try {
      console.log("Yeni kullanıcı oluşturuluyor:", username, role)
      const users = userOperations.getAll()

      // Kullanıcı adı kontrolü
      if (users.some((user) => user.username === username)) {
        throw new Error("Bu kullanıcı adı zaten kullanılıyor")
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        password, // Gerçek uygulamada hash'lenmeli
        role,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      usersDb.set("users", users)
      console.log("Kullanıcı başarıyla oluşturuldu:", username)

      return newUser
    } catch (error) {
      console.error("Kullanıcı oluşturma hatası:", error)
      throw error
    }
  },

  // Şifre doğrula
  validatePassword: (user: User, password: string): boolean => {
    console.log("Şifre doğrulanıyor...")
    const isValid = user.password === password
    console.log("Şifre doğrulama sonucu:", isValid)
    return isValid
  },

  // Test kullanıcılarını oluştur
  initTestUsers: () => {
    try {
      console.log("Test kullanıcıları kontrol ediliyor...")
      const users = userOperations.getAll()

      // Test kullanıcıları zaten varsa çık
      if (users.length > 0) {
        console.log("Test kullanıcıları zaten mevcut")
        return
      }

      // Test kullanıcılarını oluştur
      const testUsers: User[] = [
        {
          id: "admin-1",
          username: "admin",
          password: "admin123",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "user-1",
          username: "TechUser",
          password: "techdev123",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ]

      usersDb.set("users", testUsers)
      console.log("Test kullanıcıları oluşturuldu")
    } catch (error) {
      console.error("Test kullanıcıları oluşturma hatası:", error)
    }
  },
}

// Session işlemleri
export const sessionOperations = {
  // Session oluştur
  create: (userId: string): string => {
    try {
      const sessions = sessionsDb.get("sessions") || []
      const token = uuidv4()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 gün

      const newSession: Session = {
        id: uuidv4(),
        userId,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      }

      sessions.push(newSession)
      sessionsDb.set("sessions", sessions)

      console.log("Session oluşturuldu:", token)
      return token
    } catch (error) {
      console.error("Session oluşturma hatası:", error)
      throw error
    }
  },

  // Session doğrula
  validate: (token: string): User | null => {
    try {
      const sessions = sessionsDb.get("sessions") || []
      const session = sessions.find((s: Session) => s.token === token)

      if (!session) {
        console.log("Session bulunamadı")
        return null
      }

      // Süre kontrolü
      if (new Date() > new Date(session.expiresAt)) {
        console.log("Session süresi dolmuş")
        sessionOperations.delete(token)
        return null
      }

      // Kullanıcıyı getir
      const user = userOperations.getById(session.userId)
      console.log("Session doğrulandı:", user?.username)
      return user
    } catch (error) {
      console.error("Session doğrulama hatası:", error)
      return null
    }
  },

  // Session sil
  delete: (token: string): void => {
    try {
      const sessions = sessionsDb.get("sessions") || []
      const filteredSessions = sessions.filter((s: Session) => s.token !== token)
      sessionsDb.set("sessions", filteredSessions)
      console.log("Session silindi")
    } catch (error) {
      console.error("Session silme hatası:", error)
    }
  },
}

// E-tablo işlemleri
export const spreadsheetOperations = {
  // Tüm e-tabloları getir
  getAll: (): Spreadsheet[] => {
    try {
      return spreadsheetsDb.get("spreadsheets") || []
    } catch (error) {
      console.error("E-tablolar yüklenirken hata:", error)
      return []
    }
  },

  // ID ile e-tablo getir
  getById: (id: string): Spreadsheet | null => {
    try {
      const spreadsheets = spreadsheetOperations.getAll()
      return spreadsheets.find((sheet: Spreadsheet) => sheet.id === id) || null
    } catch (error) {
      console.error("E-tablo yüklenirken hata:", error)
      return null
    }
  },

  // E-tablo erişim kontrolü
  validateAccess: (spreadsheetId: string, username: string, password: string): boolean => {
    try {
      const spreadsheet = spreadsheetOperations.getById(spreadsheetId)
      if (!spreadsheet) return false

      return spreadsheet.users.some((user) => user.username === username && user.password === password)
    } catch (error) {
      console.error("E-tablo erişim kontrolü hatası:", error)
      return false
    }
  },

  // Yeni e-tablo oluştur (sadece admin)
  create: (name: string, users: SpreadsheetUser[]): Spreadsheet => {
    try {
      const spreadsheets = spreadsheetOperations.getAll()
      const now = new Date().toISOString()

      const newSpreadsheet: Spreadsheet = {
        id: uuidv4(),
        name,
        createdAt: now,
        updatedAt: now,
        data: {},
        users,
        settings: {
          headerColor: "#f3f4f6",
          rowColor: "#ffffff",
          alternateRowColor: "#f9fafb",
          textColor: "#111827",
          fontSize: "14px",
          cellPadding: "8px",
        },
      }

      spreadsheets.push(newSpreadsheet)
      spreadsheetsDb.set("spreadsheets", spreadsheets)

      console.log("E-tablo oluşturuldu:", name)
      return newSpreadsheet
    } catch (error) {
      console.error("E-tablo oluşturma hatası:", error)
      throw error
    }
  },

  // E-tablo güncelle
  update: (id: string, updates: Partial<Spreadsheet>): Spreadsheet | null => {
    try {
      const spreadsheets = spreadsheetOperations.getAll()
      const index = spreadsheets.findIndex((sheet: Spreadsheet) => sheet.id === id)

      if (index === -1) {
        throw new Error("E-tablo bulunamadı")
      }

      const updatedSpreadsheet = {
        ...spreadsheets[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      spreadsheets[index] = updatedSpreadsheet
      spreadsheetsDb.set("spreadsheets", spreadsheets)

      console.log("E-tablo güncellendi:", id)
      return updatedSpreadsheet
    } catch (error) {
      console.error("E-tablo güncelleme hatası:", error)
      return null
    }
  },

  // Hücre güncelle
  updateCell: (id: string, cellId: string, cellData: Cell): Spreadsheet | null => {
    try {
      const spreadsheets = spreadsheetOperations.getAll()
      const index = spreadsheets.findIndex((sheet: Spreadsheet) => sheet.id === id)

      if (index === -1) {
        throw new Error("E-tablo bulunamadı")
      }

      spreadsheets[index].data[cellId] = cellData
      spreadsheets[index].updatedAt = new Date().toISOString()

      spreadsheetsDb.set("spreadsheets", spreadsheets)

      console.log("Hücre güncellendi:", cellId)
      return spreadsheets[index]
    } catch (error) {
      console.error("Hücre güncelleme hatası:", error)
      return null
    }
  },

  // E-tablo sil (sadece admin)
  delete: (id: string): boolean => {
    try {
      const spreadsheets = spreadsheetOperations.getAll()
      const filteredSpreadsheets = spreadsheets.filter((sheet: Spreadsheet) => sheet.id !== id)
      spreadsheetsDb.set("spreadsheets", filteredSpreadsheets)

      console.log("E-tablo silindi:", id)
      return true
    } catch (error) {
      console.error("E-tablo silme hatası:", error)
      return false
    }
  },

  // Test e-tablolarını oluştur
  initTestSpreadsheets: () => {
    try {
      console.log("Test e-tabloları kontrol ediliyor...")
      const spreadsheets = spreadsheetOperations.getAll()

      if (spreadsheets.length > 0) {
        console.log("Test e-tabloları zaten mevcut")
        return
      }

      // Test e-tablosu oluştur
      const testSpreadsheet = spreadsheetOperations.create("Tech E-Tablo", [
        { username: "tech", password: "tech123" },
        { username: "dev", password: "dev123" },
      ])

      // Test verilerini ekle
      spreadsheetOperations.updateCell(testSpreadsheet.id, "1-1", { value: "Takım Adı", type: "text" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "1-2", { value: "Tag", type: "text" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "1-3", { value: "Puan", type: "text" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "1-4", { value: "Durum", type: "text" })

      spreadsheetOperations.updateCell(testSpreadsheet.id, "2-1", { value: "", type: "text" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "2-2", { value: "", type: "text" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "2-3", { value: "", type: "number" })
      spreadsheetOperations.updateCell(testSpreadsheet.id, "2-4", { value: "", type: "text" })

      console.log("Test e-tabloları oluşturuldu")
    } catch (error) {
      console.error("Test e-tabloları oluşturma hatası:", error)
    }
  },
}

// Başlangıç verilerini oluştur
console.log("CroxyDB başlatılıyor...")
userOperations.initTestUsers()
spreadsheetOperations.initTestSpreadsheets()
console.log("CroxyDB başlatıldı")

export { userOperations as userDb, spreadsheetOperations as spreadsheetDb }
