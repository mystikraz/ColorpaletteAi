import React from 'react';
import { X, Trash2, Download, ArrowUpRight, Calendar, User, MapPin } from 'lucide-react';
import { SavedProject } from '../types';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onLoadProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Saved House Projects
            </h2>
            <p className="text-xs text-slate-500">
              {savedProjects.length} designs saved in local visualizer storage
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of projects */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {savedProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-slate-700">No saved house designs yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Customize colors on any house and click "Save" to keep a permanent record.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-4/3 bg-slate-200 overflow-hidden group">
                    <img
                      src={project.imageThumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white font-semibold text-xs drop-shadow-xs">
                        {project.title}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{project.customer.name}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(project.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="capitalize">{project.customer.address}</span>
                    </div>

                    {/* Colors used */}
                    {project.usedColors && project.usedColors.length > 0 && (
                      <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                        {project.usedColors.map((c) => (
                          <span
                            key={c.code}
                            style={{ backgroundColor: c.hex }}
                            className="w-4 h-4 rounded-md shadow-2xs shrink-0"
                            title={`${c.code} (${c.name})`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          onLoadProject(project);
                          onClose();
                        }}
                        className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Load Project</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `Bihani_${project.customer.name}_${project.id}.jpg`;
                          link.href = project.imageThumbnail;
                          link.click();
                        }}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
