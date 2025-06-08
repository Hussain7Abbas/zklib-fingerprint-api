#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testDeviceControl() {
  console.log('🔄 Testing Device Control Endpoints...\n');

  try {
    // Test disabling device
    console.log('1. Testing POST /disable');
    const disableResponse = await fetch(`${BASE_URL}/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const disableData = await disableResponse.json();

    if (disableResponse.ok && disableData.success) {
      console.log('✅ Disable device endpoint working');
      console.log(`   Response: ${disableData.message}`);
    } else {
      console.log('❌ Disable device endpoint failed');
      console.log(`   Status: ${disableResponse.status}`);
      console.log(`   Error: ${JSON.stringify(disableData, null, 2)}`);
    }

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test enabling device
    console.log('\n2. Testing POST /enable');
    const enableResponse = await fetch(`${BASE_URL}/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const enableData = await enableResponse.json();

    if (enableResponse.ok && enableData.success) {
      console.log('✅ Enable device endpoint working');
      console.log(`   Response: ${enableData.message}`);
    } else {
      console.log('❌ Enable device endpoint failed');
      console.log(`   Status: ${enableResponse.status}`);
      console.log(`   Error: ${JSON.stringify(enableData, null, 2)}`);
    }

    // Test if device is responsive after enable/disable cycle
    console.log('\n3. Testing device responsiveness after enable/disable cycle');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const testResponse = await fetch(`${BASE_URL}/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const testData = await testResponse.json();

    if (testResponse.ok && testData.success) {
      console.log('✅ Device is responsive after enable/disable cycle');
      console.log('   Device info retrieved successfully');
    } else {
      console.log('❌ Device not responsive after enable/disable cycle');
      console.log(`   Error: ${JSON.stringify(testData, null, 2)}`);
    }

    console.log('\n📋 Raw Responses:');
    console.log(`   Disable: ${JSON.stringify(disableData, null, 2)}`);
    console.log(`   Enable: ${JSON.stringify(enableData, null, 2)}`);

    console.log('\n🎉 Device control endpoints test completed!');
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testDeviceControl().catch(console.error);
