import dayjs from 'dayjs';
import ZKLib from 'node-zklib';

export interface ZKUser {
  uid: number;
  userid: string;
  name: string;
  role: number;
  password: string;
  cardno: number;
}

export interface ZKAttendance {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
  ip: string;
}

export interface ZKDeviceInfo {
  userCounts: number;
  logCounts: number;
  logCapacity: number;
}

export interface ZKRealTimeLog {
  userId: string;
  attTime: Date;
  verifyMethod: number;
  inOutMode: number;
}

export interface ZKUserRaw {
  uid: number;
  userid: string;
  name: string;
  role: number;
  password: string;
  cardno: number;
}

export interface ZKAttendanceRaw {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
  ip: string;
}

export class ZKService {
  private zkInstance: ZKLib | null = null;
  private ip: string;
  private port: number;
  private timeout: number;
  private inport: number;

  constructor(
    ip = '192.168.1.201',
    port = 4370,
    timeout = 5000,
    inport = 5200
  ) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.inport = inport;
  }

  /**
   * Create socket connection to ZK device
   */
  async connect(): Promise<void> {
    try {
      this.zkInstance = new ZKLib(
        this.ip,
        this.port,
        this.timeout,
        this.inport
      );
      console.log('✅', {
        ip: this.ip,
        port: this.port,
        timeout: this.timeout,
        inport: this.inport,
      });
      await this.zkInstance.createSocket();
      console.log(
        `Connected to ZK device at ${this.ip}:${this.port}`
      );
    } catch (error) {
      console.error(
        'Failed to connect to ZK device:',
        error
      );
      throw new Error(
        `Failed to connect to ZK device: ${error}`
      );
    }
  }

  /**
   * Disconnect from ZK device
   */
  async disconnect(): Promise<void> {
    if (this.zkInstance) {
      try {
        await this.zkInstance.disconnect();
        this.zkInstance = null;
        console.log('Disconnected from ZK device');
      } catch (error) {
        console.error(
          'Error disconnecting from ZK device:',
          error
        );
      }
    }
  }

  /**
   * Get device information
   */
  async getInfo(): Promise<ZKDeviceInfo> {
    this.ensureConnected();
    try {
      const rawInfo = await this.zkInstance!.getInfo();
      return {
        userCounts: rawInfo.userCounts || 0,
        logCounts: rawInfo.logCounts || 0,
        logCapacity: rawInfo.logCapacity || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get device info: ${error}`
      );
    }
  }

  /**
   * Get all users from device
   */
  async getUsers(): Promise<ZKUser[]> {
    this.ensureConnected();
    try {
      const response = await this.zkInstance!.getUsers();
      return response.data.map((user) => ({
        uid: user.uid,
        userid: user.userId,
        name: user.name,
        role: user.role,
        password: user.password,
        cardno: user.cardno,
      }));
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  /**
   * Get attendances from device with optional date range filtering
   */
  async getAttendances(
    fromDate?: Date,
    toDate?: Date
  ): Promise<ZKAttendance[]> {
    this.ensureConnected();
    try {
      const attendances =
        await this.zkInstance!.getAttendances();
      console.log('attendances', attendances);

      let filteredAttendances = attendances.data;

      // Filter by date range if provided
      if (fromDate || toDate) {
        filteredAttendances = this.filterAttendancesByDate(
          filteredAttendances,
          fromDate,
          toDate
        );
      }

      console.log(
        'filteredAttendances',
        filteredAttendances
      );

      return filteredAttendances;
    } catch (error) {
      console.error('Attendance error:', error);
      throw new Error(
        `Failed to get attendances: ${JSON.stringify(
          error
        )}`
      );
    }
  }

  /**
   * Clear attendance logs from device
   */
  async clearAttendanceLogs(): Promise<void> {
    this.ensureConnected();
    try {
      await this.zkInstance!.clearAttendanceLog();
    } catch (error) {
      throw new Error(
        `Failed to clear attendance logs: ${error}`
      );
    }
  }

  /**
   * Get real-time logs (for monitoring)
   */
  async getRealTimeLogs(
    callback: (data: ZKRealTimeLog) => void
  ): Promise<void> {
    this.ensureConnected();
    try {
      await this.zkInstance!.getRealTimeLogs(callback);
    } catch (error) {
      throw new Error(
        `Failed to get real-time logs: ${error}`
      );
    }
  }

  /**
   * Filter attendances by date range
   */
  private filterAttendancesByDate(
    attendances: ZKAttendance[],
    fromDate?: Date,
    toDate?: Date
  ): ZKAttendanceRaw[] {
    return attendances.filter(
      (attendance: ZKAttendance) => {
        const attTime = dayjs(attendance.recordTime);
        const from = fromDate ? dayjs(fromDate) : null;
        const to = toDate ? dayjs(toDate) : null;

        if (from && to) {
          return (
            attTime.isAfter(from) && attTime.isBefore(to)
          );
        }
        if (from) {
          return attTime.isAfter(from);
        }
        if (to) {
          return attTime.isBefore(to);
        }
        return true;
      }
    );
  }

  /**
   * Ensure device is connected
   */
  private ensureConnected(): void {
    if (!this.zkInstance) {
      throw new Error(
        'ZK device is not connected. Call connect() first.'
      );
    }
  }
}
