
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { MOCK_RESOURCES, MOCK_USERS, MOCK_CATEGORIES, MOCK_REVIEWS } from './constants';
import { Resource, Subject, GradeLevel, ResourceType, User, UserRole, UserStatus, ResourceStatus, Category, CategoryType, Review } from './types';
import { ResourceCard } from './components/ResourceCard';
import { AIChatPanel } from './components/AIChatPanel';
import { generateQuickSummary, generateQuizQuestions } from './services/geminiService';
import { api } from './services/api';
import { 
  Search, Filter, Book, LayoutGrid, UploadCloud, 
  MessageSquare, Settings, Menu, X, ChevronRight,
  PlayCircle, FileText, BrainCircuit, ArrowLeft,
  Sparkles, Heart, Check, Bell, User as UserIcon, Shield, LogOut, Image as ImageIcon,
  Users, BarChart, LayoutDashboard, MoreHorizontal, Trash2, Edit, Plus, Lock, Mail, ArrowRight,
  Maximize2, Minimize2, CheckCircle, AlertTriangle, Eye, XCircle, CheckSquare, Layers, Home,
  FileInput, HelpCircle, Clock, Tag, TrendingUp, Download, Calendar, PieChart, RefreshCw, ShieldCheck, Save,
  Link as LinkIcon, Video, Star, Phone, MapPin
} from 'lucide-react';

