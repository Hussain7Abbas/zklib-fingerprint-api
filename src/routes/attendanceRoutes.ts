import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';

const router = Router();
const attendanceController = new AttendanceController();

// GET /api/attendances - Get attendances with optional date filtering
router.get(
  '/',
  attendanceController.getAttendances.bind(
    attendanceController
  )
);

// GET /api/attendances/summary - Get attendance summary statistics
router.get(
  '/summary',
  attendanceController.getAttendanceSummary.bind(
    attendanceController
  )
);

// DELETE /api/attendances/clear - Clear all attendance logs
router.delete(
  '/clear',
  attendanceController.clearAttendanceLogs.bind(
    attendanceController
  )
);

export default router;
