import React, { useEffect, useState } from 'react';
import { Users, PhoneCall, Mail, GraduationCap, Building2, BookOpen } from 'lucide-react';
import api from '../services/api';

interface Lead {
  phone: string;
  studentName: string;
  email: string | null;
  highSchoolPercent: number;
  interestedStream: string;
}

interface Inquiry {
  id: string;
  status: 'PENDING' | 'CALLED' | 'INTERESTED' | 'ADMITTED';
  createdAt: string;
  lead: Lead;
  college: { name: string };
}

export const Inquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/inquiries');
      setInquiries(data.data);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/inquiries/${id}/status`, { status });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: status as Inquiry['status'] } : inq))
      );
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'CALLED': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'INTERESTED': return 'bg-purple-50 text-purple-700 ring-purple-700/10';
      case 'ADMITTED': return 'bg-green-50 text-green-700 ring-green-600/20';
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading Lead Tracker...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> Student Inquiries
        </h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage student leads exploring Tier 3 colleges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inquiries.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No inquiries generated from User Portal yet.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-gray-900/5 p-6 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    {inquiry.lead.studentName}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                    <GraduationCap className="w-3 h-3" /> {inquiry.lead.highSchoolPercent}% in 12th
                  </span>
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                  className={`text-xs font-semibold rounded-md px-2 py-1 outline-none ring-1 ring-inset cursor-pointer ${getStatusColor(inquiry.status)}`}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CALLED">CALLED</option>
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="ADMITTED">ADMITTED</option>
                </select>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 border-l-2 border-blue-100 pl-3">
                <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> {inquiry.college.name}</p>
                <p className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> {inquiry.lead.interestedStream}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                <a href={`tel:${inquiry.lead.phone}`} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <PhoneCall className="w-4 h-4" /> {inquiry.lead.phone}
                </a>
                {inquiry.lead.email && (
                  <a href={`mailto:${inquiry.lead.email}`} className="text-gray-400 hover:text-gray-600">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
