// Client-side auth yardımcısı
export const clientAuth = {
  // Token'ı localStorage'a kaydet
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  },

  // Token'ı localStorage'dan al
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },

  // Token'ı localStorage'dan sil
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  },

  // Kullanıcı bilgilerini localStorage'a kaydet
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
  },

  // Kullanıcı bilgilerini localStorage'dan al
  getUser: () => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user")
      if (userJson) {
        return JSON.parse(userJson)
      }
    }
    return null
  },

  // Kullanıcı bilgilerini localStorage'dan sil
  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
  },

  // Çıkış yap
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  // Giriş yapılmış mı kontrol et
  isLoggedIn: (): boolean => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token")
    }
    return false
  },
}
