export type Role = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Campos extendidos
  institution?: string;
  major?: string; // Carrera o profesión
  semester?: string;
}

export interface Course {
  id: string;
  name: string;
  subject: string;
  description: string;
  code: string; // Unique access code
  creatorId: string;
  createdAt: string;
}

export interface Membership {
  courseId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  time: string;
  location: string;
  topic: string;
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface Announcement {
  id: string;
  courseId: string;
  authorId: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
}

export interface Observation {
  id: string;
  courseId: string;
  studentId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// Helper types for UI
export interface CourseWithRole extends Course {
  myRole: Role;
}