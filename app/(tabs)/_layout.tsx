import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// 1. Importation des modules AdMob
import { AdEventType, AppOpenAd, TestIds } from 'react-native-google-mobile-ads';
import { ENABLE_REAL_ADS } from "./index";
// 2. Configuration de l'ID (Test en dev, Vrai ID en prod)
// L'ID correspond parfaitement à votre capture d'écran !
const REAL_APP_OPEN = 'ca-app-pub-5542646175321041/1547191351';
export const adUnitIdAppOpen = ENABLE_REAL_ADS ? REAL_APP_OPEN : TestIds.APP_OPEN;
// 3. Création de l'instance de la publicité en dehors du composant
const appOpenAd = AppOpenAd.createForAdRequest(adUnitIdAppOpen, {
  requestNonPersonalizedAdsOnly: true,
});

export default function TabLayout() {
  // SÉCURITÉ : On utilise useRef pour savoir si la pub est DÉJÀ à l'écran
  // Cela évite que l'appli essaie de l'ouvrir 2 fois et fasse crasher AdMob
  const isAdShowing = useRef(false);

  useEffect(() => {
    // 4. On charge la publicité dès le lancement de l'application
    appOpenAd.load();

    // 5. Quand l'utilisateur ferme la pub
    const unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      isAdShowing.current = false; // La pub n'est plus à l'écran
      appOpenAd.load(); // On en précharge une nouvelle pour la prochaine fois
    });

    // SÉCURITÉ : Gestion des erreurs (si pas de connexion internet par exemple)
    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Erreur de chargement App Open Ad:', error);
      isAdShowing.current = false;
    });

    // 6. On écoute l'état de l'application (arrière-plan -> premier plan)
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      // Si l'application revient au premier plan (active)
      if (nextAppState === 'active') {
        // Si la pub est prête ET qu'elle n'est pas déjà en train de s'afficher
        if (appOpenAd.loaded && !isAdShowing.current) {
          isAdShowing.current = true;
          appOpenAd.show();
        } else if (!appOpenAd.loaded) {
          // Sinon, on essaie de la charger
          appOpenAd.load();
        }
      }
    });

    // Nettoyage à la fermeture du composant
    return () => {
      unsubscribeClosed();
      unsubscribeError();
      appStateSubscription.remove();
    };
  }, []);

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