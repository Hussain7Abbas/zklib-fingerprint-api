# API Usage Examples

This document provides examples of how to use the ZKLib Fingerprint API with different device connection parameters.

## Environment Setup

First, set up your default device configuration in `.env`:

```env
# Default device configuration
ZK_DEVICE_IP=192.168.1.201
ZK_DEVICE_PORT=4370
ZK_TIMEOUT=5000
ZK_INPORT=5200
```

## Using Default Device Configuration

When no `ip` or `port` parameters are provided, the API uses the default values from environment variables:

### Connect to Default Device

```bash
curl -X POST http://localhost:3000/api/device/connect \
  -H "Content-Type: application/json"
```

### Get Users from Default Device

```bash
curl -X GET http://localhost:3000/api/users
```

### Get Attendances from Default Device

```bash
curl -X GET "http://localhost:3000/api/attendances?fromDate=2024-01-01T00:00:00.000Z&toDate=2024-12-31T23:59:59.999Z"
```

## Using Custom Device Configuration

You can override the default device configuration by providing `ip` and `port` parameters:

### Via Query Parameters (GET requests)

```bash
# Connect to a specific device
curl -X GET "http://localhost:3000/api/device/info?ip=192.168.1.100&port=4370"

# Get users from a specific device
curl -X GET "http://localhost:3000/api/users?ip=192.168.1.100&port=4370"

# Get attendances from a specific device with date filtering
curl -X GET "http://localhost:3000/api/attendances?ip=192.168.1.100&port=4370&fromDate=2024-01-01T00:00:00.000Z&toDate=2024-12-31T23:59:59.999Z"

# Get attendance summary from a specific device
curl -X GET "http://localhost:3000/api/attendances/summary?ip=192.168.1.100&port=4370"

# Get real-time logs from a specific device
curl -X GET "http://localhost:3000/api/device/realtime-logs?ip=192.168.1.100&port=4370"
```

### Via Request Body (POST/PUT/DELETE requests)

```bash
# Connect to a specific device
curl -X POST http://localhost:3000/api/device/connect \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "port": 4370
  }'

# Disconnect from a specific device
curl -X POST http://localhost:3000/api/device/disconnect \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "port": 4370
  }'

# Disable a specific device
curl -X POST http://localhost:3000/api/device/disable \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "port": 4370
  }'

# Enable a specific device
curl -X POST http://localhost:3000/api/device/enable \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "port": 4370
  }'

# Clear attendance logs from a specific device
curl -X DELETE http://localhost:3000/api/attendances/clear \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "port": 4370
  }'
```

### Via Query Parameters (for POST/PUT/DELETE requests)

You can also use query parameters for POST/PUT/DELETE requests:

```bash
# Connect to a specific device via query params
curl -X POST "http://localhost:3000/api/device/connect?ip=192.168.1.100&port=4370" \
  -H "Content-Type: application/json"

# Clear attendance logs via query params
curl -X DELETE "http://localhost:3000/api/attendances/clear?ip=192.168.1.100&port=4370" \
  -H "Content-Type: application/json"
```

## Multi-Device Scenarios

### Managing Multiple Devices

```bash
# Get info from Device 1
curl -X GET "http://localhost:3000/api/device/info?ip=192.168.1.100&port=4370"

# Get info from Device 2
curl -X GET "http://localhost:3000/api/device/info?ip=192.168.1.101&port=4370"

# Get users from Device 1
curl -X GET "http://localhost:3000/api/users?ip=192.168.1.100&port=4370"

# Get users from Device 2
curl -X GET "http://localhost:3000/api/users?ip=192.168.1.101&port=4370"

# Get attendances from both devices
curl -X GET "http://localhost:3000/api/attendances?ip=192.168.1.100&port=4370&fromDate=2024-01-01T00:00:00.000Z"
curl -X GET "http://localhost:3000/api/attendances?ip=192.168.1.101&port=4370&fromDate=2024-01-01T00:00:00.000Z"
```

