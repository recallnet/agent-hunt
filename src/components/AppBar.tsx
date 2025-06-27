import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { NewAgentModal } from "./NewAgentModal";
import { ShareXModal } from "./ShareXModal";
import { RulesModal } from "./RulesModal";
import { Menu } from "lucide-react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { SuccessfulAgentData } from "@utils/types";

export const AppBar: React.FC = () => {
  const [isNewAgentModalOpen, setNewAgentModalOpen] = useState(false);
  const [isShareXModalOpen, setShareXModalOpen] = useState(false);
  const [isRulesModalOpen, setRulesModalOpen] = useState(false);
  // Use the existing SuccessfulAgentData type for the state
  const [shareXAgentData, setShareXAgentData] = useState<SuccessfulAgentData | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const { isConnected } = useAccount();

  const handleHuntClick = () => {
    if (isConnected) {
      setNewAgentModalOpen(true);
    } else {
      toast.error("Please connect your wallet to hunt an agent.");
    }
    setMobileMenuOpen(false);
  };

  const handleRulesClick = () => {
    setRulesModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleCloseNewAgentModal = () => {
    setNewAgentModalOpen(false);
  };

  const handleNewAgentSuccess = (agentData: SuccessfulAgentData) => {
    setShareXAgentData(agentData);
    setShareXModalOpen(true);
  };

  const handleCloseShareXModal = () => {
    setShareXAgentData(null);
  };

  const navTextStyle = "font-bold text-base tracking-tighter";
  const centerNavStyle = `text-xl ${navTextStyle} hover:bg-transparent hover:cursor-pointer`;

  const huntButtonClass = isNewAgentModalOpen
    ? "h-[42px] w-[135px] rounded-[5px] bg-[var(--brand-blue)] text-white border-2 border-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:cursor-pointer"
    : "h-[42px] w-[135px] text-brand-blue hover:cursor-pointer";

  const getLinkClass = (href: string) => {
    const baseStyle = `${centerNavStyle} p-0`;
    return pathname === href ? `${baseStyle} text-[var(--brand-blue)]` : baseStyle;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <nav className="container mx-auto flex h-[84px] items-center justify-between px-6 relative">
          {/* Left: Logo */}
          <Link href="/top" className="flex items-center space-x-3">
            <Image src="/agent-icon.svg" alt="Agent Hunt Logo" width={28} height={32} />
            <span className="text-2xl font-normal tracking-tighter hidden xl:inline">AgentHunt</span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden xl:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8">
            <Link href="/top" className={getLinkClass("/top")}>
              TOP
            </Link>
            <Button variant="ghost" className={`${centerNavStyle} ${huntButtonClass}`} onClick={handleHuntClick}>
              + HUNT
            </Button>
            <Link href="/new" className={getLinkClass("/new")}>
              NEW
            </Link>
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-10">
            <Button
              variant="link"
              className={`${navTextStyle} p-0 h-auto hover:bg-transparent hover:no-underline hover:cursor-pointer`}
              onClick={handleRulesClick}
            >
              RULES
            </Button>
            <ConnectButton />
          </div>

          {/* Mobile Menu Button & Connect Wallet */}
          <div className="xl:hidden flex items-center">
            <ConnectButton showBalance={false} chainStatus="none" label="CONNECT" accountStatus="avatar" />
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="ml-4">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white shadow-md absolute w-full">
            <div className="flex flex-col items-center space-y-4 p-4">
              <Link href="/top" className={getLinkClass("/top")} onClick={() => setMobileMenuOpen(false)}>
                TOP
              </Link>
              <Button variant="ghost" className={`${centerNavStyle} ${huntButtonClass}`} onClick={handleHuntClick}>
                + HUNT
              </Button>
              <Link href="/new" className={getLinkClass("/new")} onClick={() => setMobileMenuOpen(false)}>
                NEW
              </Link>
              <Button
                variant="link"
                className={`${navTextStyle} hover:bg-transparent hover:cursor-pointer`}
                onClick={handleRulesClick}
              >
                RULES
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={handleCloseNewAgentModal}
        onSuccess={handleNewAgentSuccess}
      />
      {shareXAgentData && (
        <ShareXModal isOpen={isShareXModalOpen} onClose={handleCloseShareXModal} agentData={shareXAgentData} />
      )}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setRulesModalOpen(false)} />
    </>
  );
};
