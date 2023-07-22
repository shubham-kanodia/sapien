import React, { useState, useEffect } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import axios from "axios";
import { Tensor, InferenceSession } from "onnxjs";
import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";

import Address from "../../components/Address";
import ClassifyResult from "../../components/ClassifyResult";
import Footer from "../../components/Footer";
import { useRouter } from 'next/router'

import WorldIDWidget from "../../components/WorldIDWidget";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../../utils/ethereum";

import { buildContractCallArgs, generateProof } from "../../utils/snark";
import { computeQuantizedEmbedding } from "../../utils/model";

import metadata from "../../data/Verifier.json";

import "react-toastify/dist/ReactToastify.css";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const VERIFIER_CONTRACT_ADDR = "0x95c5683d9e9f48F00E32c1Ff4e273631cD105Da5";
const VERIFIER_CONTRACT_ABI: any = metadata.abi;

const mlModelUrl = "/frontend_model.onnx";

const title = "ZK Face Recognition";
const description =
  "Recognizing faces privately using ZK Snarks and Machine Learning";

const appHeading = "ZK Face Recognition";
const appDescription =
  "In this app, we use ZK Snarks and Machine Learning to recognize a face privately";

const primaryButtonClasses =
  "mt-10 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide";

const titlePart1 = "Connect with the world effortlessly with";
const titlePart2 = "Sapien";

