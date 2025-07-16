import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userControllers.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('username').isLength({ min: 2 }).withMessage('Username must be at least 2 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  userController.registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  userController.loginUser
);

router.get('/profile', authMiddleware.authUser, userController.getUserProfile);
router.get('/logout', authMiddleware.authUser, userController.logoutUser);

export default router;
