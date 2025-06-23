"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { NewAgentModal } from "./NewAgentModal";
import { ShareXModal } from "./ShareXModal";
import { Menu } from "lucide-react";
import type { Agent } from "@prisma/client";

export const AppBar: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isShareXModalOpen, setShareXModalOpen] = useState(false);
  const [shareXAgentData, setShareXAgentData] = useState<
    | (Pick<Agent, "id" | "name" | "xAccount" | "description" | "whyHunt" | "skill"> & {
        agentHandle?: string;
      })
    | null
  >(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  const handleHuntClick = () => {
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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

  const navTextStyle = "font-bold text-xl tracking-tighter";
  const centerNavStyle = `text-2xl ${navTextStyle} hover:bg-transparent hover:cursor-pointer`;

  const huntButtonClass = isModalOpen
    ? "h-[42px] w-[135px] rounded-[5px] bg-[var(--brand-blue)] text-white border-2 border-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:cursor-pointer"
    : "h-[42px] w-[135px] text-brand-blue hover:cursor-pointer";

  const getLinkClass = (href: string) => {
    const baseStyle = `${centerNavStyle} p-0`;
    // Highlight if the current path matches the link's href
    if (pathname === href) {
      return `${baseStyle} text-[var(--brand-blue)]`;
    }
    return baseStyle;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <nav className="container mx-auto flex h-[84px] items-center justify-between px-6">
          {/* Left: Logo */}
          <Link href="/top" className="flex items-center space-x-3">
            <Image src="/agent-icon.svg" alt="Agent Hunt Logo" width={31} height={35} />
            <span className="text-3xl font-normal tracking-tighter hidden md:inline">AgentHunt</span>
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
            >
              RULES
            </Button>
            <div className={navTextStyle}>
              <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;
                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className={`${navTextStyle} hover:cursor-pointer hover:bg-transparent`}
                            >
                              CONNECT WALLET
                            </button>
                          );
                        }
                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className={`${navTextStyle} text-red-500 hover:cursor-pointer hover:bg-transparent`}
                            >
                              WRONG NETWORK
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className={`${navTextStyle} hover:cursor-pointer hover:bg-transparent`}
                          >
                            {account.displayName}
                          </button>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>

          {/* Mobile Menu Button & Connect Wallet */}
          <div className="md:hidden flex items-center space-x-4">
            <div className={navTextStyle}>
              <ConnectButton showBalance={false} chainStatus="none" label="CONNECT" accountStatus="avatar" />
            </div>
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
                onClick={() => setMobileMenuOpen(false)}
              >
                RULES
              </Button>
            </div>
          </div>
        )}
      </header>
      {/* Dummy comment */}

      <NewAgentModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleNewAgentSuccess} />
      {shareXAgentData && (
        <ShareXModal isOpen={isShareXModalOpen} onClose={handleCloseShareXModal} agentData={shareXAgentData} />
      )}
    </>
  );
};
