"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, HelpCircle, Users, Settings, Smartphone } from "lucide-react"
import Image from "next/image"

export default function HelpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => router.push("/login")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Tech Organization Giriş</p>
                <p className="text-xs text-gray-600">https://tech.dev</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 relative">
                <Image
                  src="/images/tech-logo.png"
                  alt="Tech Development Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-2xl">Tech E-Tablo</CardTitle>
                <p className="text-sm text-gray-600">DOĞRULAMA SİSTEMİ</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => router.push("/login")}>
                  E-Tablo Giriş
                </TabsTrigger>
                <TabsTrigger value="help">E-Tablo Yardım</TabsTrigger>
              </TabsList>

              <TabsContent value="help" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      E-Tablo Yardım
                    </h2>
                    <p className="text-gray-600">
                      E-Tablo Yardım seçeneğiyle E-Tablo ile ilgili karşılaşabileceğiniz sorular ve yanıtları burada
                      bulabilirsiniz.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Soru 1 */}
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          E-Tabloyu kimler kullanabilir?
                        </h3>
                        <p className="text-sm text-gray-700">
                          E-Tabloyu, yalnızca hesabı olan ve yetkilendirilmiş kullanıcılar kullanabilir. Eğer hesabınız
                          yoksa, sisteme giriş yapamazsınız.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Soru 2 */}
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Hesap nasıl oluşturulur?
                        </h3>
                        <p className="text-sm text-gray-700">
                          Hesap oluşturmak için gerekli yetkiye sahipseniz, komut üzerinden kendinize hesap
                          oluşturabilirsiniz.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Soru 3 */}
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Hesap bilgilerini nasıl güncelleyebilirim?
                        </h3>
                        <p className="text-sm text-gray-700">
                          Hesabınızı tanımladığınız komut üzerinden şifrenizi ve diğer bilgilerinizi görüntüleyebilir
                          veya güncelleyebilirsiniz.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Soru 4 */}
                    <Card className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          E-Tablo verilerine nasıl erişebilirim?
                        </h3>
                        <p className="text-sm text-gray-700">
                          E-Tablo verilerine erişmek için önce sisteme giriş yapmanız, ardından size atanmış e-tablolar
                          için özel kullanıcı adı ve şifrenizi kullanmanız gerekir.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Soru 5 */}
                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Admin yetkilerim nelerdir?
                        </h3>
                        <p className="text-sm text-gray-700">
                          Admin hesabıyla yeni e-tablolar oluşturabilir, mevcut e-tabloları silebilir, kullanıcı
                          erişimlerini yönetebilir ve sistem ayarlarını değiştirebilirsiniz.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mobil Uygulama Bilgisi */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-blue-800 mb-2">Mobil Erişim</h3>
                          <p className="text-sm text-blue-700">
                            E-Tabloya daha hızlı ve pratik bir şekilde erişmek için Tech App mobil uygulamasını da
                            kullanabilirsiniz. Uygulama sayesinde tablolarınıza kolayca erişebilir, güncellemelerden
                            anında haberdar olabilir ve işlemlerinizi her yerden hızlıca gerçekleştirebilirsiniz.
                          </p>
                          <p className="text-sm font-medium text-blue-800 mt-2">
                            Uygulamayı indirmek için buraya tıklayın
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Giriş Butonu */}
                  <div className="text-center pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-2" onClick={() => router.push("/login")}>
                      E-Tablo Giriş Sayfasına Dön
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Tech Development. Tüm Hakları Saklıdır © 2023</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-blue-600">
              Gizlilik Politikası
            </a>
            <a href="#" className="hover:text-blue-600">
              Hizmet Şartları
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
