import type { NextFunction, Request, Response } from 'express';
import { type DeviceConnectionParams, deviceConnectionSchema } from '../schemas/validationSchemas';
import { ZKService } from '../services/zkService';

/**
 * @swagger
 * tags:
 *   name: Device
 *   description: ZK device management and connection operations
 */

export class DeviceController {
  private zkService: ZKService;

  constructor() {
    this.zkService = new ZKService(
      process.env.ZK_DEVICE_IP || '192.168.1.201',
      Number.parseInt(process.env.ZK_DEVICE_PORT || '4370'),
      Number.parseInt(process.env.ZK_TIMEOUT || '5000'),
      Number.parseInt(process.env.ZK_INPORT || '5200')
    );
  }

  /**
   * Extract device connection parameters from request
   */
  private getDeviceParams(req: Request): DeviceConnectionParams {
    // Try to get params from query first, then from body
    const params = { ...req.query, ...req.body };
    const result = deviceConnectionSchema.safeParse(params);

    if (result.success) {
      return result.data;
    }

    // If validation fails, return empty object (will use defaults)
    return {};
  }

  /**
   * Create ZK service instance with request params or defaults
   */
  private createZKService(deviceParams: DeviceConnectionParams): ZKService {
    return ZKService.createWithConnection(deviceParams.ip, deviceParams.port);
  }

  /**
   * @swagger
   * /api/device/connect:
   *   post:
   *     summary: Create socket connection to ZK device
   *     tags: [Device]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ip:
   *                 type: string
   *                 description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *                 example: "192.168.1.201"
   *               port:
   *                 type: number
   *                 description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *                 example: 4370
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Successfully connected to device
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               message: "Successfully connected to ZK device"
   *       500:
   *         description: Connection failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async connect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      await zkService.disconnect(); // Disconnect after testing connection

      res.status(200).json({
        success: true,
        message: 'Successfully connected to ZK device',
        deviceInfo: {
          ip: deviceParams.ip || process.env.ZK_DEVICE_IP || '192.168.1.201',
          port: deviceParams.port || Number.parseInt(process.env.ZK_DEVICE_PORT || '4370'),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/disconnect:
   *   post:
   *     summary: Disconnect from ZK device
   *     tags: [Device]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ip:
   *                 type: string
   *                 description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *                 example: "192.168.1.201"
   *               port:
   *                 type: number
   *                 description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *                 example: 4370
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Successfully disconnected from device
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               message: "Successfully disconnected from ZK device"
   *       500:
   *         description: Disconnection failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async disconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Successfully disconnected from ZK device',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/info:
   *   get:
   *     summary: Get device information
   *     tags: [Device]
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Successfully retrieved device information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeviceInfoResponse'
   *             example:
   *               success: true
   *               data:
   *                 userCounts: 5
   *                 logCounts: 2
   *                 logCapacity: 100000
   *       500:
   *         description: Failed to get device information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      const deviceInfo = await zkService.getInfo();
      await zkService.disconnect();

      res.status(200).json({
        success: true,
        data: deviceInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/disable:
   *   post:
   *     summary: Disable the ZK device
   *     tags: [Device]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ip:
   *                 type: string
   *                 description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *                 example: "192.168.1.201"
   *               port:
   *                 type: number
   *                 description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *                 example: 4370
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Device successfully disabled
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               message: "Device successfully disabled"
   *       500:
   *         description: Failed to disable device
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async disableDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      const zkInstance = zkService.getZKInstance();
      if (!zkInstance) {
        throw new Error('Failed to get ZK instance');
      }
      await zkInstance.disableDevice();
      await zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Device successfully disabled',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/enable:
   *   post:
   *     summary: Enable the ZK device
   *     tags: [Device]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               ip:
   *                 type: string
   *                 description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *                 example: "192.168.1.201"
   *               port:
   *                 type: number
   *                 description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *                 example: 4370
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Device successfully enabled
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               message: "Device successfully enabled"
   *       500:
   *         description: Failed to enable device
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async enableDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      const zkInstance = zkService.getZKInstance();
      if (!zkInstance) {
        throw new Error('Failed to get ZK instance');
      }
      await zkInstance.enableDevice();
      await zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Device successfully enabled',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/realtime-logs:
   *   get:
   *     summary: Get real-time logs from device (Server-Sent Events)
   *     tags: [Device]
   *     parameters:
   *       - in: query
   *         name: ip
   *         schema:
   *           type: string
   *         description: Device IP address (optional, defaults to ZK_DEVICE_IP env var)
   *       - in: query
   *         name: port
   *         schema:
   *           type: number
   *         description: Device port (optional, defaults to ZK_DEVICE_PORT env var)
   *     responses:
   *       200:
   *         description: Real-time log stream established
   *         content:
   *           text/event-stream:
   *             schema:
   *               type: string
   *               example: "data: {\"userId\": \"EMP001\", \"attTime\": \"2023-12-01T10:00:00Z\", \"verifyMethod\": 1, \"inOutMode\": 1}\n\n"
   *       500:
   *         description: Failed to establish real-time log connection
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getRealTimeLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      await zkService.connect();

      // Set up real-time log callback
      await zkService.getRealTimeLogs((logData) => {
        res.write(`data: ${JSON.stringify(logData)}\n\n`);
      });

      // Handle client disconnect
      req.on('close', async () => {
        await zkService.disconnect();
      });
    } catch (error) {
      next(error);
    }
  }
}
