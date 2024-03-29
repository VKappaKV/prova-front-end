import React from "react";
import { useWallet } from "@txnlab/use-wallet";

export default function Account() {
  const { activeAccount } = useWallet();

  if (!activeAccount) {
    return <p>No account active.</p>;
  }

  return (
    <div>
      <h4>Active Account</h4>
      <p>
        Name: <span>{activeAccount.name}</span>
      </p>
      <p>
        Address: <span>{activeAccount.address}</span>
      </p>
      <p>
        Provider: <span>{activeAccount.providerId}</span>
      </p>
    </div>
  );
}
