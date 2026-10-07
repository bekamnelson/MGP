# Journal de développement — MGP

Résumé des sessions de travail avec Claude Code (septembre–octobre 2026).

## 1. Analyse et corrections de bugs

- **Publicités** (`utils/ads.ts`)
  - Les vraies pubs s'activent automatiquement en production (`ENABLE_REAL_ADS = !__DEV__`) ; les pubs de test restent en développement.
  - Le consentement UMP est recueilli et le SDK initialisé avant tout chargement de pub.
  - La pub d'ouverture s'affiche au plus une fois toutes les 3 min. Une pub chargée depuis plus de 4 h est renouvelée, et aucune pub ne s'affiche au retour après un clic sur une bannière.
- **Calcul**
  - Plus aucune note ne tombe entre deux tranches : chaque tranche va de son minimum jusqu'au minimum de la suivante.
  - Notes limitées à 2 décimales, crédits obligatoirement supérieurs à 0.
- **Barème** : la détection des tranches qui se chevauchent prend en compte une tranche qui en englobe une autre. Supprimer une tranche demande une confirmation.
- **Données** (`context/GradeContext.tsx`)
  - Les notes sont sauvegardées.
  - L'app attend la fin du chargement avant d'afficher quoi que ce soit, donc aucune modification n'est écrasée.
  - Les erreurs de sauvegarde sont gérées.
- **Affichage** : `SafeAreaView` vient de `react-native-safe-area-context`, et le thème clair est forcé.
- **Nettoyage** : suppression de `withPlayServicesAdsVersion.js`, inutile car la librairie impose déjà `play-services-ads` 24.3.0.

## 2. Barème, grades et système de notation

- Nouveau barème avec grade et appréciation, de A+ (18–20, 4.0) à F (0–6.99, 0.0). **En dessous de 7, la MGP vaut 0.**
- Chaque UE affiche son grade, et un grade global est calculé à partir de la MGP.
- Choix **/20 ou /100** sur l'écran principal :
  - les notes déjà saisies sont converties ;
  - le barème reste défini sur 20, et une note sur 100 est divisée par 5 pour trouver sa tranche.

## 3. Tests

- Jest (`jest-expo`) et React Native Testing Library v14 ; lancer les tests avec `npm test`.
- 43 tests dans `__tests__/` : le calcul (barème, grades, /100, pondération) et le contexte (chargement, sauvegarde, conversion).

## 4. Fiche Play Store (`store-listing/`)

- Icône 512×512, bannière 1024×500 et 4 captures 1080×1920, régénérables avec `python store-listing/source/generer.py`.
- `fiche.md` : nom, descriptions et réponses aux formulaires de la Play Console (sécurité des données, public cible, classification).
- `politique-confidentialite.md` : à mettre en ligne à une adresse publique.

## 5. Builds EAS (production, AAB)

| versionCode | Commit | Contenu |
|---|---|---|
| 2 | `be0e5f8` | Corrections, grades, /20 ou /100, tests |
| 3 | commit qui ajoute ce journal | R8 activé, orientation libre, mise en page adaptée au paysage et aux tablettes |

- `eas.json` : `autoIncrement` activé en production, et le `versionCode` est géré par EAS.
- Les `.aab` téléchargés sont dans `builds/`, qui n'est pas suivi par git.

## 6. Avertissements de la Play Console (version 2)

| Avertissement | Statut |
|---|---|
| Obscurcissement DEX à 1 % | Corrigé en version 3 : R8 (`enableMinifyInReleaseBuilds`) et réduction des ressources. Environ 31 % des classes ont un nom raccourci. |
| Restrictions d'orientation sur grand écran | Corrigé en version 3 : `orientation: "default"`, en-têtes qui défilent avec la liste, largeur maximale de 720 dp. |
| API obsolètes de bord à bord (Android 15) | Pas corrigeable dans le code de l'app : les appels viennent des librairies (androidx, React Native, Material, react-native-screens, expo-navigation-bar). `setBehaviorAsync`, non pris en charge, a été retiré. |

## Reste à faire

- [ ] Tester la version 3 en **test interne** sur un vrai téléphone, pour vérifier que R8 ne fait rien planter.
- [ ] Mettre en ligne la politique de confidentialité et renseigner l'adresse e-mail de contact.
- [ ] Créer le message de consentement RGPD dans AdMob (« Confidentialité et messages »).
- [ ] Ajouter son téléphone comme appareil de test AdMob, et ne jamais cliquer sur ses propres pubs.
- [ ] Remplacer l'ID d'app AdMob iOS de test dans `app.json` si l'app sort sur iOS.
- [ ] Associer l'app AdMob à la fiche Play Store après publication, et publier `app-ads.txt`.
- [ ] Fusionner la branche `feat/corrections-grades-systeme-tests` dans `main`.
- [ ] Optionnel : supprimer le code inutilisé du modèle Expo (`explore.tsx`, `modal.tsx`, `components/`, `hooks/`) et ajouter des tests des écrans.
