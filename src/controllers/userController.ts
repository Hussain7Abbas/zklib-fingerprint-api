import type {
  NextFunction,
  Request,
  Response,
} from 'express';
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
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users from fingerprint device
   *     tags: [Users]
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
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      const users = await this.zkService.getUsers();
      await this.zkService.disconnect();

      res.status(200).json({
        success: true,
        data: users,
        meta: {
          total: users.length,
        },
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }
}
