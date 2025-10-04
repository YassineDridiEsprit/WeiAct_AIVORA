// import { useState, useEffect, useRef } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Search, AlertCircle, Package, ArrowRight, Loader2, Home } from 'lucide-react';
// import { ethers, BigNumber } from 'ethers';
// import jsQR from 'jsqr';
// import CryptoJS from 'crypto-js';

// interface Batch {
//   harvesting: {
//     farmer: string;
//     date: string;
//     location: string;
//     method: string;
//     quantity: string;
//     variety: string;
//   };
//   transportation: {
//     duration: string;
//     conditions: string;
//     transporterId: string;
//     vehicleType: string;
//   };
//   storageBeforePressing: {
//     duration: string;
//     pressingId: string;
//     conditions: string;
//     temperature: string;
//     humidity: string;
//     goodOlives: string;
//     badOlives: string;
//   };
//   pressingProcess: {
//     date: string;
//     pressingId: string;
//     facility: string;
//     method: string;
//     conditions: string;
//     temperature: string;
//     pressure: string;
//     operatorName: string;
//   };
//   storageAfterPressing: {
//     tankId: string;
//     pressingId: string;
//     duration: string;
//     conditions: string;
//     temperature: string;
//     humidity: string;
//     inertAtmosphere: boolean;
//   };
//   qualityCheck: {
//     lab: string;
//     onhId: string;
//     acidity: string;
//     quality: string;
//     area: string;
//     peroxideValue: string;
//     certifiedOrganic: boolean;
//   };
//   isFinalized: boolean;
// }

// export default function Trace() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [batchId, setBatchId] = useState('');
//   const [batch, setBatch] = useState<Batch | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [fileName, setFileName] = useState('');
//   const [scanMessage, setScanMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
//   const [fraudStatus, setFraudStatus] = useState<string>('No Issues Detected');
//   const [fraudDetails, setFraudDetails] = useState<{ title: string; description: string; type: 'safe' | 'warning' | 'danger' }[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const contractAddress = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
//   const contractABI = [
//     {
//       inputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
//       name: 'getBatch',
//       outputs: [
//         {
//           components: [
//             {
//               components: [
//                 { internalType: 'string', name: 'farmer', type: 'string' },
//                 { internalType: 'string', name: 'date', type: 'string' },
//                 { internalType: 'string', name: 'location', type: 'string' },
//                 { internalType: 'string', name: 'method', type: 'string' },
//                 { internalType: 'uint256', name: 'quantity', type: 'uint256' },
//                 { internalType: 'string', name: 'variety', type: 'string' },
//               ],
//               internalType: 'struct SupplyChain.Harvesting',
//               name: 'harvesting',
//               type: 'tuple',
//             },
//             {
//               components: [
//                 { internalType: 'uint256', name: 'duration', type: 'uint256' },
//                 { internalType: 'string', name: 'transporterId', type: 'string' },
//                 { internalType: 'string', name: 'conditions', type: 'string' },
//                 { internalType: 'string', name: 'vehicleType', type: 'string' },
//               ],
//               internalType: 'struct SupplyChain.Transportation',
//               name: 'transportation',
//               type: 'tuple',
//             },
//             {
//               components: [
//                 { internalType: 'uint256', name: 'duration', type: 'uint256' },
//                 { internalType: 'string', name: 'pressingId', type: 'string' },
//                 { internalType: 'string', name: 'conditions', type: 'string' },
//                 { internalType: 'uint256', name: 'temperature', type: 'uint256' },
//                 { internalType: 'uint256', name: 'humidity', type: 'uint256' },
//                 { internalType: 'uint256', name: 'goodOlives', type: 'uint256' },
//                 { internalType: 'uint256', name: 'badOlives', type: 'uint256' },
//               ],
//               internalType: 'struct SupplyChain.StorageBeforePressing',
//               name: 'storageBeforePressing',
//               type: 'tuple',
//             },
//             {
//               components: [
//                 { internalType: 'string', name: 'date', type: 'string' },
//                 { internalType: 'string', name: 'pressingId', type: 'string' },
//                 { internalType: 'string', name: 'facility', type: 'string' },
//                 { internalType: 'string', name: 'method', type: 'string' },
//                 { internalType: 'string', name: 'conditions', type: 'string' },
//                 { internalType: 'uint256', name: 'temperature', type: 'uint256' },
//                 { internalType: 'uint256', name: 'pressure', type: 'uint256' },
//                 { internalType: 'string', name: 'operatorName', type: 'string' },
//               ],
//               internalType: 'struct SupplyChain.PressingProcess',
//               name: 'pressingProcess',
//               type: 'tuple',
//             },
//             {
//               components: [
//                 { internalType: 'string', name: 'tankId', type: 'string' },
//                 { internalType: 'string', name: 'pressingId', type: 'string' },
//                 { internalType: 'uint256', name: 'duration', type: 'uint256' },
//                 { internalType: 'string', name: 'conditions', type: 'string' },
//                 { internalType: 'uint256', name: 'temperature', type: 'uint256' },
//                 { internalType: 'uint256', name: 'humidity', type: 'uint256' },
//                 { internalType: 'bool', name: 'inertAtmosphere', type: 'bool' },
//               ],
//               internalType: 'struct SupplyChain.StorageAfterPressing',
//               name: 'storageAfterPressing',
//               type: 'tuple',
//             },
//             {
//               components: [
//                 { internalType: 'string', name: 'lab', type: 'string' },
//                 { internalType: 'string', name: 'onhId', type: 'string' },
//                 { internalType: 'uint256', name: 'acidity', type: 'uint256' },
//                 { internalType: 'string', name: 'quality', type: 'string' },
//                 { internalType: 'string', name: 'area', type: 'string' },
//                 { internalType: 'uint256', name: 'peroxideValue', type: 'uint256' },
//                 { internalType: 'bool', name: 'certifiedOrganic', type: 'bool' },
//               ],
//               internalType: 'struct SupplyChain.QualityCheck',
//               name: 'qualityCheck',
//               type: 'tuple',
//             },
//             { internalType: 'bool', name: 'isFinalized', type: 'bool' },
//             { internalType: 'address', name: 'creator', type: 'address' },
//             { internalType: 'uint256', name: 'creationTimestamp', type: 'uint256' },
//           ],
//           internalType: 'struct SupplyChain.Batch',
//           name: '',
//           type: 'tuple',
//         },
//       ],
//       stateMutability: 'view',
//       type: 'function',
//     },
//   ];

//   const showError = (message: string) => {
//     setError(message);
//     setTimeout(() => setError(null), 5000);
//   };

//   const showScanMessage = (message: string, type: 'success' | 'error' | 'info' | 'clear' = 'info') => {
//     if (!message || type === 'clear') {
//       setScanMessage(null);
//       return;
//     }
//     setScanMessage({ message, type });
//     setTimeout(() => setScanMessage(null), 5000);
//   };

//   const decryptQRCodeData = (encryptedData: string): string => {
//     try {
//       const key = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef');
//       const iv = CryptoJS.enc.Hex.parse('abcdef9876543210abcdef9876543210');
//       const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv });
//       const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
//       if (!decryptedText) throw new Error('Decryption failed');
//       const params = new URLSearchParams(decryptedText);
//       const batchId = params.get('batchId');
//       if (!batchId) throw new Error('Batch ID not found in decrypted data');
//       return batchId;
//     } catch (error) {
//       throw new Error('Failed to decrypt QR code data: ' + (error as Error).message);
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setFileName(file.name);
//     showScanMessage('Processing QR code...', 'info');

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const context = canvas.getContext('2d');
//         if (!context) {
//           showScanMessage('Failed to process image', 'error');
//           return;
//         }
//         canvas.width = img.width;
//         canvas.height = img.height;
//         context.drawImage(img, 0, 0);
//         const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//         const code = jsQR(imageData.data, imageData.width, imageData.height, {
//           inversionAttempts: 'dontInvert',
//         });

//         if (code) {
//           try {
//             const batchIdFromQR = decryptQRCodeData(code.data);
//             setBatchId(batchIdFromQR);
//             showScanMessage('QR code scanned successfully!', 'success');
//             viewBatchDetails(batchIdFromQR);
//           } catch (e) {
//             if (/^\d+$/.test(code.data)) {
//               setBatchId(code.data);
//               showScanMessage('QR code scanned successfully!', 'success');
//               viewBatchDetails(code.data);
//             } else {
//               showScanMessage((e as Error).message, 'error');
//             }
//           }
//         } else {
//           showScanMessage('No valid QR code found in the image', 'error');
//         }

