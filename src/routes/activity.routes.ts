import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate as authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';

const router = Router();
const activityController = new ActivityController();

router.post(
  '/activities/new',
  authMiddleware,
  upload.single('image'),
  (req, res, next) => {
    activityController.create(req, res).catch(next);
  }
);

router.put(
  '/:id/approve',
  authMiddleware,
  (req, res, next) => {
    activityController.approveParticipant(req, res).catch(next);
  }
);

export default router;