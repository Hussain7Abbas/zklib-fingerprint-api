declare module 'node-zklib' {
  export interface ZKDeviceInfoRaw {
    userCounts: number;
    logCounts: number;
    logCapacity: number;
  }

  export interface ZKUserRaw {
    uid: number;
    role: number;
    password: string;
    name: string;
    cardno: number;
    userId: string;
  }

  export interface ZKUsersResponse {
    data: ZKUserRaw[];
  }

  export interface ZKAttendanceRaw {
    userSn: number;
    deviceUserId: string;
    recordTime: string;
    ip: string;
  }

  export interface ZKAttendancesResponse {
    data: ZKAttendanceRaw[];
  }

  export interface ZKRealTimeLogRaw {
    userId: string;
    attTime: Date;
    verifyMethod: number;
    inOutMode: number;
  }

  export default class ZKLib {
    constructor(ip: string, port: number, timeout: number, inport: number);

    createSocket(): Promise<void>;
    disconnect(): Promise<void>;
    getInfo(): Promise<ZKDeviceInfoRaw>;
    getUsers(): Promise<ZKUsersResponse>;
    setUser(
      uid: number,
      userid: string,
      name: string,
      password?: string,
      role?: number,
      cardno?: number
    ): Promise<void>;
    getAttendances(): Promise<ZKAttendancesResponse>;
    clearAttendanceLog(): Promise<void>;
    getRealTimeLogs(callback: (data: ZKRealTimeLogRaw) => void): Promise<void>;
    disableDevice(): Promise<void>;
    enableDevice(): Promise<void>;
  }
}
