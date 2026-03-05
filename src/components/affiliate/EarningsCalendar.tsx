import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, DollarSign, TrendingUp, Zap } from "lucide-react";

interface EarningsCalendarProps {
  sales: Array<{ created_at: string; notes?: string | null }>;
  commissionRate: number;
}

const AOV = 45; // average order value EUR

const STREAK_REWARDS = [
  { days: 3, label: "🔥 Hot Start", bonus: "+5% bonus" },
  { days: 7, label: "⚡ Week Warrior", bonus: "+10% bonus" },
  { days: 14, label: "💎 Unstoppable", bonus: "+15% bonus" },
  { days: 30, label: "👑 Diamond Rush", bonus: "+25% bonus" },
];

const EarningsCalendar = ({ sales, commissionRate }: EarningsCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Group sales by date string
  const salesByDate = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s) => {
      const dateKey = new Date(s.created_at).toISOString().slice(0, 10);
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [sales]);

  // Calculate streak
  const { currentStreak, bestStreak } = useMemo(() => {
    const sortedDates = Array.from(salesByDate.keys()).sort();
    if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

    let best = 1;
    let current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 1;
      }
    }

    // Check if current streak extends to today
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastSaleDate = sortedDates[sortedDates.length - 1];
    const isActive = lastSaleDate === today || lastSaleDate === yesterday;

    return { currentStreak: isActive ? current : 0, bestStreak: best };
  }, [salesByDate]);

  // Monthly stats
  const monthStats = useMemo(() => {
    let totalSales = 0;
    let activeDays = 0;
    salesByDate.forEach((count, dateKey) => {
      if (dateKey.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)) {
        totalSales += count;
        activeDays++;
      }
    });
    const commission = totalSales * AOV * (commissionRate / 100);
    return { totalSales, activeDays, commission };
  }, [salesByDate, year, month, commissionRate]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const navigate = (dir: -1 | 1) => {
    setCurrentMonth(new Date(year, month + dir, 1));
  };

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const nextStreakReward = STREAK_REWARDS.find((r) => r.days > currentStreak);

  const getHeatColor = (count: number) => {
    if (count === 0) return "";
    if (count === 1) return "bg-primary/20 border-primary/30";
    if (count <= 3) return "bg-primary/40 border-primary/50";
    return "bg-primary/60 border-primary/70";
  };

  return (
    <div className="space-y-6">
      {/* Streak Banner */}
      <div className="flex flex-wrap gap-3">
        <div className="glass-surface rounded-xl p-4 flex-1 min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">CURRENT STREAK</span>
          </div>
          <p className="font-display text-2xl font-black text-foreground">
            {currentStreak} <span className="text-sm font-semibold text-muted-foreground">days</span>
          </p>
          {currentStreak > 0 && (
            <p className="text-[10px] text-orange-400 font-display mt-1">
              {STREAK_REWARDS.filter((r) => r.days <= currentStreak).pop()?.label || "Keep going!"}
            </p>
          )}
        </div>
        <div className="glass-surface rounded-xl p-4 flex-1 min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">BEST STREAK</span>
          </div>
          <p className="font-display text-2xl font-black text-foreground">
            {bestStreak} <span className="text-sm font-semibold text-muted-foreground">days</span>
          </p>
        </div>
        <div className="glass-surface rounded-xl p-4 flex-1 min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">THIS MONTH</span>
          </div>
          <p className="font-display text-2xl font-black text-foreground">€{monthStats.commission.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground font-body">{monthStats.totalSales} sales · {monthStats.activeDays} active days</p>
        </div>
      </div>

      {/* Next Streak Goal */}
      {nextStreakReward && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface rounded-xl p-4 border border-orange-400/20 flex items-center gap-3"
        >
          <Zap className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-display tracking-wider text-foreground">
              {nextStreakReward.days - currentStreak} more day{nextStreakReward.days - currentStreak !== 1 ? "s" : ""} to unlock{" "}
              <span className="text-orange-400">{nextStreakReward.label}</span>
            </p>
            <p className="text-[10px] text-muted-foreground font-body">{nextStreakReward.bonus} on all commissions</p>
          </div>
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all"
              style={{ width: `${Math.min(100, (currentStreak / nextStreakReward.days) * 100)}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Calendar */}
      <div className="glass-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h3 className="font-display text-sm font-semibold tracking-wider text-foreground">{monthName}</h3>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[9px] font-display tracking-widest text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const count = salesByDate.get(dateKey) || 0;
            const isToday = dateKey === new Date().toISOString().slice(0, 10);
            const earning = count * AOV * (commissionRate / 100);

            return (
              <div
                key={i}
                className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-colors group cursor-default
                  ${count > 0 ? getHeatColor(count) : "border-border/50"}
                  ${isToday ? "ring-1 ring-primary/50" : ""}
                `}
              >
                <span className={`text-xs font-display ${count > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                  {day}
                </span>
                {count > 0 && (
                  <span className="text-[8px] font-display text-primary font-bold">{count}×</span>
                )}
                {/* Tooltip */}
                {count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-card border border-border text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 w-28 shadow-lg">
                    <p className="text-[10px] font-display text-foreground font-bold">{count} sale{count !== 1 ? "s" : ""}</p>
                    <p className="text-[9px] text-primary font-display">€{earning.toFixed(2)} earned</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Heat legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-[9px] text-muted-foreground font-body">Less</span>
          {[0, 1, 2, 4].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm border ${c === 0 ? "border-border/50 bg-transparent" : getHeatColor(c)}`} />
          ))}
          <span className="text-[9px] text-muted-foreground font-body">More</span>
        </div>
      </div>
    </div>
  );
};

export default EarningsCalendar;
