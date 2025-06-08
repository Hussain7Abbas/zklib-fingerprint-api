#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3000/api/device';

// Test files to run
const testFiles = [
  'test-connection.js',
  'test-device-info.js',
  'test-users.js',
  'test-attendances.js',
  'test-device-control.js',
  // Note: test-realtime-logs.js is excluded as it requires manual interaction
];

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    if (response.ok && data.status === 'OK') {
      console.log('✅ Server is running and healthy\n');
      return true;
    }
    console.log('❌ Server health check failed');
    return false;
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure it is running on port 3000');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

function runTest(testFile) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test ${testFile} failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log('🚀 ZK Device API Endpoint Tests\n');
  console.log('='.repeat(50));

  // Check server health first
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('💡 Please start the server with: bun run dev');
    process.exit(1);
  }

  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const testFile of testFiles) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Running ${testFile}...`);
    console.log('='.repeat(50));

    try {
      await runTest(testFile);
      console.log(`✅ ${testFile} completed successfully`);
      passedTests++;
      results.push({ test: testFile, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ ${testFile} failed: ${error.message}`);
      failedTests++;
      results.push({ test: testFile, status: 'FAILED', error: error.message });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  for (const result of results) {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log(`\n📈 Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Your ZK Device API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  console.log('\n💡 Additional Tests:');
  console.log('   - Run test-realtime-logs.js manually to test real-time functionality');
  console.log('   - Use the fingerprint device during the real-time test');

  console.log('\n📚 API Documentation: http://localhost:3000/api-docs');
}

// Run all tests
runAllTests().catch(console.error);
