import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  type DeviceConnectionParams,
  deviceConnectionSchema,
  getAttendancesSchema,
  getUniqueAttendancesSchema,
} from '../schemas/validationSchemas';
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
    // Initialize dayjs plugins
    dayjs.extend(utc);
    dayjs.extend(timezone);

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
  private getDeviceParams(
    req: Request
  ): DeviceConnectionParams {
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
  private createZKService(
    deviceParams: DeviceConnectionParams
  ): ZKService {
    return ZKService.createWithConnection(
      deviceParams.ip,
      deviceParams.port
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
   *                   username: "John Doe"
   *                   recordTime: "2025-06-07T10:21:02.000Z"
   *                   ip: "192.168.0.201"
   *                   attTime: "2025-06-07T10:21:02.000Z"
   *                 - userSn: 6551
   *                   deviceUserId: "5"
   *                   username: "John Doe"
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

      const { fromDate, toDate, ip, port } =
        queryValidation.data;
      const zkService = this.createZKService({ ip, port });

      await zkService.connect();

      // Fetch both attendances and users
      const users = await zkService.getUsers();
      const attendances = await zkService.getAttendances(
        fromDate,
        toDate
      );

      await zkService.disconnect();

      console.log(users);
      // Create a mapping object with deviceUserId as key and username as value
      const userMapping: { [key: string]: string } = {};
      for (const user of users) {
        userMapping[user.userid] = user.name;
      }

      // Format the response data and add username
      const formattedAttendances = attendances.map(
        (attendance) => ({
          ...attendance,
          username:
            userMapping[attendance.deviceUserId] ||
            'Unknown',
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

      const { fromDate, toDate, ip, port } =
        queryValidation.data;
      const zkService = this.createZKService({ ip, port });

      await zkService.connect();
      const attendances = await zkService.getAttendances(
        fromDate,
        toDate
      );
      await zkService.disconnect();

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
      next(error);
    }
  }

  /**
   * @swagger
   * /api/attendances-unique:
   *   get:
   *     summary: Get unique daily attendances with check-in/check-out times
   *     tags: [Attendances]
   *     description: Get attendances grouped by user and date, showing first (check-in) and last (check-out) records for each day
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
   *       - in: query
   *         name: timezone
   *         schema:
   *           type: string
   *         description: IANA timezone for formatting check-in/check-out times (e.g., America/New_York, UTC). If provided, times will be formatted as HH:mm:ss in the specified timezone, otherwise as ISO timestamps.
   *         example: "America/New_York"
   *     responses:
   *       200:
   *         description: Successfully retrieved unique daily attendances
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UniqueAttendancesResponse'
   *             example:
   *               success: true
   *               data:
   *                 - userSn: 6550
   *                   deviceUserId: "5"
   *                   username: "John Doe"
   *                   date: "2025-06-07"
   *                   checkIn: "08:30:00"
   *                   checkOut: "17:30:00"
   *               meta:
   *                 total: 1
   *                 timezone: "America/New_York"
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
  async getUniqueAttendances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate query parameters
      const queryValidation =
        getUniqueAttendancesSchema.safeParse(req.query);
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

      const { fromDate, toDate, ip, port, timezone } =
        queryValidation.data;
      const zkService = this.createZKService({ ip, port });

      await zkService.connect();

      // Fetch both attendances and users
      const users = await zkService.getUsers();
      const attendances = await zkService.getAttendances(
        fromDate,
        toDate
      );

      await zkService.disconnect();

      // Create a mapping object with deviceUserId as key and username as value
      const userMapping: { [key: string]: string } = {};
      for (const user of users) {
        userMapping[user.userid] = user.name;
      }

      // Group attendances by user and date
      const groupedAttendances: { [key: string]: any[] } =
        {};

      for (const attendance of attendances) {
        const date = dayjs(attendance.recordTime).format(
          'YYYY-MM-DD'
        );
        const key = `${attendance.deviceUserId}_${date}`;

        if (!groupedAttendances[key]) {
          groupedAttendances[key] = [];
        }
        groupedAttendances[key].push(attendance);
      }

      // Create unique daily attendance records
      const uniqueAttendances = Object.keys(
        groupedAttendances
      ).map((key) => {
        const [deviceUserId, date] = key.split('_');
        const userAttendances = groupedAttendances[key];

        // Sort attendances by time to get first (check-in) and last (check-out)
        userAttendances.sort(
          (a, b) =>
            dayjs(a.recordTime).valueOf() -
            dayjs(b.recordTime).valueOf()
        );

        const checkIn = userAttendances[0];
        const checkOut =
          userAttendances[userAttendances.length - 1];

        // Format times based on timezone parameter
        const formatTime = (timestamp: string) => {
          if (timezone) {
            return dayjs(timestamp)
              .tz(timezone)
              .format('HH:mm:ss');
          }
          return dayjs(timestamp).toISOString();
        };

        return {
          userSn: checkIn.userSn,
          deviceUserId: deviceUserId,
          username: userMapping[deviceUserId] || 'Unknown',
          date: date,
          checkIn: formatTime(checkIn.recordTime),
          checkOut: formatTime(checkOut.recordTime),
        };
      });

      // Sort by date and deviceUserId for consistent ordering
      uniqueAttendances.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.deviceUserId.localeCompare(b.deviceUserId);
      });

      res.status(200).json({
        success: true,
        data: uniqueAttendances,
        meta: {
          total: uniqueAttendances.length,
          ...(fromDate && {
            fromDate: dayjs(fromDate).toISOString(),
          }),
          ...(toDate && {
            toDate: dayjs(toDate).toISOString(),
          }),
          ...(timezone && {
            timezone: timezone,
          }),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/attendances/clear:
   *   delete:
   *     summary: Clear all attendance logs from device
   *     tags: [Attendances]
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
      const deviceParams = this.getDeviceParams(req);
      const zkService = this.createZKService(deviceParams);

      await zkService.connect();
      await zkService.clearAttendanceLogs();
      await zkService.disconnect();

      res.status(200).json({
        success: true,
        message: 'Attendance logs successfully cleared',
      });
    } catch (error) {
      next(error);
    }
  }
}
