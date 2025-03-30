import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload'; 

const router = Router();
const activityController = new ActivityController();

router.post(
  '/activities/new',
  authMiddleware, 
  upload.single('image'),
  activityController.create
);


export default router;