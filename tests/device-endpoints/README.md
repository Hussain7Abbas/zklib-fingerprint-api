# ZK Device API Endpoint Tests

This directory contains comprehensive test scripts for all ZK device API endpoints. These tests are designed to work with a real ZK fingerprint device connected to your network.

## Prerequisites

1. **Server Running**: Make sure your API server is running on port 3000

   ```bash
   bun run dev
   ```

2. **Device Connected**: Ensure your ZK fingerprint device is connected and accessible at the configured IP address (default: 192.168.1.201)

3. **Node.js**: Tests require Node.js with fetch support (Node.js 18+ recommended)

## Test Files

### Individual Tests

- **`test-connection.js`** - Tests device connection and disconnection endpoints
- **`test-device-info.js`** - Tests device information retrieval
- **`test-users.js`** - Tests user data retrieval from device
- **`test-attendances.js`** - Tests attendance record retrieval and clearing
- **`test-device-control.js`** - Tests device enable/disable functionality
- **`test-realtime-logs.js`** - Tests real-time log streaming (requires manual interaction)

### Test Runner

- **`test-all.js`** - Runs all tests in sequence (except real-time logs)

## Running Tests

### Run All Tests

```bash
# From the project root
node tests/device-endpoints/test-all.js

# Or from the test directory
cd tests/device-endpoints
node test-all.js
```

### Run Individual Tests

```bash
# Test specific functionality
node tests/device-endpoints/test-connection.js
node tests/device-endpoints/test-device-info.js
node tests/device-endpoints/test-users.js
node tests/device-endpoints/test-attendances.js
node tests/device-endpoints/test-device-control.js
```

### Test Real-time Logs

```bash
# This test requires manual interaction with the device
node tests/device-endpoints/test-realtime-logs.js

# During the 30-second test window, use your fingerprint device
# to generate attendance logs and see them appear in real-time
```

## Test Output

Each test provides detailed output including:

- ✅ **Success indicators** for working endpoints
- ❌ **Error messages** for failed endpoints
- 📊 **Data validation** for response structures
- 📋 **Raw responses** for debugging
- 💡 **Helpful tips** and warnings

### Example Output

```
🔄 Testing Device Connection Endpoints...

1. Testing POST /connect
✅ Connect endpoint working
   Response: Successfully connected to ZK device

2. Testing POST /disconnect
✅ Disconnect endpoint working
   Response: Successfully disconnected from ZK device

🎉 Connection endpoints test completed!
```

## Troubleshooting

### Common Issues

1. **Server Not Running**

   ```
   ❌ Cannot connect to server. Make sure it is running on port 3000
   ```

   **Solution**: Start the server with `bun run dev`

2. **Device Not Connected**

   ```
   ❌ Connect endpoint failed
   Error: Failed to connect to ZK device
   ```

   **Solution**: Check device IP, network connectivity, and device power

3. **No Attendance Data**

   ```
   📭 No attendance records found on device
   ```

   **Solution**: This is normal if no one has used the device recently

4. **Real-time Logs No Data**
   ```
   ⚠️ No real-time events received during test period
   ```
   **Solution**: Use the fingerprint device during the test window

### Device Configuration

Make sure your device configuration matches your environment:

```javascript
// Default configuration in the API
const zkService = new ZKService(
  process.env.ZK_DEVICE_IP || '192.168.1.201',
  Number.parseInt(process.env.ZK_DEVICE_PORT || '4370'),
  Number.parseInt(process.env.ZK_TIMEOUT || '5000'),
  Number.parseInt(process.env.ZK_INPORT || '5200')
);
```

Update your `.env` file if needed:

```env
ZK_DEVICE_IP=192.168.1.201
ZK_DEVICE_PORT=4370
ZK_TIMEOUT=5000
ZK_INPORT=5200
```

## Test Safety

- **Attendance Clearing**: The attendance test skips the actual clearing operation by default for safety
- **Device Control**: Enable/disable tests are safe and won't harm the device
- **Real-time Logs**: Non-destructive monitoring only

To enable attendance clearing in tests, uncomment the relevant code in `test-attendances.js`.

## Expected Results

With a properly connected device, you should see:

- ✅ All connection tests pass
- ✅ Device info shows actual user/log counts
- ✅ Users list shows registered users
- ✅ Attendance records (if any exist)
- ✅ Device control operations work
- ✅ Real-time logs stream (when device is used)

## API Documentation

For complete API documentation, visit: http://localhost:3000/api-docs