//         setFileName('');
//         if (fileInputRef.current) fileInputRef.current.value = '';
//       };
//       img.src = e.target?.result as string;
//     };
//     reader.readAsDataURL(file);
//   };

//   const formatKey = (key: string) => {
//     return key
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/^./, (str) => str.toUpperCase());
//   };

//   const displayStages = (batchId: string, batch: Batch) => {
//     const stages: JSX.Element[] = [];

//     const createStageCard = (
//       title: string,
//       date: string,
//       details: { [key: string]: any },
//       iconPath: string
//     ) => {
//       const formattedDetails = Object.entries(details).map(([key, value]) => {
//         if (value === undefined || value === null) return null;

//         let formattedValue: string | JSX.Element = value;
//         let extraClass = '';

//         // Convert to number for rendering
//         if (typeof value === 'string' && /^\d+$/.test(value)) {
//           const numericValue = Number(value);
//           if (key.toLowerCase() === 'duration') {
//             formattedValue = `${(numericValue / 10).toFixed(1)} hours`;
//           } else if (key.toLowerCase() === 'temperature') {
//             formattedValue = `${(numericValue / 10).toFixed(1)}°C`;
//           } else if (key.toLowerCase() === 'humidity') {
//             formattedValue = `${(numericValue / 10).toFixed(1)}%`;
//           } else if (key.toLowerCase() === 'pressure') {
//             formattedValue = `${numericValue} bar`;
//           } else if (key.toLowerCase() === 'acidity') {
//             formattedValue = `${(numericValue / 10).toFixed(1)}%`;
//           } else if (key.toLowerCase() === 'peroxidevalue') {
//             formattedValue = `${(numericValue / 426.67).toFixed(1)} meq O2/kg`;
//           } else if (key.toLowerCase() === 'quantity') {
//             formattedValue = `${(numericValue / 1000).toFixed(2)} kg`;
//           } else {
//             formattedValue = value.toString();
//           }
//         } else if (key.toLowerCase().includes('id') && typeof value === 'string' && value.startsWith('0x')) {
//           formattedValue = <span className="address">{value}</span>;
//         } else if (key.toLowerCase() === 'conditions') {
//           const cond = value.toString().toLowerCase();
//           if (cond.includes('good')) extraClass = 'conditions-good';
//           else if (cond.includes('fair')) extraClass = 'conditions-fair';
//           else if (cond.includes('poor')) extraClass = 'conditions-poor';
//         } else if (typeof value === 'boolean') {
//           formattedValue = value ? 'Yes' : 'No';
//         }

//         if (key.toLowerCase() === 'farmer' && typeof formattedValue === 'string') {
//           formattedValue = <span className="address" title={formattedValue}>{formattedValue}</span>;
//         }

//         return (
//           <div className="detail-item" key={key}>
//             <strong>{formatKey(key)}</strong>
//             <span className={extraClass}>{formattedValue}</span>
//           </div>
//         );
//       }).filter(Boolean);

//       return (
//         <div className="stage-card" key={title}>
//           <div className="stage-header">
//             <svg className="stage-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)">
//               <path d={iconPath} />
//             </svg>
//             <div className="stage-title">{title}</div>
//             {date && <span className="stage-date">{date}</span>}
//           </div>
//           <div className="stage-details">{formattedDetails}</div>
//         </div>
//       );
//     };

//     if (batch.harvesting && batch.harvesting.date) {
//       stages.push(
//         createStageCard(
//           'Harvesting',
//           batch.harvesting.date,
//           {
//             farmer: batch.harvesting.farmer,
//             location: batch.harvesting.location,
//             method: batch.harvesting.method,
//             quantity: batch.harvesting.quantity,
//             variety: batch.harvesting.variety,
//           },
//           'M19.5 12c0-1.32-.84-2.44-2.02-2.86l-.93-3.08C16.08 5.13 14.61 4 12.9 4H11.1C9.39 4 7.92 5.13 7.45 7.06l-.93 3.08C5.34 9.56 4.5 10.68 4.5 12c0 1.32.84 2.44 2.02 2.86l.93 3.08c.47 1.93 1.94 3.06 3.65 3.06h1.8c1.71 0 3.28-1.13 3.75-3.06l.93-3.08c1.18-.42 2.02-1.54 2.02-2.86zM12 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z'
//         )
//       );
//     }

//     if (batch.transportation && batch.transportation.duration) {
//       stages.push(
//         createStageCard(
//           'Transportation',
//           '',
//           {
//             transporterId: batch.transportation.transporterId,
//             duration: batch.transportation.duration,
//             vehicleType: batch.transportation.vehicleType,
//             conditions: batch.transportation.conditions,
//           },
//           'M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3z'
//         )
//       );
//     }

//     if (batch.storageBeforePressing && batch.storageBeforePressing.duration) {
//       stages.push(
//         createStageCard(
//           'Storage Before Pressing',
//           '',
//           {
//             pressingId: batch.storageBeforePressing.pressingId,
//             duration: batch.storageBeforePressing.duration,
//             temperature: batch.storageBeforePressing.temperature,
//             humidity: batch.storageBeforePressing.humidity,
//             conditions: batch.storageBeforePressing.conditions,
//             goodOlives: batch.storageBeforePressing.goodOlives,
//             badOlives: batch.storageBeforePressing.badOlives,
//           },
//           'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z'
//         )
//       );
//     }

//     if (batch.pressingProcess && batch.pressingProcess.date) {
//       stages.push(
//         createStageCard(
//           'Pressing Process',
//           batch.pressingProcess.date,
//           {
//             pressingId: batch.pressingProcess.pressingId,
//             facility: batch.pressingProcess.facility,
//             method: batch.pressingProcess.method,
//             temperature: batch.pressingProcess.temperature,
//             pressure: batch.pressingProcess.pressure,
//             operatorName: batch.pressingProcess.operatorName,
//             conditions: batch.pressingProcess.conditions,
//           },
//           'M12 3c-4.97 0-9 3.19-9 7 0 2.38 1.19 4.47 3 5.74V19c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3.26c1.81-1.27 3-3.36 3-5.74 0-3.81-4.03-7-9-7zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'
//         )
//       );
//     }

//     if (batch.storageAfterPressing && batch.storageAfterPressing.duration) {
//       stages.push(
//         createStageCard(
//           'Storage After Pressing',
//           '',
//           {
//             tankId: batch.storageAfterPressing.tankId,
//             pressingId: batch.storageAfterPressing.pressingId,
//             duration: batch.storageAfterPressing.duration,
//             temperature: batch.storageAfterPressing.temperature,
//             humidity: batch.storageAfterPressing.humidity,
//             inertAtmosphere: batch.storageAfterPressing.inertAtmosphere,
//             conditions: batch.storageAfterPressing.conditions,
//           },
//           'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z'
//         )
//       );
//     }

//     if (batch.qualityCheck && batch.qualityCheck.lab) {
//       stages.push(
//         createStageCard(
//           'Quality Check',
//           '',
//           {
//             lab: batch.qualityCheck.lab,
//             onhId: batch.qualityCheck.onhId,
//             acidity: batch.qualityCheck.acidity,
//             quality: batch.qualityCheck.quality,
//             area: batch.qualityCheck.area,
//             peroxideValue: batch.qualityCheck.peroxideValue,
//             certifiedOrganic: batch.qualityCheck.certifiedOrganic,
//           },
//           'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z'
//         )
//       );
//     }

//     stages.push(
//       createStageCard(
//         'Final Status',
//         '',
//         {
//           batchStatus: batch.isFinalized ? 'Finalized' : 'Not Finalized',
//           batchId: batchId,
//         },
//         'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
//       )
//     );

//     return stages;
//   };

//   const checkForFraud = (batchId: string, batch: Batch) => {
//     const fraudDetails: { title: string; description: string; type: 'safe' | 'warning' | 'danger' }[] = [];
//     let fraudDetected = false;
//     let warnings = 0;

//     // Check 1: Finalization status
//     if (!batch.isFinalized) {
//       fraudDetails.push({
//         title: 'Batch not finalized',
//         description: 'This batch has not been finalized in the supply chain, which may indicate incomplete processing or potential tampering.',
//         type: 'warning',
//       });
//       warnings++;
//     }

