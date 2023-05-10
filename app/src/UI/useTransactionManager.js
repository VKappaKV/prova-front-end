import algosdk from "algosdk";
import { useWallet } from "@txnlab/use-wallet";
import crt from "../../../contract/artifacts/crt.json";
import { useWalletUI } from "@algoscan/use-wallet-ui";
import { useContext } from "react";
import { TxnContext } from "../components/Context/TxnContext";
import { CRI_ASA_ID, USDC_ASA_ID, APP_ID, CONTRACT_ADD } from "@/src/constants/utility";
const fs = require("fs");

//For Purestake
/* const algodToken = {
  "X-API-Key": "dUAm46iRb73HzsHBrEYGr1nVw81Yc0Kp5eiNmZDF",
};
const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";
 */
//For Algonode
const algodToken = "";
const algodServer = "https://testnet-api.algonode.cloud/";
const algodPort = "";

const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const contract = new algosdk.ABIContract(crt);


export default function useTransactionManager() {
  return 0;
}

export function useMyFunction() {
  const { setTxn } = useContext(TxnContext);
  const { activeAddress, signer, signTransactions, sendTransactions } =
    useWallet();

  const account_is_donor = async () => {
    const accountInfo = await client.accountInformation(activeAddress).do();
    console.log(`Raw local state - ${JSON.stringify(accountInfo)}`);
    const check_ASA_optIn = accountInfo.assets.some(
      (asset) => asset["asset-id"] === CRI_ASA_ID
    );
    const check_App_optIn = accountInfo["apps-local-state"].some(
      (app) => app.id === APP_ID
    );

    if (!check_ASA_optIn && !check_App_optIn) return [false, false, false];

    const accountInfoOfAppObj = await client
      .accountApplicationInformation(activeAddress, APP_ID)
      .do();
    const localState = accountInfoOfAppObj["app-local-state"]["key-value"][0];
    console.log(`Raw local state - ${JSON.stringify(accountInfoOfAppObj)}`);
    const localKey = Buffer.from(localState.key, "base64").toString();
    // get uint value directly
    const localValue = localState.value.uint;

    console.log(`Decoded local state - ${localKey}: ${localValue}`);
    const check_Local_State = localValue == 1 ? true : false;

    return [check_App_optIn, check_ASA_optIn, check_Local_State];
  };

  const set_account_as_donor = async () => {
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.flatFee = true;
    sp.fee = 1000;
    const commonParams = {
      APP_ID: APP_ID,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    const params_status = await account_is_donor();
    params_status.forEach((param, index) => {
      if (!param) {
        switch (index) {
          case 2:
            atc.addMethodCall({
              method: getMethodByName("set_donor_role", contract),
              methodArgs: [activeAddress, true],
              ...commonParams,
            });
            break;
          case 1:
            let txn_ASA = algosdk.makeAssetTransferTxnWithSuggestedParams(
              activeAddress,
              activeAddress,
              undefined,
              undefined,
              0,
              undefined,
              CRI_ASA_ID,
              sp
            );
            atc.addTransaction({ txn: txn_ASA, signer: signer });
            break;
          case 0:
            let txn_App = algosdk.makeApplicationOptInTxn(
              activeAddress,
              sp,
              APP_ID
            );
            atc.addTransaction({ txn: txn_App, signer: signer });
            break;
        }
      }
    });
    const result = await atc.execute(client, 2);
    if (result.confirmedRound) {
      setTxn(result);
    }
    for (const idx in result.methodResults) {
      console.log(result.methodResults[idx]);
    }
  };

  const donor_buy_token = async (amount) => {
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.fee = 3000;
    sp.flatFee = true;

    const commonParams = {
      APP_ID: APP_ID,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    const txn = {
      txn: algosdk.makeAssetTransferTxnWithSuggestedParams(
        activeAddress,
        CONTRACT_ADD,
        undefined,
        undefined,
        amount,
        undefined,
        USDC_ASA_ID,
        sp
      ),
      signer: signer,
    };
    console.log("amount da trasferire: ", amount);

    atc.addMethodCall({
      method: getMethodByName("donor_buy_token", contract),
      methodArgs: [txn, CRI_ASA_ID],
      ...commonParams,
    });

    const result = await atc.execute(client, 2);
    if (result.confirmedRound) {
      setTxn(result);
    }
    for (const idx in result.methodResults) {
      console.log(result.methodResults[idx]);
    }

    return result;
  };

  const pay_merchant = async (amount, merchAddr) => {
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.fee = 3000;
    sp.flatFee = true;

    const commonParams = {
      APP_ID: APP_ID,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    atc.addMethodCall({
      method: getMethodByName("pay_merchant", contract),
      methodArgs: [CRI_ASA_ID, USDC_ASA_ID, amount, activeAddress, merchAddr],
      ...commonParams,
    });

    const result = await atc.execute(client, 2);
    if (result.confirmedRound) {
      setTxn(result);
    }
  };

  const donation_to_cri = async (amount, cri_address) => {

    console.log("donate to cry called");

    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.fee = 3000;
    sp.flatFee = true;

    const commonParams = {
      APP_ID: APP_ID,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    console.log("stampa:" , cri_address , "_" , amount);
  
    atc.addMethodCall({
      method: getMethodByName("donation_transfer", contract),
      methodArgs: [CRI_ASA_ID, amount, activeAddress, cri_address],
      ...commonParams,
    });
  
    const result = await atc.execute(client, 2);
    if (result.confirmedRound) {
      setTxn(result);
    }
   
  }


  const get_asa_balance = async (asset_id) => {
    if (activeAddress) {
      const accountInfo = await client.accountInformation(activeAddress).do();
      const assetHolding = accountInfo.assets.find(
        (asset) => asset["asset-id"] === asset_id
      );
      const assetBalance = assetHolding ? assetHolding.amount : 0;
      return assetBalance;
    }
    return 0;
  };

  const opt_in_asa = async (asset_id) => {
    const params = await client.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      activeAddress,
      activeAddress,
      undefined,
      undefined,
      0,
      undefined,
      asset_id,
      params
    );

    const encodedTransaction = algosdk.encodeUnsignedTransaction(opttxn);
    const signedTransactions = await signTransactions([encodedTransaction]);

    const waitRoundsToConfirm = 4;

    const { id } = await sendTransactions(
      signedTransactions,
      waitRoundsToConfirm
    );

    console.log("Successfully sent transaction. Transaction ID: ", id);
  };

  const opt_in_app = async () => {
    const params = await client.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    let opttxn = algosdk.makeApplicationOptInTxn(activeAddress, params, APP_ID);

    const encodedTransaction = algosdk.encodeUnsignedTransaction(opttxn);
    const signedTransactions = await signTransactions([encodedTransaction]);

    const waitRoundsToConfirm = 4;

    const { id } = await sendTransactions(
      signedTransactions,
      waitRoundsToConfirm
    );

    console.log("Successfully sent transaction. Transaction ID: ", id);
  };

  return {
    donor_buy_token,
    pay_merchant,
    get_asa_balance,
    opt_in_asa,
    opt_in_app,
    account_is_donor,
    set_account_as_donor,
    donation_to_cri
  };
}

function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}