### Batch Operations

```bash
# Disable multiple devices
curl -X POST http://localhost:3000/api/device/disable \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "port": 4370}'

curl -X POST http://localhost:3000/api/device/disable \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.101", "port": 4370}'

# Enable multiple devices
curl -X POST http://localhost:3000/api/device/enable \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "port": 4370}'

curl -X POST http://localhost:3000/api/device/enable \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.101", "port": 4370}'
```

## JavaScript/TypeScript Examples

### Using fetch API

```javascript
// Connect to a specific device
async function connectToDevice(ip, port) {
  const response = await fetch(
    'http://localhost:3000/api/device/connect',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip, port }),
    }
  );

  const data = await response.json();
  console.log('Connection result:', data);
  return data;
}

// Get users from a specific device
async function getUsersFromDevice(ip, port) {
  const response = await fetch(
    `http://localhost:3000/api/users?ip=${ip}&port=${port}`
  );
  const data = await response.json();
  console.log('Users:', data);
  return data;
}

// Get attendances from a specific device
async function getAttendancesFromDevice(
  ip,
  port,
  fromDate,
  toDate
) {
  const params = new URLSearchParams({
    ip,
    port: port.toString(),
    ...(fromDate && { fromDate: fromDate.toISOString() }),
    ...(toDate && { toDate: toDate.toISOString() }),
  });

  const response = await fetch(
    `http://localhost:3000/api/attendances?${params}`
  );
  const data = await response.json();
  console.log('Attendances:', data);
  return data;
}

// Usage examples
connectToDevice('192.168.1.100', 4370);
getUsersFromDevice('192.168.1.100', 4370);
getAttendancesFromDevice(
  '192.168.1.100',
  4370,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

### Using axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Connect to a specific device
async function connectToDevice(ip, port) {
  try {
    const response = await api.post('/device/connect', {
      ip,
      port,
    });
    console.log('Connection result:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Connection failed:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Get users from a specific device
async function getUsersFromDevice(ip, port) {
  try {
    const response = await api.get('/users', {
      params: { ip, port },
    });
    console.log('Users:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Failed to get users:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Get attendances from a specific device
async function getAttendancesFromDevice(
  ip,
  port,
  fromDate,
  toDate
) {
  try {
    const params = { ip, port };
    if (fromDate) params.fromDate = fromDate.toISOString();
    if (toDate) params.toDate = toDate.toISOString();

    const response = await api.get('/attendances', {
      params,
    });
    console.log('Attendances:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Failed to get attendances:',
      error.response?.data || error.message
    );
    throw error;
  }
}
```

## Error Handling

The API validates IP addresses and port numbers:

```bash
# Invalid IP address
curl -X GET "http://localhost:3000/api/users?ip=invalid-ip&port=4370"
# Response: {"success": false, "error": {"message": "Invalid query parameters: ip must be a valid IP address", "statusCode": 400}}

# Invalid port number
curl -X GET "http://localhost:3000/api/users?ip=192.168.1.100&port=99999"
# Response: {"success": false, "error": {"message": "Invalid query parameters: port must be a valid port number (1-65535)", "statusCode": 400}}
```

## Best Practices

1. **Use environment variables for default configuration**: Set up your most commonly used device as the default in `.env`.

2. **Validate parameters on the client side**: Check IP addresses and port numbers before making API calls.

3. **Handle connection errors gracefully**: Always wrap API calls in try-catch blocks.

4. **Use query parameters for GET requests**: This makes URLs more readable and cacheable.

5. **Use request body for sensitive operations**: For operations like disable/enable, use POST with request body.

6. **Implement retry logic**: Network connections to devices can be unreliable, so implement retry mechanisms.

7. **Monitor device connectivity**: Use the `/api/device/connect` endpoint to test connectivity before performing operations.
