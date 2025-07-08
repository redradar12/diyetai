import Link from "next/link";
import { ArrowRight, Brain, Users, Calendar, FileText, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-green-600">AI Destekli</span> Diyetisyen
              <br />
              <span className="text-blue-600">Asistan Platformu</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Danışanlarınız için kişiselleştirilmiş menüler oluşturun, 
              içerik üretin ve randevularınızı yönetin. Tümü AI desteğiyle!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/kayit"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Ücretsiz Başlayın
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/giris"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Giriş Yapın
              </Link>
            </div>
            
            {/* Test Hesabı Linki */}
            <div className="mt-4 text-center">
              <Link 
                href="/test"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                🧪 Test Hesabı ile Deneyin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Diyetisyen İşinizi Kolaylaştırın
            </h2>
            <p className="text-xl text-gray-600">
              AI teknolojisiyle zaman kazanın, daha fazla danışana ulaşın
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Menü Oluşturucu
              </h3>
              <p className="text-gray-600">
                Danışan bilgilerine göre kişiselleştirilmiş menüler saniyeler içinde
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Danışan Yönetimi
              </h3>
              <p className="text-gray-600">
                Tüm danışan bilgilerini tek yerden takip edin ve yönetin
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Randevu Sistemi
              </h3>
              <p className="text-gray-600">
                Randevularınızı planlayın, hatırlatmalar gönderin
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                İçerik Üretici
              </h3>
              <p className="text-gray-600">
                Blog yazıları ve sosyal medya içerikleri AI ile oluşturun
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problems & Solutions */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sorunlarınıza Çözüm
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-xl font-semibold text-gray-900">Zaman Problemi</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Her danışan için özel menü hazırlamak saatler alıyor
              </p>
              <div className="flex items-center text-green-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-medium">AI ile saniyeler içinde kişisel menüler</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-xl font-semibold text-gray-900">İçerik Üretme Zorluğu</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Blog ve sosyal medya için sürekli içerik üretmek yorucu
              </p>
              <div className="flex items-center text-green-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-medium">Otomatik içerik üretimi ve paylaşım</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-xl font-semibold text-gray-900">Dağınık Bilgiler</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Danışan bilgileri ve randevular farklı yerlerde
              </p>
              <div className="flex items-center text-green-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-medium">Merkezi panel ve otomatik hatırlatmalar</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-xl font-semibold text-gray-900">Sürekli Sorular</h3>
              </div>
              <p className="text-gray-600 mb-4">
                WhatsApp&apos;tan gelen benzer sorulara cevap vermek zor
              </p>
              <div className="flex items-center text-green-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="font-medium">Otomatik yanıtlar ve chatbot desteği</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Basit Fiyatlandırma
            </h2>
            <p className="text-xl text-gray-600">
              İhtiyacınıza göre plan seçin, istediğiniz zaman değiştirin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Ücretsiz Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ücretsiz</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₺0<span className="text-lg text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  3 danışan
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  5 AI menü
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Temel randevu sistemi
                </li>
              </ul>
              <Link
                href="/kayit"
                className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors block text-center"
              >
                Başlayın
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-green-500 rounded-xl p-8 relative bg-green-50">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Popüler
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₺149<span className="text-lg text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Sınırsız danışan
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Sınırsız AI menü
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  İçerik üretici
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Gelişmiş raporlar
                </li>
              </ul>
              <Link
                href="/kayit"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors block text-center"
              >
                Şimdi Başlayın
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₺299<span className="text-lg text-gray-600">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Tüm Premium özellikler
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  WhatsApp entegrasyonu
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  API erişimi
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Öncelikli destek
                </li>
              </ul>
              <Link
                href="/kayit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center"
              >
                Pro&apos;ya Geçin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">DiyetAI</h3>
            <p className="text-gray-400 mb-6">
              Türkiye&apos;nin diyetisyenler için özel AI asistan platformu
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/gizlilik" className="text-gray-400 hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim" className="text-gray-400 hover:text-white transition-colors">
                Kullanım Şartları
              </Link>
              <Link href="/iletisim" className="text-gray-400 hover:text-white transition-colors">
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
