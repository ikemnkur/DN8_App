import React, { useCallback, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import Info from './components/Info';
import TransactionHistory from './components/TransactionHistory';
import SendMoney from './components/SendMoney';
import ReceivedPayments from './components/ReceivedPayments';
import { CheckoutForm, Return } from "./components/Stripe";
import { CoinBaseCheckoutForm } from "./components/CoinBaseCheckoutForm";
import { CashappCheckoutForm } from "./components/CashappCheckoutForm";
import { CryptoCheckoutForm } from "./components/CryptoCheckoutForm";
import ReloadWallet from './components/ReloadWallet';
import ConvertWallet from './components/ConvertWallet';
import WithdrawWallet from './components/WithdrawWallet';
import SearchUser from './components/Search4User';
import UserProfile from './components/UserProfile';
import ShareWallet from './components/ShareWallet';
import Messages from './components/Messages';
import Account from './components/Account';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Wallet from './components/Wallet';
import UnlockContent from './components/UnlockContent';
import Subscriptions from './components/ManageSubscriptions';
import ManageContent from './components/ManageContent';
import AddToWallet from './components/AddToWallet';
import YourStuff from './components/YourStuff';
import OtherUserStuff from './components/OtherUserStuff';
import AdminDashboard from './components/AdminDashboard';
import AdminPurchasesPage from './components/adminPurchases';
import AdminWithdrawsPage from './components/adminWithdraws';
import ProtectedRoute from './components/ProtectedRoute';
import SubscribeToContent from "./components/SubscribeToContent";
import UserManagement from "./components/UserManagement";
import HelpPage from "./components/HelpPage";


import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { fetchUserProfile, walletStripeReloadAction, walletWithdrawAction } from "./components/api";
import UpgradeAccountPage from "./components/UpgradeAccountPage";
import DowngradeAccountPage from "./components/DowngradeAccountPage";

import AdHelpPage from "./pages/AdHelpPage";
import AdAnalyticsPage from "./pages/AdAnalyticsPage.jsx";
import AdDashboardPage from "./pages/AdDashboardPage.jsx";
import ManageAdsPage from "./pages/ManageAdsPage";
import CreateAdPage from "./pages/CreateAdPage";
import AdPreviewPage from "./pages/AdPreviewPage";
import AdHomepage from "./pages/AdHomepage.jsx";
import JoinAdProgram from "./pages/JoinAdProgram";
import LoginToAdProgram from "./pages/LoginToAdProgram.jsx";
import AdObject from "./pages/AdObject";
import DisplayAd from "./pages/DisplayAd.jsx";
import AdsHeader from "./pages/AdsHeader.jsx";
import AdsActivatePage from "./pages/AdsActivatePage.jsx";
// import AdHomepage from "./pages/AdHomepage.jsx";



// import Ads from "./components/Ads";
// import Ads from "../src/components/Ads.js";



require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
// import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe('pk_test_51OPgiOEViYxfJNd2ZA0pYlZ3MKdsIHDEhE9vzihdcj6CUW99q7ULSgR44nWfNVwhKvEHJ1JQCaf1NcXGhTROu8Dh008XrwD0Hv');

function App() {

  // const navigate = useNavigate();
  const [coins, setCoins] = useState();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    encryptionKey: '',
    accountTier: 1,
    profilePicture: null,
    coins: 0,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Auth isLogin={true} />} />
            {/* <Route path="/" element={<Auth isLogin={true} />} /> */}
            <Route path="/register" element={<Auth isLogin={false} />} />
            <Route path="/unlock/:itemid" element={<UnlockContent />} />
            <Route path="/help" element={<HelpPage />} />

            

            {/* Protected Routes */}
            <Route path="/adminx" element={
              <ProtectedRoute> <AdminDashboard /> </ProtectedRoute>} />
            <Route path="/dashboard" element={
              <ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path="/" element={<Info />} />
            <Route path="/info" element={<Info />} />

            <Route path="/transactions" element={
              <ProtectedRoute> <TransactionHistory /> </ProtectedRoute>} />
            <Route path="/send" element={
              <ProtectedRoute> <SendMoney /> </ProtectedRoute>} />
            <Route path="/reload" element={
              <ProtectedRoute> <ReloadWallet /> </ProtectedRoute>} />
            <Route path="/convert" element={
              <ProtectedRoute> <ConvertWallet /> </ProtectedRoute>} />
            <Route path="/withdraw" element={
              <ProtectedRoute> <WithdrawWallet /> </ProtectedRoute>} />
            <Route path="/search" element={
              <ProtectedRoute> <SearchUser /> </ProtectedRoute>} />
            <Route path="/user/:userId" element={
              <ProtectedRoute> <UserProfile /> </ProtectedRoute>} />
            <Route path="/share" element={
              <ProtectedRoute> <ShareWallet /> </ProtectedRoute>} />
            <Route path="/messages" element={
              <ProtectedRoute> <Messages /> </ProtectedRoute>} />
            <Route path="/messages/:username" element={
              <ProtectedRoute> <Messages /> </ProtectedRoute>} />
            <Route path="/upgrade-account" element={
              <ProtectedRoute> < UpgradeAccountPage /> </ProtectedRoute>} />
            <Route path="/downgrade-account" element={
              <ProtectedRoute> < DowngradeAccountPage /> </ProtectedRoute>} />
            <Route path="/account" element={
              <ProtectedRoute> <Account /> </ProtectedRoute>} />
            <Route path="/settings" element={
              <ProtectedRoute> <Settings /> </ProtectedRoute>} />
            <Route path="/wallet" element={
              <ProtectedRoute> <Wallet /> </ProtectedRoute>} />
            <Route path="/manage-subscriptions" element={
              <ProtectedRoute> <Subscriptions /> </ProtectedRoute>} />
            <Route path="/subscribe/:itemid" element={
              <ProtectedRoute> <SubscribeToContent /> </ProtectedRoute>} />
            <Route path="/manage-content" element={
              <ProtectedRoute> <ManageContent /> </ProtectedRoute>} />
            <Route path="/reload-wallet" element={
              <ProtectedRoute> <AddToWallet /> </ProtectedRoute>} />
            <Route path="/your-stuff" element={
              <ProtectedRoute> <YourStuff /> </ProtectedRoute>} />
            <Route path="/user-posts/:user" element={
              <ProtectedRoute> <OtherUserStuff /> </ProtectedRoute>} />
            <Route path="/Admin" element={
              <ProtectedRoute> <AdminDashboard /> </ProtectedRoute>} />
            {/* <Route path="/admin-purchases" element={
              <ProtectedRoute> <AdminPurchasesPage /> </ProtectedRoute>} />
            <Route path="/admin-withdraws" element={
              <ProtectedRoute> <AdminWithdrawsPage /> </ProtectedRoute>} /> */}
            <Route path="/stripe-checkout" element={
              <ProtectedRoute> <CheckoutForm setCoins={setCoins} /> </ProtectedRoute>} />
            <Route path="/crypto-checkout" element={
              <ProtectedRoute> <CryptoCheckoutForm setCoins={setCoins} /> </ProtectedRoute>} />
            <Route path="/cashapp-checkout" element={
              <ProtectedRoute> <CashappCheckoutForm setCoins={setCoins} /> </ProtectedRoute>} />
            <Route path="/coinbase-checkout" element={
              <ProtectedRoute> <CoinBaseCheckoutForm setCoins={setCoins} /> </ProtectedRoute>} />
            <Route path="/return" element={
              <ProtectedRoute> <Return /> </ProtectedRoute>} />
            <Route path="/test" element={
              <ProtectedRoute> <UserManagement /> </ProtectedRoute>} />
              {/* Ad Service Pages */}
            <Route path="/create-ad" element={
              <ProtectedRoute> <CreateAdPage /> </ProtectedRoute>} />
            <Route path="/ad-help" element={
              <ProtectedRoute> <AdHelpPage /> </ProtectedRoute>} />
            <Route path="/ad-analytics" element={
              <ProtectedRoute> <AdAnalyticsPage /> </ProtectedRoute>} />
             <Route path="/ad-dashboard" element={
              <ProtectedRoute> <AdDashboardPage /> </ProtectedRoute>} />
            <Route path="/manage-ads" element={
              <ProtectedRoute> <ManageAdsPage /> </ProtectedRoute>} />
            <Route path="/preview-ad/:id" element={
              <ProtectedRoute> <AdPreviewPage /> </ProtectedRoute>} />
            <Route path="/preview/pending-ad/" element={
              <ProtectedRoute> <AdPreviewPage /> </ProtectedRoute>} />
            <Route path="/ads-homepage" element={
              <ProtectedRoute> <AdHomepage /> </ProtectedRoute>} />
            <Route path="/ads-activate" element={
              <ProtectedRoute> <AdsActivatePage /> </ProtectedRoute>} />
            <Route path="/ads-join" element={
              <ProtectedRoute> <JoinAdProgram /> </ProtectedRoute>} />
            <Route path="/ads-login" element={
              <ProtectedRoute> <LoginToAdProgram /> </ProtectedRoute>} />
            <Route path="/ads-service" element={
              <ProtectedRoute> <AdsHeader /> </ProtectedRoute>} /> 
            <Route path="/test-ad" element={
              <ProtectedRoute> <AdObject /> </ProtectedRoute>} />
            <Route path="/display-ad" element={<DisplayAd /> } />


          </Routes>
        </NavBar>
      </Router>
    </ThemeProvider>
  );
}

export default App;