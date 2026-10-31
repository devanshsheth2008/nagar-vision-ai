import { useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Calendar, Loader2, FileText, X, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/lib/auth';
import { generateMonthlyReport } from '@/lib/reportGenerator';
import {
  dailyIncidentTrend, weeklyGarbageDetection, monthlyCleanupPerformance, wasteDistribution, stats,
} from '@/data/mockData';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PolarAngleAxis,
} from 'recharts';

const chartTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
};

const accuracyData = [{ name: 'Accuracy', value: stats.detectionAccuracy, fill: '#218838' }];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function AnalyticsReports() {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleDownload = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      generateMonthlyReport({
        month: selectedMonth,
        year: selectedYear,
        generatedBy: user?.email ?? 'System Admin',
      });
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => {
        setGenerated(false);
        setShowReportModal(false);
      }, 2000);
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive waste management intelligence"
        icon={<BarChart3 className="w-5 h-5" />}
        actions={
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF Report
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg Daily Incidents" value="42" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: '+8.2%', direction: 'up' }} accent="emerald" />
        <StatCard label="Resolution Rate" value="90.4%" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: '+3.1%', direction: 'up' }} accent="cyan" />
        <StatCard label="Avg Response Time" value="2.4h" icon={<TrendingDown className="w-5 h-5" />} trend={{ value: '-18%', direction: 'down' }} accent="amber" />
        <StatCard label="Monthly Waste" value="156t" icon={<Calendar className="w-5 h-5" />} trend={{ value: '+12%', direction: 'up' }} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <Panel title="Incident Trend Analysis" subtitle="7-day incident vs resolution trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyIncidentTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#C83E3E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#218838" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel title="Detection Accuracy" subtitle="Model performance gauge">
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart data={accuracyData} innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" cornerRadius={10} fill="#218838" background={{ fill: 'rgba(0,0,0,0.06)' }} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#263445" fontSize="28" fontWeight="bold" fontFamily="monospace">
                {stats.detectionAccuracy}%
              </text>
              <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize="11">
                Accuracy
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Panel title="Weekly Detection by Category" subtitle="Garbage, plastic, and debris detection">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyGarbageDetection} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="garbage" name="Garbage" fill="#218838" radius={[3, 3, 0, 0]} />
              <Bar dataKey="plastic" name="Plastic" fill="#168C8C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="debris" name="Debris" fill="#D99A19" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Waste Category Distribution" subtitle="Total volume by type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={wasteDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {wasteDistribution.map((_, i) => (
                  <Cell key={i} fill={wasteDistribution[i].color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Monthly Cleanup Performance" subtitle="Scheduled vs completed operations over 10 months">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyCleanupPerformance} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="scheduled" name="Scheduled" fill="#94A3B8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill="#168C8C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      {showReportModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !generating && setShowReportModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-slide-up">
            <div className="glass p-6">
              {generated ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-neon-emerald" />
                  </div>
                  <p className="text-sm font-medium text-[#263445]">Report Generated</p>
                  <p className="text-xs text-gray-500 mt-1">Your PDF has been downloaded</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-neon-emerald" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#263445]">Generate Monthly Report</h3>
                        <p className="text-xs text-gray-500">Official PDF for Municipal Corporation</p>
                      </div>
                    </div>
                    <button
                      onClick={() => !generating && setShowReportModal(false)}
                      className="text-gray-500 hover:text-[#64748B]"
                      disabled={generating}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1.5 block">Report Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        disabled={generating}
                        className="w-full bg-ink-900/50 border border-ink-700 rounded-lg px-3 py-2.5 text-sm text-[#263445] focus:outline-none focus:border-neon-emerald/30 transition-colors"
                      >
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1.5 block">Report Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={generating}
                        className="w-full bg-ink-900/50 border border-ink-700 rounded-lg px-3 py-2.5 text-sm text-[#263445] focus:outline-none focus:border-neon-emerald/30 transition-colors"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-ink-800/40 border border-ink-700/60">
                      <p className="text-xs text-gray-500 mb-2">Report includes:</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-emerald" /> Executive summary with 6 KPIs</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-emerald" /> Daily incident trend chart</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-emerald" /> Waste category distribution table</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-emerald" /> Weekly detection summary</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-neon-emerald" /> Monthly cleanup performance</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleDownload}
                      disabled={generating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-colors disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Report
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
