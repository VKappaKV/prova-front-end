// Import
const { Transaction } = require("algosdk");
const algosdk = require("algosdk");
const fs = require("fs");

// Create client object to connect to sandbox's algod client
/*
For Sanbbox
const algodToken = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "http://localhost";
const algodPort = 4001;*/

//For Purestake
const algodToken = {
  "X-API-Key": "dUAm46iRb73HzsHBrEYGr1nVw81Yc0Kp5eiNmZDF",
};
const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
const algodPort = "";

const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const jsonPath = "contract/artifacts/crt.json";
const approvalPath = "contract/artifacts/crt_approval.teal";
const clearStatePath = "contract/artifacts/crt_clearstate.teal";

// The accounts below should be generated with the createAccount() function

// Creator account
const mnenonic =
  "cheese enter impact deliver media side youth skill easy school renew spice detect apple blouse focus undo knee okay liquid robust invite twice absent shield";
const account = algosdk.mnemonicToSecretKey(mnenonic);
const accAdd = "2WKBPFJNWGMOENUBNWD7JY2CXE2RAVSL5EI6NULZZWTZ5FH5TWETB5EPPQ";

// Merchant account:
const merchMnemonic =
  "trumpet canal siege hip what adjust silk clarify foot siege limb clinic dismiss leopard region resemble solution owner nurse confirm video eyebrow small abandon online";
const merchAccount = algosdk.mnemonicToSecretKey(merchMnemonic);
const merchAddr = "MSHIHS7AHBMSJOXN2HWJTANMUCWSRLAHGLJVHVXDACRFV4JBSJYV7G5ZKU";

// CRI account:
const CriMnemonic =
  "strike two seven agent rifle paddle direct hurdle control trigger bacon proud ugly inflict enforce tent giggle journey arrive business color coyote chase above solid";
const CriAccount = algosdk.mnemonicToSecretKey(CriMnemonic);
const CriAddr = "TBB76BCKOQUEZ2INFYIKCWI7UQYPJ33Y4TMVMAYPURPLAGIBFKCHVBC5L4";

// Utility variables
let usdc_id = 67395862;

// Da compilare dopo step doDeploy
let smartContractAddress =
  "NC6BZAISGFL2OXU6FSN7MQH6KOCAKOWUTVLJ32ANJSOKHZTZ6QNBMFP2MU";
let appId = 170690461;

// Da compilare dopo step doStartingTasks
let assetId = 170690482;

// Steps:
let doDeploy = false; //deploy
let updateContract = false; //update

let doStartingTasks = false; // fund the contract and asset creation
let doContractUsdcOptIn = false;
let doOptInAndAssignRole = false; // creator opt-in into app and ASA
let buyToken = false; //creator buy smart ASA using ALGO
let payMerchant_ = false; // Creator pay a merchant using smart ASA
let donor_transfer = false; // Transfer from creator to CRI

main();
assign_donor_role();

async function main() {
  console.log("start");

  if (doDeploy) {
    appId = await deploy();

    console.log("App created with appId: " + appId);
    smartContractAddress = algosdk.getApplicationAddress(appId);
    console.log("Application address: " + smartContractAddress);
  }

  if (updateContract) {
    await update_contract();
    console.log("Update done!");
  }

  if (doStartingTasks) {
    // Transfer Algo to SC account
    await algoTranfer(account, smartContractAddress, 1000000); //1 ALGO

    // Smart Asa creation
    assetId = await assetCreateMethod();
    //console.log("Smart ASA crated with ID: " + assetId.toString());
  }

  if (doOptInAndAssignRole) {
    // Opt-in
    await assetOptIn(account, assetId);
    await appOptIn(account, appId);
    console.log("User optins done");

    await assetOptIn(merchAccount, assetId);
    await appOptIn(merchAccount, appId);
    console.log("Merchant optins done");

    await assetOptIn(CriAccount, assetId);
    await appOptIn(CriAccount, appId);
    console.log("CRI optins done");

    // Assign roles

    await assign_donor_role();
    console.log("Donor role assigned");
    await assign_merch_role();
    console.log("Merchant role assigned");
    await assign_redcross_role();
    console.log("RCI role assigned");
  }

  if (doContractUsdcOptIn) {
    await contract_opt_in_usdc();
  }

  if (buyToken) {
    await donor_buy_token();
  }

  if (payMerchant_) {
    await pay_merchant();
  }

  if (donor_transfer) {
    await donor_transfer_asa();
  }

  console.log("END");
}

