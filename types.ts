
export enum GradeLevel {
  Grade1 = "Lớp 1",
  Grade2 = "Lớp 2",
  Grade3 = "Lớp 3",
  Grade4 = "Lớp 4",
  Grade5 = "Lớp 5",
  Grade6 = "Lớp 6",
  Grade7 = "Lớp 7",
  Grade8 = "Lớp 8",
  Grade9 = "Lớp 9",
  Grade10 = "Lớp 10",
  Grade11 = "Lớp 11",
  Grade12 = "Lớp 12",
  University = "Đại học",
  General = "Tổng hợp"
}

export enum Subject {
  Math = "Toán học",
  Physics = "Vật lý",
  Chemistry = "Hóa học",
  Literature = "Ngữ văn",
  English = "Tiếng Anh",
  History = "Lịch sử",
  IT = "Tin học",
  Geography = "Địa lý",
  Biology = "Sinh học"
}

export enum ResourceType {
  PDF = "PDF",
  Video = "Video",
  Quiz = "Trắc nghiệm",
  Lesson = "Bài giảng"
}

export enum ResourceStatus {
  Pending = "Chờ duyệt",
  Approved = "Đã duyệt",
  Rejected = "Từ chối"
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  grade: GradeLevel;
  type: ResourceType;
  author: string;
  date: string;
  views: number;
  downloads: number;
  thumbnailUrl: string;
  contentUrl?: string; // URL to the actual content (PDF link, Youtube Embed, etc.)
  tags: string[];
  status: ResourceStatus;
  avgRating?: number; // Calculated average rating (1-5)
  reviewCount?: number; // Total number of reviews
}

export interface Review {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Admin Types
export enum UserRole {
  Admin = "Quản trị viên",
  User = "Người dùng"
}

export enum UserStatus {
  Active = "Hoạt động",
  Inactive = "Bị khóa"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinDate: string;
  status: UserStatus;
  avatarUrl: string;
}

// Category Types
export type CategoryType = 'SUBJECT' | 'GRADE' | 'RESOURCE_TYPE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  count: number; // Number of resources in this category
  status: 'Active' | 'Inactive';
}