import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CourseWithRole } from '../types';
import * as Storage from '../services/storage';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { Plus, LogOut, BookOpen, ArrowRight, Layers, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithRole[]>([]);
  
  // Modals
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Profile Form States
  const [profileData, setProfileData] = useState({ institution: '', major: '', semester: '' });

  const refreshCourses = () => {
    if (user) setCourses(Storage.getMyCourses(user.id));
  };

  useEffect(() => {
    refreshCourses();
    
    // Check if user needs onboarding (missing data)
    if (user && (!user.institution || !user.major)) {
        setProfileData({
            institution: user.institution || '',
            major: user.major || '',
            semester: user.semester || ''
        });
        // Small delay for better UX
        setTimeout(() => setIsSettingsModalOpen(true), 500);
    }
  }, [user]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    Storage.createCourse(user.id, {
      name: newCourseName,
      subject: newCourseSubject,
      description: newCourseDesc
    });
    setIsCreateModalOpen(false);
    setNewCourseName(''); setNewCourseSubject(''); setNewCourseDesc('');
    refreshCourses();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const res = Storage.joinCourse(user.id, joinCode.toUpperCase());
    if (res.success) {
      setIsJoinModalOpen(false);
      setJoinCode('');
      refreshCourses();
    } else {
      alert(res.message);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateProfile(profileData);
      setIsSettingsModalOpen(false);
  };

  const openSettings = () => {
      if(user) {
          setProfileData({
            institution: user.institution || '',
            major: user.major || '',
            semester: user.semester || ''
          });
          setIsSettingsModalOpen(true);
      }
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-500/30">
                {user?.name.charAt(0)}
             </div>
             <div>
               <h1 className="text-base font-bold text-slate-900">Hola, {user?.name.split(' ')[0]}</h1>
               <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                   {user?.major ? user.major : 'Estudiante'}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={openSettings} className="rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50">
                <Settings size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50">
                <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mis Cursos</h2>
            <p className="text-sm text-slate-500 mt-1">
                {user?.institution ? `${user.institution} • ` : ''} 
                {user?.semester ? `${user.semester} Semestre` : 'Gestiona tus materias'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="sm" variant="secondary" onClick={() => setIsJoinModalOpen(true)}>
              Unirse
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} /> Crear
            </Button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Layers size={32} className="text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">No estás inscrito en ningún curso.</p>
            <p className="text-sm text-slate-400 mt-1">Únete a uno o crea el tuyo.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map(course => (
              <Card 
                key={course.id} 
                className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge color={course.myRole === 'admin' ? 'blue' : 'green'}>
                      {course.myRole === 'admin' ? 'Profesor' : 'Estudiante'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 leading-snug group-hover:text-primary-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">{course.subject}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CÓDIGO</span>
                        <span className="text-sm font-mono font-semibold text-slate-700">{course.code}</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Join Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Unirse a un Curso">
        <form onSubmit={handleJoin} className="flex flex-col gap-6">
          <Input 
            label="Código de Acceso" 
            placeholder="ej. X8J29A" 
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={joinCode.length < 4}>Unirse Ahora</Button>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Nuevo Curso">
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <Input 
            label="Nombre del Curso" 
            placeholder="ej. Cálculo Diferencial"
            value={newCourseName}
            onChange={e => setNewCourseName(e.target.value)}
            required
          />
          <Input 
            label="Materia / Departamento" 
            placeholder="ej. Matemáticas"
            value={newCourseSubject}
            onChange={e => setNewCourseSubject(e.target.value)}
            required
          />
          <Input 
            label="Descripción (Opcional)" 
            placeholder="Breve resumen del curso..."
            value={newCourseDesc}
            onChange={e => setNewCourseDesc(e.target.value)}
          />
          <Button type="submit">Crear Curso</Button>
        </form>
      </Modal>

      {/* Settings / Onboarding Modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Datos Personales">
          <div className="mb-6 flex flex-col items-center text-center">
             <div className="h-16 w-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                 <User size={32} />
             </div>
             <p className="text-slate-500 text-sm">
                 Completa tu perfil para mejorar tu experiencia en la universidad.
             </p>
          </div>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              <Input 
                  label="Institución Educativa" 
                  placeholder="Ej. Universidad Nacional"
                  value={profileData.institution}
                  onChange={e => setProfileData({...profileData, institution: e.target.value})}
              />
              <Input 
                  label="Carrera o Profesión" 
                  placeholder="Ej. Ingeniería de Sistemas"
                  value={profileData.major}
                  onChange={e => setProfileData({...profileData, major: e.target.value})}
              />
              <Input 
                  label="Semestre Actual" 
                  placeholder="Ej. 6to Semestre"
                  value={profileData.semester}
                  onChange={e => setProfileData({...profileData, semester: e.target.value})}
              />
              <div className="flex gap-3 mt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsSettingsModalOpen(false)}>
                    Llenar después
                </Button>
                <Button type="submit" className="flex-1">
                    Guardar Datos
                </Button>
              </div>
          </form>
      </Modal>

    </div>
  );
};

export default Dashboard;