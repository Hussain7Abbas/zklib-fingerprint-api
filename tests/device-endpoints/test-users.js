#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testUsers() {
  console.log('🔄 Testing Users Endpoint...\n');

  try {
    // Test getting all users
    console.log('1. Testing GET /users');
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Users endpoint working');
      console.log(`👥 Found ${data.meta.total} users on device:`);

      data.data.forEach((user, index) => {
        console.log(
          `   ${index + 1}. User ID: ${user.userid}, Name: "${user.name}", UID: ${
            user.uid
          }, Role: ${user.role}`
        );
      });

      console.log(`\n📋 Raw Response: ${JSON.stringify(data, null, 2)}\n`);

      // Validate response structure
      const requiredFields = ['uid', 'userid', 'name', 'role', 'password', 'cardno'];
      if (data.data.length > 0) {
        const firstUser = data.data[0];
        const missingFields = requiredFields.filter((field) => !(field in firstUser));

        if (missingFields.length === 0) {
          console.log('✅ User data structure is correct');
        } else {
          console.log(`⚠️  Missing fields in user data: ${missingFields.join(', ')}`);
        }
      } else {
        console.log('⚠️  No users found on device');
      }

      // Check meta structure
      if (data.meta && typeof data.meta.total === 'number') {
        console.log('✅ Meta information is correct');
      } else {
        console.log('⚠️  Meta information is missing or incorrect');
      }
    } else {
      console.log('❌ Users endpoint failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}\n`);
    }

    console.log('💡 Note: User update functionality is not available on this device model');
    console.log('   The setUser method is not supported by this ZK device');
    console.log('🎉 Users test completed!');
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testUsers().catch(console.error);
