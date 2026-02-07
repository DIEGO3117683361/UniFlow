import { User, Course, Membership, ClassSession, Announcement, Observation, Role } from '../types';

// Keys
const K_USERS = 'uniflow_users';
const K_COURSES = 'uniflow_courses';
const K_MEMBERSHIPS = 'uniflow_memberships';
const K_CLASSES = 'uniflow_classes';
const K_ANNOUNCEMENTS = 'uniflow_announcements';
const K_OBSERVATIONS = 'uniflow_observations';
const K_SESSION = 'uniflow_session';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// Initialize with some data if empty
const seedData = () => {
  if (!localStorage.getItem(K_USERS)) {
    localStorage.setItem(K_USERS, JSON.stringify([]));
    localStorage.setItem(K_COURSES, JSON.stringify([]));
    localStorage.setItem(K_MEMBERSHIPS, JSON.stringify([]));
    localStorage.setItem(K_CLASSES, JSON.stringify([]));
    localStorage.setItem(K_ANNOUNCEMENTS, JSON.stringify([]));
    localStorage.setItem(K_OBSERVATIONS, JSON.stringify([]));
  }
};

seedData();

// --- Auth ---

// Verifica si el email existe
export const checkEmailExists = (email: string): boolean => {
  const users: User[] = JSON.parse(localStorage.getItem(K_USERS) || '[]');
  return users.some(u => u.email === email);
};

