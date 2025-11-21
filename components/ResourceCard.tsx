import React from 'react';
import { Resource, ResourceType, ResourceStatus } from '../types';
import { FileText, Video, HelpCircle, BookOpen, Eye, Download, Sparkles, Clock, CheckCircle, XCircle, Star } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onClick: (resource: Resource) => void;
  showStatus?: boolean;
}

const getIcon = (type: ResourceType) => {
  switch (type) {
    case ResourceType.PDF: return <FileText className="w-4 h-4" />;
    case ResourceType.Video: return <Video className="w-4 h-4" />;
    case ResourceType.Quiz: return <HelpCircle className="w-4 h-4" />;
    case ResourceType.Lesson: return <BookOpen className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getColor = (type: ResourceType) => {
  switch (type) {
    case ResourceType.PDF: return "bg-red-100 text-red-700";
    case ResourceType.Video: return "bg-blue-100 text-blue-700";
    case ResourceType.Quiz: return "bg-green-100 text-green-700";
    case ResourceType.Lesson: return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getStatusBadge = (status: ResourceStatus) => {
  switch (status) {
    case ResourceStatus.Approved:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" /> Đã duyệt
        </span>
      );
    case ResourceStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Clock className="w-3 h-3" /> Chờ duyệt
        </span>
      );
    case ResourceStatus.Rejected:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <XCircle className="w-3 h-3" /> Từ chối
        </span>
      );
    default:
      return null;
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick, showStatus = false }) => {
  return (
    <div 
      onClick={() => onClick(resource)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
    >
      {/* Thumbnail Section */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img 
          src={resource.thumbnailUrl} 
          alt={resource.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {showStatus && getStatusBadge(resource.status)}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getColor(resource.type)}`}>
            {getIcon(resource.type)}
            {resource.type}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Xem chi tiết với AI
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <span>{resource.subject}</span>
          <span>•</span>
          <span>{resource.grade}</span>
        </div>
        
        <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {resource.title}
        </h3>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
          {resource.description}
        </p>

        {/* Footer Section */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mt-auto">
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {resource.views >= 1000 ? `${(resource.views/1000).toFixed(1)}k` : resource.views}
             </span>
             <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> {resource.downloads >= 1000 ? `${(resource.downloads/1000).toFixed(1)}k` : resource.downloads}
             </span>
             {resource.avgRating !== undefined && resource.avgRating > 0 && (
                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                   <Star className="w-3.5 h-3.5 fill-current" /> {resource.avgRating}
                </span>
             )}
          </div>
          <span className="font-medium text-slate-500">{resource.author}</span>
        </div>
      </div>
    </div>
  );
};