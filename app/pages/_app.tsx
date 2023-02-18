import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import {
  reconnectProviders,
  initializeProviders,
  WalletProvider,
} from "@txnlab/use-wallet";
import { WalletUIProvider } from "@algoscan/use-wallet-ui";
import { SSRProvider } from "react-bootstrap";

const walletProviders = initializeProviders();

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    reconnectProviders(walletProviders);
  }, []);
  return (
    <SSRProvider>
      <WalletUIProvider providers={["pera", "myalgo", "defly"]}>
        <Component {...pageProps} />
      </WalletUIProvider>
    </SSRProvider>
  );
}
