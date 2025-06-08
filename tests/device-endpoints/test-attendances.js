#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testAttendances() {
  console.log('🔄 Testing Attendance Endpoints...\n');

  try {
    // Test getting attendances
    console.log('1. Testing GET /attendances');
    const getResponse = await fetch(`${BASE_URL}/attendances`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const getData = await getResponse.json();

    if (getResponse.ok && getData.success) {
      console.log('✅ Get attendances endpoint working');
      console.log(`📊 Found ${getData.meta.total} attendance records:`);

      if (getData.data.length > 0) {
        getData.data.forEach((record, index) => {
          console.log(
            `   ${index + 1}. User: ${record.deviceUserId}, Time: ${record.recordTime}, SN: ${
              record.userSn
            }`
          );
        });

        // Validate response structure
        const requiredFields = ['userSn', 'deviceUserId', 'recordTime', 'ip'];
        const firstRecord = getData.data[0];
        const missingFields = requiredFields.filter((field) => !(field in firstRecord));

        if (missingFields.length === 0) {
          console.log('✅ Attendance data structure is correct');
        } else {
          console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
        }
      } else {
        console.log('   📭 No attendance records found on device');
      }

      console.log(`\n📋 Raw Response: ${JSON.stringify(getData, null, 2)}\n`);
    } else {
      console.log('❌ Get attendances endpoint failed');
      console.log(`   Status: ${getResponse.status}`);
      console.log(`   Error: ${JSON.stringify(getData, null, 2)}\n`);
    }

    // Test with date filtering
    console.log('2. Testing GET /attendances with date filtering');
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const filterResponse = await fetch(
      `${BASE_URL}/attendances?fromDate=${yesterday}&toDate=${today}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const filterData = await filterResponse.json();

    if (filterResponse.ok && filterData.success) {
      console.log('✅ Date filtering working');
      console.log(
        `   Found ${filterData.meta.total} records for date range ${yesterday} to ${today}`
      );
    } else {
      console.log('❌ Date filtering failed');
      console.log(`   Error: ${JSON.stringify(filterData, null, 2)}`);
    }

    // Test attendance summary
    console.log('\n3. Testing GET /attendances/summary');
    const summaryResponse = await fetch(`${BASE_URL}/attendances/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const summaryData = await summaryResponse.json();

    if (summaryResponse.ok && summaryData.success) {
      console.log('✅ Attendance summary endpoint working');
      console.log('📊 Summary data:');
      console.log(`   Total Attendances: ${summaryData.data.totalAttendances}`);
      console.log(`   Unique Users: ${summaryData.data.uniqueUsers}`);
      if (summaryData.data.attendancesByDate && summaryData.data.attendancesByDate.length > 0) {
        console.log('   Attendance by date:');
        for (const item of summaryData.data.attendancesByDate.slice(0, 5)) {
          console.log(`     ${item.date}: ${item.count} attendances`);
        }
      }
    } else {
      console.log('❌ Attendance summary endpoint failed');
      console.log(`   Error: ${JSON.stringify(summaryData, null, 2)}`);
    }

    // Test clearing attendances (with confirmation)
    console.log('\n4. Testing DELETE /attendances/clear');
    console.log('⚠️  This will clear all attendance logs from the device!');

    // For safety, we'll just test the endpoint exists but won't actually clear
    // To actually clear, uncomment the following lines:
    /*
    const clearResponse = await fetch(`${BASE_URL}/attendances/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const clearData = await clearResponse.json();
    
    if (clearResponse.ok && clearData.success) {
      console.log('✅ Clear attendances endpoint working');
      console.log(`   Response: ${clearData.message}`);
    } else {
      console.log('❌ Clear attendances endpoint failed');
      console.log(`   Error: ${JSON.stringify(clearData, null, 2)}`);
    }
    */

    console.log('   💡 Clear endpoint test skipped for safety');
    console.log('   💡 To test clearing, uncomment the code in the test file');

    console.log('\n🎉 Attendance endpoints test completed!');
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testAttendances().catch(console.error);
