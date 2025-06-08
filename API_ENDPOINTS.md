# ZK Device API Endpoints

This document describes all available API endpoints for the ZK fingerprint device, with actual response structures based on testing with a connected device.

## Base URL

```
http://localhost:3000/api/device
```

## Available Endpoints

### 1. Device Connection Management

#### Connect to Device

- **Endpoint**: `POST /connect`
- **Description**: Create socket connection to ZK device
- **Response**:

```json
{
  "success": true,
  "message": "Successfully connected to ZK device"
}
```

#### Disconnect from Device

- **Endpoint**: `POST /disconnect`
- **Description**: Disconnect from ZK device
- **Response**:

```json
{
  "success": true,
  "message": "Successfully disconnected from ZK device"
}
```

### 2. Device Information

#### Get Device Info

- **Endpoint**: `GET /info`
- **Description**: Get device information and statistics
- **Response**:

```json
{
  "success": true,
  "data": {
    "userCounts": 4,
    "logCounts": 2,
    "logCapacity": 100000
  }
}
```

### 3. User Management

#### Get All Users

- **Endpoint**: `GET /users`
- **Description**: Get all users from the device
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "uid": 1,
      "userid": "1",
      "name": "Gjt",
      "role": 0,
      "password": "",
      "cardno": 0
    },
    {
      "uid": 2,
      "userid": "2",
      "name": "Hus",
      "role": 0,
      "password": "",
      "cardno": 0
    }
  ],
  "meta": {
    "total": 4
  }
}
```

### 4. Attendance Management

#### Get Attendance Records

- **Endpoint**: `GET /attendances`
- **Description**: Get attendance records from device
- **Query Parameters**:
  - `fromDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `toDate` (optional): End date for filtering (YYYY-MM-DD)
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "userSn": 6550,
      "deviceUserId": "5",
      "username": "John Doe",
      "recordTime": "2025-06-07T10:21:02.000Z",
      "ip": "192.168.0.201",
      "attTime": "2025-06-07T10:21:02.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Get Unique Daily Attendances

- **Endpoint**: `GET /attendances-unique`
- **Description**: Get unique daily attendance records with check-in/check-out times for each user per day
- **Query Parameters**:
  - `fromDate` (optional): Start date for filtering (ISO 8601 format)
  - `toDate` (optional): End date for filtering (ISO 8601 format)
  - `ip` (optional): Device IP address (defaults to ZK_DEVICE_IP env var)
  - `port` (optional): Device port (defaults to ZK_DEVICE_PORT env var)
  - `timezone` (optional): IANA timezone for formatting check-in/check-out times (e.g., America/New_York, UTC). If provided, times will be formatted as HH:mm:ss, otherwise as ISO timestamps.
- **Response (without timezone):**

```json
{
  "success": true,
  "data": [
    {
      "userSn": 6550,
      "deviceUserId": "5",
      "username": "John Doe",
      "date": "25-06-07",
      "checkIn": "2025-06-07T08:30:00.000Z",
      "checkOut": "2025-06-07T17:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "fromDate": "2025-01-01T00:00:00.000Z",
    "toDate": "2025-12-31T23:59:59.999Z"
  }
}
```

**Response (with timezone=America/New_York):**

```json
{
  "success": true,
  "data": [
    {
      "userSn": 6550,
      "deviceUserId": "5",
      "username": "John Doe",
      "date": "2025-06-07",
      "checkIn": "08:30:00",
      "checkOut": "17:30:00"
    }
  ],
  "meta": {
    "total": 1,
    "timezone": "America/New_York"
  }
}
```

#### Clear Attendance Logs

- **Endpoint**: `DELETE /attendances/clear`
- **Description**: Clear all attendance logs from device
- **Response**:

```json
{
  "success": true,
  "message": "Attendance logs successfully cleared"
}
```

### 5. Device Control

#### Disable Device

- **Endpoint**: `POST /disable`
- **Description**: Disable the ZK device
- **Response**:

```json
{
  "success": true,
  "message": "Device successfully disabled"
}
```

#### Enable Device

- **Endpoint**: `POST /enable`
- **Description**: Enable the ZK device
- **Response**:

```json
{
  "success": true,
  "message": "Device successfully enabled"
}
```

### 6. Real-time Monitoring

#### Get Real-time Logs

- **Endpoint**: `GET /realtime-logs`
- **Description**: Get real-time logs from device (Server-Sent Events)
- **Response**: Stream of events in the format:

```
data: {"userId": "EMP001", "attTime": "2023-12-01T10:00:00Z", "verifyMethod": 1, "inOutMode": 1}

```

## Data Types

### DeviceInfo

```typescript
interface DeviceInfo {
  userCounts: number; // Number of users registered
  logCounts: number; // Number of attendance logs
  logCapacity: number; // Maximum log capacity
}
```

### User

```typescript
interface User {
  uid: number; // User unique identifier
  userid: string; // User ID string
  name: string; // User name
  role: number; // User role (0 = normal, 1 = admin)
  password: string; // User password
  cardno: number; // Card number
}
```

### Attendance

```typescript
interface Attendance {
  userSn: number; // User serial number
  deviceUserId: string; // Device user ID
  recordTime: string; // ISO timestamp
  ip: string; // Device IP address
}
```

### UniqueAttendance

```typescript
interface UniqueAttendance {
  userSn: number; // User serial number
  deviceUserId: string; // Device user ID
  username: string; // User name
  date: string; // Date in YYYY-MM-DD format
  checkIn: string; // First attendance record time for the day (ISO timestamp or HH:mm:ss if timezone provided)
  checkOut: string; // Last attendance record time for the day (ISO timestamp or HH:mm:ss if timezone provided)
}
```

### RealTimeLog

```typescript
interface RealTimeLog {
  userId: string; // User ID
  attTime: Date; // Attendance time
  verifyMethod: number; // Verification method
  inOutMode: number; // In/Out mode
}
```

## Available ZK Device Methods

Based on testing with the actual device, the following methods are available:

- `clearAttendanceLog`
- `createSocket`
- `disableDevice`
- `disconnect`
- `enableDevice`
- `executeCmd`
- `freeData`
- `functionWrapper`
- `getAttendances`
- `getInfo`
- `getRealTimeLogs`
- `getSocketStatus`
- `getUsers`
- `setIntervalSchedule`
- `setTimerSchedule`

## Notes

1. **User Management**: The `setUser` method is not available on this device model, so user creation/modification endpoints are not implemented.

2. **Connection Management**: Each endpoint automatically connects and disconnects from the device to ensure proper resource management.

3. **Error Handling**: All endpoints include proper error handling with descriptive error messages.

4. **Real-time Logs**: The real-time logs endpoint uses Server-Sent Events (SSE) for streaming live attendance data.

5. **Date Filtering**: Attendance records can be filtered by date range using query parameters.

## Swagger Documentation

Full API documentation is available at: `http://localhost:3000/api-docs`
