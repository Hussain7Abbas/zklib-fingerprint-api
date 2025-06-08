import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

// GET /api/users - Get all users
router.get(
  '/',
  userController.getAllUsers.bind(userController)
);

export default router;
