import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, LogOut, Camera, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string | null;
  referral_code: string | null;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({ display_name: "", bio: "", avatar_url: null, referral_code: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url, referral_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ display_name: data.display_name ?? "", bio: data.bio ?? "", avatar_url: data.avatar_url, referral_code: data.referral_code });
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: profile.display_name, bio: profile.bio })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(t("profile.saveError"));
    } else {
      toast.success(t("profile.saved"));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error(t("profile.uploadError"));
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = urlData.publicUrl;

    await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
    setProfile((p) => ({ ...p, avatar_url }));
    toast.success(t("profile.avatarUpdated"));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-black tracking-wider text-foreground mb-1">
            {t("profile.title")}
          </h1>
          <p className="text-sm text-muted-foreground font-body">{t("profile.subtitle")}</p>
        </motion.div>

        {/* Avatar */}
        <Card>
          <CardContent className="p-6 flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-primary/30">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display text-xl">
                  {profile.display_name?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <p className="font-display font-bold text-foreground">{profile.display_name || t("profile.noName")}</p>
              <p className="text-xs text-muted-foreground font-body">{user?.email}</p>
              {profile.referral_code && (
                <p className="text-xs text-primary font-mono mt-1">{t("profile.referralCode")}: {profile.referral_code}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">{t("profile.editProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">{t("profile.displayName")}</Label>
              <Input
                value={profile.display_name}
                onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("profile.bio")}</Label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="mt-1"
                rows={3}
                placeholder={t("profile.bioPlaceholder")}
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full font-display tracking-wider">
              <Save className="w-4 h-4 mr-2" />
              {saving ? t("profile.saving") : t("profile.save")}
            </Button>
          </CardContent>
        </Card>

        {/* Account section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">{t("profile.account")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-body text-foreground">{t("profile.email")}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="w-full font-display tracking-wider gap-2">
              <LogOut className="w-4 h-4" /> {t("profile.signOut")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
