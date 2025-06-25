import React from "react";
import Image from "next/image";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

const MAX_DISPLAY_COUNT = 16; // 4 columns * 4 rows

type UpvoterItemProps = {
  address: `0x${string}`;
};

/**
 * An internal component that renders a single item in the upvoter grid.
 * It handles the ENS lookup for an individual address.
 * Hooks like `useEnsName` must be called from a component, so we create this
 * small component to use inside our .map() loop.
 */
const UpvoterItem: React.FC<UpvoterItemProps> = ({ address }) => {
  const { data: ensName, isLoading } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const truncateAddress = (addr: string): string => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const displayName = isLoading || !ensName ? truncateAddress(address) : ensName;
  const textClass = isLoading || !ensName ? "text-sm text-gray-600 font-mono" : "text-sm text-gray-700 font-semibold";

  return (
    <div className="flex items-center gap-2" title={address}>
      <Image src="/circle-icon.svg" alt="Upvoter icon" width={24} height={24} />
      <span className={textClass}>{displayName}</span>
    </div>
  );
};

// --- Main List Component ---

type UpvoterListProps = {
  upvoters: string[];
};

export const UpvoterList: React.FC<UpvoterListProps> = ({ upvoters }) => {
  // If there are no upvoters, render nothing.
  if (!upvoters || upvoters.length === 0) {
    return null;
  }

  const displayedUpvoters = upvoters.slice(0, MAX_DISPLAY_COUNT);
  const remainingCount = upvoters.length - displayedUpvoters.length;

  return (
    <>
      <hr className="my-8 border-gray-200" />
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upvoted By</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {displayedUpvoters.map((address) => (
            <UpvoterItem key={address} address={address as `0x${string}`} />
          ))}
        </div>
        {remainingCount > 0 && <p className="text-sm text-gray-500 mt-4">+ {remainingCount} others</p>}
      </div>
    </>
  );
};
