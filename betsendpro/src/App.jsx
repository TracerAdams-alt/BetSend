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
  gameControllerOutline,
  personCircleOutline,
  trophyOutline,
} from "ionicons/icons";

import LobbyPage from "./components/LobbyPage.jsx";
import GamePage from "./components/GamePage.jsx";
import AccountPage from "./components/AccountPage.jsx";
import SignUpPage from "./components/SignUpPage.jsx";
import SignInPage from "./components/SignInPage.jsx";
import LeaderboardPage from "./components/LeaderboardPage.jsx";
import AuthButtons from "./components/AuthButtons.jsx";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

setupIonicReact();

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false); // ⭐ FIX FOR REFRESH LOOP

  // Listen for real auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true); // ⭐ Mark authentication as fully loaded
    });

    return () => unsub();
  }, []);

  // ⭐ Prevent app from rendering before Firebase finishes loading user session
  if (!authLoaded) {
    return (
      <IonApp>
        <div style={{ padding: 40, color: "white", textAlign: "center" }}>
          Loading…
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp className="casino-app">
      <IonReactRouter>

        {/* 🔥 Always show Auth Buttons at the top when signed out */}
        <AuthButtons />

        <IonTabs>
          <IonRouterOutlet>

            {/* MAIN ROUTES */}
            <Route path="/lobby" component={LobbyPage} exact />
            <Route path="/game" component={GamePage} exact />
            <Route path="/leaderboard" component={LeaderboardPage} exact />

            {/* PROTECTED ACCOUNT PAGE */}
            <Route
              path="/account"
              exact
              render={() =>
                user ? <AccountPage /> : <Redirect to="/signin" />
              }
            />

            {/* AUTH PAGES */}
            <Route path="/signup" component={SignUpPage} exact />
            <Route path="/signin" component={SignInPage} exact />

            {/* DEFAULT ROUTE */}
            <Route exact path="/">
              <Redirect to="/lobby" />
            </Route>

          </IonRouterOutlet>

          {/* BOTTOM NAV TABS */}
          <IonTabBar slot="bottom">

            <IonTabButton tab="lobby" href="/lobby">
              <IonIcon icon={diceOutline} />
              <IonLabel>Lobby</IonLabel>
            </IonTabButton>

            <IonTabButton tab="game" href="/game">
              <IonIcon icon={gameControllerOutline} />
              <IonLabel>Game</IonLabel>
            </IonTabButton>

            <IonTabButton tab="leaderboard" href="/leaderboard">
              <IonIcon icon={trophyOutline} />
              <IonLabel>Leaders</IonLabel>
            </IonTabButton>

            {/* Account tab only when logged in */}
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
