import TopNavbar from "@/src/UI/Navbar";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import UserInfo from "@/src/UI/UserInfo";
import { useRouter } from "next/router";
import { useWallet } from "@txnlab/use-wallet";
import Tag from "@/src/UI/Tag";
import { useEffect, useState } from "react";
import { useMyFunction } from "@/src/UI/useTransactionManager";
import SliderWithButton from "@/src/UI/Slider";

let assetId = 170690482;
let usdc_id = 67395862;

export default function Home() {
  const { providers, activeAccount } = useWallet();
  const {
    donor_buy_token,
    get_asa_balance,
    opt_in_asa,
    opt_in_app,
    set_account_as_donor,
    account_is_donor,
  } = useMyFunction();
  const pera = providers?.at(0);
  let router = useRouter();
  const [asa_balance, set_asa_balance] = useState(0);
  const [usdc_balance, set_usdc_balance] = useState(0);
  const [accountHasUSDC, setAccountHasUSDC] = useState(false);
  const [accountIsDonor, setAccountIsDonor] = useState(false);

  function openLinkInNewTab(url: string) {
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }

  async function fetchData() {
    let response = await get_asa_balance(assetId);
    set_asa_balance(response);
    let response2 = await get_asa_balance(usdc_id);
    set_usdc_balance(response2);
    if (usdc_balance > 0.1) {
      setAccountHasUSDC(true && !!activeAccount);
    }
  }

  const checkAllDonorParams = async () => {
    const Params = await account_is_donor().catch((e) => {
      console.log("errore: ", e);
      return [false, false, false];
    }); // Params[0]: Local State "donor_role"; Params[1]: ASA opt-in; Params[2]: App opt-in
    const checkParams = Params[0] && Params[1] && Params[2];
    if (checkParams) {
      setAccountIsDonor(true);
    }
  };

  useEffect(() => {
    !!activeAccount && fetchData();
    !!activeAccount && checkAllDonorParams();
  }, [activeAccount, asa_balance, usdc_balance]);

  return (
    <>
      <Head>
        <title>Helpy</title>
        <link rel="icon" href="/Crocerossa.png" />
        <style />
      </Head>
      <main>
        <TopNavbar />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            gap: "3vh",
          }}
        >
          <h1>WELCOME ON HELPY </h1>
          {activeAccount ? (
            <div>
              <h6>welcome: {activeAccount?.name}</h6>
              <UserInfo />
            </div>
          ) : (
            <div>
              <h4>Connect wallet to begin</h4>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5vh",
              flexWrap: "wrap",
            }}
          >
            <Tag
              condition={!!activeAccount}
              valueToShow="1. Connect Wallet"
              onClick={pera?.connect}
              disabled={!!activeAccount}
            />
            <Tag
              condition={accountHasUSDC && !!activeAccount}
              valueToShow="2. Load up USDC"
              onClick={() =>
                openLinkInNewTab("https://testnet.folks.finance/faucet")
              }
              disabled={false}
            />
            <Tag
              condition={accountIsDonor && !!activeAccount}
              valueToShow="3. Become donor"
              disabled={accountIsDonor}
              onClick={set_account_as_donor}
            />
          </div>
          {!!activeAccount && accountIsDonor ? (
            <BuyToken
              minValue={0}
              maxValue={usdc_balance}
              handlerFunction={donor_buy_token}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}

interface BuyTokenProps {
  minValue: number;
  maxValue: number;
  handlerFunction: (value: number) => void;
}

const BuyToken: React.FC<BuyTokenProps> = ({
  minValue,
  maxValue,
  handlerFunction,
}) => {
  const handleSliderButtonClick = (value: number) => {
    handlerFunction(value);
  };

  return (
    <div>
      <SliderWithButton
        handlerFunction={handleSliderButtonClick}
        minValue={minValue}
        maxValue={maxValue / 1_000_000}
        buttonText="BUY CRI TOKEN"
      />
    </div>
  );
};
