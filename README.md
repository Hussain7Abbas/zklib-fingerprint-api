# ZKLib Fingerprint API

A robust REST API for managing ZKTeco fingerprint attendance devices using Node.js, TypeScript, and Express.js. This API provides endpoints to interact with fingerprint devices for attendance management and user administration.

## 🚀 Features

- **Attendance Management**: Retrieve attendance records with date filtering
- **User Management**: Get all users and update user information
- **Real-time Integration**: Connect directly to ZKTeco fingerprint devices
- **Multi-Device Support**: Connect to different devices by specifying IP and port parameters
- **Data Validation**: Comprehensive input validation using Zod
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **TypeScript**: Full TypeScript support with strict type checking
- **Error Handling**: Robust error handling and logging
- **Date Management**: Advanced date filtering and formatting with Day.js

## 🏗️ Architecture

This project follows the **Router-Service-Controller** design pattern with clear separation of concerns:

```
src/
├── app.ts                 # Express app configuration
├── controllers/           # Request handlers and business logic
│   ├── attendanceController.ts
│   ├── deviceController.ts
│   └── userController.ts
├── services/             # Business logic and external integrations
│   └── zkService.ts      # ZKTeco device communication
├── routes/               # Route definitions
│   ├── attendanceRoutes.ts
│   ├── deviceRoutes.ts
│   └── userRoutes.ts
├── middleware/           # Custom middleware
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── schemas/              # Data validation schemas
│   ├── deviceSchemas.ts
│   └── validationSchemas.ts
└── types/                # TypeScript type definitions
    └── node-zklib.d.ts
```

