import { useEffect, useState } from 'react';
import mobileAds, { AdsConsent, TestIds } from 'react-native-google-mobile-ads';

// Vraies publicités uniquement dans les builds de production (jamais en développement)
export const ENABLE_REAL_ADS = !__DEV__;

export const AD_UNIT_IDS = {
  banniereAccueil: ENABLE_REAL_ADS ? 'ca-app-pub-5542646175321041/6113122329' : TestIds.BANNER,
  banniereBareme: ENABLE_REAL_ADS ? 'ca-app-pub-5542646175321041/6963169563' : TestIds.BANNER,
  appOpen: ENABLE_REAL_ADS ? 'ca-app-pub-5542646175321041/1547191351' : TestIds.APP_OPEN,
};

// État partagé : quand l'utilisateur clique sur une bannière, il quitte l'appli.
// À son retour, on ne doit pas lui afficher une pub d'ouverture.
export const etatPubs = { ignorerProchainRetour: false };

let initialisation: Promise<boolean> | null = null;

// Recueille le consentement (RGPD / UMP) puis initialise le SDK, une seule fois.
// Renvoie true si l'on a le droit de demander des publicités.
export const initialiserPubs = () => {
  if (!initialisation) {
    initialisation = (async () => {
      let autorise = false;
      try {
        autorise = (await AdsConsent.gatherConsent()).canRequestAds;
      } catch (e) {
        // Pas de réseau, par exemple : on se fie au dernier consentement connu
        console.log('Erreur de consentement :', e);
        try {
          autorise = (await AdsConsent.getConsentInfo()).canRequestAds;
        } catch {
          autorise = false;
        }
      }
      if (autorise) {
        try {
          await mobileAds().initialize();
        } catch (e) {
          console.log("Erreur d'initialisation AdMob :", e);
        }
      }
      return autorise;
    })();
  }
  return initialisation;
};

export const usePubsAutorisees = () => {
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    let actif = true;
    initialiserPubs().then((valeur) => {
      if (actif) setAutorise(valeur);
    });
    return () => {
      actif = false;
    };
  }, []);

  return autorise;
};
