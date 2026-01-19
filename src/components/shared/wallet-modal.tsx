import { useState, useEffect } from "react";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useSwitchChain,
  type Connector,
} from "wagmi"; // Added type Connector
import { Wallet, LogOut, Check, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

// FIX 1: Import from the /dynamic path
import { WalletIcon, NetworkIcon } from "@web3icons/react/dynamic";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { connectors, connect, isPending } = useConnect();
  const { address, isConnected, chain: currentChain } = useAccount();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();

  if (!mounted) return null;

  // FIX 2: Explicitly type 'c' as Connector
  const filteredConnectors = connectors.filter(
    (c: Connector) => c.id !== "injected"
  );

  // Helper to map Wagmi connector IDs to Web3Icons IDs
  const getWalletIconId = (connectorId: string) => {
    const map: Record<string, string> = {
      "io.metamask": "metamask",
      coinbaseWalletSDK: "coinbase",
      walletConnect: "walletconnect",
      "io.rabby": "rabby",
      "me.rainbow": "rainbow",
      safe: "safe",
    };
    return map[connectorId] || "walletconnect";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {isConnected ? "Wallet Settings" : "Connect Wallet"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {!isConnected ? (
            <div className="grid gap-3">
              {/* FIX 3: Explicitly type 'connector' as Connector */}
              {filteredConnectors.map((connector: Connector) => (
                <Button
                  key={connector.uid}
                  variant="outline"
                  onClick={() => {
                    connect({ connector });
                    onClose();
                  }}
                  className="h-16 justify-between px-4 hover:border-primary/50 hover:bg-muted/50 group"
                  disabled={isPending}
                >
                  <span className="flex items-center gap-3 font-medium text-base">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-background transition-colors border border-border/50">
                      <WalletIcon
                        id={getWalletIconId(connector.id)}
                        size={28}
                        className="rounded-sm"
                      />
                    </div>
                    {connector.name}
                  </span>
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Connected as
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => disconnect()}
                  title="Disconnect"
                >
                  <LogOut size={18} />
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground ml-1">
                  Switch Network
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {/* @ts-ignore */}
                  {chains.map((chain) => {
                    const isActive = currentChain?.id === chain.id;
                    return (
                      <Button
                        key={chain.id}
                        variant={isActive ? "secondary" : "outline"}
                        onClick={async () => {
                          try {
                            // First try regular switch via wagmi
                            await switchChain({ chainId: chain.id });
                          } catch (error: any) {
                            const { switchOrAddNetwork } =
                              await import("~/lib/wallet-network-utils");
                            await switchOrAddNetwork(chain);
                          }
                        }}
                        className={cn(
                          "justify-between h-14 pl-3 pr-4 transition-all",
                          isActive
                            ? "border-primary/20 bg-primary/5 text-primary shadow-sm"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-full bg-background border",
                              isActive ? "border-primary/20" : "border-border"
                            )}
                          >
                            {/* FIX 4: Use 'network' prop instead of 'chainId' if chainId fails */}
                            <NetworkIcon
                              chainId={chain.id}
                              size={20}
                              variant="mono"
                            />
                          </div>
                          <span className="font-medium">{chain.name}</span>
                        </span>
                        {isActive && (
                          <Check size={18} className="text-primary" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
