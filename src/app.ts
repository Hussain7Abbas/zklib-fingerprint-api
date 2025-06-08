import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { AttendanceController } from './controllers/attendanceController';
import attendanceRoutes from './routes/attendanceRoutes';
import deviceRoutes from './routes/deviceRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZKLib Fingerprint API',
      version: '1.0.0',
      description:
        'API for managing fingerprint attendance system using ZKTeco devices',
      contact: {
        name: 'API Support',
        email: 'hussain.jazing.21@gmail.com',
      },
    },
    servers: [
      {
        url:
          process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts',
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL encoding

// API Documentation
app.use(
  '/api-docs',
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerDocs)
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/device', deviceRoutes);

// Unique attendances endpoint
const attendanceController = new AttendanceController();
app.get(
  '/api/attendances-unique',
  attendanceController.getUniqueAttendances.bind(
    attendanceController
  )
);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
