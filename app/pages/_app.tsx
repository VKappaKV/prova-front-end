import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { WalletUIProvider } from "@algoscan/use-wallet-ui";
import { SSRProvider } from "react-bootstrap";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <WalletUIProvider providers={["pera", "defly"]}>
        <Component {...pageProps} />
      </WalletUIProvider>
    </SSRProvider>
  );
}
