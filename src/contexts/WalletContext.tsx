import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProvider, getSigner, requestAccounts, getContract, toChecksumAddress } from '../lib/web3';

interface WalletContextType {
  account: string | null;
  provider: any | null;
  signer: any | null;
  connect: () => Promise<void>;
  contract: any | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);

  const contract = useMemo(() => (signer ? getContract(signer) : null), [signer]);

  const connect = async () => {
    const p = getProvider();
    await requestAccounts(p);
    const s = getSigner(p);
    const addr = toChecksumAddress(await s.getAddress());
    setProvider(p);
    setSigner(s);
    setAccount(addr);
  };

  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts?.length > 0) setAccount(toChecksumAddress(accounts[0]));
        else setAccount(null);
      });
    }
  }, []);

  const value: WalletContextType = { account, provider, signer, connect, contract };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};


