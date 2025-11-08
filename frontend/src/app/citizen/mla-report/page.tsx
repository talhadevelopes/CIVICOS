"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, BarChart3, MapPin, Mail, Phone, TrendingUp, AlertCircle, Users, Activity, Building2, Award, Target } from "lucide-react"
import { Navbar } from "@/app/_components/navbar"

interface MLAData {
  id: string
  name: string
  constituency: string
  party: string
  contact: string
  phone: string
  image: string
  performanceScore: number
  issuesResolved: number
  issuesPending: number
  averageResolutionTime: number
  responseRate: number
  categories: {
    name: string
    resolved: number
    total: number
  }[]
}

const mockMLAs: MLAData[] = [
  {
    id: "1",
    name: "Shri. Rajesh Kumar",
    constituency: "Jubilee Hills",
    party: "Bharatiya Janata Party",
    contact: "rajesh.kumar@mla.gov.in",
    phone: "+91 98765 43210",
    image: "/api/placeholder/80/80",
    performanceScore: 8.5,
    issuesResolved: 156,
    issuesPending: 24,
    averageResolutionTime: 8,
    responseRate: 92,
    categories: [
      { name: "Road Damage", resolved: 42, total: 45 },
      { name: "Water Supply", resolved: 38, total: 40 },
      { name: "Street Lights", resolved: 35, total: 38 },
      { name: "Drainage", resolved: 26, total: 32 },
      { name: "Others", resolved: 15, total: 18 },
    ],
  },
  {
    id: "2",
    name: "Smt. Priya Singh",
    constituency: "Banjara Hills",
    party: "Indian National Congress",
    contact: "priya.singh@mla.gov.in",
    phone: "+91 98765 43211",
    image: "/api/placeholder/80/80",
    performanceScore: 7.8,
    issuesResolved: 128,
    issuesPending: 35,
    averageResolutionTime: 11,
    responseRate: 87,
    categories: [
      { name: "Road Damage", resolved: 35, total: 40 },
      { name: "Water Supply", resolved: 30, total: 38 },
      { name: "Street Lights", resolved: 28, total: 35 },
      { name: "Drainage", resolved: 22, total: 30 },
      { name: "Others", resolved: 13, total: 17 },
    ],
  },
  {
    id: "3",
    name: "Shri. Amit Patel",
    constituency: "Hitech City",
    party: "Telangana Rashtra Samithi",
    contact: "amit.patel@mla.gov.in",
    phone: "+91 98765 43212",
    image: "/api/placeholder/80/80",
    performanceScore: 6.9,
    issuesResolved: 92,
    issuesPending: 58,
    averageResolutionTime: 14,
    responseRate: 78,
    categories: [
      { name: "Road Damage", resolved: 25, total: 38 },
      { name: "Water Supply", resolved: 20, total: 35 },
      { name: "Street Lights", resolved: 18, total: 32 },
      { name: "Drainage", resolved: 15, total: 28 },
      { name: "Others", resolved: 14, total: 22 },
    ],
  },
]

