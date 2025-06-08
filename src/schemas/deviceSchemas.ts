/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceInfo:
 *       type: object
 *       properties:
 *         userCounts:
 *           type: number
 *           description: Number of users registered on the device
 *           example: 5
 *         logCounts:
 *           type: number
 *           description: Number of attendance logs on the device
 *           example: 2
 *         logCapacity:
 *           type: number
 *           description: Maximum capacity for attendance logs
 *           example: 100000
 *
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: number
 *           description: User unique identifier
 *           example: 1
 *         userid:
 *           type: string
 *           description: User ID string
 *           example: "1"
 *         name:
 *           type: string
 *           description: User name
 *           example: "Gjt"
 *         role:
 *           type: number
 *           description: User role (0 = normal user, 1 = admin)
 *           example: 0
 *         password:
 *           type: string
 *           description: User password
 *           example: ""
 *         cardno:
 *           type: number
 *           description: Card number
 *           example: 0
 *
 *     Attendance:
 *       type: object
 *       properties:
 *         userSn:
 *           type: number
 *           description: User serial number
 *           example: 6550
 *         deviceUserId:
 *           type: string
 *           description: Device user ID
 *           example: "5"
 *         recordTime:
 *           type: string
 *           format: date-time
 *           description: Attendance record timestamp
 *           example: "2025-06-07T10:21:02.000Z"
 *         ip:
 *           type: string
 *           description: Device IP address
 *           example: "192.168.0.201"
 *         attTime:
 *           type: string
 *           format: date-time
 *           description: Formatted attendance time (same as recordTime)
 *           example: "2025-06-07T10:21:02.000Z"
 *
 *     AttendanceSummary:
 *       type: object
 *       properties:
 *         totalAttendances:
 *           type: number
 *           description: Total number of attendance records
 *           example: 2
 *         uniqueUsers:
 *           type: number
 *           description: Number of unique users with attendance records
 *           example: 1
 *         dateRange:
 *           type: object
 *           properties:
 *             from:
 *               type: string
 *               format: date-time
 *               description: Start date of the range
 *               example: "2025-01-01T00:00:00.000Z"
 *             to:
 *               type: string
 *               format: date-time
 *               description: End date of the range
 *               example: "2025-12-31T23:59:59.999Z"
 *         attendancesByDate:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date in YYYY-MM-DD format
 *                 example: "2025-06-07"
 *               count:
 *                 type: number
 *                 description: Number of attendances on this date
 *                 example: 2
 *
 *     RealTimeLog:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *           example: "5"
 *         attTime:
 *           type: string
 *           format: date-time
 *           description: Attendance time
 *           example: "2025-06-08T10:00:00Z"
 *         verifyMethod:
 *           type: number
 *           description: Verification method (1 = fingerprint, 2 = password, etc.)
 *           example: 1
 *         inOutMode:
 *           type: number
 *           description: In/Out mode (1 = in, 2 = out)
 *           example: 1
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *
 *     UsersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 5
 *
 *     AttendancesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Attendance'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 2
 *             fromDate:
 *               type: string
 *               format: date-time
 *               example: "2025-06-07T00:00:00.000Z"
 *             toDate:
 *               type: string
 *               format: date-time
 *               example: "2025-06-08T23:59:59.999Z"
 *
 *     UniqueAttendance:
 *       type: object
 *       properties:
 *         userSn:
 *           type: number
 *           description: User serial number
 *           example: 6550
 *         deviceUserId:
 *           type: string
 *           description: Device user ID
 *           example: "5"
 *         username:
 *           type: string
 *           description: User name
 *           example: "John Doe"
 *         date:
 *           type: string
 *           description: Date in YYYY-MM-DD format
 *           example: "25-06-07"
 *         checkIn:
 *           type: string
 *           description: First attendance record time for the day (ISO timestamp or HH:mm:ss if timezone provided)
 *           example: "08:30:00"
 *         checkOut:
 *           type: string
 *           description: Last attendance record time for the day (ISO timestamp or HH:mm:ss if timezone provided)
 *           example: "17:30:00"
 *
 *     UniqueAttendancesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UniqueAttendance'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 1
 *             fromDate:
 *               type: string
 *               format: date-time
 *               example: "2025-06-07T00:00:00.000Z"
 *             toDate:
 *               type: string
 *               format: date-time
 *               example: "2025-06-08T23:59:59.999Z"
 *
 *     DeviceInfoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/DeviceInfo'
 */

// This file contains only Swagger documentation comments
// No actual exports are needed
