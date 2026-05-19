"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ChevronDown, ArrowUpRight, CheckCircle2, TrendingUp, Users, MapPin, Building2, Banknote, ShieldCheck, Sun, Moon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import collegesData from "@/data/colleges.json";
import Fuse from "fuse.js";

export interface College {
  rank: number | null;
  name: string;
  city: string;
  state: string;
  examAccepted: string;
  cutoffGem: string;
  cutoffNonGem: string;
  feesStr: string;
  feesLakhs: number | null;
  averageLpaStr: string;
  averageLpa: number | null;
  roi: string;
  type: string;
  batchSize: number | null;
  nirfRank: string;
  notes: string;
}

const colleges = collegesData as College[];

export default function Dashboard() {
  const { setTheme } = useTheme();
  const [showThemePrompt, setShowThemePrompt] = useState(false);
  const [themePromptChecked, setThemePromptChecked] = useState(false);

  useEffect(() => {
    const hasPrompted = localStorage.getItem("theme_prompted");
    if (!hasPrompted) {
      setShowThemePrompt(true);
    }
    setThemePromptChecked(true);
  }, []);

  const selectTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme_prompted", "true");
    setShowThemePrompt(false);
  };

  const [search, setSearch] = useState("");
  const [sortParam, setSortParam] = useState<keyof College | "">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Filters
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [minLpa, setMinLpa] = useState<number>(0);
  const [maxFees, setMaxFees] = useState<number>(50);
  const [selectedRoi, setSelectedRoi] = useState<string[]>([]);

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const states = useMemo(() => Array.from(new Set(colleges.map(c => c.state).filter(Boolean))).sort(), []);
  const rois = ["High", "Very High", "Medium", "Low"];

  const fuse = useMemo(() => new Fuse(colleges, {
    keys: ["name", "city", "state"],
    threshold: 0.2, // Lower threshold prevents "IIT" from matching "IIM"
    distance: 100,
    ignoreLocation: true,
  }), []);

  const filteredColleges = useMemo(() => {
    let result = colleges;

    // Search
    if (search) {
      result = fuse.search(search).map(r => r.item);
    }

    // State Filter
    if (selectedStates.length > 0) {
      result = result.filter(c => selectedStates.includes(c.state));
    }

    // ROI Filter
    if (selectedRoi.length > 0) {
      result = result.filter(c => selectedRoi.includes(c.roi));
    }

    // LPA Filter
    if (minLpa > 0) {
      result = result.filter(c => (c.averageLpa || 0) >= minLpa);
    }

    // Fees Filter
    if (maxFees < 50) {
      result = result.filter(c => (c.feesLakhs || 0) <= maxFees);
    }

    // Sort
    if (sortParam) {
      result = [...result].sort((a, b) => {
        let valA = a[sortParam];
        let valB = b[sortParam];
        
        if (valA === null) valA = sortOrder === "asc" ? Infinity : -Infinity;
        if (valB === null) valB = sortOrder === "asc" ? Infinity : -Infinity;

        if (valA! < valB!) return sortOrder === "asc" ? -1 : 1;
        if (valA! > valB!) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [search, sortParam, sortOrder, selectedStates, minLpa, maxFees, selectedRoi]);

  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const toggleRoi = (roi: string) => {
    setSelectedRoi(prev => 
      prev.includes(roi) ? prev.filter(r => r !== roi) : [...prev, roi]
    );
  };

  if (!themePromptChecked) {
    return <div className="min-h-screen bg-background text-foreground"></div>;
  }

  if (showThemePrompt) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="bg-card border border-border shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">MBA Intelligence</h2>
          <p className="text-muted-foreground mb-8">Choose your preferred viewing experience to begin exploring colleges.</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => selectTheme('light')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary bg-muted/30 transition-all hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Sun size={24} />
              </div>
              <span className="font-semibold">Light Mode</span>
            </button>
            <button
              onClick={() => selectTheme('dark')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary bg-muted/30 transition-all hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white border border-zinc-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Moon size={24} />
              </div>
              <span className="font-semibold">Dark Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">MBA Intelligence</h1>
          </div>
          
          <div className="flex-1 max-w-xl mx-4 relative">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search colleges, cities, states..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center justify-center relative"
            >
              <Filter size={18} />
              {(selectedStates.length > 0 || selectedRoi.length > 0 || minLpa > 0 || maxFees < 50) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar Filter */}
        <aside className={`lg:w-64 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden lg:block'} fixed inset-0 z-40 lg:static lg:z-auto bg-background/95 lg:bg-transparent lg:backdrop-blur-none backdrop-blur-xl transition-all`}>
          <div className="h-full overflow-y-auto p-6 lg:p-0">
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Sort By */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Sort By</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Rank", value: "rank" },
                    { label: "Average LPA", value: "averageLpa" },
                    { label: "Fees", value: "feesLakhs" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (sortParam === opt.value) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortParam(opt.value as any);
                          setSortOrder(opt.value === "averageLpa" ? "desc" : "asc");
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all ${sortParam === opt.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}
                    >
                      {opt.label}
                      {sortParam === opt.value && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border w-full"></div>

              {/* LPA Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Min Average LPA</h3>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{minLpa}L+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={minLpa}
                  onChange={(e) => setMinLpa(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Fees Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Max Fees</h3>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">≤{maxFees}L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={maxFees}
                  onChange={(e) => setMaxFees(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="h-px bg-border w-full"></div>

              {/* ROI Filter */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Return on Investment</h3>
                <div className="flex flex-wrap gap-2">
                  {rois.map(roi => (
                    <button
                      key={roi}
                      onClick={() => toggleRoi(roi)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selectedRoi.includes(roi) ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border bg-card hover:border-primary/50'}`}
                    >
                      {roi}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">State ({states.length})</h3>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {states.map(state => (
                    <label key={state} className="flex items-center gap-3 p-1 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={selectedStates.includes(state)} 
                        onChange={() => toggleState(state)} 
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStates.includes(state) ? 'bg-primary border-primary' : 'border-muted-foreground/40 group-hover:border-primary/50'}`}>
                        {selectedStates.includes(state) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{state}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Top Institutions</h2>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
              {filteredColleges.length} results
            </span>
          </div>

          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredColleges.map((college) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  key={college.name}
                  onClick={() => setSelectedCollege(college)}
                  className="group relative bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-5 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background font-bold text-xs shadow-sm">
                          #{college.rank || "-"}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {college.type}
                        </span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 translate-y-2 group-hover:translate-y-0 translate-x-[-8px] group-hover:translate-x-0" />
                    </div>

                    <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {college.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-5">
                      <MapPin size={14} />
                      {college.city}, {college.state}
                    </p>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Average LPA</p>
                        <p className="text-lg font-bold text-foreground flex items-center gap-1">
                          {college.averageLpaStr || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Fees</p>
                        <p className="text-base font-semibold text-foreground flex items-center gap-1">
                          {college.feesStr || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-5 pt-4 border-t border-border/60 grid grid-cols-2 gap-2 text-xs text-muted-foreground font-medium">
                     <div className="flex flex-col gap-1">
                        <span>GEM Cutoff: <strong className="text-foreground">{college.cutoffGem || "-"}</strong></span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span>Non-GEM: <strong className="text-foreground">{college.cutoffNonGem || "-"}</strong></span>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {filteredColleges.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </main>
      </div>

      {/* College Detail Modal */}
      <AnimatePresence>
        {selectedCollege && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCollege(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-x-4 bottom-4 top-20 md:inset-x-auto md:right-8 md:top-8 md:bottom-8 md:w-[600px] bg-card border border-border shadow-2xl rounded-3xl z-50 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/20 via-background to-background border-b border-border p-8 flex flex-col justify-end shrink-0">
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background font-bold text-sm shadow-md">
                    #{selectedCollege.rank || "-"}
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                    {selectedCollege.type}
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 uppercase tracking-wide">
                    {selectedCollege.roi} ROI
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground leading-tight">{selectedCollege.name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 font-medium">
                  <MapPin size={16} />
                  {selectedCollege.city}, {selectedCollege.state}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted/50 p-4 rounded-2xl border border-border/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <TrendingUp size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Average Placement</span>
                    </div>
                    <span className="text-2xl font-bold">{selectedCollege.averageLpaStr || "N/A"}</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl border border-border/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Banknote size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Fees</span>
                    </div>
                    <span className="text-2xl font-bold">{selectedCollege.feesStr || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
                      <ShieldCheck size={20} className="text-primary" />
                      Admission Requirements
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Exams Accepted</p>
                        <p className="font-medium bg-muted inline-block px-2 py-1 rounded text-sm">{selectedCollege.examAccepted || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Batch Size</p>
                        <p className="font-medium flex items-center gap-1.5"><Users size={16} className="text-muted-foreground"/> {selectedCollege.batchSize || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">GEM Cutoff</p>
                        <p className="font-bold text-primary">{selectedCollege.cutoffGem || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Non-GEM Cutoff</p>
                        <p className="font-bold text-primary">{selectedCollege.cutoffNonGem || "N/A"}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Institutional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <p className="text-sm text-muted-foreground mb-1">NIRF Rank 2025</p>
                        <p className="font-medium">{selectedCollege.nirfRank || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Institution Type</p>
                        <p className="font-medium">{selectedCollege.type || "N/A"}</p>
                      </div>
                    </div>
                  </section>

                  {selectedCollege.notes && (
                    <section className="bg-primary/5 border border-primary/20 p-5 rounded-2xl">
                      <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Key Strengths & Notes</h3>
                      <p className="text-sm leading-relaxed text-foreground/90">{selectedCollege.notes}</p>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
