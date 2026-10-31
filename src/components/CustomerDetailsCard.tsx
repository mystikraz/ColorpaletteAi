import React, { useState } from 'react';
import { User, MapPin, Phone, Calendar, Edit3, Check } from 'lucide-react';
import { CustomerDetails } from '../types';

interface CustomerDetailsCardProps {
  customer: CustomerDetails;
  onUpdateCustomer: (updated: CustomerDetails) => void;
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customer,
  onUpdateCustomer,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CustomerDetails>(customer);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomer(formData);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-3 px-1 mb-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Customer Details
            </h3>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 py-1 px-2 rounded-md hover:bg-teal-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Address / Site Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Submitted Date
                </label>
                <input
                  type="text"
                  value={formData.submittedDate}
                  onChange={(e) => setFormData({ ...formData, submittedDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-teal-800 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-xs">
            {/* Name */}
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Name
              </span>
              <span className="font-semibold text-slate-800 text-sm capitalize">
                {customer.name}
              </span>
            </div>

            {/* Address */}
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Address
              </span>
              <span className="font-medium text-slate-700 capitalize flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 inline" />
                {customer.address}
              </span>
            </div>

            {/* Contact */}
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Contact
              </span>
              <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400 inline" />
                {customer.contact}
              </span>
            </div>

            {/* Dates grid */}
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                  Submitted Date
                </span>
                <span className="font-medium text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 inline" />
                  {customer.submittedDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                  Received Date
                </span>
                <span className="font-medium text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 inline" />
                  {customer.receivedDate}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
