import algosdk from "algosdk";
import { useWallet } from "@txnlab/use-wallet";
import crt from "../../../contract/artifacts/crt.json";
import { useWalletUI } from "@algoscan/use-wallet-ui";
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

// Da compilare dopo step doDeploy
let smartContractAddress =
  "NC6BZAISGFL2OXU6FSN7MQH6KOCAKOWUTVLJ32ANJSOKHZTZ6QNBMFP2MU";
let appId = 170690461;
let assetId = 170690482;
let usdc_id = 67395862;

export default function useTransactionManager() {
  return 0;
}

export function useMyFunction() {
  const { activeAddress, signer, signTransactions, sendTransactions } =
    useWallet();

  const account_is_donor = async () => {
    const accountInfo = await client.accountInformation(activeAddress).do();
    console.log(`Raw local state - ${JSON.stringify(accountInfo)}`);
    const check_ASA_optIn = accountInfo.assets.some(
      (asset) => asset["asset-id"] === assetId
    );
    const check_App_optIn = accountInfo["apps-local-state"].some(
      (app) => app.id === appId
    );

    if (!check_ASA_optIn && !check_App_optIn) return [false, false, false];

    const accountInfoOfAppObj = await client
      .accountApplicationInformation(activeAddress, appId)
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
      appID: appId,
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
              assetId,
              sp
            );
            atc.addTransaction({ txn: txn_ASA, signer: signer });
            break;
          case 0:
            let txn_App = algosdk.makeApplicationOptInTxn(
              activeAddress,
              sp,
              appId
            );
            atc.addTransaction({ txn: txn_App, signer: signer });
            break;
        }
      }
    });
    const result = await atc.execute(client, 2);
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
      appID: appId,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    const txn = {
      txn: algosdk.makeAssetTransferTxnWithSuggestedParams(
        activeAddress,
        smartContractAddress,
        undefined,
        undefined,
        amount,
        undefined,
        usdc_id,
        sp
      ),
      signer: signer,
    };
    console.log("amount da trasferire: ", amount);

    atc.addMethodCall({
      method: getMethodByName("donor_buy_token", contract),
      methodArgs: [txn, assetId],
      ...commonParams,
    });

    const result = await atc.execute(client, 2);
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
      appID: appId,
      sender: activeAddress,
      suggestedParams: sp,
      signer: signer,
    };

    atc.addMethodCall({
      method: getMethodByName("pay_merchant", contract),
      methodArgs: [assetId, usdc_id, amount, activeAddress, merchAddr],
      ...commonParams,
    });

    const result = await atc.execute(client, 2);
    for (const idx in result.methodResults) {
      console.log(result.methodResults[idx]);
    }
  };

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

    let opttxn = algosdk.makeApplicationOptInTxn(activeAddress, params, appId);

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
  };
}

function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}
