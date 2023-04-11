import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { WalletUIProvider } from "@algoscan/use-wallet-ui";
import { SSRProvider } from "react-bootstrap";
import { useEffect } from "react";

import {
  reconnectProviders,
  initializeProviders,
  WalletProvider,
  PROVIDER_ID,
} from "@txnlab/use-wallet";

const walletProviders = initializeProviders([PROVIDER_ID.PERA], {
  network: "testnet",
  nodeServer: "https://testnet-api.algonode.cloud",
  nodeToken: "",
  nodePort: "",
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    reconnectProviders(walletProviders);
  }, []);
  return (
    <SSRProvider>
      <WalletProvider value={walletProviders}>
        <Component {...pageProps} />
      </WalletProvider>
    </SSRProvider>
  );
}
