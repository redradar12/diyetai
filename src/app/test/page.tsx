import Link from 'next/link';
import { User, Lock, Eye, ArrowRight } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Hesabı
            </h1>
            <p className="text-gray-600">
              DiyetAI platformunu test etmek için hazır hesap
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Giriş Bilgileri
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    E-posta
                  </label>
                  <div className="bg-white border border-green-300 rounded-lg p-3 font-mono text-sm">
                    test@diyetai.com
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Şifre
                  </label>
                  <div className="bg-white border border-green-300 rounded-lg p-3 font-mono text-sm">
                    123456
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Test Verileri
              </h3>
              
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• <strong>Diyetisyen:</strong> Test Diyetisyen</li>
                <li>• <strong>Uzmanlık:</strong> Klinik Beslenme</li>
                <li>• <strong>Plan:</strong> Premium (30 gün)</li>
                <li>• <strong>Danışanlar:</strong> 2 adet örnek danışan</li>
                <li>• <strong>Randevular:</strong> 2 adet test randevusu</li>
                <li>• <strong>Menüler:</strong> 1 adet örnek menü</li>
                <li>• <strong>İçerikler:</strong> 1 adet blog yazısı</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link 
                href="/giris"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                Giriş Yap
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link 
                href="/"
                className="w-full border-2 border-green-600 text-green-600 py-3 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center block"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Not:</strong> Bu test hesabıdır.
              </p>
              <p className="text-xs text-gray-500">
                Gerçek veriler kullanılmamaktadır. Tüm bilgiler örnek amaçlıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
