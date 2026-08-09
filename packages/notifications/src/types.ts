export interface FeedItem {
  id: string;
  type: string;
  title: string;
  body: string;
  appointmentId: string | null;
  readAt: string | null;
  createdAt: string;
}
