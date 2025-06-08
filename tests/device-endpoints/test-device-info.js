#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testDeviceInfo() {
  console.log('🔄 Testing Device Info Endpoint...\n');

  try {
    console.log('Testing GET /info');
    const response = await fetch(`${BASE_URL}/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Device info endpoint working');
      console.log('📊 Device Information:');
      console.log(`   User Count: ${data.data.userCounts}`);
      console.log(`   Log Count: ${data.data.logCounts}`);
      console.log(`   Log Capacity: ${data.data.logCapacity}`);
      console.log(`   Raw Response: ${JSON.stringify(data, null, 2)}\n`);

      // Validate response structure
      const requiredFields = ['userCounts', 'logCounts', 'logCapacity'];
      const missingFields = requiredFields.filter(field => !(field in data.data));

      if (missingFields.length === 0) {
        console.log('✅ Response structure is correct');
      } else {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
      }

    } else {
      console.log('❌ Device info endpoint failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}\n`);
    }

    console.log('🎉 Device info test completed!');

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testDeviceInfo().catch(console.error); 