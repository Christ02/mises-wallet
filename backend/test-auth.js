import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/auth';

async function testLogin() {
  try {
    console.log('🔍 Probando login...\n');
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ufm.edu',
        password: 'Admin123!'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login exitoso!');
    } else {
      console.log('\n❌ Error en login');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();