const Home: NextPage = () => {
  const router = useRouter()
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [session, setSession] = useState<any>();

  const [account, setAccount] = useState();
  const [verifierContract, setVerifierContract] = useState<any>();

  const [prediction, setPrediction] = useState<null | number>();
  const [publicSignals, setPublicSignals] = useState<number[]>();
  const [proof, setProof] = useState<any>();

  const [selectedImage, setSelectedImage] = useState<any>();

  const [image, setImage] = useState(null);

  const [webcam, setWebcam] = useState(false);
  const [validated, setValidated] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const preProcess = async (fileInput: any): Promise<Tensor | null> => {
    let tensorData;
    try {
      if (!fileInput) return null;

      const formData = new FormData();
      formData.append("file", fileInput);

      const response = await axios.post(
        "http://localhost:8000/embeddings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      tensorData = response.data?.embeddings;
    } catch (e) {
      console.log("preProcess error: ", e);
    }

    const tensor = new Tensor(new Float32Array(512), "float32", [1, 512]);
    (tensor.data as Float32Array).set(tensorData);
    return tensor;
  };

  const runModel = async (
    model: InferenceSession,
    preProcessedData: Tensor
  ): Promise<[Tensor, number]> => {
    const start = new Date();
    try {
      const outputData = await model.run([preProcessedData]);
      const end = new Date();
      const inferenceTime = end.getTime() - start.getTime();
      const output = outputData.values().next().value;
      return [output, inferenceTime];
    } catch (e) {
      console.error(e);
      throw new Error();
    }
  };

  const classifyAndGenerateProof = async (base64Image: any, session: any) => {
    if (!session) return;

    try {
      const result = await fetch(base64Image);
      const blob = await result.blob();

      const file = new File([blob], "filename.jpeg");

      const preProcessedData = await preProcess(file);
      if (!preProcessedData) return;

      let [modelOutput, _] = await runModel(session, preProcessedData);

      var output = modelOutput.data;
      const quantizedEmbedding = computeQuantizedEmbedding(output, 1);

      const { proof, publicSignals } = await generateProof(quantizedEmbedding);
      const maxValue = Math.max(...publicSignals);

      setPublicSignals(publicSignals);
      setPrediction(maxValue);
      setProof(proof);

      toast.success(
        "Face classification and proof generation completed successfully"
      );
    } catch (e) {
      console.warn(e);
    }
  };

  const verifyProof = async (proof: any, publicSignals: any) => {
    //@ts-ignore
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask walet");
      return;
    }

    try {
      const callArgs = await buildContractCallArgs(proof, publicSignals);
      const result = await verifierContract.addUserByFace(...callArgs);

      if (result) {
        toast.success("User added!");
        router.push("/verified");
        return;
      }
      toast.error("Invalid user details!");
    }

    catch (e) {
      toast.error("User already registered!");
    }
  };

  const addUser = async () => {
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask walet");
      return;
    }

    try {
      const result = await verifierContract.addUser();

      if (result) {
        toast.success("User added!");
        router.push("/verified");
        return;
      }
      toast.error("Invalid user details!");
    }

    catch (e) {
      toast.error("User already registered!");
    }
  }

  const onImageChange = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

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

  const loadModel = async () => {
    const session = new InferenceSession({ backendHint: "cpu" });
    const url = mlModelUrl;
    await session.loadModel(url);

    setIsModelLoaded(true);
    setSession(session);
  };

  useEffect(() => {
    setupWallet();
    loadModel();
  }, []);

  const isImageLoaded = Boolean(selectedImage);
  const isImageAndProofPresent = isImageLoaded && Boolean(proof);

  const isMetamaskConnected = !!account;

  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    //@ts-ignore
    const imageSrc = webcamRef?.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  useEffect(() => {
    if (!image || !session) return;
    classifyAndGenerateProof(image, session);
  }, [image, session]);

  const onSuccess = (proof: any) => {
    console.log("Called by worldcoin!");
    setValidated(true);
  }

  return (
    <div className="min-h-screen items-center py-2">
      <Head>
        <title>ZK Face Recognition</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://ethereum-bootcamp-frontend.vercel.app/og-image.png"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
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

      <div className="flex flex-row mt-20">
        <div className="w-1/2 text-center h-[500px] border-r border-r-gray-600">
          <h2 className="font-semibold text-lg bg-gradient-to-b from-sky-400 to-blue-600 bg-clip-text text-transparent">Connect with FaceID</h2>
          {!webcam && (
            <div className="flex flex-row h-full place-items-center justify-center"><button
              type="button"
              className="mt-10 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
              onClick={() => setWebcam(true)}
            >Enable Webcam
            </button></div>
          )}
          {webcam && (
            <main className="flex w-full flex-1 flex-col items-center px-20 pt-12 text-center">
              <div className="my-2">
                {/* <WebcamCapture setImage={setImage} /> */}
                <Webcam
                  audio={false}
                  height={720}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                  className="w-6/12 mx-auto"
                />
                {/* <button onClick={capture}>Capture photo</button> */}
              </div>

              <div className="my-12 mt-6">
                {!isModelLoaded && <p>Loading model ...</p>}

                {isModelLoaded && (
                  <div className="flex flex-col gap-8 items-center">
                    <div className="flex gap-2 mt-4">
                      <div>
                        <button
                          className={primaryButtonClasses}
                          // onClick={() => classifyAndGenerateProof(image, session)}
                          onClick={capture}
                        // disabled={!image}
                        >
                          Classify and Generate Proof
                        </button>
                      </div>
                      <div>
                        {/* <button
                          className={primaryButtonClasses}
                          onClick={() => verifyProof(proof, publicSignals)}
                          disabled={!Boolean(proof)}
                        >
                          Verify Proof on chain
                        </button> */}
                      </div>
                    </div>
                    {prediction !== null && prediction !== undefined && (
                      <ClassifyResult prediction={prediction} proof={proof} />
                    )}
                  </div>
                )}
              </div>
            </main>
          )}
        </div>
        <div className="w-1/2 text-center h-[500px]">
          <h2 className="font-semibold text-lg bg-gradient-to-b from-sky-400 to-blue-600 bg-clip-text text-transparent">Connect with WorldCoin</h2>
          <div className="flex place-items-center justify-center h-full">
            <WorldIDWidget onSuccess={onSuccess} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-row h-full place-items-center justify-center"><button
              type="button"
              disabled={!Boolean(proof) && !validated}
              className="mt-20 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
              onClick={() => {
                if (Boolean(proof)) {
                    verifyProof(proof, publicSignals);
                  }
                else {
                    addUser();
                }
              }}
            >Add Identity On Chain
            </button></div>
      {/* <Footer /> */}
    </div>
  );
};

export default Home;

