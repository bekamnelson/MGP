# Fiche Google Play — MGP

À copier dans la Play Console : **Croissance > Présence sur le Play Store > Fiche principale**.

## Détails de l'application

**Nom de l'application** (30 caractères max)
```
MGP – Calculateur de Moyenne
```

**Description courte** (80 caractères max)
```
Calculez votre moyenne, votre MGP sur 4.0 et votre grade en quelques secondes.
```

**Description complète** (4000 caractères max)
```
Vous voulez connaître votre MGP avant la publication des résultats ? MGP calcule en un instant votre moyenne pondérée, votre Moyenne Générale Pondérée (MGP) sur 4.0 et votre grade, selon le système LMD.

📚 SIMPLE ET RAPIDE
• Ajoutez vos unités d'enseignement (UE) avec leurs crédits
• Saisissez vos notes : la moyenne, la MGP et le grade se mettent à jour immédiatement
• Vos UE et vos notes sont enregistrées sur votre téléphone : retrouvez-les à chaque ouverture

🎯 NOTES SUR 20 OU SUR 100
Votre établissement note sur 100 ? Changez de système en un geste : les notes déjà saisies sont converties automatiquement.

🏅 GRADE ET APPRÉCIATION
Chaque UE affiche son grade (A+, A, B+, B, B-, C+, C, C-, D, E, F), et vous obtenez votre grade global avec son appréciation, d'« Excellent » à « Nul ».

⚙️ BARÈME PERSONNALISABLE
Le barème LMD standard est inclus :
• A+ : 18 à 20 → 4.0
• A : 16 à 17.99 → 3.7
• B+ : 14 à 15.99 → 3.3
• B : 13 à 13.99 → 3.0
• B- : 12 à 12.99 → 2.7
• C+ : 11 à 11.99 → 2.3
• C : 10 à 10.99 → 2.0
• C- : 9 à 9.99 → 1.7
• D : 8 à 8.99 → 1.3
• E : 7 à 7.99 → 1.0
• F : en dessous de 7 → 0.0
Votre université utilise un autre barème ? Ajoutez, supprimez ou modifiez les tranches, puis revenez au barème standard d'un simple appui.

✅ POURQUOI CHOISIR MGP ?
• Aucun compte, aucune inscription
• Fonctionne hors connexion
• Idéal pour préparer vos semestres et suivre vos objectifs

Téléchargez MGP et dévoilez votre potentiel !
```

## Éléments graphiques

| Élément | Fichier | Format demandé |
|---|---|---|
| Icône de l'application | `icone-512.png` | PNG 512 × 512 |
| Image principale (bannière) | `banniere-1024x500.png` | PNG/JPEG 1024 × 500 |
| Captures d'écran téléphone | `capture-1-accueil.png` à `capture-4-bareme.png` | 2 à 8 images, 9:16 |

Pour régénérer les images après une modification : `python store-listing/source/generer.py`

## Catégorie et coordonnées

- **Type** : Application
- **Catégorie** : Éducation
- **Tags** : Éducation, Calculatrice
- **Adresse e-mail** : votre adresse de contact
- **Règles de confidentialité** : URL publique vers `politique-confidentialite.md` (voir plus bas)

## Contenu de l'application (Règles > Contenu de l'application)

**Annonces** : Oui, l'application contient des annonces.

**Accès à l'application** : Toutes les fonctionnalités sont disponibles sans restriction (pas de compte).

**Public cible** : 18 ans et plus (ou 16-17 ans et 18 ans et plus). Ne cochez pas de tranche de moins de 13 ans : l'application serait alors soumise au programme Familles, qui impose d'autres réglages AdMob.

**Classification du contenu** : catégorie « Référence, actualités ou éducation ». Répondez « Non » à toutes les questions sur la violence, la sexualité, le langage, les substances et les jeux d'argent. Les utilisateurs n'échangent pas de contenu entre eux.

**Identifiant publicitaire** : Oui, l'application utilise l'identifiant publicitaire (pour les annonces AdMob).

**Sécurité des données** : les notes et les UE restent sur le téléphone et ne sont jamais envoyées : ce ne sont pas des données « collectées ». Seul le SDK Google AdMob collecte des données :

| Type de données | Collectée | Partagée | Finalités |
|---|---|---|---|
| Position approximative (déduite de l'adresse IP) | Oui | Oui | Publicité, prévention des fraudes |
| Identifiants de l'appareil (identifiant publicitaire) | Oui | Oui | Publicité, analyses, prévention des fraudes |
| Activité dans l'application (interactions avec les annonces) | Oui | Oui | Publicité, analyses |
| Informations et performances de l'application (diagnostics, plantages) | Oui | Oui | Analyses, prévention des fraudes |

- Données chiffrées en transit : Oui
- Possibilité de demander la suppression des données : Non (aucun compte ; les données de l'application restent sur l'appareil et sont effacées à la désinstallation)
- Collecte obligatoire ou facultative : Obligatoire (publicité)
