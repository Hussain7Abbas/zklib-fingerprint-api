#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api/device';

async function testRealTimeLogs() {
  console.log('🔄 Testing Real-time Logs Endpoint...\n');

  try {
    console.log('Testing GET /realtime-logs (Server-Sent Events)');
    console.log('⚠️  This test will listen for real-time logs for 30 seconds');
    console.log('💡 Try using the fingerprint device to generate logs during this time\n');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 seconds timeout

    let eventCount = 0;
    let hasReceivedData = false;

    try {
      const response = await fetch(`${BASE_URL}/realtime-logs`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        console.log('❌ Real-time logs endpoint failed');
        console.log(`   Status: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        return;
      }

      console.log('✅ Real-time logs endpoint connection established');
      console.log('📡 Listening for events...\n');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.log('❌ Could not get response reader');
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              hasReceivedData = true;
              eventCount++;
              const data = line.substring(6); // Remove 'data: ' prefix

              try {
                const logData = JSON.parse(data);
                console.log(`📩 Event ${eventCount}:`);
                console.log(`   User ID: ${logData.userId}`);
                console.log(`   Time: ${logData.attTime}`);
                console.log(`   Verify Method: ${logData.verifyMethod}`);
                console.log(`   In/Out Mode: ${logData.inOutMode}`);
                console.log(`   Raw Data: ${data}\n`);
              } catch (parseError) {
                console.log(`📩 Event ${eventCount} (raw): ${data}\n`);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.log('⏰ Real-time logs test timed out after 30 seconds');
      } else {
        throw fetchError;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (hasReceivedData) {
      console.log(`✅ Real-time logs working - received ${eventCount} events`);
    } else {
      console.log('⚠️  No real-time events received during test period');
      console.log('💡 This might be normal if no one used the device during the test');
    }

    console.log('\n📊 Test Summary:');
    console.log('   Connection: ✅ Successful');
    console.log(`   Events received: ${eventCount}`);
    console.log(`   Data format: ${hasReceivedData ? '✅ Valid' : '⚠️  No data to validate'}`);

    console.log('\n🎉 Real-time logs test completed!');

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}\n`);
  }
}

// Run the test
testRealTimeLogs().catch(console.error); 