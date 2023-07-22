import React, { useState, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";import Webcam from "react-webcam";

import Address from "../../components/Address";
import { useRouter } from 'next/router'
import metadata from "../../data/Verifier.json";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../../utils/ethereum";

import "react-toastify/dist/ReactToastify.css";

const VERIFIER_CONTRACT_ADDR = "0x95c5683d9e9f48F00E32c1Ff4e273631cD105Da5";
const VERIFIER_CONTRACT_ABI = metadata.abi;

const primaryButtonClasses =
  "mt-10 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide";

const Verified = () => {
  const router = useRouter()

  const [account, setAccount] = useState();
  const [verifierContract, setVerifierContract] = useState();

  const setupWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) return;

    setupEthereumEventListeners(ethereum);

    const verifierContract = getSignedContract(
      VERIFIER_CONTRACT_ADDR,
      VERIFIER_CONTRACT_ABI
    );

    if (!verifierContract) return;

    const currentAccount = await getCurrentAccount();
    setVerifierContract(verifierContract);
    setAccount(currentAccount);
  };

  useEffect(() => {
    setupWallet();
  }, []);

  const isMetamaskConnected = !!account;

  return (
    <div className="min-h-screen items-center py-2">
      <ToastContainer position="bottom-center" autoClose={1500} closeOnClick />

      <div className="flex my-4 text-center px-5 justify-end">
        {!isMetamaskConnected && (
          <button
            type="button"
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {isMetamaskConnected && (
          <div className="flex w-full items-center gap-2 mx-auto justify-end">
            <Address address={account} />
          </div>
        )}
      </div>

      <div className="maximum-width-control">
      <h2 className="font-semibold text-lg bg-gradient-to-b from-sky-400 to-blue-600 bg-clip-text text-transparent">Add your identity on multiple chains</h2>

      <div className="mt-10 flex flex-row place-items-center">
        <h2 className="font-semibold text-sm w-1/2">CELO</h2>
        <button className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide">Add Identity to chain</button>
      </div>

      <div className="mt-10 flex flex-row place-items-center">
        <h2 className="font-semibold text-sm w-1/2">Gnosis Chain</h2>
        <button className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide">Add Identity to chain</button>
      </div>
      
    </div>
    </div>
  );
};

export default Verified;