//     // Check 2: Transportation conditions
//     if (batch.transportation && batch.transportation.conditions && typeof batch.transportation.conditions === 'string') {
//       const conditions = batch.transportation.conditions.toLowerCase();
//       if (conditions.includes('poor')) {
//         fraudDetails.push({
//           title: 'Poor transportation conditions',
//           description: 'The olives were transported under poor conditions which may have affected quality.',
//           type: 'warning',
//         });
//         warnings++;
//       }
//     }

//     // Check 3: Storage conditions before pressing
//     if (batch.storageBeforePressing && batch.storageBeforePressing.temperature && batch.storageBeforePressing.duration) {
//       const tempBeforePressing = Number(batch.storageBeforePressing.temperature) / 10;
//       if (tempBeforePressing > 25) {
//         fraudDetails.push({
//           title: 'High storage temperature before pressing',
//           description: `Storage temperature (${tempBeforePressing.toFixed(1)}°C) was above recommended levels (max 25°C), which may degrade olive quality.`,
//           type: 'warning',
//         });
//         warnings++;
//       }

//       const durationBeforePressing = Number(batch.storageBeforePressing.duration) / 10;
//       if (durationBeforePressing > 48) {
//         fraudDetails.push({
//           title: 'Long storage duration before pressing',
//           description: `Olives were stored for ${durationBeforePressing.toFixed(1)} hours before pressing (recommended max 48 hours), which may affect oil quality.`,
//           type: 'warning',
//         });
//         warnings++;
//       }
//     }

//     // Check 4: Quality check values
//     if (batch.qualityCheck && batch.qualityCheck.acidity && batch.qualityCheck.peroxideValue) {
//       const adjustedAcidity = Number(batch.qualityCheck.acidity) / 10;
//       const adjustedPeroxideValue = Number(batch.qualityCheck.peroxideValue) / 426.67;

//       if (adjustedAcidity > 0.8) {
//         fraudDetails.push({
//           title: 'High acidity level',
//           description: `Acidity level (${adjustedAcidity.toFixed(1)}%) exceeds extra virgin olive oil standards (max 0.8%).`,
//           type: 'danger',
//         });
//         fraudDetected = true;
//       }

//       if (adjustedPeroxideValue > 20) {
//         fraudDetails.push({
//           title: 'High peroxide value',
//           description: `Peroxide value (${adjustedPeroxideValue.toFixed(1)} meq O2/kg) exceeds extra virgin olive oil standards (max 20 meq O2/kg).`,
//           type: 'danger',
//         });
//         fraudDetected = true;
//       }
//     }

//     // Check 5: Storage after pressing conditions
//     if (batch.storageAfterPressing && batch.storageAfterPressing.temperature) {
//       const tempAfterPressing = Number(batch.storageAfterPressing.temperature) / 10;
//       if (tempAfterPressing > 18) {
//         fraudDetails.push({
//           title: 'High storage temperature after pressing',
//           description: `Oil stored at ${tempAfterPressing.toFixed(1)}°C (recommended max 18°C), which may accelerate degradation.`,
//           type: 'warning',
//         });
//         warnings++;
//       }

//       if (!batch.storageAfterPressing.inertAtmosphere) {
//         fraudDetails.push({
//           title: 'No inert atmosphere during storage',
//           description: 'Oil was not stored under inert atmosphere (nitrogen/argon), increasing oxidation risk.',
//           type: 'warning',
//         });
//         warnings++;
//       }
//     }

//     // Check 6: Missing critical stages
//     if (!batch.harvesting || !batch.pressingProcess || !batch.qualityCheck) {
//       fraudDetails.push({
//         title: 'Missing critical stages',
//         description: 'One or more critical stages (harvesting, pressing, quality check) are missing from the record.',
//         type: 'danger',
//       });
//       fraudDetected = true;
//     }

//     // Update fraud status
//     if (fraudDetected) {
//       setFraudStatus('Potential Fraud Detected');
//     } else if (warnings > 0) {
//       setFraudStatus(`${warnings} Quality Warnings`);
//     } else {
//       setFraudStatus('No Issues Detected');
//       fraudDetails.push({
//         title: 'All checks passed',
//         description: 'No quality issues or potential fraud indicators detected in this batch.',
//         type: 'safe',
//       });
//     }

//     setFraudDetails(fraudDetails);
//   };

//   const viewBatchDetails = async (idToUse: string) => {
//     const id = parseInt(idToUse);
//     if (isNaN(id) || id < 0) {
//       showError('Batch ID must be a valid non-negative integer');
//       return;
//     }

//     let provider;
//     try {
//       if (!window.ethereum) {
//         showError('Please install MetaMask to use this application.');
//         return;
//       }

//       provider = new ethers.providers.Web3Provider(window.ethereum);
//       const contract = new ethers.Contract(contractAddress, contractABI, provider);

//       setLoading(true);
//       setError(null);
//       setBatch(null);
//       showScanMessage('Loading batch details...', 'info');

//       const batchData = await contract.getBatch(id);
//       if (!batchData || !batchData.harvesting) {
//         throw new Error('Batch not found');
//       }

//       // Normalize batchData to match Batch interface with strings for numeric fields
//       const normalizedBatch: Batch = {
//         harvesting: {
//           farmer: batchData.harvesting.farmer,
//           date: batchData.harvesting.date,
//           location: batchData.harvesting.location,
//           method: batchData.harvesting.method,
//           quantity: BigNumber.isBigNumber(batchData.harvesting.quantity) ? batchData.harvesting.quantity.toString() : batchData.harvesting.quantity.toString(),
//           variety: batchData.harvesting.variety,
//         },
//         transportation: {
//           duration: BigNumber.isBigNumber(batchData.transportation.duration) ? batchData.transportation.duration.toString() : batchData.transportation.duration.toString(),
//           conditions: batchData.transportation.conditions,
//           transporterId: batchData.transportation.transporterId,
//           vehicleType: batchData.transportation.vehicleType,
//         },
//         storageBeforePressing: {
//           duration: BigNumber.isBigNumber(batchData.storageBeforePressing.duration) ? batchData.storageBeforePressing.duration.toString() : batchData.storageBeforePressing.duration.toString(),
//           pressingId: batchData.storageBeforePressing.pressingId,
//           conditions: batchData.storageBeforePressing.conditions,
//           temperature: BigNumber.isBigNumber(batchData.storageBeforePressing.temperature) ? batchData.storageBeforePressing.temperature.toString() : batchData.storageBeforePressing.temperature.toString(),
//           humidity: BigNumber.isBigNumber(batchData.storageBeforePressing.humidity) ? batchData.storageBeforePressing.humidity.toString() : batchData.storageBeforePressing.humidity.toString(),
//           goodOlives: BigNumber.isBigNumber(batchData.storageBeforePressing.goodOlives) ? batchData.storageBeforePressing.goodOlives.toString() : batchData.storageBeforePressing.goodOlives.toString(),
//           badOlives: BigNumber.isBigNumber(batchData.storageBeforePressing.badOlives) ? batchData.storageBeforePressing.badOlives.toString() : batchData.storageBeforePressing.badOlives.toString(),
//         },
//         pressingProcess: {
//           date: batchData.pressingProcess.date,
//           pressingId: batchData.pressingProcess.pressingId,
//           facility: batchData.pressingProcess.facility,
//           method: batchData.pressingProcess.method,
//           conditions: batchData.pressingProcess.conditions,
//           temperature: BigNumber.isBigNumber(batchData.pressingProcess.temperature) ? batchData.pressingProcess.temperature.toString() : batchData.pressingProcess.temperature.toString(),
//           pressure: BigNumber.isBigNumber(batchData.pressingProcess.pressure) ? batchData.pressingProcess.pressure.toString() : batchData.pressingProcess.pressure.toString(),
//           operatorName: batchData.pressingProcess.operatorName,
//         },
//         storageAfterPressing: {
//           tankId: batchData.storageAfterPressing.tankId,
//           pressingId: batchData.storageAfterPressing.pressingId,
//           duration: BigNumber.isBigNumber(batchData.storageAfterPressing.duration) ? batchData.storageAfterPressing.duration.toString() : batchData.storageAfterPressing.duration.toString(),
//           conditions: batchData.storageAfterPressing.conditions,
//           temperature: BigNumber.isBigNumber(batchData.storageAfterPressing.temperature) ? batchData.storageAfterPressing.temperature.toString() : batchData.storageAfterPressing.temperature.toString(),
//           humidity: BigNumber.isBigNumber(batchData.storageAfterPressing.humidity) ? batchData.storageAfterPressing.humidity.toString() : batchData.storageAfterPressing.humidity.toString(),
//           inertAtmosphere: batchData.storageAfterPressing.inertAtmosphere,
//         },
//         qualityCheck: {
//           lab: batchData.qualityCheck.lab,
//           onhId: batchData.qualityCheck.onhId,
//           acidity: BigNumber.isBigNumber(batchData.qualityCheck.acidity) ? batchData.qualityCheck.acidity.toString() : batchData.qualityCheck.acidity.toString(),
//           quality: batchData.qualityCheck.quality,
//           area: batchData.qualityCheck.area,
//           peroxideValue: BigNumber.isBigNumber(batchData.qualityCheck.peroxideValue) ? batchData.qualityCheck.peroxideValue.toString() : batchData.qualityCheck.peroxideValue.toString(),
//           certifiedOrganic: batchData.qualityCheck.certifiedOrganic,
//         },
//         isFinalized: batchData.isFinalized,
//       };

