import React from "react";
import { Users, FileCheck, Calendar, DollarSign, TrendingUp, TrendingDown, Map as MapIcon, BarChart3 } from "lucide-react";
import { Card } from "@repo/ui";

const kpiData = [
  {
    title: "Total Active Tourists",
    value: "14,284",
    trend: "+12.5%",
    trendUp: true,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Pending Verifications",
    value: "84",
    trend: "-5.2%",
    trendUp: false,
    icon: FileCheck,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Total Bookings",
    value: "3,192",
    trend: "+8.1%",
    trendUp: true,
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Total GMV (UZS)",
    value: "4.2B",
    trend: "+15.3%",
    trendUp: true,
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function DashboardPage() {
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
                <span className="text-gray-400 ml-2">vs last period</span>
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

        {/* Analytics Graphs Placeholder */}
        <Card className="flex flex-col border border-gray-100 shadow-sm rounded-xl bg-white h-[400px]">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Revenue Growth</h3>
          </div>
          <div className="flex-1 p-6 flex items-end space-x-2 relative group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
              <div className="flex flex-col items-center text-[#1E6F8A]">
                <BarChart3 className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Connect Chart.js / Recharts</span>
              </div>
            </div>

            {/* Mock Bar Chart */}
            {[40, 70, 45, 90, 65, 100, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full">
                <div 
                  className="w-full bg-gradient-to-t from-[#1E6F8A] to-[#3B9AB8] rounded-t-sm opacity-80" 
                  style={{ height: `${height}%` }}
                />
                <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