async function deploy() {
  // get node suggested parameters
  let params = await client.getTransactionParams().do();

  // declare onComplete as NoOp
  onComplete = algosdk.OnApplicationComplete.NoOpOC;

  const approvalProgram = fs.readFileSync(approvalPath).toString();
  const clearStateProgram = fs.readFileSync(clearStatePath).toString();

  const compiledApprovalProgram = await client.compile(approvalProgram).do();
  const compiledClearState = await client.compile(clearStateProgram).do();

  const codificatoApproval = new Uint8Array(
    Buffer.from(compiledApprovalProgram.result, "base64")
  );
  const codificatoClear = new Uint8Array(
    Buffer.from(compiledClearState.result, "base64")
  );

  // create unsigned transaction
  let txn = algosdk.makeApplicationCreateTxn(
    account.addr,
    params,
    onComplete,
    codificatoApproval,
    codificatoClear,
    4,
    0,
    5,
    7,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1
  );
  let txId = txn.txID().toString();

  // Sign the transaction
  let signedTxn = txn.signTxn(account.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  // Wait for transaction to be confirmed
  confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // display results
  let transactionResponse = await client
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["application-index"];

  return appId;
}

async function update_contract() {
  // get node suggested parameters
  let params = await client.getTransactionParams().do();

  const approvalProgram = fs.readFileSync(approvalPath).toString();
  const clearStateProgram = fs.readFileSync(clearStatePath).toString();

  const compiledApprovalProgram = await client.compile(approvalProgram).do();
  const compiledClearState = await client.compile(clearStateProgram).do();

  const codificatoApproval = new Uint8Array(
    Buffer.from(compiledApprovalProgram.result, "base64")
  );
  const codificatoClear = new Uint8Array(
    Buffer.from(compiledClearState.result, "base64")
  );

  let appUpdateTxn = algosdk.makeApplicationUpdateTxnFromObject({
    from: accAdd,
    suggestedParams: params,
    appIndex: appId,
    approvalProgram: codificatoApproval,
    clearProgram: codificatoClear,
  });

  let txId = appUpdateTxn.txID().toString();

  // Sign the transaction
  let signedTxn = appUpdateTxn.signTxn(account.sk);
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  // Wait for transaction to be confirmed
  confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
}

async function assetCreateMethod() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  // Read in the local contract.json file
  const buff = fs.readFileSync(jsonPath);

  // Parse the json file into an object, pass it to create an ABIContract object
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId, //contract.networks[genesis_hash].appID,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("asset_create", contract),
    methodArgs: [],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);

  /*const buffer = result.methodResults[0].rawReturnValue;*/

  console.log("asset created. Check AssetID on explorer before to continue");

  /*
  var assetId = buffer.readUIntBE(0, Uint8Array.length);

  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }*/

  return 0;
}

async function algoTranfer(sender, receiver, amount) {
  let params = await client.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: receiver,
    amount: amount,
    note: undefined,
    suggestedParams: params,
  });

  let signedTxn = txn.signTxn(sender.sk);

  let txId = txn.txID().toString();
  console.log("Signed transaction with txID: %s", txId);

  // Submit the transaction
  await client.sendRawTransaction(signedTxn).do();

  let confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  accountInfo = await client.accountInformation(sender.addr).do();
  console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
  console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
  console.log("Account balance: %d microAlgos", accountInfo.amount);
}