// -- Toast Notification Component --
const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Increased time to read OTP
    return () => clearTimeout(timer);
  }, [onClose, message]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in transition-all transform translate-y-0 border-2 ${
      type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
    }`}>
      {type === 'success' ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
      <span className="font-bold text-sm md:text-base">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
};

// -- Modal Component for User Form --
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  initialData: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: UserRole.User,
    status: UserStatus.Active,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        role: UserRole.User,
        status: UserStatus.Active,
        avatarUrl: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const userToSave: User = {
      id: initialData ? initialData.id : Date.now().toString(),
      joinDate: initialData ? initialData.joinDate : new Date().toISOString().split('T')[0],
      avatarUrl: initialData?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      name: formData.name!,
      email: formData.email!,
      role: formData.role as UserRole,
      status: formData.status as UserStatus,
    };
    onSave(userToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{initialData ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập họ tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@school.edu.vn"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={UserRole.User}>{UserRole.User}</option>
                  <option value={UserRole.Admin}>{UserRole.Admin}</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={UserStatus.Active}>{UserStatus.Active}</option>
                  <option value={UserStatus.Inactive}>{UserStatus.Inactive}</option>
                </select>
             </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Hủy bỏ</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              {initialData ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -- Modal Component for Category Form --
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  initialData: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    type: 'SUBJECT',
    description: '',
    status: 'Active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        type: 'SUBJECT',
        description: '',
        status: 'Active',
        count: 0
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const categoryToSave: Category = {
      id: initialData ? initialData.id : `cat-${Date.now()}`,
      name: formData.name!,
      type: formData.type as CategoryType,
      description: formData.description || '',
      status: formData.status as 'Active' | 'Inactive',
      count: initialData ? initialData.count : 0
    };
    onSave(categoryToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{initialData ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ví dụ: Toán học, Lớp 10..."
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Loại danh mục</label>
             <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as CategoryType})}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
             >
                <option value="SUBJECT">Môn học</option>
                <option value="GRADE">Khối lớp</option>
                <option value="RESOURCE_TYPE">Loại tài liệu</option>
             </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Mô tả ngắn về danh mục này..."
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
             <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
             >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Ẩn</option>
             </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Hủy bỏ</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              {initialData ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -- Modal Component for Resource Preview (Admin) --
interface ResourcePreviewModalProps {
   isOpen: boolean;
   onClose: () => void;
   resource: Resource | null;
   onApprove: () => void;
   onReject: () => void;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({ isOpen, onClose, resource, onApprove, onReject }) => {
   if (!isOpen || !resource) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{resource.title}</h3>
                  <p className="text-xs text-slate-500">Tác giả: {resource.author} • Ngày gửi: {resource.date}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
               <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                  <div className="aspect-video bg-black flex items-center justify-center">
                     {resource.type === ResourceType.Video ? (
                         <iframe src={resource.contentUrl} className="w-full h-full" title="Preview" allowFullScreen />
                     ) : (
                         <div className="flex flex-col items-center text-slate-400">
                            <FileText className="w-16 h-16 mb-2" />
                            <p>Preview PDF / Document Content</p>
                            <a href={resource.contentUrl} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                               Mở tài liệu gốc
                            </a>
                         </div>
                     )}
                  </div>
               </div>
               
               <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-2">Mô tả</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{resource.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                     <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{resource.subject}</span>
                     <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">{resource.grade}</span>
                     {resource.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
               <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Đóng</button>
               {resource.status === ResourceStatus.Pending && (
                  <>
                     <button onClick={() => { onReject(); onClose(); }} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 border border-red-200">Từ chối</button>
                     <button onClick={() => { onApprove(); onClose(); }} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200">Duyệt bài</button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

// -- Auth Components --

const LoginPage: React.FC<{ onLogin: (email: string, pass: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 hover:scale-105 transition-transform">
              E
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Chào mừng trở lại!</h1>
            <p className="text-slate-500 text-sm">Đăng nhập để tiếp tục học tập.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.vn"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
               <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">← Quay lại trang chủ</Link>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Quên mật khẩu?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : "Đăng nhập"}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            Chưa có tài khoản? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC<{ 
  onRegister: (data: any) => void, 
  setNotification: (note: {msg: string, type: 'success'|'error'} | null) => void 
}> = ({ onRegister, setNotification }) => {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.User
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      setNotification({ msg: 'Email không hợp lệ', type: 'error' });
      return;
    }

    setIsLoading(true);
    
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    // Simulate API delay and Sending Email
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      // IMPORTANT: For demonstration, we show the code in the notification
      setNotification({ 
        msg: `Mã xác minh (Demo): ${code}`, 
        type: 'success' 
      });
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
       setIsLoading(true);
       setTimeout(() => {
         onRegister(formData);
         setIsLoading(false);
       }, 800);
    } else {
       setNotification({ msg: 'Mã xác minh không đúng', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
             <h1 className="text-2xl font-bold text-slate-800">
               {step === 'form' ? 'Tạo tài khoản mới' : 'Xác thực Email'}
             </h1>
             <p className="text-slate-500 text-sm text-center mt-2">
               {step === 'form' 
                 ? 'Tham gia cộng đồng EduKho ngay hôm nay.' 
                 : `Nhập mã 6 chữ số đã được gửi tới ${formData.email}`}
             </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-start pt-2">
                 <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">← Quay lại trang chủ</Link>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : "Tiếp tục"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
               <div className="flex flex-col items-center space-y-4">
                 <ShieldCheck className="w-16 h-16 text-green-500 animate-pulse" />
                 <input 
                   type="text"
                   maxLength={6}
                   value={otp}
                   onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                   className="w-48 text-center text-3xl font-bold tracking-widest py-3 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                   placeholder="000000"
                   autoFocus
                 />
                 <p className="text-xs text-slate-400">Nhập mã 6 số hiển thị trong thông báo</p>
               </div>

               <button 
                 type="submit" 
                 disabled={isLoading || otp.length !== 6}
                 className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : "Xác thực & Đăng ký"}
               </button>
               
               <div className="text-center pt-2">
                 <button 
                   type="button" 
                   onClick={() => setStep('form')}
                   className="text-sm text-slate-500 hover:text-blue-600 underline"
                 >
                   Quay lại
                 </button>
               </div>
            </form>
          )}
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            Đã có tài khoản? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


// -- Main Layout Component (User) --
const UserLayout: React.FC<{ 
  children: React.ReactNode; 
  user: User | null; 
  onLogout: () => void;
}> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutGrid, label: "Khám phá", path: "/" },
    { icon: Book, label: "Kho của tôi", path: "/library" },
    { icon: UploadCloud, label: "Đóng góp", path: "/upload" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
            E
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">EduKho</span>
        </Link>
        
        <nav className="flex-grow px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? "text-blue-600" : "text-slate-400"}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center gap-2 mb-2">
                 <BrainCircuit className="w-5 h-5 text-white/80" />
                 <span className="font-semibold text-sm">EduBot AI</span>
              </div>
              <p className="text-xs text-white/70 mb-3">Trợ lý học tập 24/7. Sẵn sàng giải đáp mọi thắc mắc.</p>
           </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 flex justify-between items-center">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="text-xl font-bold text-slate-800">EduKho</Link>
            <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-slate-500" /></button>
         </div>
         <nav className="px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  location.pathname === item.path ? "bg-blue-50 text-blue-700" : "text-slate-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
         </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                 <Menu className="w-6 h-6" />
              </button>
           </div>
           
           {/* Highlighted Search Bar */}
           <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
              <div className="relative group">
                 <div className="absolute inset-0 bg-blue-200 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                       type="text" 
                       placeholder="Tìm kiếm tài liệu, môn học, tác giả..." 
                       className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-blue-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium shadow-sm"
                    />
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4 ml-4">
              {user ? (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                     {user.role === UserRole.Admin && (
                        <Link to="/admin" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors mr-2">
                           <Shield className="w-4 h-4" /> Admin
                        </Link>
                     )}
                     <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                        <img src={user.avatarUrl} alt="User" />
                     </div>
                     <button onClick={onLogout} title="Đăng xuất" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                     </button>
                  </div>
              ) : (
                  <div className="flex items-center gap-3">
                     <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block">
                        Đăng nhập
                     </Link>
                     <Link to="/register" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        Đăng ký
                     </Link>
                  </div>
              )}
           </div>
        </header>

        <div className="flex-1 p-4 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
           <div className="max-w-7xl mx-auto px-4 text-center">
              <h3 className="font-bold text-slate-800 text-lg mb-2 uppercase tracking-wide">Trường Tiểu học Nguyễn Huệ</h3>
              <div className="text-slate-500 text-sm space-y-2">
                 <p className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Địa chỉ: Xã Đắk Wil, Tỉnh Lâm Đồng
                 </p>
                 <p className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Số điện thoại: 
                    <a href="tel:02613709333" className="text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-0.5 rounded-md">02613.709.333</a>
                 </p>
              </div>
              <div className="border-t border-slate-100 mt-6 pt-6 text-xs text-slate-400">
                 <p>© {new Date().getFullYear()} EduKho - Kho Học Liệu Số. All rights reserved.</p>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

const Dashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Resource | null>(null);

  useEffect(() => {
    // Attempt to fetch from API, fallback to Mock if fails
    const fetchData = async () => {
       try {
          const data = await api.getResources();
          setResources(data);
       } catch (error) {
          console.log("API unavailable, using mock data");
          setResources(MOCK_RESOURCES);
       } finally {
          setLoading(false);
       }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div>
       <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Tài liệu nổi bật</h2>
             <p className="text-slate-500">Được xem nhiều nhất tuần qua</p>
          </div>
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map(r => (
             <ResourceCard 
                key={r.id} 
                resource={r} 
                onClick={(res) => { setSelectedRes(res); setChatOpen(true); }}
             />
          ))}
       </div>

       <AIChatPanel 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)}
          initialContext={selectedRes ? `Người dùng đang hỏi về tài liệu: ${selectedRes.title}. Mô tả: ${selectedRes.description}` : undefined}
       />
    </div>
  );
};

const App: React.FC = () => {
   const [user, setUser] = useState<User | null>(null);
   const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

   useEffect(() => {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
   }, []);

   const handleLogin = async (email: string, pass: string) => {
      try {
         const u = await api.login(email, pass);
         setUser(u);
         localStorage.setItem('user', JSON.stringify(u));
         setNotification({msg: 'Đăng nhập thành công', type: 'success'});
      } catch (err: any) {
         // Fallback Login
         const found = MOCK_USERS.find(u => u.email === email);
         if (found) {
             setUser(found);
             localStorage.setItem('user', JSON.stringify(found));
             setNotification({msg: 'Đăng nhập thành công (Offline Mode)', type: 'success'});
         } else {
             setNotification({msg: err.message || 'Lỗi đăng nhập', type: 'error'});
         }
      }
   };

   const handleRegister = async (data: any) => {
      try {
         const u = await api.register(data);
         setUser(u);
         localStorage.setItem('user', JSON.stringify(u));
         setNotification({msg: 'Đăng ký thành công', type: 'success'});
      } catch (err: any) {
         // Fallback Register
         const newUser: User = {
           id: Date.now().toString(),
           name: data.name,
           email: data.email,
           role: data.role,
           joinDate: new Date().toISOString().split('T')[0],
           status: UserStatus.Active,
           avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
         };
         setUser(newUser);
         localStorage.setItem('user', JSON.stringify(newUser));
         setNotification({msg: 'Đăng ký thành công (Offline Mode)', type: 'success'});
      }
   };

   const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      setNotification({msg: 'Đã đăng xuất', type: 'success'});
   };

   return (
      <HashRouter>
         {notification && <Notification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
         <Routes>
            <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage onRegister={handleRegister} setNotification={setNotification} /> : <Navigate to="/" />} />
            <Route path="/*" element={
               <UserLayout user={user} onLogout={handleLogout}>
                  <Routes>
                     <Route path="/" element={<Dashboard user={user} />} />
                     <Route path="*" element={<div className="p-8 text-center">Trang không tồn tại</div>} />
                  </Routes>
               </UserLayout>
            } />
         </Routes>
      </HashRouter>
   );
};

export default App;
