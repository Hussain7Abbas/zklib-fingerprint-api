#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testConnection() {
  console.log('🔄 Testing Device Connection Endpoints...\n');

  try {
    // Test Connect
    console.log('1. Testing POST /connect');
    const connectResponse = await fetch(`${BASE_URL}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const connectData = await connectResponse.json();

    if (connectResponse.ok && connectData.success) {
      console.log('✅ Connect endpoint working');
      console.log(`   Response: ${connectData.message}\n`);
    } else {
      console.log('❌ Connect endpoint failed');
      console.log(`   Error: ${JSON.stringify(connectData, null, 2)}\n`);
      return;
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Disconnect
    console.log('2. Testing POST /disconnect');
    const disconnectResponse = await fetch(`${BASE_URL}/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const disconnectData = await disconnectResponse.json();

    if (disconnectResponse.ok && disconnectData.success) {
      console.log('✅ Disconnect endpoint working');
      console.log(`   Response: ${disconnectData.message}\n`);
    } else {
      console.log('❌ Disconnect endpoint failed');
      console.log(`   Error: ${JSON.stringify(disconnectData, null, 2)}\n`);
    }

    console.log('🎉 Connection endpoints test completed!');

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testConnection().catch(console.error); 