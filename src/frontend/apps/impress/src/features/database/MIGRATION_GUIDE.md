# Migration Guide: LocalStorage → PostgreSQL

## Vue d'ensemble

Les databases sont maintenant persistées dans PostgreSQL au lieu du localStorage. Cette migration apporte :

✅ **Partage** : Les databases peuvent être partagées entre utilisateurs  
✅ **Collaboration** : Plusieurs utilisateurs peuvent travailler sur la même database  
✅ **Persistance** : Les données sont sauvegardées sur le serveur  
✅ **Sécurité** : Contrôle d'accès avec rôles (Owner, Admin, Editor, Reader)

---

## Changements Principaux

### Avant (LocalStorage)
```typescript
import { useDatabaseStore } from './stores/useDatabaseStore';

const { createDatabase, updateDatabase, addRow } = useDatabaseStore();

// Créer une database
const database = createDatabase('My Database');

// Ajouter une ligne
addRow(database.id, { name: 'John' });
```

### Après (PostgreSQL + API)
```typescript
import { useCreateDatabase, useDatabase, useCreateRow } from './api';

// Créer une database
const { mutate: createDatabase } = useCreateDatabase({
  onSuccess: (database) => {
    console.log('Database created:', database.id);
  },
});

createDatabase({ title: 'My Database' });

// Récupérer une database
const { data: database, isLoading } = useDatabase(databaseId);

// Ajouter une ligne
const { mutate: createRow } = useCreateRow();
createRow({
  databaseId: database.id,
  properties: { name: 'John' },
});
```

---

## API Hooks Disponibles

### Databases
- `useDatabases()` - Liste toutes les databases accessibles
- `useDatabase(id)` - Récupère une database par ID
- `useCreateDatabase()` - Crée une nouvelle database
- `useUpdateDatabase()` - Met à jour une database

### Properties (Colonnes)
- `useCreateProperty()` - Ajoute une propriété
- `useUpdateProperty()` - Met à jour une propriété
- `useDeleteProperty()` - Supprime une propriété

### Views (Vues)
- `useCreateView()` - Crée une vue
- `useUpdateView()` - Met à jour une vue (filtres, sorts, config)
- `useDeleteView()` - Supprime une vue

### Rows (Lignes)
- `useCreateRow()` - Ajoute une ligne
- `useUpdateRow()` - Met à jour une ligne
- `useDeleteRow()` - Supprime une ligne

### État Local (UI uniquement)
- `useDatabaseLocalStore()` - Gère l'état local (vue active, etc.)

---

## Exemples d'Utilisation

### 1. Créer une Database avec Propriétés et Vues

```typescript
import { useCreateDatabase, useCreateProperty, useCreateView } from './api';

function CreateDatabaseButton() {
  const { mutate: createDatabase } = useCreateDatabase({
    onSuccess: (database) => {
      // Ajouter des propriétés
      createProperty({
        databaseId: database.id,
        name: 'Status',
        property_type: 'select',
        config: {
          options: [
            { id: '1', value: 'Todo', color: 'gray' },
            { id: '2', value: 'In Progress', color: 'blue' },
            { id: '3', value: 'Done', color: 'green' },
          ],
        },
      });

      // Ajouter une vue
      createView({
        databaseId: database.id,
        name: 'Board View',
        view_type: 'board',
        config: {
          groupByProperty: 'status',
        },
      });
    },
  });

  const { mutate: createProperty } = useCreateProperty();
  const { mutate: createView } = useCreateView();

  return (
    <button onClick={() => createDatabase({ title: 'My Project' })}>
      Create Database
    </button>
  );
}
```

### 2. Afficher une Database avec React Query

