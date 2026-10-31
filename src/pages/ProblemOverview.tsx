import {
  FileText,
  MapPin,
  Building2,
  Hash,
  Moon,
  ScanSearch,
  Car,
  Clock,
  Camera,
  Brain,
  Trash2,
  ShieldCheck,
  ScanLine,
  FileWarning,
  UserCheck,
  Truck,
  ArrowRight,
  Users,
  Footprints,
  Store,
  Activity,
  Gauge,
  HeartPulse,
  Sparkles,
  Target,
  Package,
  Box,
  Recycle,
  Route,
  Factory,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const metaItems = [
  { label: 'Problem ID', value: 'PS000058', icon: Hash, accent: 'emerald' as const },
  { label: 'Industry ID', value: '206', icon: Layers, accent: 'cyan' as const },
  { label: 'Location', value: 'Gandhidham, Gujarat', icon: MapPin, accent: 'amber' as const },
  { label: 'Department', value: 'Municipal Corporation / SWM', icon: Building2, accent: 'emerald' as const },
];

const accentMap: Record<string, { text: string; bg: string; border: string }> = {
  emerald: { text: 'text-neon-emerald', bg: 'bg-neon-emerald/10', border: 'border-neon-emerald/20' },
  cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
  amber: { text: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/20' },
  red: { text: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/20' },
};

const wasteTypes = [
  { label: 'Commercial Packaging', icon: Package },
  { label: 'Timber Scrap', icon: Box },
  { label: 'Mixed Solid Waste', icon: Recycle },
];

const affectedLocations = [
  { label: 'Open Municipal Plots', icon: MapPin },
  { label: 'Peripheral Bypass Roads', icon: Route },
  { label: 'Industrial & Commercial Areas', icon: Factory },
  { label: 'Service Lanes', icon: Layers },
];

const challenges = [
  {
    icon: Moon,
    title: 'Limited Night Patrols',
    desc: 'Manual monitoring cannot cover all commercial and industrial areas during nighttime hours.',
    accent: 'amber' as const,
  },
  {
    icon: ScanSearch,
    title: 'Illegal Dumping Detection',
    desc: 'No automated mechanism to identify dumping incidents in real time.',
    accent: 'red' as const,
  },
  {
    icon: Car,
    title: 'Vehicle Identification',
    desc: 'Difficulty recognizing registration plates in low-light conditions.',
    accent: 'cyan' as const,
  },
  {
    icon: Clock,
    title: 'Delayed Cleanup',
    desc: 'Slow incident reporting and cleanup dispatch allow garbage hotspots to grow.',
    accent: 'emerald' as const,
  },
];

const workflowSteps = [
  { label: 'CCTV / Video Input', icon: Camera },
  { label: 'AI Object Detection', icon: Brain },
  { label: 'Illegal Dumping Detection', icon: Trash2 },
  { label: 'Number Plate Recognition', icon: ScanLine },
  { label: 'Incident Generation', icon: FileWarning },
  { label: 'Officer Assignment', icon: UserCheck },
  { label: 'Cleanup Dispatch', icon: Truck },
];

const capabilities = [
  {
    icon: ScanSearch,
    title: 'Unauthorized Vehicle Halt Detection',
    desc: 'Computer vision models detect and flag vehicles stopping in restricted or monitored zones for suspicious durations.',
    accent: 'emerald' as const,
  },
  {
    icon: Trash2,
    title: 'Garbage Dumping Activity Detection',
    desc: 'Real-time identification of dumping actions — objects being unloaded or discarded — across authorized CCTV feeds.',
    accent: 'cyan' as const,
  },
  {
    icon: ScanLine,
    title: 'Automatic Number Plate Recognition (ANPR)',
    desc: 'Low-light ANPR captures and reads vehicle registration plates for investigation and enforcement.',
    accent: 'amber' as const,
  },
];

const outcomes = [
  {
    icon: Camera,
    title: 'Edge-AI Computer Vision',
    desc: 'Edge-AI computer vision integrated with authorized CCTV feeds across municipal zones.',
    accent: 'emerald' as const,
  },
  {
    icon: Activity,
    title: 'Automated Dumping Recognition',
    desc: 'Automated recognition of unauthorized vehicle halts and dumping actions without manual monitoring.',
    accent: 'cyan' as const,
  },
  {
    icon: ScanLine,
    title: 'Number Plate Recognition',
    desc: 'Automatic number plate recognition for review, investigation, and enforcement follow-up.',
    accent: 'amber' as const,
  },
];

const stakeholdersPrimary = [
  { label: 'Chief Sanitary Inspectors', icon: ShieldCheck },
  { label: 'Solid Waste Management Officers', icon: Trash2 },
  { label: 'Municipal Enforcement Squads', icon: Users },
];

const stakeholdersSecondary = [
  { label: 'Residents', icon: Users },
  { label: 'Pedestrians', icon: Footprints },
  { label: 'Commercial Establishments', icon: Store },
];

const impacts = [
  {
    icon: Trash2,
    title: 'Reduction in Chronic Hotspots',
    desc: 'Fewer persistent garbage accumulation points through early detection and rapid response.',
    accent: 'emerald' as const,
  },
  {
    icon: Gauge,
    title: 'Faster Incident Reporting & Cleanup',
    desc: 'Automated incident generation shortens the gap between detection and dispatch.',
    accent: 'cyan' as const,
  },
  {
    icon: ShieldCheck,
    title: 'Improved Municipal Accountability',
    desc: 'Digital records of incidents, vehicle plates, and cleanup actions create an auditable trail.',
    accent: 'amber' as const,
  },
  {
    icon: HeartPulse,
    title: 'Better Sanitation & Public Health',
    desc: 'Cleaner public spaces reduce health risks for residents and improve overall urban hygiene.',
    accent: 'red' as const,
  },
];

export function ProblemOverview() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Problem Overview"
        description="Computer-Vision System for Automated Detection of Garbage Vulnerable Points (GVPs) and Illegal Dumping"
        icon={<FileText className="w-5 h-5" />}
      />

      {/* Meta Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 animate-slide-up">
        {metaItems.map((m) => {
          const a = accentMap[m.accent];
          return (
            <div key={m.label} className="glass p-4 flex items-center gap-3 transition-all duration-300 hover:border-ink-600">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border shrink-0', a.bg, a.border, a.text)}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{m.label}</p>
                <p className="text-sm font-medium text-[#263445] truncate">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Problem Description */}
      <Section title="Problem Description" icon={<FileText className="w-4 h-4" />}>
        <Panel>
          <p className="text-sm leading-relaxed text-[#64748B]">
            Gandhidham faces unauthorized nighttime dumping by commercial freight vehicles and private waste handlers.
            Limited night patrols and the absence of automated surveillance make it difficult to identify illegal
            dumping, recognize vehicle registration numbers in low light, and dispatch cleanup teams quickly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-neon-emerald" />
                Common Waste Types
              </h4>
              <div className="space-y-2">
                {wasteTypes.map((w) => (
                  <div key={w.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-ink-800/40 border border-ink-700/60 hover:border-neon-emerald/20 transition-colors">
                    <w.icon className="w-4 h-4 text-neon-emerald shrink-0" />
                    <span className="text-sm text-[#64748B]">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neon-cyan" />
                Major Affected Locations
              </h4>
              <div className="space-y-2">
                {affectedLocations.map((l) => (
                  <div key={l.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-ink-800/40 border border-ink-700/60 hover:border-neon-cyan/20 transition-colors">
                    <l.icon className="w-4 h-4 text-neon-cyan shrink-0" />
                    <span className="text-sm text-[#64748B]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* Key Challenges */}
      <Section title="Key Challenges" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map((c, i) => {
            const a = accentMap[c.accent];
            return (
              <div
                key={c.title}
                className={cn(
                  'glass p-5 transition-all duration-300 hover:border-ink-600 animate-slide-up',
                  c.accent === 'emerald' && 'hover:shadow-glow',
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border shrink-0', a.bg, a.border, a.text)}>
                    <c.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#263445] mb-1.5">{c.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Proposed AI Solution */}
      <Section title="Our AI-Powered Solution" icon={<Sparkles className="w-4 h-4 text-neon-emerald" />}>
        <Panel>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Solution Workflow</h4>

          {/* Workflow */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 lg:items-stretch overflow-x-auto pb-2">
            {workflowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 lg:gap-0 shrink-0">
                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-white/[0.03] border border-ink-700 hover:border-neon-emerald/20 transition-colors min-w-[140px]">
                  <div className="w-9 h-9 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 flex items-center justify-center text-neon-emerald">
                    <step.icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] text-center leading-tight">{step.label}</span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-500 shrink-0 rotate-90 lg:rotate-0" />
                )}
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {capabilities.map((cap) => {
              const a = accentMap[cap.accent];
              return (
                <div key={cap.title} className={cn('rounded-lg p-4 border transition-all duration-300 hover:border-ink-600', a.bg, a.border)}>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border mb-3', a.bg, a.border, a.text)}>
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <h5 className="text-sm font-semibold text-[#263445] mb-1.5">{cap.title}</h5>
                  <p className="text-xs text-gray-400 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </Section>

      {/* Expected Outcomes */}
      <Section title="Expected Outcomes" icon={<Target className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outcomes.map((o, i) => {
            const a = accentMap[o.accent];
            return (
              <div
                key={o.title}
                className={cn(
                  'glass p-6 transition-all duration-300 hover:border-ink-600 animate-slide-up',
                  o.accent === 'emerald' && 'hover:shadow-glow',
                  o.accent === 'cyan' && 'hover:shadow-glow-cyan',
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center border mb-4', a.bg, a.border, a.text)}>
                  <o.icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-[#263445] mb-2">{o.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{o.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Stakeholders */}
      <Section title="Stakeholders" icon={<Users className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Primary Users" subtitle="Direct operators of the system">
            <div className="space-y-2">
              {stakeholdersPrimary.map((s) => (
                <div key={s.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-ink-800/40 border border-ink-700/60 hover:border-neon-emerald/20 transition-colors">
                  <s.icon className="w-4 h-4 text-neon-emerald shrink-0" />
                  <span className="text-sm text-[#64748B]">{s.label}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Secondary Users" subtitle="Beneficiaries of improved sanitation">
            <div className="space-y-2">
              {stakeholdersSecondary.map((s) => (
                <div key={s.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-ink-800/40 border border-ink-700/60 hover:border-neon-cyan/20 transition-colors">
                  <s.icon className="w-4 h-4 text-neon-cyan shrink-0" />
                  <span className="text-sm text-[#64748B]">{s.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Section>

      {/* Potential Impact */}
      <Section title="Potential Impact" icon={<Gauge className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {impacts.map((imp, i) => {
            const a = accentMap[imp.accent];
            return (
              <div
                key={imp.title}
                className={cn(
                  'glass p-5 transition-all duration-300 hover:border-ink-600 animate-slide-up',
                  imp.accent === 'emerald' && 'hover:shadow-glow',
                  imp.accent === 'cyan' && 'hover:shadow-glow-cyan',
                  imp.accent === 'red' && 'hover:shadow-glow-red',
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border shrink-0', a.bg, a.border, a.text)}>
                    <imp.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#263445] mb-1.5">{imp.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{imp.desc}</p>
                    <div className="mt-3">
                      <Badge variant={imp.accent === 'red' ? 'red' : imp.accent} dot>Descriptive Indicator</Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-neon-emerald">{icon}</span>
        <h2 className="text-lg font-bold text-[#263445] tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