//       setBatch(normalizedBatch);
//       checkForFraud(idToUse, normalizedBatch);
//       showScanMessage('', 'clear');
//     } catch (err: any) {
//       console.error(err);
//       showError(`Error: ${err?.reason || err?.message || 'Batch not found'}`);
//       setBatch(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     viewBatchDetails(batchId);
//   };

//   useEffect(() => {
//     const batchIdFromUrl = searchParams.get('batchId');
//     if (batchIdFromUrl) {
//       setBatchId(batchIdFromUrl);
//       viewBatchDetails(batchIdFromUrl);
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
//       <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
//         <div className="container mx-auto px-4">
//           <div className="text-center">
//             <h1 className="text-4xl font-bold mb-4">Trace Olive Oil Batch</h1>
//             <nav className="mt-6">
//               <ol className="flex justify-center space-x-2 text-sm">
//                 <li><a href="/" className="hover:underline">Home</a></li>
//                 <li className="text-white/60">/</li>
//                 <li className="text-white/60">Trace Batch</li>
//               </ol>
//             </nav>
//           </div>
//         </div>
//       </div>

//       <div className="py-12">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Trace Your Olive Oil Batch</h3>
//               <p className="text-gray-600 mb-6">
//                 Quickly search and access batch records by entering a valid batch ID or scanning a QR code!
//               </p>
//               <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex-1">
//                   <input
//                     type="number"
//                     value={batchId}
//                     onChange={(e) => setBatchId(e.target.value)}
//                     placeholder="Enter Batch ID"
//                     className="w-full px-4 py-3 border-2 border-rose-500 rounded-lg focus:border-rose-600 focus:outline-none transition-colors"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       <span>Searching...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Search className="h-4 w-4" />
//                       <span>Find Batch</span>
//                     </>
//                   )}
//                 </button>
//               </form>

//               <div className="upload-container mt-6">
//                 <label htmlFor="file-input" className="upload-label">
//                   Upload QR Code Image
//                 </label>
//                 <input
//                   type="file"
//                   id="file-input"
//                   accept="image/*"
//                   ref={fileInputRef}
//                   onChange={handleFileUpload}
//                   style={{ display: 'none' }}
//                 />
//                 {fileName && <div id="file-name" className="mt-2 text-sm text-gray-600">{fileName}</div>}
//               </div>

//               {scanMessage && (
//                 <div
//                   className={`mt-4 p-4 rounded-lg flex items-start space-x-3 status-message ${
//                     scanMessage.type === 'error'
//                       ? 'bg-red-50 border-red-200 text-red-700'
//                       : scanMessage.type === 'success'
//                       ? 'bg-green-50 border-green-200 text-green-700'
//                       : 'bg-blue-50 border-blue-200 text-blue-700'
//                   }`}
//                 >
//                   <AlertCircle
//                     className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
//                       scanMessage.type === 'error'
//                         ? 'text-red-500'
//                         : scanMessage.type === 'success'
//                         ? 'text-green-500'
//                         : 'text-blue-500'
//                     }`}
//                   />
//                   <p className="text-sm">
//                     {scanMessage.type === 'info' ? 'Processing QR code...' : scanMessage.message}
//                   </p>
//                 </div>
//               )}

//               {error && (
//                 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
//                   <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               )}
//             </div>

//             {batch && (
//               <>
//                 <div className="max-w-2xl mx-auto mb-8">
//                   <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
//                     <div className="relative h-80 overflow-hidden">
//                       <img
//                         src="/assets/img/blog/oilveoil.jpg"
//                         alt="Batch Image"
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           (e.target as HTMLImageElement).src =
//                             'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxNDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTA5OTQwIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxMDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTBBOTgxIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE0Ij5PbGl2ZSBPaWw8L3RleHQ+Cjwvc3ZnPgo=';
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//                     </div>

