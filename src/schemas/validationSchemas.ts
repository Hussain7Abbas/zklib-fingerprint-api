import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: number
 *           description: User unique ID
 *         userid:
 *           type: string
 *           description: User ID string
 *         name:
 *           type: string
 *           description: User name
 *         role:
 *           type: number
 *           description: User role
 *         password:
 *           type: string
 *           description: User password
 *         cardno:
 *           type: number
 *           description: Card number
 *     Attendance:
 *       type: object
 *       properties:
 *         deviceUserId:
 *           type: string
 *           description: Device user ID
 *         attTime:
 *           type: string
 *           format: date-time
 *           description: Attendance time
 *         verifyMethod:
 *           type: number
 *           description: Verification method
 *         inOutMode:
 *           type: number
 *           description: In/Out mode
 *         workCode:
 *           type: number
 *           description: Work code
 */

// Query parameters for attendance filtering
export const getAttendancesSchema = z
  .object({
    fromDate: z
      .string()
      .datetime({
        message: 'fromDate must be a valid ISO 8601 datetime string',
      })
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    toDate: z
      .string()
      .datetime({
        message: 'toDate must be a valid ISO 8601 datetime string',
      })
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  })
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        return data.fromDate <= data.toDate;
      }
      return true;
    },
    {
      message: 'fromDate must be before or equal to toDate',
      path: ['fromDate'],
    }
  );

// Request body for updating user name
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
});

// Path parameters for user operations
export const userParamsSchema = z.object({
  uid: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: 'uid must be a positive number',
    }),
});

// General API response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      message: z.string(),
      statusCode: z.number(),
    })
    .optional(),
  meta: z
    .object({
      total: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    })
    .optional(),
});

// Type exports for TypeScript
export type GetAttendancesQuery = z.infer<typeof getAttendancesSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
