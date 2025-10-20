# Guide de Test - Migration Database vers PostgreSQL

## 🎯 Objectif
Vérifier que toutes les fonctionnalités de database fonctionnent correctement avec PostgreSQL.

## ✅ Tests Backend (Complétés)

Les tests backend ont été exécutés avec succès via la commande :
```bash
docker-compose exec app-dev python manage.py test_database_api
```

**Résultats** : ✅ Tous les tests passent
- ✅ Création de database
- ✅ Création de propriété (Select avec options)
- ✅ Création de vue (Board)
- ✅ Création de ligne
- ✅ Mise à jour de ligne
- ✅ Ajout de filtres à une vue
- ✅ Sérialisation complète
- ✅ Liste des databases
- ✅ Suppression de ligne
- ✅ Soft delete de database

## 🧪 Tests Frontend (À faire manuellement)

### Prérequis
1. Backend Django en cours d'exécution : `docker-compose up`
2. Frontend Next.js en cours d'exécution : `npm run dev`
3. Navigateur ouvert sur `http://localhost:3000`

### Test 1 : Création d'une Database
1. Ouvrir un document
2. Taper `/database` dans l'éditeur
3. Sélectionner "Database" dans le menu
4. Cliquer sur "Create new database"
5. Vérifier qu'une nouvelle database est créée

**Vérification** :
- [ ] La database apparaît dans le document
- [ ] La database a une vue Table par défaut
- [ ] Aucune erreur dans la console

### Test 2 : Ajout de Propriétés
1. Dans la database créée, cliquer sur le bouton "+"
2. Ajouter une propriété "Name" de type Text
3. Ajouter une propriété "Status" de type Select
4. Ajouter des options : "Todo", "In Progress", "Done"
5. Ajouter une propriété "Date" de type Date

**Vérification** :
- [ ] Les propriétés apparaissent comme colonnes dans la vue Table
- [ ] Les types de propriétés sont corrects
- [ ] Les options Select sont sauvegardées
- [ ] Rafraîchir la page : les propriétés sont toujours là

### Test 3 : Ajout de Lignes
1. Cliquer sur "New" pour ajouter une ligne
2. Remplir les champs (Name, Status, Date)
3. Ajouter 3-4 lignes avec des données différentes

**Vérification** :
- [ ] Les lignes apparaissent dans la table
- [ ] Les valeurs sont sauvegardées
- [ ] Rafraîchir la page : les lignes sont toujours là
- [ ] Les dates sont formatées correctement

### Test 4 : Modification de Lignes
1. Cliquer sur une cellule pour l'éditer
2. Modifier le texte
3. Changer le statut
4. Modifier la date

**Vérification** :
- [ ] Les modifications sont sauvegardées immédiatement
- [ ] Rafraîchir la page : les modifications sont persistées
- [ ] Aucune erreur dans la console

### Test 5 : Suppression de Lignes
1. Cliquer sur le menu "..." d'une ligne
2. Sélectionner "Delete"
3. Confirmer la suppression

**Vérification** :
- [ ] La ligne disparaît de la table
- [ ] Rafraîchir la page : la ligne est toujours supprimée

### Test 6 : Création de Vues
1. Cliquer sur le menu déroulant des vues (à côté de "Table")
2. Cliquer sur "Add a view"
3. Créer une vue "Board" (Kanban)
4. Créer une vue "List"
5. Créer une vue "Calendar"
6. Créer une vue "Gallery"

**Vérification** :
- [ ] Toutes les vues sont créées
- [ ] On peut basculer entre les vues
- [ ] Les données sont les mêmes dans toutes les vues
- [ ] Rafraîchir la page : les vues sont toujours là

### Test 7 : Vue Board (Kanban)
1. Basculer vers la vue Board
2. Sélectionner "Status" comme propriété de groupement
3. Vérifier que les colonnes "Todo", "In Progress", "Done" apparaissent
4. Glisser-déposer une carte d'une colonne à l'autre

