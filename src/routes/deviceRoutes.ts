import { Router } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { UserController } from '../controllers/userController';
import { AttendanceController } from '../controllers/attendanceController';

const router = Router();
const deviceController = new DeviceController();
const userController = new UserController();
const attendanceController = new AttendanceController();

// POST /api/device/connect - Create socket connection to device
router.post(
  '/connect',
  deviceController.connect.bind(deviceController)
);

// POST /api/device/disconnect - Disconnect from device
router.post(
  '/disconnect',
  deviceController.disconnect.bind(deviceController)
);

// GET /api/device/info - Get device information
router.get(
  '/info',
  deviceController.getInfo.bind(deviceController)
);

// POST /api/device/disable - Disable the device
router.post(
  '/disable',
  deviceController.disableDevice.bind(deviceController)
);

// POST /api/device/enable - Enable the device
router.post(
  '/enable',
  deviceController.enableDevice.bind(deviceController)
);

// GET /api/device/users - Get all users from device
router.get(
  '/users',
  userController.getAllUsers.bind(userController)
);

// GET /api/device/attendances - Get attendances from device
router.get(
  '/attendances',
  attendanceController.getAttendances.bind(
    attendanceController
  )
);

// GET /api/device/attendances/summary - Get attendance summary statistics
router.get(
  '/attendances/summary',
  attendanceController.getAttendanceSummary.bind(
    attendanceController
  )
);

// DELETE /api/device/attendances/clear - Clear attendance logs
router.delete(
  '/attendances/clear',
  attendanceController.clearAttendanceLogs.bind(
    attendanceController
  )
);

// GET /api/device/realtime-logs - Get real-time logs (Server-Sent Events)
router.get(
  '/realtime-logs',
  deviceController.getRealTimeLogs.bind(deviceController)
);

export default router;
