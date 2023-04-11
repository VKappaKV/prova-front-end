import { useWalletUI } from "@algoscan/use-wallet-ui";
import algosdk from "algosdk";
import crt from '../../../contract/artifacts/crt.json';
const fs = require("fs");

//For Purestake
const algodToken = {
  'X-API-Key': "dUAm46iRb73HzsHBrEYGr1nVw81Yc0Kp5eiNmZDF"
}
const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
const algodPort = '';

const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const contract = new algosdk.ABIContract(crt);

// Da compilare dopo step doDeploy
let smartContractAddress = "NC6BZAISGFL2OXU6FSN7MQH6KOCAKOWUTVLJ32ANJSOKHZTZ6QNBMFP2MU"; 
let appId = 170690461;
let assetId = 170690482; 
let usdc_id = 67395862;

import { useCallback } from "react";

export default function useTransactionManager(){
  return 0;
}

export function useMyFunction(){

  const { activeAddress, signer } = useWalletUI();

  const donor_buy_token = async (amount) => {
    
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.fee = 10;

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
        undefined, undefined,
        amount, undefined, usdc_id, sp),
        signer: signer
      };
     
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


  const pay_merchant = async(amount, merchAddr) => {
    
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();
    sp.fee = 10;

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

    if(activeAddress){
      const accountInfo = await client.accountInformation(activeAddress).do();
      const assetHolding = accountInfo.assets.find(asset => asset['asset-id'] === asset_id);
      const assetBalance = assetHolding.amount;
      return assetBalance;
    }
    return 0;
  }




  return { donor_buy_token, pay_merchant, get_asa_balance };

}


function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}