**Vérification** :
- [ ] Les colonnes correspondent aux options Select
- [ ] Le drag & drop fonctionne
- [ ] Le statut de la ligne est mis à jour
- [ ] Rafraîchir la page : le changement est persisté

### Test 8 : Vue List
1. Basculer vers la vue List
2. Vérifier que toutes les lignes apparaissent
3. Cliquer sur une ligne pour l'éditer

**Vérification** :
- [ ] Les lignes sont affichées en liste compacte
- [ ] L'édition fonctionne
- [ ] Les modifications sont sauvegardées

### Test 9 : Vue Calendar
1. Basculer vers la vue Calendar
2. Sélectionner la propriété "Date" comme propriété de date
3. Vérifier que les événements apparaissent aux bonnes dates
4. Cliquer sur une date pour ajouter un événement

**Vérification** :
- [ ] Les événements sont affichés au bon jour
- [ ] On peut ajouter un événement en cliquant sur une date
- [ ] On peut éditer un événement
- [ ] On peut supprimer un événement

### Test 10 : Vue Gallery
1. Basculer vers la vue Gallery
2. Vérifier que les cartes apparaissent en grille
3. Cliquer sur une carte pour l'éditer

**Vérification** :
- [ ] Les cartes sont affichées en grille
- [ ] L'édition fonctionne
- [ ] On peut changer la taille des cartes (Small, Medium, Large)

### Test 11 : Filtres
1. Dans n'importe quelle vue, cliquer sur "Filter"
2. Ajouter un filtre : "Status equals Done"
3. Vérifier que seules les lignes avec Status = Done apparaissent
4. Ajouter un deuxième filtre
5. Supprimer un filtre

**Vérification** :
- [ ] Les filtres fonctionnent correctement
- [ ] Les filtres sont sauvegardés par vue
- [ ] Rafraîchir la page : les filtres sont toujours là
- [ ] Changer de vue : chaque vue a ses propres filtres

### Test 12 : Suppression de Vue
1. Cliquer sur le menu "..." d'une vue
2. Sélectionner "Delete view"
3. Confirmer la suppression

**Vérification** :
- [ ] La vue est supprimée
- [ ] On bascule automatiquement vers une autre vue
- [ ] Rafraîchir la page : la vue est toujours supprimée

### Test 13 : Réutilisation de Database
1. Créer un nouveau document
2. Taper `/database`
3. Sélectionner "Link existing database"
4. Choisir une database existante

**Vérification** :
- [ ] La database apparaît dans le nouveau document
- [ ] Les données sont les mêmes que dans le document original
- [ ] Les modifications dans un document apparaissent dans l'autre

### Test 14 : Partage de Database (À implémenter)
_Note : Le partage est prévu dans les modèles mais pas encore implémenté dans l'UI_

### Test 15 : Persistance PostgreSQL
1. Ouvrir pgAdmin ou un client PostgreSQL
2. Se connecter à la base de données
3. Vérifier les tables :
   - `core_databasemodel`
   - `core_databaseproperty`
   - `core_databaseview`
   - `core_databaserow`
   - `core_databaseaccess`

**Vérification** :
- [ ] Les tables existent
- [ ] Les données sont présentes
- [ ] Les relations (foreign keys) sont correctes

## 🐛 Problèmes Connus

Aucun pour le moment.

## 📝 Notes

- Les databases ne sont plus stockées dans localStorage
- Toutes les données sont maintenant dans PostgreSQL
- Le store Zustand ne gère plus que l'état local (vue active)
- React Query gère le cache et la synchronisation avec l'API

## 🚀 Prochaines Étapes

- [ ] Implémenter l'UI de partage de database
- [ ] Ajouter Yjs pour la collaboration temps réel
- [ ] Ajouter des optimistic updates pour une meilleure UX
- [ ] Ajouter des tests end-to-end automatisés

