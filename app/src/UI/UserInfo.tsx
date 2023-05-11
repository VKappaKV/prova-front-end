import { useEffect, useState, useContext } from "react";
import { useWalletUI } from "@algoscan/use-wallet-ui";
import { useWallet } from "@txnlab/use-wallet";
import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";
import { TxnContext } from "../components/Context/TxnContext";
import { CRI_ASA_ID, USDC_ASA_ID } from "@/src/constants/utility";

export default function UserInfo() {
  const txn = useContext(TxnContext);
  const {
    donor_buy_token,
    pay_merchant,
    get_asa_balance,
    opt_in_asa,
    opt_in_app,
  } = useMyFunction();
  const { activeAccount } = useWallet();
  const [asa_balance, set_asa_balance] = useState(0);
  const [usdc_balance, set_usdc_balance] = useState(0);

  async function fetchData() {
    let response = await get_asa_balance(CRI_ASA_ID);
    set_asa_balance(response);
    let response2 = await get_asa_balance(USDC_ASA_ID);
    set_usdc_balance(response2);
  }

  useEffect(() => {
    !!activeAccount && fetchData();
  }, [activeAccount, asa_balance, usdc_balance, txn]);

  const donor_buy_token_call = () => {
    donor_buy_token(1)
      .then(() => console.log("eseguito"))
      .then(() => fetchData());
  };

  const pay_merchant_call = () => {
    pay_merchant(
      1,
      "MSHIHS7AHBMSJOXN2HWJTANMUCWSRLAHGLJVHVXDACRFV4JBSJYV7G5ZKU"
    )
      .then(() => console.log("eseguito"))
      .then(() => fetchData());
  };

  const opt_in_call = (asa: number) => {
    opt_in_asa(asa)
      .then(() => console.log("eseguito"))
      .then(() => fetchData());
  };

  const opt_in_app_call = () => {
    opt_in_app()
      .then(() => console.log("eseguito"))
      .then(() => fetchData());
  };

  return (
    <>
      <p>My address: {activeAccount?.address}</p>
      <p>Smart Asa Balance: {activeAccount ? asa_balance / 1000000 : null}</p>
      <p>USDC Balance: {activeAccount ? usdc_balance / 1000000 : null}</p>
    </>
  );
}