//                     <div className="p-4 bg-gray-50">
//                       <div className="flex items-center space-x-2">
//                         <Package className="h-5 w-5 text-rose-600" />
//                         <span className="text-sm font-medium text-gray-700">
//                           {batch.transportation?.transporterId
//                             ? `${batch.transportation.transporterId.slice(0, 6)}...${batch.transportation.transporterId.slice(-4)}`
//                             : 'Unknown Transporter'}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       <div className="flex justify-between items-center mb-4">
//                         <div className="text-center flex-1">
//                           <h5 className="text-lg font-semibold text-gray-900 mb-1">Batch ID</h5>
//                           <span className="text-gray-600">{batchId}</span>
//                         </div>
//                         <div className="w-px h-12 bg-gray-200 mx-4" />
//                         <div className="text-center flex-1">
//                           <h5 className="text-lg font-semibold text-gray-900 mb-1">Status</h5>
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               batch.isFinalized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                             }`}
//                           >
//                             {batch.isFinalized ? 'Completed' : 'In Progress'}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="mt-4 text-sm text-gray-600">
//                         <p>
//                           <strong>Transporter ID:</strong>{' '}
//                           {batch.transportation?.transporterId
//                             ? `${batch.transportation.transporterId.slice(0, 6)}...${batch.transportation.transporterId.slice(-4)}`
//                             : 'Unknown'}
//                         </p>
//                         <p>
//                           <strong>Duration:</strong>{' '}
//                           {batch.transportation?.duration
//                             ? `${(Number(batch.transportation.duration) / 10)} hours`
//                             : 'Unknown'}
//                         </p>
//                         <p>
//                           <strong>Conditions:</strong> {batch.transportation?.conditions || 'Unknown'}
//                         </p>
//                         <p>
//                           <strong>Vehicle Type:</strong> {batch.transportation?.vehicleType || 'Unknown'}
//                         </p>
//                         <p>
//                           <strong>Farmer:</strong> {batch.harvesting?.farmer || 'Unknown'}
//                         </p>
//                       </div>

//                       <div className="mt-6 flex space-x-4">
//                         <a
//                           href={`/transporter/batch/${batchId}`}
//                           className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
//                         >
//                           <span>More Details</span>
//                           <ArrowRight className="h-4 w-4" />
//                         </a>
//                         <button
//                           onClick={() => navigate('/')}
//                           className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
//                         >
//                           <Home className="h-4 w-4" />
//                           <span>Back to Home</span>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="container section-title" data-aos="fade-up">
//                   <h2>Supply Chain Journey</h2>
//                   <p>Trace every step of your olive oil's production process with our transparent supply chain tracking.</p>
//                 </div>
//                 <div className="content">
//                   <div className="container">
//                     <div className="timeline">{batch && displayStages(batchId, batch)}</div>
//                     <div className="fraud-section">
//                       <div className="fraud-header">
//                         <svg className="fraud-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff9800">
//                           <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
//                         </svg>
//                         <h3>Fraud Detection Analysis</h3>
//                         <div
//                           className={`fraud-indicator ${
//                             fraudStatus.includes('Fraud') ? 'fraud-danger' : fraudStatus.includes('Warnings') ? 'fraud-warning' : 'fraud-safe'
//                           }`}
//                         >
//                           {fraudStatus}
//                         </div>
//                       </div>
//                       <div className="fraud-details">
//                         {fraudDetails.map((item, index) => (
//                           <div key={index} className={`fraud-item fraud-item-${item.type}`}>
//                             <svg className="fraud-item-icon" viewBox="0 0 24 24" fill="currentColor">
//                               <path
//                                 d={
//                                   item.type === 'danger'
//                                     ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
//                                     : item.type === 'warning'
//                                     ? 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
//                                     : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
//                                 }
//                               />
//                             </svg>
//                             <div>
//                               <strong>{item.title}</strong>
//                               <div>{item.description}</div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             {!loading && !batch && !error && batchId && (
//               <div className="text-center py-12">
//                 <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batch Found</h3>
//                 <p className="text-gray-600">
//                   Enter a valid batch ID or scan a QR code to search for batch details.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, Package, ArrowRight, Loader2, Home } from 'lucide-react';
import { ethers, BigNumber } from 'ethers';
import jsQR from 'jsqr';
import CryptoJS from 'crypto-js';

interface Batch {
  harvesting: {
    farmer: string;
    date: string;
    location: string;
    method: string;
    quantity: string;
    variety: string;
  };
  transportation: {
    duration: string;
    conditions: string;
    transporterId: string;
    vehicleType: string;
  };
  storageBeforePressing: {
    duration: string;
    pressingId: string;
    conditions: string;
    temperature: string;
    humidity: string;
    goodOlives: string;
    badOlives: string;
  };
  pressingProcess: {
    date: string;
    pressingId: string;
    facility: string;
    method: string;
    conditions: string;
    temperature: string;
    pressure: string;
    operatorName: string;
  };
  storageAfterPressing: {
    tankId: string;
    pressingId: string;
    duration: string;
    conditions: string;
    temperature: string;
    humidity: string;
    inertAtmosphere: boolean;
  };
  qualityCheck: {
    lab: string;
    onhId: string;
    acidity: string;
    quality: string;
    area: string;
    peroxideValue: string;
    certifiedOrganic: boolean;
  };
  isFinalized: boolean;
}

export default function Trace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState('');
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [scanMessage, setScanMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [fraudStatus, setFraudStatus] = useState<string>('No Issues Detected');
  const [fraudDetails, setFraudDetails] = useState<{ title: string; description: string; type: 'safe' | 'warning' | 'danger' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contractAddress = '0x381535e52d5b09d9Eb1024000bCa2784d47d2265';
  const contractABI = [
    {
      inputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
      name: 'getBatch',
      outputs: [
        {
          components: [
            {
              components: [
                { internalType: 'string', name: 'farmer', type: 'string' },
                { internalType: 'string', name: 'date', type: 'string' },
                { internalType: 'string', name: 'location', type: 'string' },
                { internalType: 'string', name: 'method', type: 'string' },
                { internalType: 'uint256', name: 'quantity', type: 'uint256' },
                { internalType: 'string', name: 'variety', type: 'string' },
              ],
              internalType: 'struct SupplyChain.Harvesting',
              name: 'harvesting',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'uint256', name: 'duration', type: 'uint256' },
                { internalType: 'string', name: 'transporterId', type: 'string' },
                { internalType: 'string', name: 'conditions', type: 'string' },
                { internalType: 'string', name: 'vehicleType', type: 'string' },
              ],
              internalType: 'struct SupplyChain.Transportation',
              name: 'transportation',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'uint256', name: 'duration', type: 'uint256' },
                { internalType: 'string', name: 'pressingId', type: 'string' },
                { internalType: 'string', name: 'conditions', type: 'string' },
                { internalType: 'uint256', name: 'temperature', type: 'uint256' },
                { internalType: 'uint256', name: 'humidity', type: 'uint256' },
                { internalType: 'uint256', name: 'goodOlives', type: 'uint256' },
                { internalType: 'uint256', name: 'badOlives', type: 'uint256' },
              ],
              internalType: 'struct SupplyChain.StorageBeforePressing',
              name: 'storageBeforePressing',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'string', name: 'date', type: 'string' },
                { internalType: 'string', name: 'pressingId', type: 'string' },
                { internalType: 'string', name: 'facility', type: 'string' },
                { internalType: 'string', name: 'method', type: 'string' },
                { internalType: 'string', name: 'conditions', type: 'string' },
                { internalType: 'uint256', name: 'temperature', type: 'uint256' },
                { internalType: 'uint256', name: 'pressure', type: 'uint256' },
                { internalType: 'string', name: 'operatorName', type: 'string' },
              ],
              internalType: 'struct SupplyChain.PressingProcess',
              name: 'pressingProcess',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'string', name: 'tankId', type: 'string' },
                { internalType: 'string', name: 'pressingId', type: 'string' },
                { internalType: 'uint256', name: 'duration', type: 'uint256' },
                { internalType: 'string', name: 'conditions', type: 'string' },
                { internalType: 'uint256', name: 'temperature', type: 'uint256' },
                { internalType: 'uint256', name: 'humidity', type: 'uint256' },
                { internalType: 'bool', name: 'inertAtmosphere', type: 'bool' },
              ],
              internalType: 'struct SupplyChain.StorageAfterPressing',
              name: 'storageAfterPressing',
              type: 'tuple',
            },
            {
              components: [
                { internalType: 'string', name: 'lab', type: 'string' },
                { internalType: 'string', name: 'onhId', type: 'string' },
                { internalType: 'uint256', name: 'acidity', type: 'uint256' },
                { internalType: 'string', name: 'quality', type: 'string' },
                { internalType: 'string', name: 'area', type: 'string' },
                { internalType: 'uint256', name: 'peroxideValue', type: 'uint256' },
                { internalType: 'bool', name: 'certifiedOrganic', type: 'bool' },
              ],
              internalType: 'struct SupplyChain.QualityCheck',
              name: 'qualityCheck',
              type: 'tuple',
            },
            { internalType: 'bool', name: 'isFinalized', type: 'bool' },
            { internalType: 'address', name: 'creator', type: 'address' },
            { internalType: 'uint256', name: 'creationTimestamp', type: 'uint256' },
          ],
          internalType: 'struct SupplyChain.Batch',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showScanMessage = (message: string, type: 'success' | 'error' | 'info' | 'clear' = 'info') => {
    if (!message || type === 'clear') {
      setScanMessage(null);
      return;
    }
    setScanMessage({ message, type });
    setTimeout(() => setScanMessage(null), 5000);
  };

  const decryptQRCodeData = (encryptedData: string): string => {
    try {
      const key = CryptoJS.enc.Hex.parse('0123456789abcdef0123456789abcdef');
      const iv = CryptoJS.enc.Hex.parse('abcdef9876543210abcdef9876543210');
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv });
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) throw new Error('Decryption failed');
      const params = new URLSearchParams(decryptedText);
      const batchId = params.get('batchId');
      if (!batchId) throw new Error('Batch ID not found in decrypted data');
      return batchId;
    } catch (error) {
      throw new Error('Failed to decrypt QR code data: ' + (error as Error).message);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    showScanMessage('Processing QR code...', 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          showScanMessage('Failed to process image', 'error');
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          try {
            const batchIdFromQR = decryptQRCodeData(code.data);
            setBatchId(batchIdFromQR);
            showScanMessage('QR code scanned successfully!', 'success');
            viewBatchDetails(batchIdFromQR);
          } catch (e) {
            if (/^\d+$/.test(code.data)) {
              setBatchId(code.data);
              showScanMessage('QR code scanned successfully!', 'success');
              viewBatchDetails(code.data);
            } else {
              showScanMessage((e as Error).message, 'error');
            }
          }
        } else {
          showScanMessage('No valid QR code found in the image', 'error');
        }

        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const displayStages = (batchId: string, batch: Batch) => {
    const stages: JSX.Element[] = [];

    const createStageCard = (
      title: string,
      date: string,
      details: { [key: string]: any },
      iconPath: string,
      index: number
    ) => {
      const formattedDetails = Object.entries(details).map(([key, value]) => {
        if (value === undefined || value === null) return null;

        let formattedValue: string | JSX.Element = value;
        let extraClass = '';

        if (typeof value === 'string' && /^\d+$/.test(value)) {
          const numericValue = Number(value);
          if (key.toLowerCase() === 'duration') {
            formattedValue = `${(numericValue / 10).toFixed(1)} hours`;
          } else if (key.toLowerCase() === 'temperature') {
            formattedValue = `${(numericValue / 10).toFixed(1)}°C`;
          } else if (key.toLowerCase() === 'humidity') {
            formattedValue = `${(numericValue / 10).toFixed(1)}%`;
          } else if (key.toLowerCase() === 'pressure') {
            formattedValue = `${numericValue} bar`;
          } else if (key.toLowerCase() === 'acidity') {
            formattedValue = `${(numericValue / 10).toFixed(1)}%`;
          } else if (key.toLowerCase() === 'peroxidevalue') {
            formattedValue = `${(numericValue / 426.67).toFixed(1)} meq O2/kg`;
          } else if (key.toLowerCase() === 'quantity') {
            formattedValue = `${(numericValue / 1000).toFixed(2)} kg`;
          } else {
            formattedValue = value.toString();
          }
        } else if (key.toLowerCase().includes('id') && typeof value === 'string' && value.startsWith('0x')) {
          formattedValue = <span className="address">{value}</span>;
        } else if (key.toLowerCase() === 'conditions') {
          const cond = value.toString().toLowerCase();
          if (cond.includes('good')) extraClass = 'conditions-good text-green-600';
          else if (cond.includes('fair')) extraClass = 'conditions-fair text-yellow-600';
          else if (cond.includes('poor')) extraClass = 'conditions-poor text-red-600';
        } else if (typeof value === 'boolean') {
          formattedValue = value ? 'Yes' : 'No';
        }

        if (key.toLowerCase() === 'farmer' && typeof formattedValue === 'string') {
          formattedValue = <span className="address" title={formattedValue}>{formattedValue}</span>;
        }

        return (
          <div className="detail-item flex justify-between py-2" key={key}>
            <strong className="text-gray-700 font-medium">{formatKey(key)}</strong>
            <span className={`text-gray-600 ${extraClass}`}>{formattedValue}</span>
          </div>
        );
      }).filter(Boolean);

      return (
        <div className="relative timeline-item mb-12 last:mb-0 pl-16" key={title}>
          <div className="absolute left-0 top-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-rose-200">
            <svg className="w-8 h-8 text-rose-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d={iconPath} />
            </svg>
          </div>
          {index !== stages.length && (
            <div className="absolute left-6 top-12 w-1 h-full bg-gradient-to-b from-rose-400 to-purple-400 animate-pulse"></div>
          )}
          <div className="stage-card bg-white rounded-xl shadow-lg p-8 border-l-4 border-transparent hover:border-rose-400 transition-all duration-300">
            <div className="stage-header flex justify-between items-center mb-6">
              <h3 className="stage-title text-xl font-semibold text-gray-900">{title}</h3>
              {date && <span className="stage-date text-sm text-gray-500 font-medium">{date}</span>}
            </div>
            <div className="stage-details space-y-3">{formattedDetails}</div>
          </div>
        </div>
      );
    };

    if (batch.harvesting && batch.harvesting.date) {
      stages.push(
        createStageCard(
          'Harvesting',
          batch.harvesting.date,
          {
            farmer: batch.harvesting.farmer,
            location: batch.harvesting.location,
            method: batch.harvesting.method,
            quantity: batch.harvesting.quantity,
            variety: batch.harvesting.variety,
          },
          'M19.5 12c0-1.32-.84-2.44-2.02-2.86l-.93-3.08C16.08 5.13 14.61 4 12.9 4H11.1C9.39 4 7.92 5.13 7.45 7.06l-.93 3.08C5.34 9.56 4.5 10.68 4.5 12c0 1.32.84 2.44 2.02 2.86l.93 3.08c.47 1.93 1.94 3.06 3.65 3.06h1.8c1.71 0 3.28-1.13 3.75-3.06l.93-3.08c1.18-.42 2.02-1.54 2.02-2.86zM12 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z',
          0
        )
      );
    }

    if (batch.transportation && batch.transportation.duration) {
      stages.push(
        createStageCard(
          'Transportation',
          '',
          {
            transporterId: batch.transportation.transporterId,
            duration: batch.transportation.duration,
            vehicleType: batch.transportation.vehicleType,
            conditions: batch.transportation.conditions,
          },
          'M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3z',
          stages.length
        )
      );
    }

    if (batch.storageBeforePressing && batch.storageBeforePressing.duration) {
      stages.push(
        createStageCard(
          'Storage Before Pressing',
          '',
          {
            pressingId: batch.storageBeforePressing.pressingId,
            duration: batch.storageBeforePressing.duration,
            temperature: batch.storageBeforePressing.temperature,
            humidity: batch.storageBeforePressing.humidity,
            conditions: batch.storageBeforePressing.conditions,
            goodOlives: batch.storageBeforePressing.goodOlives,
            badOlives: batch.storageBeforePressing.badOlives,
          },
          'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z',
          stages.length
        )
      );
    }

    if (batch.pressingProcess && batch.pressingProcess.date) {
      stages.push(
        createStageCard(
          'Pressing Process',
          batch.pressingProcess.date,
          {
            pressingId: batch.pressingProcess.pressingId,
            facility: batch.pressingProcess.facility,
            method: batch.pressingProcess.method,
            temperature: batch.pressingProcess.temperature,
            pressure: batch.pressingProcess.pressure,
            operatorName: batch.pressingProcess.operatorName,
            conditions: batch.pressingProcess.conditions,
          },
          'M12 3c-4.97 0-9 3.19-9 7 0 2.38 1.19 4.47 3 5.74V19c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3.26c1.81-1.27 3-3.36 3-5.74 0-3.81-4.03-7-9-7zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
          stages.length
        )
      );
    }

    if (batch.storageAfterPressing && batch.storageAfterPressing.duration) {
      stages.push(
        createStageCard(
          'Storage After Pressing',
          '',
          {
            tankId: batch.storageAfterPressing.tankId,
            pressingId: batch.storageAfterPressing.pressingId,
            duration: batch.storageAfterPressing.duration,
            temperature: batch.storageAfterPressing.temperature,
            humidity: batch.storageAfterPressing.humidity,
            inertAtmosphere: batch.storageAfterPressing.inertAtmosphere,
            conditions: batch.storageAfterPressing.conditions,
          },
          'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z',
          stages.length
        )
      );
    }

    if (batch.qualityCheck && batch.qualityCheck.lab) {
      stages.push(
        createStageCard(
          'Quality Check',
          '',
          {
            lab: batch.qualityCheck.lab,
            onhId: batch.qualityCheck.onhId,
            acidity: batch.qualityCheck.acidity,
            quality: batch.qualityCheck.quality,
            area: batch.qualityCheck.area,
            peroxideValue: batch.qualityCheck.peroxideValue,
            certifiedOrganic: batch.qualityCheck.certifiedOrganic,
          },
          'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z',
          stages.length
        )
      );
    }

    stages.push(
      createStageCard(
        'Final Status',
        '',
        {
          batchStatus: batch.isFinalized ? 'Finalized' : 'Not Finalized',
          batchId: batchId,
        },
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
        stages.length
      )
    );

    return stages;
  };

  const checkForFraud = (batchId: string, batch: Batch) => {
    const fraudDetails: { title: string; description: string; type: 'safe' | 'warning' | 'danger' }[] = [];
    let fraudDetected = false;
    let warnings = 0;

    if (!batch.isFinalized) {
      fraudDetails.push({
        title: 'Batch Not Finalized',
        description: 'This batch has not been finalized, indicating potential incomplete processing or tampering.',
        type: 'warning',
      });
      warnings++;
    }

    if (batch.transportation && batch.transportation.conditions && typeof batch.transportation.conditions === 'string') {
      const conditions = batch.transportation.conditions.toLowerCase();
      if (conditions.includes('poor')) {
        fraudDetails.push({
          title: 'Poor Transportation Conditions',
          description: 'The olives were transported under poor conditions, potentially affecting quality.',
          type: 'warning',
        });
        warnings++;
      }
    }

    if (batch.storageBeforePressing && batch.storageBeforePressing.temperature && batch.storageBeforePressing.duration) {
      const tempBeforePressing = Number(batch.storageBeforePressing.temperature) / 10;
      if (tempBeforePressing > 25) {
        fraudDetails.push({
          title: 'High Storage Temperature Before Pressing',
          description: `Storage temperature (${tempBeforePressing.toFixed(1)}°C) exceeds recommended levels (max 25°C).`,
          type: 'warning',
        });
        warnings++;
      }

      const durationBeforePressing = Number(batch.storageBeforePressing.duration) / 10;
      if (durationBeforePressing > 48) {
        fraudDetails.push({
          title: 'Long Storage Duration Before Pressing',
          description: `Olives stored for ${durationBeforePressing.toFixed(1)} hours before pressing (max 48 hours recommended).`,
          type: 'warning',
        });
        warnings++;
      }
    }

    if (batch.qualityCheck && batch.qualityCheck.acidity && batch.qualityCheck.peroxideValue) {
      const adjustedAcidity = Number(batch.qualityCheck.acidity) / 10;
      const adjustedPeroxideValue = Number(batch.qualityCheck.peroxideValue) / 426.67;

      if (adjustedAcidity > 0.8) {
        fraudDetails.push({
          title: 'High Acidity Level',
          description: `Acidity level (${adjustedAcidity.toFixed(1)}%) exceeds extra virgin olive oil standards (max 0.8%).`,
          type: 'danger',
        });
        fraudDetected = true;
      }

      if (adjustedPeroxideValue > 20) {
        fraudDetails.push({
          title: 'High Peroxide Value',
          description: `Peroxide value (${adjustedPeroxideValue.toFixed(1)} meq O2/kg) exceeds standards (max 20 meq O2/kg).`,
          type: 'danger',
        });
        fraudDetected = true;
      }
    }

    if (batch.storageAfterPressing && batch.storageAfterPressing.temperature) {
      const tempAfterPressing = Number(batch.storageAfterPressing.temperature) / 10;
      if (tempAfterPressing > 18) {
        fraudDetails.push({
          title: 'High Storage Temperature After Pressing',
          description: `Oil stored at ${tempAfterPressing.toFixed(1)}°C (recommended max 18°C).`,
          type: 'warning',
        });
        warnings++;
      }

      if (!batch.storageAfterPressing.inertAtmosphere) {
        fraudDetails.push({
          title: 'No Inert Atmosphere During Storage',
          description: 'Oil was not stored under inert atmosphere, increasing oxidation risk.',
          type: 'warning',
        });
        warnings++;
      }
    }

    if (!batch.harvesting || !batch.pressingProcess || !batch.qualityCheck) {
      fraudDetails.push({
        title: 'Missing Critical Stages',
        description: 'One or more critical stages (harvesting, pressing, quality check) are missing.',
        type: 'danger',
      });
      fraudDetected = true;
    }

    if (fraudDetected) {
      setFraudStatus('Potential Fraud Detected');
    } else if (warnings > 0) {
      setFraudStatus(`${warnings} Quality Warnings`);
    } else {
      setFraudStatus('No Issues Detected');
      fraudDetails.push({
        title: 'All Checks Passed',
        description: 'No quality issues or fraud indicators detected in this batch.',
        type: 'safe',
      });
    }

    setFraudDetails(fraudDetails);
  };

  const viewBatchDetails = async (idToUse: string) => {
    const id = parseInt(idToUse);
    if (isNaN(id) || id < 0) {
      showError('Batch ID must be a valid non-negative integer');
      return;
    }

    let provider;
    try {
      if (!window.ethereum) {
        showError('Please install MetaMask to use this application.');
        return;
      }

      provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      setLoading(true);
      setError(null);
      setBatch(null);
      showScanMessage('Loading batch details...', 'info');

      const batchData = await contract.getBatch(id);
      if (!batchData || !batchData.harvesting) {
        throw new Error('Batch not found');
      }

      const normalizedBatch: Batch = {
        harvesting: {
          farmer: batchData.harvesting.farmer,
          date: batchData.harvesting.date,
          location: batchData.harvesting.location,
          method: batchData.harvesting.method,
          quantity: BigNumber.isBigNumber(batchData.harvesting.quantity) ? batchData.harvesting.quantity.toString() : batchData.harvesting.quantity.toString(),
          variety: batchData.harvesting.variety,
        },
        transportation: {
          duration: BigNumber.isBigNumber(batchData.transportation.duration) ? batchData.transportation.duration.toString() : batchData.transportation.duration.toString(),
          conditions: batchData.transportation.conditions,
          transporterId: batchData.transportation.transporterId,
          vehicleType: batchData.transportation.vehicleType,
        },
        storageBeforePressing: {
          duration: BigNumber.isBigNumber(batchData.storageBeforePressing.duration) ? batchData.storageBeforePressing.duration.toString() : batchData.storageBeforePressing.duration.toString(),
          pressingId: batchData.storageBeforePressing.pressingId,
          conditions: batchData.storageBeforePressing.conditions,
          temperature: BigNumber.isBigNumber(batchData.storageBeforePressing.temperature) ? batchData.storageBeforePressing.temperature.toString() : batchData.storageBeforePressing.temperature.toString(),
          humidity: BigNumber.isBigNumber(batchData.storageBeforePressing.humidity) ? batchData.storageBeforePressing.humidity.toString() : batchData.storageBeforePressing.humidity.toString(),
          goodOlives: BigNumber.isBigNumber(batchData.storageBeforePressing.goodOlives) ? batchData.storageBeforePressing.goodOlives.toString() : batchData.storageBeforePressing.goodOlives.toString(),
          badOlives: BigNumber.isBigNumber(batchData.storageBeforePressing.badOlives) ? batchData.storageBeforePressing.badOlives.toString() : batchData.storageBeforePressing.badOlives.toString(),
        },
        pressingProcess: {
          date: batchData.pressingProcess.date,
          pressingId: batchData.pressingProcess.pressingId,
          facility: batchData.pressingProcess.facility,
          method: batchData.pressingProcess.method,
          conditions: batchData.pressingProcess.conditions,
          temperature: BigNumber.isBigNumber(batchData.pressingProcess.temperature) ? batchData.pressingProcess.temperature.toString() : batchData.pressingProcess.temperature.toString(),
          pressure: BigNumber.isBigNumber(batchData.pressingProcess.pressure) ? batchData.pressingProcess.pressure.toString() : batchData.pressingProcess.pressure.toString(),
          operatorName: batchData.pressingProcess.operatorName,
        },
        storageAfterPressing: {
          tankId: batchData.storageAfterPressing.tankId,
          pressingId: batchData.storageAfterPressing.pressingId,
          duration: BigNumber.isBigNumber(batchData.storageAfterPressing.duration) ? batchData.storageAfterPressing.duration.toString() : batchData.storageAfterPressing.duration.toString(),
          conditions: batchData.storageAfterPressing.conditions,
          temperature: BigNumber.isBigNumber(batchData.storageAfterPressing.temperature) ? batchData.storageAfterPressing.temperature.toString() : batchData.storageAfterPressing.temperature.toString(),
          humidity: BigNumber.isBigNumber(batchData.storageAfterPressing.humidity) ? batchData.storageAfterPressing.humidity.toString() : batchData.storageAfterPressing.humidity.toString(),
          inertAtmosphere: batchData.storageAfterPressing.inertAtmosphere,
        },
        qualityCheck: {
          lab: batchData.qualityCheck.lab,
          onhId: batchData.qualityCheck.onhId,
          acidity: BigNumber.isBigNumber(batchData.qualityCheck.acidity) ? batchData.qualityCheck.acidity.toString() : batchData.qualityCheck.acidity.toString(),
          quality: batchData.qualityCheck.quality,
          area: batchData.qualityCheck.area,
          peroxideValue: BigNumber.isBigNumber(batchData.qualityCheck.peroxideValue) ? batchData.qualityCheck.peroxideValue.toString() : batchData.qualityCheck.peroxideValue.toString(),
          certifiedOrganic: batchData.qualityCheck.certifiedOrganic,
        },
        isFinalized: batchData.isFinalized,
      };

      setBatch(normalizedBatch);
      checkForFraud(idToUse, normalizedBatch);
      showScanMessage('', 'clear');
    } catch (err: any) {
      console.error(err);
      showError(`Error: ${err?.reason || err?.message || 'Batch not found'}`);
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    viewBatchDetails(batchId);
  };

  useEffect(() => {
    const batchIdFromUrl = searchParams.get('batchId');
    if (batchIdFromUrl) {
      setBatchId(batchIdFromUrl);
      viewBatchDetails(batchIdFromUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      <style>
        {`
          .timeline {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 0;
          }
          .timeline-item {
            position: relative;
            animation: fadeInUp 0.6s ease-out;
          }
          .stage-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .stage-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            border-color: #f43f5e;
          }
          .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
          }
          .stage-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
          }
          .stage-date {
            font-size: 0.9rem;
            color: #6b7280;
            font-weight: 500;
          }
          .stage-details {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .detail-item {
            font-size: 0.9rem;
          }
          .address {
            font-family: monospace;
            font-size: 0.85rem;
            color: #4b5563;
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .conditions-good { color: #15803d; }
          .conditions-fair { color: #d97706; }
          .conditions-poor { color: #b91c1c; }
          .fraud-section {
            max-width: 900px;
            margin: 60px auto;
            padding: 40px 0;
            position: relative;
          }
          .fraud-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 32px;
            background: linear-gradient(135deg, #fff1f2, #f3e8ff);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .fraud-icon {
            width: 40px;
            height: 40px;
            fill: #f97316;
          }
          .fraud-indicator {
            padding: 10px 20px;
            border-radius: 9999px;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .fraud-indicator.fraud-danger {
            background: #fee2e2;
            color: #b91c1c;
            border: 2px solid #b91c1c;
          }
          .fraud-indicator.fraud-warning {
            background: #fef3c7;
            color: #d97706;
            border: 2px solid #d97706;
          }
          .fraud-indicator.fraud-safe {
            background: #dcfce7;
            color: #15803d;
            border: 2px solid #15803d;
          }
          .fraud-item {
            position: relative;
            margin-bottom: 24px;
            padding-left: 56px;
            animation: fadeInUp 0.6s ease-out;
          }
          .fraud-item:last-child {
            margin-bottom: 0;
          }
          .fraud-item-icon {
            position: absolute;
            left: 0;
            top: 12px;
            width: 32px;
            height: 32px;
          }
          .fraud-item.fraud-item-danger .fraud-item-icon { color: #b91c1c; }
          .fraud-item.fraud-item-warning .fraud-item-icon { color: #d97706; }
          .fraud-item.fraud-item-safe .fraud-item-icon { color: #15803d; }
          .fraud-item-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border: 2px solid transparent;
            transition: all 0.3s ease;
          }
          .fraud-item-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            border-color: #f43f5e;
          }
          .fraud-details > .fraud-item:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 24px;
            top: 48px;
            width: 2px;
            height: calc(100% - 24px);
            background: linear-gradient(to bottom, #f43f5e, #a855f7);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 640px) {
            .timeline {
              padding: 20px 0;
            }
            .timeline-item {
              padding-left: 48px;
            }
            .timeline-item .absolute.left-0 {
              left: -8px;
            }
            .timeline-item .absolute.left-6 {
              left: 0;
            }
            .fraud-item {
              padding-left: 40px;
            }
            .fraud-item-icon {
              top: 8px;
              width: 24px;
              height: 24px;
            }
            .fraud-details > .fraud-item:not(:last-child)::after {
              left: 16px;
            }
          }
        `}
      </style>
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Trace Olive Oil Batch</h1>
            <nav className="mt-6">
              <ol className="flex justify-center space-x-2 text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li className="text-white/60">/</li>
                <li className="text-white/60">Trace Batch</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trace Your Olive Oil Batch</h3>
              <p className="text-gray-600 mb-6">
                Enter a batch ID or scan a QR code to explore the journey of your olive oil with full transparency.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Enter Batch ID"
                    className="w-full px-4 py-3 border-2 border-rose-500 rounded-lg focus:border-rose-600 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Find Batch</span>
                    </>
                  )}
                </button>
              </form>

              <div className="upload-container mt-6">
                <label
                  htmlFor="file-input"
                  className="inline-block px-6 py-3 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors cursor-pointer"
                >
                  Upload QR Code Image
                </label>
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {fileName && <div className="mt-2 text-sm text-gray-600">{fileName}</div>}
              </div>

              {scanMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
                    scanMessage.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : scanMessage.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <AlertCircle
                    className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      scanMessage.type === 'error'
                        ? 'text-red-500'
                        : scanMessage.type === 'success'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`}
                  />
                  <p className="text-sm">{scanMessage.message}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {batch && (
              <>
                <div className="max-w-2xl mx-auto mb-12">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src="/assets/img/blog/oilveoil.jpg"
                        alt="Batch Image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMyMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxNDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTA5OTQwIi8+CjxwYXRoIGQ9Ik0xNjAgMTIwTDE0MCAxMDBIMTgwTDE2MCAxMjBaIiBmaWxsPSIjMTBBOTgxIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE0Ij5PbGl2ZSBPaWw8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Package className="h-6 w-6 text-rose-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {batch.transportation?.transporterId
                            ? `${batch.transportation.transporterId.slice(0, 6)}...${batch.transportation.transporterId.slice(-4)}`
                            : 'Unknown Transporter'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">Batch ID</h5>
                          <span className="text-gray-600">{batchId}</span>
                        </div>
                        <div className="w-px h-12 bg-gray-200 mx-4" />
                        <div className="text-center flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">Status</h5>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              batch.isFinalized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {batch.isFinalized ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600 space-y-2">
                        <p>
                          <strong>Transporter ID:</strong>{' '}
                          {batch.transportation?.transporterId
                            ? `${batch.transportation.transporterId.slice(0, 6)}...${-batch.transportation.transporterId.slice(-4)}`
                            : 'Unknown'}
                        </p>
                        <p>
                          <strong>Duration:</strong>{' '}
                          {batch.transportation?.duration
                            ? `${(Number(batch.transportation.duration) / 10)} hours`
                            : 'Unknown'}
                        </p>
                        <p>
                          <strong>Conditions:</strong> {batch.transportation?.conditions || 'Unknown'}
                        </p>
                        <p>
                          <strong>Vehicle Type:</strong> {batch.transportation?.vehicleType || 'Unknown'}
                        </p>
                        <p>
                          <strong>Farmer:</strong> {batch.harvesting?.farmer || 'Unknown'}
                        </p>
                      </div>

                      <div className="mt-6 flex space-x-4">
                        {/* <a
                          href={`/transporter/batch/${batchId}`}
                          className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                        >
                          <span>More Details</span>
                          <ArrowRight className="h-5 w-5" />
                        </a> */}
                        <button
                          onClick={() => navigate('/')}
                          className="inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                        >
                          <Home className="h-5 w-5" />
                          <span>Back to Home</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container section-title" data-aos="fade-up">
                  <h2 className="text-3xl font-bold text-gray-900">Supply Chain Journey</h2>
                  <p className="text-gray-600 mt-2">
                    Trace every step of your olive oil's production process with our transparent supply chain tracking.
                  </p>
                </div>
                <div className="content">
                  <div className="container">
                    <div className="timeline">{batch && displayStages(batchId, batch)}</div>
                    <div className="fraud-section">
                      <div className="fraud-header">
                        <svg className="fraud-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                        </svg>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Fraud Detection Analysis</h3>
                          <p className="text-sm text-gray-600 mt-1">Comprehensive analysis to ensure batch integrity and quality.</p>
                        </div>
                        <div
                          className={`fraud-indicator ${
                            fraudStatus.includes('Fraud') ? 'fraud-danger' : fraudStatus.includes('Warnings') ? 'fraud-warning' : 'fraud-safe'
                          }`}
                        >
                          {fraudStatus}
                        </div>
                      </div>
                      <div className="fraud-details">
                        {fraudDetails.map((item, index) => (
                          <div key={index} className={`fraud-item fraud-item-${item.type}`}>
                            <svg className="fraud-item-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path
                                d={
                                  item.type === 'danger'
                                    ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
                                    : item.type === 'warning'
                                    ? 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
                                    : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
                                }
                              />
                            </svg>
                            <div className="fraud-item-card">
                              <div className="flex justify-between items-center mb-3">
                                <strong className="text-gray-900 font-semibold">{item.title}</strong>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    item.type === 'danger'
                                      ? 'bg-red-100 text-red-800'
                                      : item.type === 'warning'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                              </div>
                              <div className="text-gray-600 text-sm">{item.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!loading && !batch && !error && batchId && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batch Found</h3>
                <p className="text-gray-600">
                  Enter a valid batch ID or scan a QR code to search for batch details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
