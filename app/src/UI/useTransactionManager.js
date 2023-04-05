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

const jsonPath = "crt.json";

// Da compilare dopo step doDeploy
let smartContractAddress = "NC6BZAISGFL2OXU6FSN7MQH6KOCAKOWUTVLJ32ANJSOKHZTZ6QNBMFP2MU"; 
let appId = 170690461;
let assetId = 170690482; 
let usdc_id = 67395862;

import { useCallback } from "react";
import internal from "stream";

export default function useTransactionManager(){
  return 0;
}

export function useMyFunction(){

  const { activeAddress, signTransactions, signer } = useWalletUI();

  const getAddress = useCallback(async() => {
    
    const atc = new algosdk.AtomicTransactionComposer();
    const sp = await client.getTransactionParams().do();

    sp.fee = 10;

   //SyntaxError: "[object Object]" is not valid JSON
    const contract = new algosdk.ABIContract(crt);
  
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
        1, undefined, usdc_id, sp),
        signer: signer
      };
   
    /*const encodedTransaction = algosdk.encodeUnsignedTransaction(txn)
    const signedTransactions = await signTransactions([encodedTransaction])*/
  
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
  
  });

  return getAddress;

}


function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}


