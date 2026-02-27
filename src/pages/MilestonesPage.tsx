import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const MilestonesPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20 pb-12 px-4 max-w-5xl mx-auto text-center">
      <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-display font-bold gradient-text mb-2">Milestones</h1>
      <p className="text-muted-foreground">Coming soon — track your fragrance journey achievements.</p>
    </div>
  </div>
);

export default MilestonesPage;
