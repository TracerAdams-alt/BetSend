import React from "react";
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
} from "ionicons/icons";


import LobbyPage from "./components/LobbyPage.jsx";
import GamePage from "./components/GamePage.jsx";
import AccountPage from "./components/AccountPage.jsx";
import SignUpPage from "./components/SignUpPage.jsx";

setupIonicReact();

const App = () => {
  return (
    <IonApp className="casino-app">
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {/* MAIN ROUTES */}
            <Route path="/lobby" component={LobbyPage} exact />
            <Route path="/game" component={GamePage} exact />
            <Route path="/account" component={AccountPage} exact />

            {/* SIGN UP ROUTE (no tab button, just a regular page) */}
            <Route path="/signup" component={SignUpPage} exact />

            {/* DEFAULT: send unknown/ root to lobby */}
            <Route exact path="/">
              <Redirect to="/lobby" />
            </Route>
          </IonRouterOutlet>

          {/* TAB BAR */}
          <IonTabBar slot="bottom">
            <IonTabButton tab="lobby" href="/lobby">
              <IonIcon icon={diceOutline} />
              <IonLabel>Lobby</IonLabel>
            </IonTabButton>

            <IonTabButton tab="game" href="/game">
              <IonIcon icon={gameControllerOutline} />
              <IonLabel>Game</IonLabel>
            </IonTabButton>

            <IonTabButton tab="account" href="/account">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>Account</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
