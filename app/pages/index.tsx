import TopNavbar from "@/src/UI/Navbar";
import Head from "next/head";
import UserInfo from "@/src/UI/UserInfo";
import { useRouter } from "next/router";
import { useWallet } from "@txnlab/use-wallet";
import Tag from "@/src/UI/Tag";
import { useContext, useEffect, useState, useRef } from "react";
import { useMyFunction } from "@/src/UI/useTransactionManager";
import SliderWithButton from "@/src/UI/Slider";
import { TxnContext } from "@/src/components/Context/TxnContext";
import { CRI_ASA_ID, USDC_ASA_ID } from "@/src/constants/utility";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const txn = useContext(TxnContext);
  const { providers, activeAccount } = useWallet();
  const {
    donor_buy_token,
    get_asa_balance,
    opt_in_asa,
    opt_in_app,
    set_account_as_donor,
    account_is_donor,
    donation_to_cri,
  } = useMyFunction();
  const pera = providers?.at(0);
  let router = useRouter();
  const [asa_balance, set_asa_balance] = useState(0);
  const [usdc_balance, set_usdc_balance] = useState(0);
  const [accountHasUSDC, setAccountHasUSDC] = useState(false);
  const [accountIsDonor, setAccountIsDonor] = useState(false);

  const criAddress = useRef<HTMLInputElement>(null);

  const cri_addresses = [
    {
      address: "TBB76BCKOQUEZ2INFYIKCWI7UQYPJ33Y4TMVMAYPURPLAGIBFKCHVBC5L4",
    },
    {
      address: "test2",
    },
    {
      address: "test3",
    },
  ];

  function openLinkInNewTab(url: string) {
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }

  async function fetchData() {
    let response = await get_asa_balance(CRI_ASA_ID);
    set_asa_balance(response);
    let response2 = await get_asa_balance(USDC_ASA_ID);
    set_usdc_balance(response2);
    if (usdc_balance > 0.1) {
      setAccountHasUSDC(true && !!activeAccount);
    }
  }

  const checkAllDonorParams = async () => {
    const params = await account_is_donor().catch((e) => {
      console.log("errore: ", e);
      return [false, false, false];
    }); // Params[0]: App opt-in ; Params[1]: ASA opt-in; Params[2]: Local State "donor_role"
    const checkParams = params[0] && params[1] && params[2];
    if (checkParams) {
      setAccountIsDonor(true);
    }
  };

  useEffect(() => {
    !!activeAccount && fetchData();
    !!activeAccount && checkAllDonorParams();
  }, [activeAccount, asa_balance, usdc_balance, txn]);

  //Donation button
  interface DonateTokenProps {
    minValue: number;
    maxValue: number;
    handlerFunction: (value: number, address: string) => Promise<void>;
  }

  const DonateToken: React.FC<DonateTokenProps> = ({
    minValue,
    maxValue,
    handlerFunction,
  }) => {
    const handleSliderButtonClick = (value: number) => {
      console.log("cliccato il button");
      if (value >= 0 && !!criAddress?.current?.value) {
        handlerFunction(value * 1_000_000, criAddress.current.value)
          .then(() => alert("Benissimo"))
          .catch((e) => {
            alert("Errore: " + e);
          });
      } else {
        alert(
          "erroraccio seleziona un cri address o fai qualcosa che qua non si va avanti !"
        );
      }
    };

    return (
      <div>
        <SliderWithButton
          handlerFunction={handleSliderButtonClick}
          minValue={minValue}
          maxValue={maxValue / 1_000_000}
          buttonText="Donate CRI"
        />
      </div>
    );
  };

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
              onClick={() => {
                openLinkInNewTab("https://testnet.folks.finance/faucet");
              }}
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
            <div>
              <BuyToken
                minValue={0}
                maxValue={usdc_balance}
                handlerFunction={donor_buy_token}
              />

              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1, width: "80vw" },
                }}
                noValidate
                autoComplete="off"
              >
                <div>
                  <TextField
                    id="outlined-select-address"
                    select
                    label="Select"
                    defaultValue=""
                    helperText="Please select a CRI address"
                    inputRef={criAddress}
                  >
                    {cri_addresses.map((option) => (
                      <MenuItem key={option.address} value={option.address}>
                        {option.address}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <DonateToken
                  minValue={0}
                  maxValue={asa_balance}
                  handlerFunction={donation_to_cri}
                />
              </Box>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
};

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
    handlerFunction(value * 1_000_000);
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

export default Home;
