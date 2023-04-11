import { useEffect, useState } from "react";
import { useWalletUI } from "@algoscan/use-wallet-ui";
import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";

let assetId = 170690482;
let usdc_id = 67395862;

export default function UserInfo() {
  const { donor_buy_token, pay_merchant, get_asa_balance, opt_in } =
    useMyFunction();
  const { activeAddress } = useWalletUI();
  const [asa_balance, set_asa_balance] = useState(0);
  const [usdc_balance, set_usdc_balance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let response = await get_asa_balance(assetId);
      set_asa_balance(response);
      let response2 = await get_asa_balance(usdc_id);
      set_usdc_balance(response2);
    }

    !!activeAddress && fetchData();
  }, [activeAddress]);

  const donor_buy_token_call = () => {
    donor_buy_token(1).then(() => console.log("eseguito"));
  };

  const pay_merchant_call = () => {
    pay_merchant(
      1,
      "MSHIHS7AHBMSJOXN2HWJTANMUCWSRLAHGLJVHVXDACRFV4JBSJYV7G5ZKU"
    ).then(() => console.log("eseguito"));
  };

  const opt_in_call = (asa: number) => {
    opt_in(asa).then(() => console.log("eseguito"));
  };

  return (
    <>
      <p>My address: {activeAddress}</p>
      <p>Smart Asa Balance: {asa_balance}</p>
      <p>USDC Balance: {usdc_balance}</p>

      <Button variant="contained" onClick={donor_buy_token_call}>
        {" Donor buy token"}
      </Button>
      <Button variant="contained" onClick={pay_merchant_call}>
        {" Pay Merchant"}
      </Button>
      <Button variant="contained" onClick={opt_in_call.bind(null, usdc_id)}>
        {" OptIn USDC"}
      </Button>
      <Button variant="contained" onClick={opt_in_call.bind(null, assetId)}>
        {" OptIn Smart ASA"}
      </Button>
    </>
  );
}
