# Modèles Acuity — Mariekey Expert (pour la cheffe de projet)

Trois blocs prêts à coller dans Acuity, aux couleurs du site (crème, beige, marron, noir). Ils utilisent uniquement du HTML simple avec styles intégrés, compatible avec les champs de description d'Acuity. Aucune photo de cliente.

| Fichier | Où le coller dans Acuity |
|---|---|
| `01-accueil.html` | Apparence > Page de réservation > texte d'accueil / description |
| `02-reservation.html` | Description de chaque type de rendez-vous (Types de rendez-vous > modifier > Description) |
| `03-preparation.html` | Message de confirmation, ou description des prestations concernées (perruque, makeup) |
| `emails.md` | Paramètres > E-mails client : confirmation, rappel, annulation |
| `*.png` | Aperçus visuels de chaque bloc (avec le logo) ; utilisables comme visuels de référence |

## Mode d'emploi
1. Ouvrir le fichier `.html`, tout sélectionner, copier.
2. Dans Acuity, ouvrir le champ cité, passer en mode « Code source » / HTML si proposé, coller, enregistrer.
3. Si le champ n'accepte que du texte brut, utiliser le texte de `emails.md` (mêmes informations).
4. Vérifier le rendu sur la page de réservation (téléphone et ordinateur).

## Modifier une règle
Chaque règle est une ligne `<p>…</p>` : changer uniquement le texte (ex. 48 h, 10 €, 4 jours). Garder les mêmes règles dans les e-mails.

## À faire valider par le salon
Acompte obligatoire (montant à définir dans Acuity), modification 48 h, retard 15 min = 10 €, 30 min = annulation/report, perruque 4 jours avant. Ces chiffres viennent de la maquette.
