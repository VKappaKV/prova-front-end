import React, { useState, createContext } from "react";

type Txn = {
  result: string;
};

type TxnContextType = {
  txn: Txn;
  setTxn: React.Dispatch<React.SetStateAction<Txn>>;
};

const TxnContext = createContext<TxnContextType | null>(null);

type TxnProviderProps = {
  children: React.ReactNode;
};

const TxnProvider: React.FC<TxnProviderProps> = ({ children }) => {
  const [txn, setTxn] = useState<Txn>({ result: "" });

  return (
    <TxnContext.Provider value={{ txn, setTxn }}>
      {children}
    </TxnContext.Provider>
  );
};
export { TxnContext, TxnProvider };
