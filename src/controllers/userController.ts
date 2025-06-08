import type { NextFunction, Request, Response } from 'express';
import { type DeviceConnectionParams, deviceConnectionSchema } from '../schemas/validationSchemas';
import { ZKService } from '../services/zkService';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations for fingerprint device
 */

export class UserController {
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
   * /api/users:
   *   get:
   *     summary: Get all users from fingerprint device
   *     tags: [Users]
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
   *         description: Successfully retrieved all users
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UsersResponse'
   *             example:
   *               success: true
   *               data:
   *                 - uid: 1
   *                   userid: "1"
   *                   name: "Gjt"
   *                   role: 0
   *                   password: ""
   *                   cardno: 0
   *                 - uid: 2
   *                   userid: "2"
   *                   name: "Hus"
   *                   role: 0
   *                   password: ""
   *                   cardno: 0
   *               meta:
   *                 total: 5
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      const users = await zkService.getUsers();
      await zkService.disconnect();

      res.status(200).json({
        success: true,
        data: users,
        meta: {
          total: users.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
