import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as Storage from '../services/storage';
import { CourseWithRole, ClassSession, Announcement, User, Role } from '../types';
import { Button, Card, Input, Modal, Badge } from '../components/UI';
import { ArrowLeft, Calendar, MapPin, MessageSquare, Users, Copy, Plus, Pin, Info, MoreHorizontal, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseWithRole | null>(null);
  const [activeTab, setActiveTab] = useState<'classes' | 'feed' | 'members' | 'info'>('classes');
  
  // Data States
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [announcements, setAnnouncements] = useState<(Announcement & { authorName: string })[]>([]);
  const [members, setMembers] = useState<(User & { role: Role })[]>([]);
  
  // Actions
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isObsOpen, setIsObsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Form States (Class)
  const [classData, setClassData] = useState({ topic: '', date: '', time: '', location: '', notes: '' });
  // Form States (Post)
  const [postContent, setPostContent] = useState('');
  // Form States (Obs)
  const [obsContent, setObsContent] = useState('');

  useEffect(() => {
    if (user && id) {
      const allCourses = Storage.getMyCourses(user.id);
      const found = allCourses.find(c => c.id === id);
      if (found) {
        setCourse(found);
        loadData(found.id);
      } else {
        navigate('/'); // Not authorized or not found
      }
    }
  }, [user, id]);

  const loadData = (courseId: string) => {
    setClasses(Storage.getClasses(courseId));
    setAnnouncements(Storage.getAnnouncements(courseId));
    setMembers(Storage.getMembers(courseId));
  };

  const handleCopyCode = () => {
    if (course) {
      navigator.clipboard.writeText(course.code);
      alert('¡Código copiado!');
    }
  };

  const isAdmin = course?.myRole === 'admin';

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      Storage.createClass({ ...classData, courseId: course.id, status: 'scheduled' });
      setIsAddClassOpen(false);
      loadData(course.id);
      setClassData({ topic: '', date: '', time: '', location: '', notes: '' });
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (course && user) {
      Storage.createAnnouncement({ 
        courseId: course.id, 
        authorId: user.id, 
        content: postContent, 
        isPinned: false, 
        createdAt: new Date().toISOString() 
      });
      setIsAddPostOpen(false);
      setPostContent('');
      loadData(course.id);
    }
  };

  const handleAddObservation = (e: React.FormEvent) => {
      e.preventDefault();
      if(course && user && selectedStudent) {
          Storage.createObservation({
              courseId: course.id,
              studentId: selectedStudent,
              authorId: user.id,
              content: obsContent
          });
          setIsObsOpen(false);
          setObsContent('');
          alert('Observación guardada');
      }
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 truncate leading-tight text-lg">{course.name}</h1>
            <p className="text-xs font-medium text-slate-500 truncate">{course.subject}</p>
          </div>
          {isAdmin && activeTab === 'classes' && (
             <Button size="sm" onClick={() => setIsAddClassOpen(true)} className="rounded-full h-9 w-9 p-0"><Plus size={18} /></Button>
          )}
          {activeTab === 'feed' && (
             <Button size="sm" onClick={() => setIsAddPostOpen(true)} className="rounded-full h-9 w-9 p-0"><Plus size={18} /></Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'classes', label: 'Clases', icon: Calendar },
            { id: 'feed', label: 'Tablón', icon: MessageSquare },
            { id: 'members', label: 'Personas', icon: Users },
            { id: 'info', label: 'Info', icon: Info },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "pb-3 pt-2 text-sm font-semibold border-b-[3px] flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-primary-500 text-primary-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={16} strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'classes' && (
              <div className="space-y-6">
                 {classes.length === 0 ? (
                     <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar size={24} className="text-slate-300"/>
                        </div>
                        <p className="text-slate-400 font-medium">No hay clases programadas.</p>
                     </div>
                 ) : (
                     classes.map(cls => (
                         <div key={cls.id} className="flex gap-5 group">
                             <div className="flex flex-col items-center pt-1 min-w-[3.5rem]">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(cls.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                                 <span className="text-2xl font-black text-slate-800">{new Date(cls.date).getDate()}</span>
                             </div>
                             <Card className="flex-1 p-5 border-l-[6px] border-l-primary-500 hover:shadow-soft transition-shadow">
                                 <div className="flex justify-between items-start mb-3">
                                     <h3 className="text-lg font-bold text-slate-900 leading-tight">{cls.topic}</h3>
                                     <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                         <Clock size={12} />
                                         {cls.time}
                                     </span>
                                 </div>
                                 <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                     <MapPin size={16} className="text-slate-400" />
                                     {cls.location}
                                 </div>
                                 {cls.notes && (
                                     <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                         {cls.notes}
                                     </div>
                                 )}
                             </Card>
                         </div>
                     ))
                 )}
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare size={24} className="text-slate-300"/>
                        </div>
                        <p className="text-slate-400 font-medium">No hay anuncios aún.</p>
                    </div>
                ) : (
                    announcements.map(post => (
                        <Card key={post.id} className={clsx("p-5", post.isPinned && "border border-primary-100 bg-primary-50/20")}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                    {post.authorName.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{post.authorName}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                            {post.isPinned && (
                                <div className="flex items-center gap-1.5 text-xs text-primary-600 mb-3 font-bold uppercase tracking-wide">
                                    <Pin size={12} fill="currentColor" /> Anuncio Fijado
                                </div>
                            )}
                            <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </Card>
                    ))
                )}
              </div>
            )}

            {activeTab === 'members' && (
               <div className="space-y-3">
                   {members.map(member => (
                       <div key={member.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                           <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-500">
                                   {member.name.charAt(0)}
                               </div>
                               <div>
                                   <p className="font-bold text-slate-900">{member.name}</p>
                                   <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                       {member.role === 'admin' ? 'Profesor' : 'Estudiante'}
                                   </p>
                               </div>
                           </div>
                           {isAdmin && member.role !== 'admin' && (
                               <Button variant="ghost" size="sm" onClick={() => { setSelectedStudent(member.id); setIsObsOpen(true); }} className="rounded-full h-10 w-10 p-0 text-slate-400">
                                   <MoreHorizontal size={20} />
                               </Button>
                           )}
                       </div>
                   ))}
               </div>
            )}

            {activeTab === 'info' && (
                <div className="space-y-6">
                    <Card className="p-8 text-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Código de Acceso</p>
                        <div className="text-4xl font-mono font-black tracking-widest text-slate-900 mb-6">{course.code}</div>
                        <Button variant="secondary" onClick={handleCopyCode} className="mx-auto w-full sm:w-auto shadow-sm">
                            <Copy size={16} /> Copiar Código
                        </Button>
                    </Card>
                    <div className="px-2">
                        <h3 className="font-bold text-slate-900 mb-3 text-lg">Acerca del curso</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{course.description || "Sin descripción."}</p>
                    </div>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <Modal isOpen={isAddClassOpen} onClose={() => setIsAddClassOpen(false)} title="Agendar Clase">
        <form onSubmit={handleCreateClass} className="space-y-4">
            <Input label="Tema / Tópico" placeholder="Ej. Introducción a la Derivada" value={classData.topic} onChange={e => setClassData({...classData, topic: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Fecha" type="date" value={classData.date} onChange={e => setClassData({...classData, date: e.target.value})} required />
                <Input label="Hora" type="time" value={classData.time} onChange={e => setClassData({...classData, time: e.target.value})} required />
            </div>
            <Input label="Salón / Enlace" placeholder="Ej. A-204 o Zoom Link" value={classData.location} onChange={e => setClassData({...classData, location: e.target.value})} required />
            <Input label="Notas (Opcional)" placeholder="Detalles extra..." value={classData.notes} onChange={e => setClassData({...classData, notes: e.target.value})} />
            <Button type="submit" className="w-full mt-2" size="lg">Guardar Clase</Button>
        </form>
      </Modal>

      <Modal isOpen={isAddPostOpen} onClose={() => setIsAddPostOpen(false)} title="Nuevo Anuncio">
        <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm resize-none"
                rows={5}
                placeholder="¿Qué quieres comunicar a la clase?"
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                required
            />
            <Button type="submit" className="w-full" size="lg">Publicar</Button>
        </form>
      </Modal>

      <Modal isOpen={isObsOpen} onClose={() => setIsObsOpen(false)} title="Agregar Observación">
        <form onSubmit={handleAddObservation} className="space-y-4">
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs font-medium border border-yellow-100">
                Esta observación solo será visible para los administradores y el estudiante seleccionado.
            </div>
            <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm resize-none"
                rows={5}
                placeholder="Notas sobre desempeño o comportamiento..."
                value={obsContent}
                onChange={e => setObsContent(e.target.value)}
                required
            />
            <Button type="submit" className="w-full" size="lg">Guardar Observación</Button>
        </form>
      </Modal>

    </div>
  );
};

export default CourseDetail;