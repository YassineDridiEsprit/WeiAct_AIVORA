import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "farmer", "type": "string" },
      { "internalType": "string", "name": "harvestDate", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "string", "name": "method", "type": "string" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "internalType": "string", "name": "variety", "type": "string" }
    ],
    "name": "createBatch",
    "outputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "string", "name": "conditions", "type": "string" },
      { "internalType": "string", "name": "transporterId", "type": "string" },
      { "internalType": "string", "name": "vehicleType", "type": "string" }
    ],
    "name": "logTransportation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "string", "name": "pressingId", "type": "string" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "string", "name": "conditions", "type": "string" },
      { "internalType": "uint256", "name": "temperature", "type": "uint256" },
      { "internalType": "uint256", "name": "humidity", "type": "uint256" },
      { "internalType": "uint256", "name": "goodOlives", "type": "uint256" },
      { "internalType": "uint256", "name": "badOlives", "type": "uint256" }
    ],
    "name": "logStorageBeforePressing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "string", "name": "pressingId", "type": "string" },
      { "internalType": "string", "name": "date", "type": "string" },
      { "internalType": "string", "name": "facility", "type": "string" },
      { "internalType": "string", "name": "method", "type": "string" },
      { "internalType": "string", "name": "conditions", "type": "string" },
      { "internalType": "uint256", "name": "temperature", "type": "uint256" },
      { "internalType": "uint256", "name": "pressure", "type": "uint256" },
      { "internalType": "string", "name": "operatorName", "type": "string" }
    ],
    "name": "logPressingProcess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "string", "name": "pressingId", "type": "string" },
      { "internalType": "string", "name": "tankId", "type": "string" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" },
      { "internalType": "string", "name": "conditions", "type": "string" },
      { "internalType": "uint256", "name": "temperature", "type": "uint256" },
      { "internalType": "uint256", "name": "humidity", "type": "uint256" },
      { "internalType": "bool", "name": "inertAtmosphere", "type": "bool" }
    ],
    "name": "logStorageAfterPressing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "string", "name": "onhId", "type": "string" },
      { "internalType": "string", "name": "lab", "type": "string" },
      { "internalType": "uint256", "name": "acidityScaled", "type": "uint256" },
      { "internalType": "string", "name": "quality", "type": "string" },
      { "internalType": "string", "name": "area", "type": "string" },
      { "internalType": "uint256", "name": "peroxideValueScaled", "type": "uint256" },
      { "internalType": "bool", "name": "certifiedOrganic", "type": "bool" }
    ],
    "name": "logQualityCheck",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" }
    ],
    "name": "getBatch",
    "outputs": [
      {
        "components": [
          {
            "components": [
              { "internalType": "string", "name": "farmer", "type": "string" },
              { "internalType": "string", "name": "date", "type": "string" },
              { "internalType": "string", "name": "location", "type": "string" },
              { "internalType": "string", "name": "method", "type": "string" },
              { "internalType": "uint256", "name": "quantity", "type": "uint256" },
              { "internalType": "string", "name": "variety", "type": "string" }
            ],
            "internalType": "struct OliveOilProductionChain.Harvesting",
            "name": "harvesting",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "uint256", "name": "duration", "type": "uint256" },
              { "internalType": "string", "name": "conditions", "type": "string" },
              { "internalType": "string", "name": "transporterId", "type": "string" },
              { "internalType": "string", "name": "vehicleType", "type": "string" }
            ],
            "internalType": "struct OliveOilProductionChain.Transportation",
            "name": "transportation",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "uint256", "name": "duration", "type": "uint256" },
              { "internalType": "string", "name": "pressingId", "type": "string" },
              { "internalType": "string", "name": "conditions", "type": "string" },
              { "internalType": "uint256", "name": "temperature", "type": "uint256" },
              { "internalType": "uint256", "name": "humidity", "type": "uint256" },
              { "internalType": "uint256", "name": "goodOlives", "type": "uint256" },
              { "internalType": "uint256", "name": "badOlives", "type": "uint256" }
            ],
            "internalType": "struct OliveOilProductionChain.StorageBeforePressing",
            "name": "storageBeforePressing",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "string", "name": "date", "type": "string" },
              { "internalType": "string", "name": "pressingId", "type": "string" },
              { "internalType": "string", "name": "facility", "type": "string" },
              { "internalType": "string", "name": "method", "type": "string" },
              { "internalType": "string", "name": "conditions", "type": "string" },
              { "internalType": "uint256", "name": "temperature", "type": "uint256" },
              { "internalType": "uint256", "name": "pressure", "type": "uint256" },
              { "internalType": "string", "name": "operatorName", "type": "string" }
            ],
            "internalType": "struct OliveOilProductionChain.PressingProcess",
            "name": "pressingProcess",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "string", "name": "tankId", "type": "string" },
              { "internalType": "string", "name": "pressingId", "type": "string" },
              { "internalType": "uint256", "name": "duration", "type": "uint256" },
              { "internalType": "string", "name": "conditions", "type": "string" },
              { "internalType": "uint256", "name": "temperature", "type": "uint256" },
              { "internalType": "uint256", "name": "humidity", "type": "uint256" },
              { "internalType": "bool", "name": "inertAtmosphere", "type": "bool" }
            ],
            "internalType": "struct OliveOilProductionChain.StorageAfterPressing",
            "name": "storageAfterPressing",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "string", "name": "lab", "type": "string" },
              { "internalType": "string", "name": "onhId", "type": "string" },
              { "internalType": "uint256", "name": "acidity", "type": "uint256" },
              { "internalType": "string", "name": "quality", "type": "string" },
              { "internalType": "string", "name": "area", "type": "string" },
              { "internalType": "uint256", "name": "peroxideValue", "type": "uint256" },
              { "internalType": "bool", "name": "certifiedOrganic", "type": "bool" }
            ],
            "internalType": "struct OliveOilProductionChain.QualityCheck",
            "name": "qualityCheck",
            "type": "tuple"
          },
          { "internalType": "bool", "name": "isFinalized", "type": "bool" }
        ],
        "internalType": "struct OliveOilProductionChain.Batch",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" }
    ],
    "name": "getHarvestDetails",
    "outputs": [
      { "internalType": "string", "name": "farmer", "type": "string" },
      { "internalType": "string", "name": "date", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "string", "name": "method", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBatchCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "farmer", "type": "address" }
    ],
    "name": "getBatchesByFarmer",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" }
    ],
    "name": "getAcidity",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" }
    ],
    "name": "getPeroxideValue",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "transporterId", "type": "string" }
    ],
    "name": "getBatchesByTransporter",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "pressingId", "type": "string" }
    ],
    "name": "getBatchesByPressingId",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "onhId", "type": "string" }
    ],
    "name": "getBatchesByOnhId",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export function getProvider(): any {
  if (!(window as any).ethereum) throw new Error('MetaMask not found');
  return new ethers.providers.Web3Provider((window as any).ethereum);
}

export async function requestAccounts(provider?: any): Promise<string[]> {
  const p = provider ?? getProvider();
  return p.send('eth_requestAccounts', []);
}

export function getSigner(provider?: any): any {
  const p = provider ?? getProvider();
  return p.getSigner();
}

export function getContract(signerOrProvider?: any) {
  const base = signerOrProvider ?? getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, base);
}

export const toChecksumAddress = (address: string): string => {
  try {
    return ethers.utils.getAddress(address);
  } catch (error) {
    console.error('Invalid address:', error);
    throw new Error('Invalid Ethereum address');
  }
};