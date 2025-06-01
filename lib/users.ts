// Basit kullanıcı veritabanı
export interface User {
  id: string
  username: string
  password: string
  createdAt: string
}

// Test kullanıcıları
const users: User[] = [
  {
    id: "user-1",
    username: "Tech",
    password: "techdev123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    username: "admin",
    password: "admin123",
    createdAt: new Date().toISOString(),
  },
]

export const userDb = {
  getByUsername: (username: string): User | undefined => {
    console.log("Kullanıcı aranıyor:", username)
    const user = users.find((u) => u.username === username)
    console.log("Kullanıcı bulundu mu:", !!user)
    return user
  },

  validatePassword: (user: User, password: string): boolean => {
    console.log("Şifre doğrulanıyor")
    // Basit şifre kontrolü (gerçek uygulamada hash kullanılmalı)
    const isValid = user.password === password
    console.log("Şifre doğru mu:", isValid)
    return isValid
  },
}
