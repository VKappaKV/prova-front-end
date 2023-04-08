import { useMyFunction } from "./useTransactionManager";
import Button from "@mui/material/Button";

export default function UserInfo() {
  const { donor_buy_token } = useMyFunction();

  const myCall = () => {
    donor_buy_token(1).then(() => console.log("eseguito"));
  };

  return (
    <>
      <Button variant="contained" onClick={myCall}>
        {" Submit Transaction"}
      </Button>
    </>
  );
}
