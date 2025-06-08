import dayjs from 'dayjs';
import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import { getAttendancesSchema } from '../schemas/validationSchemas';
import { ZKService } from '../services/zkService';

/**
 * @swagger
 * tags:
 *   name: Attendances
 *   description: Attendance management operations for fingerprint device
 */

export class AttendanceController {
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
   * /api/attendances:
   *   get:
   *     summary: Get attendances from fingerprint device
   *     tags: [Attendances]
   *     parameters:
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date for filtering attendances (ISO 8601 format)
   *         example: "2025-01-01T00:00:00.000Z"
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date for filtering attendances (ISO 8601 format)
   *         example: "2025-12-31T23:59:59.999Z"
   *     responses:
   *       200:
   *         description: Successfully retrieved attendances
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AttendancesResponse'
   *             example:
   *               success: true
   *               data:
   *                 - userSn: 6550
   *                   deviceUserId: "5"
   *                   recordTime: "2025-06-07T10:21:02.000Z"
   *                   ip: "192.168.0.201"
   *                   attTime: "2025-06-07T10:21:02.000Z"
   *                 - userSn: 6551
   *                   deviceUserId: "5"
   *                   recordTime: "2025-06-07T10:22:14.000Z"
   *                   ip: "192.168.0.201"
   *                   attTime: "2025-06-07T10:22:14.000Z"
   *               meta:
   *                 total: 2
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAttendances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate query parameters
      const queryValidation =
        getAttendancesSchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            message: `Invalid query parameters: ${queryValidation.error.errors
              .map((e) => e.message)
              .join(', ')}`,
            statusCode: 400,
          },
        });
        return;
      }

      const { fromDate, toDate } = queryValidation.data;

      await this.zkService.connect();
      const attendances =
        await this.zkService.getAttendances(
          fromDate,
          toDate
        );
      await this.zkService.disconnect();

      // Format the response data
      const formattedAttendances = attendances.map(
        (attendance) => ({
          ...attendance,
          attTime: dayjs(
            attendance.recordTime
          ).toISOString(),
        })
      );

      res.status(200).json({
        success: true,
        data: formattedAttendances,
        meta: {
          total: formattedAttendances.length,
          ...(fromDate && {
            fromDate: dayjs(fromDate).toISOString(),
          }),
          ...(toDate && {
            toDate: dayjs(toDate).toISOString(),
          }),
        },
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/attendances/summary:
   *   get:
   *     summary: Get attendance summary statistics
   *     tags: [Attendances]
   *     parameters:
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date for filtering attendances (ISO 8601 format)
   *         example: "2025-01-01T00:00:00.000Z"
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date for filtering attendances (ISO 8601 format)
   *         example: "2025-12-31T23:59:59.999Z"
   *     responses:
   *       200:
   *         description: Successfully retrieved attendance summary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AttendanceSummary'
   *             example:
   *               success: true
   *               data:
   *                 totalAttendances: 2
   *                 uniqueUsers: 1
   *                 dateRange: {}
   *                 attendancesByDate:
   *                   - date: "2025-06-07"
   *                     count: 2
   *       400:
   *         description: Invalid query parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAttendanceSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate query parameters
      const queryValidation =
        getAttendancesSchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            message: `Invalid query parameters: ${queryValidation.error.errors
              .map((e) => e.message)
              .join(', ')}`,
            statusCode: 400,
          },
        });
        return;
      }

      const { fromDate, toDate } = queryValidation.data;

      await this.zkService.connect();
      const attendances =
        await this.zkService.getAttendances(
          fromDate,
          toDate
        );
      await this.zkService.disconnect();

      // Calculate summary statistics
      const uniqueUsers = new Set(
        attendances.map((att) => att.deviceUserId)
      ).size;

      // Group attendances by date
      const attendancesByDate = attendances.reduce(
        (acc, attendance) => {
          const date = dayjs(attendance.recordTime).format(
            'YYYY-MM-DD'
          );
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const attendancesByDateArray = Object.entries(
        attendancesByDate
      )
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.status(200).json({
        success: true,
        data: {
          totalAttendances: attendances.length,
          uniqueUsers,
          dateRange: {
            ...(fromDate && {
              from: dayjs(fromDate).toISOString(),
            }),
            ...(toDate && {
              to: dayjs(toDate).toISOString(),
            }),
          },
          attendancesByDate: attendancesByDateArray,
        },
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }

  /**
   * @swagger
   * /api/attendances/clear:
   *   delete:
   *     summary: Clear all attendance logs from device
   *     tags: [Attendances]
   *     responses:
   *       200:
   *         description: Attendance logs successfully cleared
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               message: "Attendance logs successfully cleared"
   *       500:
   *         description: Failed to clear attendance logs
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async clearAttendanceLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.zkService.connect();
      await this.zkService.clearAttendanceLogs();
      await this.zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Attendance logs successfully cleared',
      });
    } catch (error) {
      await this.zkService.disconnect();
      next(error);
    }
  }
}
