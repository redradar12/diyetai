// Admin API endpoint'ini test etmek için script

async function testAdminAPI() {
  try {
    console.log('🔍 Admin API endpoint test ediliyor...');
    
    // Production URL'ini kullan
    const baseUrl = 'https://diyetai-tau.vercel.app';
    const adminEmail = 'admin@test.com';
    
    // Test token (gerçek uygulamada JWT kullanılmalı)
    const testToken = 'test-admin-token';
    
    console.log(`📡 API URL: ${baseUrl}/api/admin/users?email=${encodeURIComponent(adminEmail)}`);
    
    const response = await fetch(`${baseUrl}/api/admin/users?email=${encodeURIComponent(adminEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Başarılı:', data);
      console.log('👥 Kullanıcı Sayısı:', data.users?.length || 0);
    } else {
      const errorText = await response.text();
      console.log('❌ API Hatası:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('🚨 Network Hatası:', error.message);
  }
}

// Test çalıştır
testAdminAPI();
