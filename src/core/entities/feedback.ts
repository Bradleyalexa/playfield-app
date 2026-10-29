export interface SessionFeedback {
  id: string;
  sessionId?: string;
  sessionTitle?: string;
  sportType?: string;
  rating?: number; // 1 - 5 (opsional)
  message: string;
  senderName?: string;
  senderContact?: string;
  createdAt: string;
  userAgent?: string;
}

