import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, etatPubs, usePubsAutorisees } from '../../utils/ads';

// Pas plus d'une pub d'ouverture toutes les 3 minutes
const DELAI_MIN_ENTRE_PUBS = 3 * 60 * 1000;
// Google recommande de ne pas afficher une pub d'ouverture chargée depuis plus de 4 h
const DUREE_VALIDITE_PUB = 4 * 60 * 60 * 1000;

const creerPub = () =>
  AppOpenAd.createForAdRequest(AD_UNIT_IDS.appOpen, {
    requestNonPersonalizedAdsOnly: true,
  });

export default function TabLayout() {
  const pubsAutorisees = usePubsAutorisees();

  // SÉCURITÉ : On utilise des refs pour savoir si la pub est DÉJÀ à l'écran
  // Cela évite que l'appli essaie de l'ouvrir 2 fois et fasse crasher AdMob
  const isAdShowing = useRef(false);
  const chargeeLe = useRef(0);
  const dernierAffichage = useRef(0);

  useEffect(() => {
    if (!pubsAutorisees) return;

    let pub = creerPub();
    let desabonnements: (() => void)[] = [];

    const brancher = () => {
      desabonnements = [
        pub.addAdEventListener(AdEventType.LOADED, () => {
          chargeeLe.current = Date.now();
        }),
        pub.addAdEventListener(AdEventType.OPENED, () => {
          isAdShowing.current = true;
          dernierAffichage.current = Date.now();
        }),
        // Quand l'utilisateur ferme la pub, on en précharge une nouvelle
        pub.addAdEventListener(AdEventType.CLOSED, () => {
          isAdShowing.current = false;
          pub.load();
        }),
        // SÉCURITÉ : Gestion des erreurs (si pas de connexion internet par exemple)
        pub.addAdEventListener(AdEventType.ERROR, (error) => {
          console.log('Erreur App Open Ad :', error);
          isAdShowing.current = false;
        }),
      ];
      pub.load();
    };

    // Une pub expirée ne peut pas être rechargée : on crée une nouvelle instance
    const renouveler = () => {
      desabonnements.forEach((d) => d());
      pub = creerPub();
      brancher();
    };

    brancher();

    // On écoute l'état de l'application (arrière-plan -> premier plan)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') return;

      // Retour après un clic sur une bannière : pas de pub
      if (etatPubs.ignorerProchainRetour) {
        etatPubs.ignorerProchainRetour = false;
        return;
      }
      if (isAdShowing.current) return;

      if (!pub.loaded) {
        pub.load(); // sans effet si un chargement est déjà en cours
        return;
      }
      if (Date.now() - chargeeLe.current > DUREE_VALIDITE_PUB) {
        renouveler();
        return;
      }
      if (Date.now() - dernierAffichage.current < DELAI_MIN_ENTRE_PUBS) return;

      isAdShowing.current = true;
      pub.show().catch((e) => {
        console.log("Erreur d'affichage App Open Ad :", e);
        isAdShowing.current = false;
      });
    });

    // Nettoyage à la fermeture du composant
    return () => {
      desabonnements.forEach((d) => d());
      appStateSubscription.remove();
    };
  }, [pubsAutorisees]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Masque la barre d'onglets tout en conservant la structure
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}
