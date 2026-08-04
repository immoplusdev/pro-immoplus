export interface Notification {
  id: string;
  type: string;
  pushType: string;
  subject: string;
  message: string;
  collection: string;
  item: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NotificationListResponse {
  data: Notification[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
