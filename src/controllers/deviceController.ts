import type {
  NextFunction,
  Request,
  Response,
} from 'express';
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
   * @swagger
   * /api/device/connect:
   *   post:
   *     summary: Create socket connection to ZK device
   *     tags: [Device]
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
  async connect(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      await this.zkService.disconnect(); // Disconnect after testing connection

      res.status(200).json({
        success: true,
        message: 'Successfully connected to ZK device',
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/disconnect:
   *   post:
   *     summary: Disconnect from ZK device
   *     tags: [Device]
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
  async disconnect(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.disconnect();

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
  async getInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      const deviceInfo = await this.zkService.getInfo();
      await this.zkService.disconnect();

      res.status(200).json({
        success: true,
        data: deviceInfo,
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/disable:
   *   post:
   *     summary: Disable the ZK device
   *     tags: [Device]
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
  async disableDevice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      const zkInstance = (this.zkService as any).zkInstance;
      await zkInstance.disableDevice();
      await this.zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Device successfully disabled',
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/enable:
   *   post:
   *     summary: Enable the ZK device
   *     tags: [Device]
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
  async enableDevice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      const zkInstance = (this.zkService as any).zkInstance;
      await zkInstance.enableDevice();
      await this.zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Device successfully enabled',
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/device/realtime-logs:
   *   get:
   *     summary: Get real-time logs from device (Server-Sent Events)
   *     tags: [Device]
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
  async getRealTimeLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      await this.zkService.connect();

      // Set up real-time log callback
      await this.zkService.getRealTimeLogs((logData) => {
        res.write(`data: ${JSON.stringify(logData)}\n\n`);
      });

      // Handle client disconnect
      req.on('close', async () => {
        await this.zkService.disconnect();
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }
}
