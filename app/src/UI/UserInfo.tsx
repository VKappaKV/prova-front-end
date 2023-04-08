import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";

export default function UserInfo() {
  const { donor_buy_token, pay_merchant } = useMyFunction();

  const donor_buy_token_call = () => {
    donor_buy_token(1).then(() => console.log("eseguito"));
  };

  const pay_merchant_call = () => {
    pay_merchant(
      1,
      "MSHIHS7AHBMSJOXN2HWJTANMUCWSRLAHGLJVHVXDACRFV4JBSJYV7G5ZKU"
    ).then(() => console.log("eseguito"));
  };

  return (
    <>
      <Button variant="contained" onClick={donor_buy_token_call}>
        {" Donor buy token"}
      </Button>
      <Button variant="contained" onClick={pay_merchant_call}>
        {" Pay Merchant"}
      </Button>
    </>
  );
}
