import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const notificationsRouter = Router();

// Get Notifications
notificationsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const notifications = dbStore.getData().notifications.filter(n => n.userId === req.user?.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  res.json({ notifications, unreadCount });
});

// Mark Single As Read
notificationsRouter.post('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const notif = dbStore.getData().notifications.find(n => n.id === req.params.id && n.userId === req.user?.id);
  if (notif) {
    notif.read = true;
    dbStore.save();
  }
  res.json({ success: true, notification: notif });
});

// Mark All As Read
notificationsRouter.post('/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  dbStore.getData().notifications.forEach(n => {
    if (n.userId === req.user?.id) {
      n.read = true;
    }
  });
  dbStore.save();
  res.json({ success: true });
});
