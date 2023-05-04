import { useEffect, useState, useContext } from "react";
import { useWalletUI } from "@algoscan/use-wallet-ui";
import { useWallet } from "@txnlab/use-wallet";
import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";
import { TxnContext } from "../components/Context/TxnContext";

let assetId = 203022506;
let usdc_id = 67395862;

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
    let response = await get_asa_balance(assetId);
    set_asa_balance(response);
    let response2 = await get_asa_balance(usdc_id);
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

      <Button variant="contained" onClick={donor_buy_token_call}>
        {" Donor buy token"}
      </Button>
      {/* <Button variant="contained" onClick={pay_merchant_call}>
        {" Pay Merchant"}
      </Button>
      <Button variant="contained" onClick={opt_in_call.bind(null, usdc_id)}>
        {" OptIn USDC"}
      </Button>
      <Button variant="contained" onClick={opt_in_call.bind(null, assetId)}>
        {" OptIn Smart ASA"}
      </Button>
      <Button variant="contained" onClick={opt_in_app_call}>
        {" OptIn App"}
      </Button> */}
    </>
  );
}
