import TopNavbar from "@/src/UI/Navbar";
import Head from "next/head";
import UserInfo from "@/src/UI/UserInfo";
import { useRouter } from "next/router";
import { useWallet } from "@txnlab/use-wallet";
import Tag from "@/src/UI/Tag";
import { useContext, useEffect, useState, useRef } from "react";
import { useMyFunction } from "@/src/contractManager/useTransactionManager";
import SliderWithButton from "@/src/UI/Slider";
import { TxnContext } from "@/src/components/Context/TxnContext";
import { CRI_ASA_ID, USDC_ASA_ID } from "@/src/constants/utility";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import cri_addresses from "@/src/constants/redcrossAddresses";

import type { NextPage } from "next";

const Donate: NextPage = () => {
  const txn = useContext(TxnContext);
  const { providers, activeAccount } = useWallet();
  const {
    donor_buy_token,
    get_asa_balance,
    account_is_donor,
    donation_to_cri,
  } = useMyFunction();
  const pera = providers?.at(0);
  let router = useRouter();
  const [asa_balance, set_asa_balance] = useState(0);
  const [accountIsDonor, setAccountIsDonor] = useState(false);
  const criAddress = useRef<HTMLInputElement>(null);

  async function fetchData() {
    let response = await get_asa_balance(CRI_ASA_ID);
    set_asa_balance(response);
  }

  const checkAllDonorParams = async () => {
    const params = await account_is_donor().catch((e) => {
      console.log("errore: ", e);
      return [false, false, false];
    });
    const checkParams = params[0] && params[1] && params[2];
    if (checkParams) {
      setAccountIsDonor(true);
    }
  };

  useEffect(() => {
    !!activeAccount && fetchData();
    !!activeAccount && checkAllDonorParams();
  }, [activeAccount, txn]);

  //Donation button
  interface BuyTokenProps {
    minValue: number;
    maxValue: number;
    handlerFunction: (value: number, address: string) => Promise<void>;
  }

  const BuyToken: React.FC<BuyTokenProps> = ({
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
        <UserInfo />
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
          <h1>Donation page</h1>
          {activeAccount && accountIsDonor ? (
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5vh",
                  flexWrap: "wrap",
                  marginTop: 50,
                }}
              ></div>

              <br></br>

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

                <BuyToken
                  minValue={0}
                  maxValue={asa_balance}
                  handlerFunction={donation_to_cri}
                />
              </Box>
            </div>
          ) : (
            <div>
              <h4>Connect wallet to begin</h4>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Donate;
