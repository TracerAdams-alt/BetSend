import React, { useEffect, useState } from "react";
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

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import {
  diceOutline,
  chatbubblesOutline,
  personCircleOutline,
  trophyOutline,
  searchOutline,
} from "ionicons/icons";

// Pages
import LobbyPage from "./components/LobbyPage.jsx";
import BulletinPage from "./components/BulletinPage.jsx";
import AccountPage from "./components/AccountPage.jsx";
import AddContestantPage from "./components/AddContestantPage.jsx";
import LeaderboardPage from "./components/LeaderboardPage.jsx";
import SignInPage from "./components/SignInPage.jsx";
import SignUpPage from "./components/SignUpPage.jsx";
import SearchPage from "./components/SearchPage.jsx";
import PublicProfilePage from "./components/PublicProfilePage.jsx";


// Auth buttons
import AuthButtons from "./components/AuthButtons.jsx";

// Ionic global CSS
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

setupIonicReact();

const App = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Prevent auth flicker
  if (!authReady) {
    return <IonApp className="casino-app" />;
  }

  return (
    <IonApp className="casino-app">
      <IonReactRouter>

        {/* GLOBAL AUTH ENTRY */}
        <AuthButtons user={user} />

        <IonTabs>
          <IonRouterOutlet>

            {/* MAIN ROUTES */}
            <Route path="/lobby" component={LobbyPage} exact />
            <Route path="/leaderboard" component={LeaderboardPage} exact />
            <Route path="/bulletin" component={BulletinPage} exact />
            <Route path="/search" component={SearchPage} exact />
            <Route path="/add-contestant" component={AddContestantPage} exact />
            <Route path="/profile/:uid" component={PublicProfilePage} exact/>


            {/* PROTECTED ACCOUNT */}
            <Route
              path="/account"
              exact
              render={() =>
                user ? <AccountPage /> : <Redirect to="/signin" />
              }
            />

            {/* AUTH ROUTES */}
            <Route path="/signin" component={SignInPage} exact />
            <Route path="/signup" component={SignUpPage} exact />

            {/* DEFAULT */}
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

            <IonTabButton tab="leaderboard" href="/leaderboard">
              <IonIcon icon={trophyOutline} />
              <IonLabel>Leaderboard</IonLabel>
            </IonTabButton>

            <IonTabButton tab="bulletin" href="/bulletin">
              <IonIcon icon={chatbubblesOutline} />
              <IonLabel>Bulletin</IonLabel>
            </IonTabButton>

            <IonTabButton tab="search" href="/search">
              <IonIcon icon={searchOutline} />
              <IonLabel>Search</IonLabel>
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
