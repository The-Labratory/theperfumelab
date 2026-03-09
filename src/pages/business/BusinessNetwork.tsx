import { useOutletContext } from "react-router-dom";
import MyNetworkManager from "@/components/affiliate/MyNetworkManager";
import AffiliateNetworkPyramid from "@/components/affiliate/AffiliateNetworkPyramid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusinessNetwork() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl font-black tracking-wider text-foreground">My Network</h2>
        <p className="text-xs text-muted-foreground font-body mt-1">Manage your affiliate network and downline</p>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="bg-muted/30 border border-border/30">
          <TabsTrigger value="manage" className="text-xs font-display tracking-wider">Manage Network</TabsTrigger>
          <TabsTrigger value="pyramid" className="text-xs font-display tracking-wider">Network Pyramid</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <div className="glass-surface rounded-xl p-6 border border-border/30">
            <MyNetworkManager />
          </div>
        </TabsContent>

        <TabsContent value="pyramid">
          <div className="glass-surface rounded-xl p-6 border border-border/30">
            <AffiliateNetworkPyramid />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