export default function MLAReportCards() {
  const [selectedMLA, setSelectedMLA] = useState<MLAData | null>(null)
  const [sortBy, setSortBy] = useState<"score" | "resolved" | "pending">("score")
  const [activeTab, setActiveTab] = useState<"overview" | "performance">("overview")

  const sortedMLAs = [...mockMLAs].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.performanceScore - a.performanceScore
      case "resolved":
        return b.issuesResolved - a.issuesResolved
      case "pending":
        return a.issuesPending - b.issuesPending
      default:
        return 0
    }
  })

  const getScoreColor = (score: number) => {
    if (score >= 8) return "#10b981"
    if (score >= 7) return "#eab308"
    return "#ef4444"
  }

  const getScoreBg = (score: number) => {
    if (score >= 8) return "#10b98114"
    if (score >= 7) return "#eab30814"
    return "#ef444414"
  }

  const performanceStats = [
    {
      label: "Total Performance",
      value: "8.2",
      change: "+2.1%",
      icon: Award,
      color: "#3b82f6"
    },
    {
      label: "Avg Resolution Time",
      value: "9.3 days",
      change: "-1.2 days",
      icon: Clock,
      color: "#10b981"
    },
    {
      label: "Satisfaction Rate",
      value: "87%",
      change: "+5%",
      icon: TrendingUp,
      color: "#eab308"
    },
    {
      label: "Active Constituents",
      value: "12,847",
      change: "+342",
      icon: Users,
      color: "#8b5cf6"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                MLA Performance Dashboard
              </h1>
              <p className="text-[#a1a1aa] text-sm mt-1.5 font-medium tracking-wide">
                Transparent accountability for elected representatives
              </p>
            </div>
            
            {/* Performance Overview */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-[10px] border border-[#10b981] bg-[#10b98114] flex items-center gap-2">
                <Award size={14} className="text-[#10b981]" />
                <span className="text-xs font-semibold text-[#10b981]">Overall: 8.2/10</span>
              </div>
            </div>
          </motion.div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {performanceStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5 hover:border-[#3f3f46] transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <stat.icon
                    size={18}
                    style={{ color: stat.color }}
                    className="opacity-80"
                  />
                </div>
                <p className="text-[#a1a1aa] text-xs font-medium tracking-wide uppercase mb-1.5">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold tracking-tight mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-[#10b981]">
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-1 mb-6 bg-[#18181b] border border-[#27272a] rounded-[10px] p-2"
              >
                {[
                  { value: "score", label: "Top Performers", icon: Award },
                  { value: "resolved", label: "Most Resolved", icon: CheckCircle },
                  { value: "pending", label: "Least Pending", icon: Clock },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[8px] font-semibold text-sm transition-all flex-1 justify-center ${
                      sortBy === option.value
                        ? "bg-[#3b82f6] text-white"
                        : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#27272a]"
                    }`}
                  >
                    <option.icon size={16} />
                    {option.label}
                  </button>
                ))}
              </motion.div>

              {/* MLA Cards Grid */}
              <div className="space-y-4">
                {sortedMLAs.map((mla, idx) => (
                  <motion.div
                    key={mla.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedMLA(mla)}
                    className="bg-[#18181b] border border-[#27272a] rounded-[10px] overflow-hidden hover:border-[#3f3f46] transition-colors cursor-pointer group"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* MLA Image and Basic Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0">
                            <Users size={24} className="text-[#71717a]" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold mb-1">{mla.name}</h3>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="text-[#a1a1aa] flex items-center gap-1">
                                    <MapPin size={14} />
                                    {mla.constituency}
                                  </span>
                                  <span className="text-[#3b82f6] font-semibold">{mla.party}</span>
                                </div>
                              </div>
                              
                              {/* Performance Score */}
                              <div 
                                className="px-3 py-2 rounded-[8px] border text-center flex-shrink-0"
                                style={{
                                  backgroundColor: getScoreBg(mla.performanceScore),
                                  borderColor: getScoreColor(mla.performanceScore),
                                }}
                              >
                                <p className="text-2xl font-bold" style={{ color: getScoreColor(mla.performanceScore) }}>
                                  {mla.performanceScore}
                                </p>
                                <p className="text-xs" style={{ color: getScoreColor(mla.performanceScore) }}>
                                  /10
                                </p>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-[#10b98114] p-3 rounded-[8px] text-center border border-[#10b981]">
                                <CheckCircle className="text-[#10b981] mx-auto mb-2" size={20} />
                                <p className="text-2xl font-bold text-[#10b981]">{mla.issuesResolved}</p>
                                <p className="text-xs text-[#10b981] font-medium">Resolved</p>
                              </div>

                              <div className="bg-[#eab30814] p-3 rounded-[8px] text-center border border-[#eab308]">
                                <Clock className="text-[#eab308] mx-auto mb-2" size={20} />
                                <p className="text-2xl font-bold text-[#eab308]">{mla.issuesPending}</p>
                                <p className="text-xs text-[#eab308] font-medium">Pending</p>
                              </div>

                              <div className="bg-[#3b82f614] p-3 rounded-[8px] text-center border border-[#3b82f6]">
                                <BarChart3 className="text-[#3b82f6] mx-auto mb-2" size={20} />
                                <p className="text-2xl font-bold text-[#3b82f6]">{mla.responseRate}%</p>
                                <p className="text-xs text-[#3b82f6] font-medium">Response</p>
                              </div>
                            </div>

                            {/* Performance Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Overall Performance</span>
                                <span className="text-xs text-[#a1a1aa]">
                                  Resolution: {mla.averageResolutionTime} days
                                </span>
                              </div>
                              <div className="w-full bg-[#27272a] rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${(mla.performanceScore / 10) * 100}%`,
                                    backgroundColor: getScoreColor(mla.performanceScore)
                                  }}
                                />
                              </div>
                            </div>

                            {/* CTA */}
                            <button className="w-full py-3 bg-[#3b82f614] text-[#3b82f6] font-semibold rounded-[8px] hover:bg-[#3b82f6] hover:text-white transition-colors group-hover:bg-[#3b82f6] group-hover:text-white">
                              View Detailed Report
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar - Top Performers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:w-[320px] flex-shrink-0"
            >
              <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5 sticky top-24">
                <h3 className="text-xs font-semibold text-[#a1a1aa] mb-4 uppercase tracking-wider">
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {sortedMLAs.slice(0, 3).map((mla, index) => (
                    <div
                      key={mla.id}
                      className="flex items-center gap-3 p-3 rounded-[8px] hover:bg-[#27272a] transition-colors cursor-pointer"
                      onClick={() => setSelectedMLA(mla)}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#3b82f6]">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{mla.name}</p>
                        <p className="text-xs text-[#a1a1aa] truncate">{mla.constituency}</p>
                      </div>
                      <div 
                        className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: getScoreBg(mla.performanceScore),
                          color: getScoreColor(mla.performanceScore),
                        }}
                      >
                        {mla.performanceScore}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-[#27272a]">
                  <h3 className="text-xs font-semibold text-[#a1a1aa] mb-4 uppercase tracking-wider">
                    Regional Overview
                  </h3>
                  <div className="space-y-1">
                    {[
                      { label: "Total MLAs", value: "3", icon: Users },
                      { label: "Avg Performance", value: "7.7/10", icon: Activity },
                      { label: "Total Resolved", value: "376", icon: CheckCircle },
                      { label: "Avg Response Time", value: "11 days", icon: Clock },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2.5">
                            <item.icon size={14} className="text-[#71717a] flex-shrink-0" />
                            <span className="text-xs font-medium text-[#d4d4d8]">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-bold">{item.value}</span>
                        </div>
                        {i < 3 && <div className="h-px bg-[#27272a]" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Details Modal */}
          {selectedMLA && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 pt-20"
              onClick={() => setSelectedMLA(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#18181b] border border-[#27272a] rounded-[10px] max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0">
                        <Users size={32} className="text-[#71717a]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{selectedMLA.name}</h2>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className="text-[#a1a1aa] flex items-center gap-1">
                            <MapPin size={16} />
                            {selectedMLA.constituency}
                          </span>
                          <span className="text-[#3b82f6] font-semibold">{selectedMLA.party}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#a1a1aa]">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {selectedMLA.contact}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {selectedMLA.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMLA(null)}
                      className="text-[#a1a1aa] hover:text-white text-2xl p-2 hover:bg-[#27272a] rounded-[8px] transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 border-b border-[#27272a] mb-6">
                    {[
                      { value: "overview", label: "Overview" },
                      { value: "performance", label: "Performance" },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value as typeof activeTab)}
                        className={`flex items-center gap-2 px-6 h-[48px] font-semibold transition-colors relative text-sm ${
                          activeTab === tab.value
                            ? "text-[#3b82f6]"
                            : "text-[#71717a] hover:text-[#a1a1aa]"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.value && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6]"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {activeTab === "overview" ? (
                    <div className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#10b98114] border border-[#10b981] rounded-[10px] p-6 text-center">
                          <p className="text-sm text-[#10b981] font-semibold mb-2">Issues Resolved</p>
                          <p className="text-4xl font-bold text-[#10b981]">{selectedMLA.issuesResolved}</p>
                        </div>

                        <div className="bg-[#eab30814] border border-[#eab308] rounded-[10px] p-6 text-center">
                          <p className="text-sm text-[#eab308] font-semibold mb-2">Issues Pending</p>
                          <p className="text-4xl font-bold text-[#eab308]">{selectedMLA.issuesPending}</p>
                        </div>

                        <div className="bg-[#3b82f614] border border-[#3b82f6] rounded-[10px] p-6 text-center">
                          <p className="text-sm text-[#3b82f6] font-semibold mb-2">Avg Resolution Time</p>
                          <p className="text-4xl font-bold text-[#3b82f6]">{selectedMLA.averageResolutionTime}</p>
                          <p className="text-sm text-[#3b82f6]">days</p>
                        </div>

                        <div className="bg-[#8b5cf614] border border-[#8b5cf6] rounded-[10px] p-6 text-center">
                          <p className="text-sm text-[#8b5cf6] font-semibold mb-2">Response Rate</p>
                          <p className="text-4xl font-bold text-[#8b5cf6]">{selectedMLA.responseRate}%</p>
                        </div>
                      </div>

                      {/* Performance Score */}
                      <div 
                        className="rounded-[10px] p-6 border text-center"
                        style={{
                          backgroundColor: getScoreBg(selectedMLA.performanceScore),
                          borderColor: getScoreColor(selectedMLA.performanceScore),
                        }}
                      >
                        <p className="text-sm font-semibold mb-2 text-[#a1a1aa]">Overall Performance Score</p>
                        <p className="text-5xl font-bold mb-3" style={{ color: getScoreColor(selectedMLA.performanceScore) }}>
                          {selectedMLA.performanceScore} / 10
                        </p>
                        <p className="text-sm text-[#d4d4d8]">
                          {selectedMLA.performanceScore >= 8
                            ? "Excellent performance in resolving citizen issues"
                            : selectedMLA.performanceScore >= 7
                              ? "Good performance with room for improvement"
                              : "Needs significant improvement in issue resolution"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Category Breakdown */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Issue Category Performance</h3>
                        <div className="space-y-4">
                          {selectedMLA.categories.map((cat) => (
                            <div key={cat.name} className="bg-[#27272a] rounded-[8px] p-4">
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold">{cat.name}</p>
                                <span className="text-sm text-[#a1a1aa]">
                                  {cat.resolved} / {cat.total} ({Math.round((cat.resolved / cat.total) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#0a0a0a] rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${(cat.resolved / cat.total) * 100}%`,
                                    backgroundColor: getScoreColor((cat.resolved / cat.total) * 10)
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}