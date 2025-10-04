import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './components/Dashboard';
import Parcels from './pages/Parcels';
import Operations from './pages/dashboard/Operations';
import Personnel from './pages/dashboard/inventory/Personnel';
import Equipment from './pages/dashboard/inventory/Equipment';
import Inputs from './pages/dashboard/inventory/Inputs';
import Calendar from './pages/dashboard/Calendar';
import Weather from './pages/dashboard/Weather';
import News from './pages/dashboard/News';
import Monitoring from './pages/dashboard/Monitoring';
import OliveOilChain from './pages/dashboard/OliveOilChain';

import CreateBatch from './pages/farmer/CreateBatch';
import LoadBatches from './pages/farmer/LoadBatches';
import BatchDetails from './pages/farmer/BatchDetails';

import LogTransportation from './pages/transporter/LogTransportation';
import LoadTransportedBatches from './pages/transporter/LoadTransportedBatches';
import BatchTransportDetails from './pages/transporter/BatchDetails';
import TransporterLayout from './components/transporter/TransporterLayout';
import FindTranspoeterBatch from './pages/transporter/FindTransporterBatch';


import LogPressingProcess from './pages/pressing/LogPressingProcess';
import LoadProcessedBatches from './pages/pressing/LoadProcessedBatches';
import LogStorageBeforePressing from './pages/pressing/LogStorageBeforePressing';
import LogStorageAfterPressing from './pages/pressing/LogStorageAfterPressing';
import BatchFindPressing from './pages/pressing/BatchFindPressing';
import PressingLayout from './components/pressing/PressingLayout';

import ViewQuality from './pages/onh/ViewQuality';
import LoadBatchesQuality from './pages/onh/LoadBatchesQuality';
import BatchDetailsQuality from './pages/onh/BatchDetailsQuality';
import LogQualityCheck from './pages/onh/LogQualityCheck';
import BatchFindQuality from './pages/onh/BatchFindQuality';
import OnhLayout from './components/onh/OnhLayout';

import Trace from './components/Trace';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <WalletProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/trace" element={<Trace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/parcels"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Parcels />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operations"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Operations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/personnel"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Personnel />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/equipment"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Equipment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/inputs"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inputs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Calendar />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/weather"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Weather />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/news"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <News />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/monitoring"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Monitoring />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/olive-oil"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OliveOilChain />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Farmer blockchain pages (React) */}
          <Route path="/farmer/create" element={<CreateBatch />} />
          <Route path="/farmer/batches" element={<LoadBatches />} />
          <Route path="/farmer/batch/:batchId" element={<BatchDetails />} />

          {/* Transporter */}
          <Route path="/transporter" element={
            <ProtectedRoute>
              <TransporterLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LogTransportation />} />
            <Route path="log" element={<LogTransportation />} />
            <Route path="batches" element={<LoadTransportedBatches />} />
            <Route path="find" element={<FindTranspoeterBatch />} />
            <Route path="batch/:batchId" element={<BatchTransportDetails />} />
          </Route>

          {/* Pressing */}
          <Route path="/pressing" element={
            <ProtectedRoute>
              <PressingLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LoadProcessedBatches />} />
            <Route path="batches" element={<LoadProcessedBatches />} />
            <Route path="storage-before" element={<LogStorageBeforePressing />} />
            <Route path="log" element={<LogPressingProcess />} />
            <Route path="storage-after" element={<LogStorageAfterPressing />} />
            <Route path="find" element={<BatchFindPressing />} />
          </Route>

          {/* ONH */}
          <Route path="/onh" element={
            <ProtectedRoute>
              <OnhLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LoadBatchesQuality />} />
            <Route path="batches" element={<LoadBatchesQuality />} />
            <Route path="batch/:batchId" element={<BatchDetailsQuality />} />
            <Route path="find" element={<BatchFindQuality />} />
            <Route path="log" element={<LogQualityCheck />} />
          </Route>
          <Route path="/onh/quality" element={<ViewQuality />} />
        </Routes>
        </WalletProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;