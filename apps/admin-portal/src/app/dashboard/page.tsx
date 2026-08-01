import React from "react";
import { Users, FileCheck, Calendar, DollarSign, Map as MapIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@repo/ui";
import { getPlatformStats } from "../actions/dashboardActions";

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default async function DashboardPage() {
  const stats = await getPlatformStats();

  const kpiData = [
    {
      title: "Total Active Tourists",
      value: stats.totalTourists.toLocaleString(),
      trend: `+${stats.newTouristsThisWeek} this week`,
      trendUp: stats.newTouristsThisWeek > 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications.toLocaleString(),
      trend: stats.pendingVerifications > 0 ? "Action required" : "All clear",
      trendUp: stats.pendingVerifications === 0,
      icon: FileCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      trend: `+${stats.newBookingsThisWeek} this week`,
      trendUp: stats.newBookingsThisWeek > 0,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total GMV (UZS)",
      value: formatCompact(stats.totalGmv),
      trend: "from completed bookings, last 7 days",
      trendUp: true,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const maxRevenue = Math.max(...stats.revenueLast7Days.map((d) => d.total), 1);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of ecosystem performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-white border border-gray-200 text-sm font-medium text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E6F8A] focus:border-transparent">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Year</option>
          </select>
          <button className="bg-[#1E6F8A] hover:bg-[#155368] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-5 border border-gray-100 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{kpi.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center font-medium ${kpi.trendUp ? "text-emerald-600" : "text-red-600"}`}>
                  {kpi.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {kpi.trend}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Heatmap Placeholder */}
        <Card className="flex flex-col border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden h-[400px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="text-base font-bold text-gray-900">Tourist Density Heatmap</h3>
            <button className="text-sm font-medium text-[#1E6F8A] hover:underline">View Full Map</button>
          </div>
          <div className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-[#1E6F8A]/5 pattern-grid-lg opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent" />
            
            <div className="relative z-10 flex flex-col items-center text-gray-400 group-hover:text-[#1E6F8A] transition-colors">
              <MapIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">Mapbox Integration Pending (Stage 2)</p>
            </div>

            {/* Decorative Heatmap blobs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-400/20 rounded-full blur-3xl mix-blend-multiply" />
            <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl mix-blend-multiply" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-400/20 rounded-full blur-3xl mix-blend-multiply" />
          </div>
        </Card>

        {/* Revenue — completed bookings, last 7 days */}
        <Card className="flex flex-col border border-gray-100 shadow-sm rounded-xl bg-white h-[400px]">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Revenue Growth</h3>
            <p className="text-xs text-gray-400 mt-0.5">GMV from completed bookings, last 7 days</p>
          </div>
          <div className="flex-1 p-6 flex items-end space-x-2">
            {stats.revenueLast7Days.every((d) => d.total === 0) ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                No completed bookings in the last 7 days
              </div>
            ) : (
              stats.revenueLast7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full" title={formatCompact(d.total)}>
                  <div
                    className="w-full bg-gradient-to-t from-[#1E6F8A] to-[#3B9AB8] rounded-t-sm opacity-80"
                    style={{ height: `${Math.max((d.total / maxRevenue) * 100, d.total > 0 ? 4 : 0)}%` }}
                  />
                  <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">{d.label}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