## 📦 Technologies

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Framework**: [Express.js](https://expressjs.com) - Web framework
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- **Validation**: [Zod](https://zod.dev) - Schema validation
- **Device Integration**: [node-zklib](https://www.npmjs.com/package/node-zklib) - ZKTeco device communication
- **Date Handling**: [Day.js](https://day.js.org) - Date manipulation
- **Documentation**: [Swagger/OpenAPI](https://swagger.io) - API documentation
- **Security**: [Helmet](https://helmetjs.github.io) - Security headers
- **Logging**: [Morgan](https://github.com/expressjs/morgan) - HTTP request logger

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh) (recommended) or [Node.js](https://nodejs.org) >= 18
- ZKTeco fingerprint device connected to the network
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/zklib-fingerprint-api.git
   cd zklib-fingerprint-api
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration (see [Environment Variables](#environment-variables))

4. **Start the development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Access the API**
   - API Server: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# ZKTeco Device Configuration (Default values)
ZK_DEVICE_IP=192.168.1.201
ZK_DEVICE_PORT=4370
ZK_TIMEOUT=5000
ZK_INPORT=5200
```

**Note**: The `ZK_DEVICE_IP` and `ZK_DEVICE_PORT` serve as default values. You can override them for individual requests by passing `ip` and `port` parameters in the request body or query parameters.

## 🔌 Multi-Device Support

All API endpoints now support connecting to different ZKTeco devices by providing optional `ip` and `port` parameters:

### Via Query Parameters

```http
GET /api/users?ip=192.168.1.100&port=4370
GET /api/attendances?ip=192.168.1.100&port=4370&fromDate=2024-01-01T00:00:00.000Z
```

### Via Request Body (for POST/PUT/DELETE requests)

```http
POST /api/device/connect
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "port": 4370
}
```

If no `ip` or `port` parameters are provided, the API will use the default values from the environment variables (`ZK_DEVICE_IP` and `ZK_DEVICE_PORT`).

## 📚 API Endpoints

### Authentication & Health

| Method | Endpoint  | Description           |
| ------ | --------- | --------------------- |
| GET    | `/health` | Health check endpoint |

### Device Management

| Method | Endpoint                    | Description                             | Device Params |
| ------ | --------------------------- | --------------------------------------- | ------------- |
| POST   | `/api/device/connect`       | Test connection to device               | ✅ Body/Query |
| POST   | `/api/device/disconnect`    | Disconnect from device                  | ✅ Body/Query |
| GET    | `/api/device/info`          | Get device information                  | ✅ Query      |
| POST   | `/api/device/disable`       | Disable device                          | ✅ Body/Query |
| POST   | `/api/device/enable`        | Enable device                           | ✅ Body/Query |
| GET    | `/api/device/realtime-logs` | Get real-time logs (Server-Sent Events) | ✅ Query      |

### Users

| Method | Endpoint     | Description               | Device Params |
| ------ | ------------ | ------------------------- | ------------- |
| GET    | `/api/users` | Get all users from device | ✅ Query      |

### Attendances

| Method | Endpoint                   | Description                                          | Device Params |
| ------ | -------------------------- | ---------------------------------------------------- | ------------- |
| GET    | `/api/attendances`         | Get attendances with optional date filtering         | ✅ Query      |
| GET    | `/api/attendances-unique`  | Get unique daily attendances with check-in/check-out | ✅ Query      |
| GET    | `/api/attendances/summary` | Get attendance summary statistics                    | ✅ Query      |
| DELETE | `/api/attendances/clear`   | Clear all attendance logs                            | ✅ Body/Query |

## 📖 API Documentation

### Connect to Device

```http
POST /api/device/connect
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "port": 4370
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully connected to ZK device",
  "deviceInfo": {
    "ip": "192.168.1.100",
    "port": 4370
  }
}
```

### Get All Users (with custom device)

```http
GET /api/users?ip=192.168.1.100&port=4370
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "uid": 1,
      "userid": "001",
      "name": "John Doe",
      "role": 0,
      "password": "",
      "cardno": 0
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Get Attendances (with custom device and date filtering)

```http
GET /api/attendances?ip=192.168.1.100&port=4370&fromDate=2024-01-01T00:00:00.000Z&toDate=2024-12-31T23:59:59.999Z
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "deviceUserId": "001",
      "attTime": "2024-01-15T08:30:00.000Z",
      "verifyMethod": 1,
      "inOutMode": 1,
      "workCode": 0
    }
  ],
  "meta": {
    "total": 1,
    "fromDate": "2024-01-01T00:00:00.000Z",
    "toDate": "2024-12-31T23:59:59.999Z"
  }
}
```

### Get Unique Daily Attendances

```http
GET /api/attendances-unique?fromDate=2024-01-01T00:00:00.000Z&toDate=2024-12-31T23:59:59.999Z
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "userSn": 6550,
      "deviceUserId": "5",
      "username": "John Doe",
      "date": "24-01-15",
      "checkIn": "2024-01-15T08:30:00.000Z",
      "checkOut": "2024-01-15T17:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "fromDate": "2024-01-01T00:00:00.000Z",
    "toDate": "2024-12-31T23:59:59.999Z"
  }
}
```

### Get Attendance Summary

```http
GET /api/attendances/summary?fromDate=2024-01-01T00:00:00.000Z&toDate=2024-12-31T23:59:59.999Z
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAttendances": 150,
    "uniqueUsers": 25,
    "dateRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-12-31T23:59:59.999Z"
    },
    "attendancesByDate": [
      {
        "date": "2024-01-15",
        "count": 45
      }
    ]
  }
}
```

## 🛡️ Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Development

### Available Scripts

```bash
# Development with hot reload
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Type checking
tsc --noEmit

# Linting (if configured)
bun run lint
```

### Project Structure Explained

- **Controllers**: Handle HTTP requests, validate input, and coordinate between services
- **Services**: Contain business logic and external service integrations
- **Routes**: Define API endpoints and link them to controllers
- **Middleware**: Handle cross-cutting concerns like error handling and logging
- **Schemas**: Define data validation rules using Zod
- **Types**: TypeScript type definitions for external libraries

## 🔌 ZKTeco Device Setup

1. **Network Configuration**

   - Ensure the device is connected to your network
   - Note the device IP address and port (default: 4370)
   - Test connectivity using ping

2. **Device Settings**

   - Enable network communication on the device
   - Set appropriate access permissions
   - Ensure device time is synchronized

3. **Firewall Configuration**
   - Allow incoming connections on the specified port
   - Ensure no network restrictions between server and device

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**

   ```bash
   NODE_ENV=production
   PORT=3000
   ```

2. **Build the application**

   ```bash
   bun run build
   ```

3. **Start the production server**
   ```bash
   bun run start
   ```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
EXPOSE 3000

CMD ["bun", "run", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting and type checking

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Device Connection Failed**

   - Check network connectivity
   - Verify IP address and port
   - Ensure device is powered on and accessible

2. **Validation Errors**

   - Check request format against API documentation
   - Ensure date formats are ISO 8601 compliant
   - Verify required fields are provided

3. **TypeScript Errors**
   - Run `bun install` to ensure all dependencies are installed
   - Check for missing type declarations
   - Verify import paths are correct

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation at `/api-docs`
- Review the troubleshooting section

## 🙏 Acknowledgments

- [node-zklib](https://www.npmjs.com/package/node-zklib) for ZKTeco device integration
- [Express.js](https://expressjs.com) community for the excellent framework
- [Zod](https://zod.dev) for runtime type validation
- [Swagger](https://swagger.io) for API documentation tools
