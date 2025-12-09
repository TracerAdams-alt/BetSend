import React, { useState } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/react'

const GamePage = () => {
  const [balance, setBalance] = useState(1000) // placeholder
  const [bet, setBet] = useState(10)
  const [result, setResult] = useState(null)

  const placeBet = () => {
    const betAmount = Number(bet) || 0
    if (betAmount <= 0 || betAmount > balance) {
      setResult('Invalid bet amount.')
      return
    }

    // Very simple mock game: 50/50 win or lose
    const win = Math.random() < 0.5
    const newBalance = win ? balance + betAmount : balance - betAmount
    setBalance(newBalance)
    setResult(win ? `You won ${betAmount}!` : `You lost ${betAmount}.`)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Lucky Dice</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding casino-background">
        <IonText color="light">
          <h2>Balance: ${balance}</h2>
        </IonText>

        <IonItem className="ion-margin-top">
          <IonLabel position="stacked">Bet Amount</IonLabel>
          <IonInput
            type="number"
            value={bet}
            onIonChange={(e) => setBet(e.detail.value)}
          />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={placeBet}>
          Place Bet
        </IonButton>

        {result && (
          <IonText color="light">
            <p className="ion-margin-top">{result}</p>
          </IonText>
        )}

        <IonText color="medium">
          <p className="ion-margin-top" style={{ fontSize: '0.8rem' }}>
            This is just demo logic. Make sure any real-money implementation follows local laws,
            age restrictions, and responsible gambling guidelines.
          </p>
        </IonText>
      </IonContent>
    </IonPage>
  )
}

export default GamePage
