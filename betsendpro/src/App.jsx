import React, { useState, useEffect } from "react";
import {
  IonApp,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";

import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";

import {
  diceOutline,
  personCircleOutline,
  trophyOutline,
  browsersOutline,  // 👈 needed for Bulletin tab
} from "ionicons/icons";

// Pages
import LobbyPage from "./components/LobbyPage.jsx";
import BulletinPage from "./components/BulletinPage.jsx";   // 👈 UPDATED
import AccountPage from "./components/AccountPage.jsx";
import SignUpPage from "./components/SignUpPage.jsx";
import SignInPage from "./components/SignInPage.jsx";
import LeaderboardPage from "./components/LeaderboardPage.jsx";

// UI Components
import AuthButtons from "./components/AuthButtons.jsx";
import WelcomeModal from "./components/WelcomeModal.jsx";

// Firebase
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

setupIonicReact();

const App = () => {
  const [user, setUser] = useState(null);

  // Listen for login/logout state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  return (
    <IonApp className="casino-app">
      {/* Welcome message modal */}
      <WelcomeModal />

      <IonReactRouter>
        {/* Sign In / Sign Up bar (only shows if logged out) */}
        <AuthButtons />

        <IonTabs>
          <IonRouterOutlet>

            {/* MAIN ROUTES */}
            <Route path="/lobby" component={LobbyPage} exact />

            {/* BULLETIN ROUTE (replaces Game) */}
            <Route path="/bulletin" component={BulletinPage} exact />

            <Route path="/leaderboard" component={LeaderboardPage} exact />

            {/* ACCOUNT PAGE — only for logged-in users */}
            <Route
              path="/account"
              exact
              render={() =>
                user ? <AccountPage /> : <Redirect to="/signin" />
              }
            />

            {/* AUTH ROUTES */}
            <Route path="/signup" component={SignUpPage} exact />
            <Route path="/signin" component={SignInPage} exact />

            {/* DEFAULT REDIRECT */}
            <Route exact path="/">
              <Redirect to="/lobby" />
            </Route>

          </IonRouterOutlet>

          {/* BOTTOM TAB BAR */}
          <IonTabBar slot="bottom">
            <IonTabButton tab="lobby" href="/lobby">
              <IonIcon icon={diceOutline} />
              <IonLabel>Lobby</IonLabel>
            </IonTabButton>

            <IonTabButton tab="bulletin" href="/bulletin">
              <IonIcon icon={browsersOutline} />
              <IonLabel>Bulletin</IonLabel>
            </IonTabButton>

            <IonTabButton tab="leaderboard" href="/leaderboard">
              <IonIcon icon={trophyOutline} />
              <IonLabel>Leaders</IonLabel>
            </IonTabButton>

            {user && (
              <IonTabButton tab="account" href="/account">
                <IonIcon icon={personCircleOutline} />
                <IonLabel>Account</IonLabel>
              </IonTabButton>
            )}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