async function getAccountBalance(add) {
  const accountInfo = await client.accountInformation(add).do();
  console.log("Algo: ", accountInfo.amount / 1000000);
}

async function assetOptIn(sender, assetId) {
  params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  let recipient = sender.addr;
  let revocationTarget = undefined;
  let closeRemainderTo = undefined;
  amount = 0;

  let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender.addr,
    recipient,
    closeRemainderTo,
    revocationTarget,
    amount,
    undefined,
    assetId,
    params
  );

  let rawSignedTxn = opttxn.signTxn(sender.sk);

  let opttx = await client.sendRawTransaction(rawSignedTxn).do();
  console.log("Transaction : " + opttx.txId);
}

async function appOptIn(sender, appId) {
  params = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  let opttxn = algosdk.makeApplicationOptInTxn(sender.addr, params, appId);

  let rawSignedTxn = opttxn.signTxn(sender.sk);

  let opttx = await client.sendRawTransaction(rawSignedTxn).do();
  console.log("Transaction : " + opttx.txId);
}

async function assign_donor_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  const buff = fs.readFileSync(jsonPath);

  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_donor_role", contract),
    //methodArgs: [account.addr, true],
    methodArgs: [
      //  "U45OH5J2KLOBOQ5BF47ZOUFWJPR6YVKVSPRL4QIDL2TBGKE47QW4OXPADY",
      true,
    ],

    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function assign_merch_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  const buff = fs.readFileSync(jsonPath);

  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_merchant_role", contract),
    methodArgs: [merchAccount.addr, true],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function assign_redcross_role() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  const buff = fs.readFileSync(jsonPath);
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("set_redcross_role", contract),
    methodArgs: [CriAddr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

async function donor_buy_token() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;
  const buff = fs.readFileSync(jsonPath);
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));

  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  txn = {
    /*txn: new Transaction({
      from: account.addr,
      to: smartContractAddress,
      amount: 10000,
      ...sp,
    }),*/
    txn: algosdk.makeAssetTransferTxnWithSuggestedParams(
      account.addr,
      smartContractAddress,
      undefined,
      undefined,
      1,
      undefined,
      usdc_id,
      sp
    ),

    signer: algosdk.makeBasicAccountTransactionSigner(account),
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
}

async function pay_merchant() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 20;

  const buff = fs.readFileSync(jsonPath);
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));
  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("pay_merchant", contract),
    methodArgs: [assetId, usdc_id, 1, account.addr, merchAccount.addr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

function createAccount() {
  let account = algosdk.generateAccount();
  console.log("Account Address: ", account.addr);
  let mn = algosdk.secretKeyToMnemonic(account.sk);
  console.log("Account Mnemonic: ", mn);
}

async function donor_transfer_asa() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  const buff = fs.readFileSync(jsonPath);
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));
  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("donation_transfer", contract),
    methodArgs: [assetId, 2000, account.addr, CriAccount.addr],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}

// Utility function to return an ABIMethod by its name
function getMethodByName(name, contract) {
  const m = contract.methods.find((mt) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}

async function contract_opt_in_usdc() {
  const atc = new algosdk.AtomicTransactionComposer();

  const sp = await client.getTransactionParams().do();
  sp.fee = 10;

  const buff = fs.readFileSync(jsonPath);
  const contract = new algosdk.ABIContract(JSON.parse(buff.toString()));
  const commonParams = {
    appID: appId,
    sender: account.addr,
    suggestedParams: sp,
    signer: algosdk.makeBasicAccountTransactionSigner(account),
  };

  atc.addMethodCall({
    method: getMethodByName("contract_opt_in_usdc", contract),
    methodArgs: [usdc_id],
    ...commonParams,
  });

  const result = await atc.execute(client, 2);
  for (const idx in result.methodResults) {
    console.log(result.methodResults[idx]);
  }
}