```typescript
import { useDatabase } from './api';

function DatabaseView({ databaseId }: { databaseId: string }) {
  const { data: database, isLoading, error } = useDatabase(databaseId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!database) return <div>Database not found</div>;

  return (
    <div>
      <h1>{database.title}</h1>
      <p>{database.description}</p>
      
      {/* Properties */}
      <div>
        {database.properties.map((prop) => (
          <div key={prop.id}>{prop.name}</div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {database.rows.map((row) => (
          <div key={row.id}>{JSON.stringify(row.properties)}</div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Mettre à Jour une Ligne

```typescript
import { useUpdateRow } from './api';

function RowEditor({ databaseId, rowId }: { databaseId: string; rowId: string }) {
  const { mutate: updateRow } = useUpdateRow();

  const handleUpdate = (newValue: string) => {
    updateRow({
      databaseId,
      rowId,
      properties: {
        name: newValue,
      },
    });
  };

  return (
    <input
      onChange={(e) => handleUpdate(e.target.value)}
      placeholder="Enter name"
    />
  );
}
```

### 4. Gérer les Filtres et Sorts

```typescript
import { useUpdateView } from './api';

function FilterManager({ databaseId, viewId }: { databaseId: string; viewId: string }) {
  const { mutate: updateView } = useUpdateView();

  const addFilter = () => {
    updateView({
      databaseId,
      viewId,
      filters: [
        {
          id: crypto.randomUUID(),
          propertyId: 'property-id',
          operator: 'equals',
          value: 'some-value',
        },
      ],
    });
  };

  return <button onClick={addFilter}>Add Filter</button>;
}
```

---

## Migration des Composants Existants

### Composants à Migrer

1. **DatabaseBlock.tsx** - Utiliser `useDatabase()` au lieu de `useDatabaseStore()`
2. **DatabaseView.tsx** - Utiliser `useDatabase()` et `useDatabaseLocalStore()`
3. **TableView.tsx, BoardView.tsx, etc.** - Utiliser les hooks API pour les mutations
4. **FilterBar.tsx** - Utiliser `useUpdateView()` pour sauvegarder les filtres

### Stratégie de Migration

1. ✅ **Backend créé** (modèles, serializers, viewsets, routes)
2. ✅ **API hooks créés** (React Query hooks)
3. ⏳ **Migrer les composants** un par un
4. ⏳ **Tester** chaque composant après migration
5. ⏳ **Supprimer** l'ancien `useDatabaseStore` une fois tout migré

---

## Notes Importantes

### React Query Cache
React Query gère automatiquement le cache. Les données sont :
- Mises en cache après le premier fetch
- Invalidées automatiquement après les mutations
- Rafraîchies en arrière-plan selon la configuration

### Optimistic Updates
Pour une meilleure UX, vous pouvez implémenter des optimistic updates :

```typescript
const { mutate: updateRow } = useUpdateRow({
  onMutate: async (variables) => {
    // Annuler les requêtes en cours
    await queryClient.cancelQueries([KEY_DATABASE, variables.databaseId]);

    // Snapshot de l'état actuel
    const previousDatabase = queryClient.getQueryData([KEY_DATABASE, variables.databaseId]);

    // Mise à jour optimiste
    queryClient.setQueryData([KEY_DATABASE, variables.databaseId], (old: any) => ({
      ...old,
      rows: old.rows.map((row: any) =>
        row.id === variables.rowId
          ? { ...row, properties: { ...row.properties, ...variables.properties } }
          : row
      ),
    }));

    return { previousDatabase };
  },
  onError: (err, variables, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(
      [KEY_DATABASE, variables.databaseId],
      context?.previousDatabase
    );
  },
});
```

---

## Prochaines Étapes

1. Migrer `DatabaseBlock.tsx` pour utiliser `useDatabase()`
2. Migrer `DatabaseView.tsx` pour utiliser les nouveaux hooks
3. Migrer les vues (Table, Board, List, Calendar, Gallery)
4. Tester la création, modification, suppression
5. Tester le partage et les permissions
6. (Optionnel) Ajouter Yjs pour la collaboration temps réel