export const login = (email: string, name?: string): User => {
  const users: User[] = JSON.parse(localStorage.getItem(K_USERS) || '[]');
  let user = users.find(u => u.email === email);
  
  if (!user) {
    if (!name) throw new Error("Nombre requerido para nuevos usuarios");
    // Registro nuevo
    user = { 
        id: generateId(), 
        name, 
        email, 
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random` 
    };
    users.push(user);
    localStorage.setItem(K_USERS, JSON.stringify(users));
  }
  
  localStorage.setItem(K_SESSION, JSON.stringify(user));
  return user;
};

export const updateUser = (userId: string, data: Partial<User>): User => {
    const users: User[] = JSON.parse(localStorage.getItem(K_USERS) || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        localStorage.setItem(K_USERS, JSON.stringify(users));
        
        // Update session if it's the current user
        const session = getSession();
        if (session && session.id === userId) {
            localStorage.setItem(K_SESSION, JSON.stringify(updatedUser));
        }
        return updatedUser;
    }
    throw new Error("Usuario no encontrado");
};

export const getSession = (): User | null => {
  const s = localStorage.getItem(K_SESSION);
  return s ? JSON.parse(s) : null;
};

export const logout = () => {
  localStorage.removeItem(K_SESSION);
};

// --- Courses ---
export const getMyCourses = (userId: string): (Course & { myRole: Role })[] => {
  const memberships: Membership[] = JSON.parse(localStorage.getItem(K_MEMBERSHIPS) || '[]');
  const courses: Course[] = JSON.parse(localStorage.getItem(K_COURSES) || '[]');
  
  const myMemberships = memberships.filter(m => m.userId === userId);
  
  return myMemberships.map(m => {
    const course = courses.find(c => c.id === m.courseId);
    if (!course) return null;
    return { ...course, myRole: m.role };
  }).filter(Boolean) as (Course & { myRole: Role })[];
};

export const createCourse = (userId: string, data: { name: string; subject: string; description: string }): Course => {
  const courses: Course[] = JSON.parse(localStorage.getItem(K_COURSES) || '[]');
  const memberships: Membership[] = JSON.parse(localStorage.getItem(K_MEMBERSHIPS) || '[]');

  const newCourse: Course = {
    id: generateId(),
    code: generateCode(),
    creatorId: userId,
    createdAt: new Date().toISOString(),
    ...data
  };

  const newMembership: Membership = {
    courseId: newCourse.id,
    userId: userId,
    role: 'admin',
    joinedAt: new Date().toISOString()
  };

  courses.push(newCourse);
  memberships.push(newMembership);

  localStorage.setItem(K_COURSES, JSON.stringify(courses));
  localStorage.setItem(K_MEMBERSHIPS, JSON.stringify(memberships));

  return newCourse;
};

export const joinCourse = (userId: string, code: string): { success: boolean; message: string; courseId?: string } => {
  const courses: Course[] = JSON.parse(localStorage.getItem(K_COURSES) || '[]');
  const memberships: Membership[] = JSON.parse(localStorage.getItem(K_MEMBERSHIPS) || '[]');

  const course = courses.find(c => c.code === code);
  if (!course) return { success: false, message: 'Código inválido' };

  const existing = memberships.find(m => m.courseId === course.id && m.userId === userId);
  if (existing) return { success: false, message: 'Ya eres miembro de este curso' };

  const newMembership: Membership = {
    courseId: course.id,
    userId: userId,
    role: 'student',
    joinedAt: new Date().toISOString()
  };

  memberships.push(newMembership);
  localStorage.setItem(K_MEMBERSHIPS, JSON.stringify(memberships));
  
  return { success: true, message: 'Te uniste correctamente', courseId: course.id };
};

// --- Classes ---
export const getClasses = (courseId: string): ClassSession[] => {
  const classes: ClassSession[] = JSON.parse(localStorage.getItem(K_CLASSES) || '[]');
  return classes.filter(c => c.courseId === courseId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const createClass = (data: Omit<ClassSession, 'id'>) => {
  const classes: ClassSession[] = JSON.parse(localStorage.getItem(K_CLASSES) || '[]');
  const newClass: ClassSession = { ...data, id: generateId() };
  classes.push(newClass);
  localStorage.setItem(K_CLASSES, JSON.stringify(classes));
  return newClass;
};

// --- Announcements ---
export const getAnnouncements = (courseId: string): (Announcement & { authorName: string })[] => {
  const announcements: Announcement[] = JSON.parse(localStorage.getItem(K_ANNOUNCEMENTS) || '[]');
  const users: User[] = JSON.parse(localStorage.getItem(K_USERS) || '[]');
  
  return announcements
    .filter(a => a.courseId === courseId)
    .sort((a, b) => b.isPinned === a.isPinned ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : b.isPinned ? 1 : -1)
    .map(a => ({
      ...a,
      authorName: users.find(u => u.id === a.authorId)?.name || 'Usuario'
    }));
};

export const createAnnouncement = (data: Omit<Announcement, 'id'>) => {
  const list: Announcement[] = JSON.parse(localStorage.getItem(K_ANNOUNCEMENTS) || '[]');
  const newItem: Announcement = { ...data, id: generateId() };
  list.push(newItem);
  localStorage.setItem(K_ANNOUNCEMENTS, JSON.stringify(list));
  return newItem;
};

// --- Members & Observations ---
export const getMembers = (courseId: string): (User & { role: Role })[] => {
  const memberships: Membership[] = JSON.parse(localStorage.getItem(K_MEMBERSHIPS) || '[]');
  const users: User[] = JSON.parse(localStorage.getItem(K_USERS) || '[]');
  
  const courseMembers = memberships.filter(m => m.courseId === courseId);
  return courseMembers.map(m => {
    const user = users.find(u => u.id === m.userId);
    if (!user) return null;
    return { ...user, role: m.role };
  }).filter(Boolean) as (User & { role: Role })[];
};

export const getObservations = (courseId: string, studentId: string): Observation[] => {
    const obs: Observation[] = JSON.parse(localStorage.getItem(K_OBSERVATIONS) || '[]');
    return obs.filter(o => o.courseId === courseId && o.studentId === studentId);
}

export const createObservation = (data: Omit<Observation, 'id' | 'createdAt'>) => {
    const obs: Observation[] = JSON.parse(localStorage.getItem(K_OBSERVATIONS) || '[]');
    const newObs: Observation = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    obs.push(newObs);
    localStorage.setItem(K_OBSERVATIONS, JSON.stringify(obs));
    return newObs;
}