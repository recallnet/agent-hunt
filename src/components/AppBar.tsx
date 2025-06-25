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
import type { Agent } from "@prisma/client";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

export const AppBar: React.FC = () => {
  const [isNewAgentModalOpen, setNewAgentModalOpen] = useState(false);
  const [isShareXModalOpen, setShareXModalOpen] = useState(false);
  const [isRulesModalOpen, setRulesModalOpen] = useState(false); // State for the Rules modal
  const [shareXAgentData, setShareXAgentData] = useState<
    | (Pick<Agent, "id" | "name" | "xAccount" | "description" | "whyHunt" | "skill"> & {
        agentHandle?: string;
      })
    | null
  >(null);
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
    setMobileMenuOpen(false); // Also close the mobile menu if open
  };

  const handleCloseNewAgentModal = () => {
    setNewAgentModalOpen(false);
  };

  const handleNewAgentSuccess = (
    agentData: Pick<Agent, "id" | "name" | "xAccount" | "description" | "whyHunt" | "skill"> & {
      agentHandle?: string;
    }
  ) => {
    setShareXAgentData(agentData);
    setShareXModalOpen(true);
  };

  const handleCloseShareXModal = () => {
    setShareXModalOpen(false);
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
        <nav className="container mx-auto flex h-[84px] items-center justify-between px-6">
          {/* Left: Logo */}
          <Link href="/top" className="flex items-center space-x-3">
            <Image src="/agent-icon.svg" alt="Agent Hunt Logo" width={28} height={32} />
            <span className="text-2xl font-normal tracking-tighter hidden md:inline">AgentHunt</span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="hidden md:flex items-center space-x-10">
            <Button
              variant="link"
              className={`${navTextStyle} p-0 h-auto hover:bg-transparent hover:no-underline hover:cursor-pointer`}
              onClick={handleRulesClick} // Updated onClick handler
            >
              RULES
            </Button>
            <ConnectButton />
          </div>

          {/* Mobile Menu Button & Connect Wallet */}
          <div className="md:hidden flex items-center space-x-4">
            <ConnectButton showBalance={false} chainStatus="none" label="CONNECT" accountStatus="avatar" />
            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md absolute w-full">
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
