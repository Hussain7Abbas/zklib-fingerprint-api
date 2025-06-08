#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api';

async function testUniqueAttendances() {
  console.log('🔄 Testing Unique Attendances Endpoint...\n');

  try {
    // Test getting unique attendances
    console.log('1. Testing GET /attendances-unique');
    const getResponse = await fetch(`${BASE_URL}/attendances-unique`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const getData = await getResponse.json();

    if (getResponse.ok && getData.success) {
      console.log('✅ Get unique attendances endpoint working');
      console.log(`📊 Found ${getData.meta.total} unique daily attendance records:`);

      if (getData.data.length > 0) {
        getData.data.forEach((record, index) => {
          console.log(
            `   ${index + 1}. User: ${record.username} (${record.deviceUserId}), Date: ${record.date}`
          );
          console.log(`      Check-in: ${record.checkIn}, Check-out: ${record.checkOut}`);
          console.log(`      UserSN: ${record.userSn}`);
        });

        // Validate response structure
        const requiredFields = ['userSn', 'deviceUserId', 'username', 'date', 'checkIn', 'checkOut'];
        const firstRecord = getData.data[0];
        const missingFields = requiredFields.filter((field) => !(field in firstRecord));

        if (missingFields.length === 0) {
          console.log('✅ Unique attendance data structure is correct');
        } else {
          console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
        }

        // Validate date format (should be YYYY-MM-DD)
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        if (dateFormat.test(firstRecord.date)) {
          console.log('✅ Date format is correct (YYYY-MM-DD)');
        } else {
          console.log(`⚠️  Date format incorrect. Expected YYYY-MM-DD, got: ${firstRecord.date}`);
        }

        // Validate that checkIn and checkOut are proper ISO timestamps
        try {
          new Date(firstRecord.checkIn);
          new Date(firstRecord.checkOut);
          console.log('✅ Check-in and check-out timestamps are valid ISO format');
        } catch (error) {
          console.log('⚠️  Invalid timestamp format in checkIn/checkOut');
        }
      } else {
        console.log('   📭 No unique attendance records found on device');
      }

      console.log(`\n📋 Raw Response: ${JSON.stringify(getData, null, 2)}\n`);
    } else {
      console.log('❌ Get unique attendances endpoint failed');
      console.log(`   Status: ${getResponse.status}`);
      console.log(`   Error: ${JSON.stringify(getData, null, 2)}\n`);
    }

    // Test with date filtering
    console.log('2. Testing GET /attendances-unique with date filtering');
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const filterResponse = await fetch(
      `${BASE_URL}/attendances-unique?fromDate=${yesterday}&toDate=${today}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const filterData = await filterResponse.json();

    if (filterResponse.ok && filterData.success) {
      console.log('✅ Date filtering working');
      console.log(
        `   Found ${filterData.meta.total} unique records for date range ${yesterday} to ${today}`
      );

      if (filterData.data.length > 0) {
        console.log('   Sample filtered record:');
        const sample = filterData.data[0];
        console.log(`     User: ${sample.username}, Date: ${sample.date}`);
        console.log(`     Check-in: ${sample.checkIn}, Check-out: ${sample.checkOut}`);
      }
    } else {
      console.log('❌ Date filtering failed');
      console.log(`   Error: ${JSON.stringify(filterData, null, 2)}`);
    }

    // Test with timezone parameter
    console.log('\n3. Testing GET /attendances-unique with timezone parameter');
    const timezoneResponse = await fetch(
      `${BASE_URL}/attendances-unique?timezone=America/New_York`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const timezoneData = await timezoneResponse.json();

    if (timezoneResponse.ok && timezoneData.success) {
      console.log('✅ Timezone formatting working');
      console.log(`   Found ${timezoneData.meta.total} records with timezone formatting`);

      if (timezoneData.data.length > 0) {
        const sample = timezoneData.data[0];
        console.log('   Sample timezone-formatted record:');
        console.log(`     User: ${sample.username}, Date: ${sample.date}`);
        console.log(`     Check-in: ${sample.checkIn}, Check-out: ${sample.checkOut}`);

        // Validate time format (should be HH:mm:ss)
        const timeFormat = /^\d{2}:\d{2}:\d{2}$/;
        if (timeFormat.test(sample.checkIn) && timeFormat.test(sample.checkOut)) {
          console.log('✅ Time format is correct (HH:mm:ss)');
        } else {
          console.log(`⚠️  Time format incorrect. Expected HH:mm:ss, got checkIn: ${sample.checkIn}, checkOut: ${sample.checkOut}`);
        }

        // Check if timezone is included in meta
        if (timezoneData.meta.timezone) {
          console.log(`✅ Timezone included in response meta: ${timezoneData.meta.timezone}`);
        } else {
          console.log('⚠️  Timezone not included in response meta');
        }
      }
    } else {
      console.log('❌ Timezone formatting failed');
      console.log(`   Error: ${JSON.stringify(timezoneData, null, 2)}`);
    }

    // Test comparison with regular attendances endpoint
    console.log('\n4. Comparing with regular /attendances endpoint');
    const regularResponse = await fetch(`${BASE_URL}/attendances`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const regularData = await regularResponse.json();

    if (regularResponse.ok && regularData.success) {
      console.log(`📊 Regular attendances: ${regularData.meta.total} records`);
      console.log(`📊 Unique attendances: ${getData.meta.total} records`);

      if (regularData.meta.total >= getData.meta.total) {
        console.log('✅ Unique attendances count is less than or equal to regular attendances (expected)');
      } else {
        console.log('⚠️  Unique attendances count is greater than regular attendances (unexpected)');
      }
    }

    console.log('\n🎉 Unique attendances endpoint test completed!');
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testUniqueAttendances().catch(console.error); 