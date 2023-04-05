import { useEffect, useState } from "react";
import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";

export default function UserInfo() {
  /*const { activeAddress, signTransactions } = useWalletUI();*/

  const getAddress = useMyFunction();

  const myCall = () => {
    getAddress().then(() => console.log("eseguito"));
  };

  return (
    <>
      <Button variant="contained" onClick={myCall}>
        {" Submit Transaction"}
      </Button>
    </>
  );
}
