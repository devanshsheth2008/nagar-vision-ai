import { useNavigate } from 'react-router-dom';
import { Shield, Users, Trash2, ArrowRight, Building2 } from 'lucide-react';
import type { UserRole } from '@/types';

interface PortalOption {
  role: UserRole;
  title: string;
  description: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
}

const portals: PortalOption[] = [
  {
    role: 'admin',
    title: 'Admin Portal',
    description: 'Municipal operators manage incidents, cameras, complaints, and crew assignments.',
    icon: Shield,
    color: 'text-[#17365D]',
    bgColor: 'bg-[#17365D]/5',
    borderColor: 'border-[#17365D]/20',
  },
  {
    role: 'citizen',
    title: 'Citizen Portal',
    description: 'Report garbage in your area, upload photos, and track your complaints.',
    icon: Users,
    color: 'text-[#168C8C]',
    bgColor: 'bg-[#168C8C]/5',
    borderColor: 'border-[#168C8C]/20',
  },
  {
    role: 'crew',
    title: 'Cleaning Crew Portal',
    description: 'View assigned cleanup tasks, upload before-and-after evidence photos.',
    icon: Trash2,
    color: 'text-[#218838]',
    bgColor: 'bg-[#218838]/5',
    borderColor: 'border-[#218838]/20',
  },
];

export function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative w-full max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-16 h-16 rounded-xl bg-[#17365D] flex items-center justify-center mb-4 shadow-md">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#263445] tracking-wide">SWATCHNETRA</h1>
          <p className="text-xs text-gray-500 mt-2 tracking-widest text-center">
            GANDHIDHAM MUNICIPAL CORPORATION
          </p>
          <p className="text-sm text-gray-600 mt-1">Intelligent Waste Monitoring &amp; Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <button
              key={portal.role}
              onClick={() => navigate(`/login?portal=${portal.role}`)}
              className={`group text-left bg-white border ${portal.borderColor} rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-lg ${portal.bgColor} ${portal.borderColor} border flex items-center justify-center mb-4`}>
                <portal.icon className={`w-6 h-6 ${portal.color}`} />
              </div>
              <h3 className="text-base font-bold text-[#263445] mb-2">{portal.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{portal.description}</p>
              <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${portal.color} group-hover:gap-2 transition-all`}>
                Continue <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          Gandhidham Municipal Corporation · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
