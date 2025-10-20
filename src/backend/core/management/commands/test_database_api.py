"""
Management command pour tester l'API Database
Usage: python manage.py test_database_api
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import DatabaseModel, DatabaseProperty, DatabaseView, DatabaseRow, DatabaseAccess
from core.api.serializers import DatabaseSerializer, ListDatabaseSerializer
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test l\'API Database avec des opérations CRUD'

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('='*60))
        self.stdout.write(self.style.HTTP_INFO('Test de l\'API Database - Known'))
        self.stdout.write(self.style.HTTP_INFO('='*60))
        self.stdout.write('')

        # Créer ou récupérer un utilisateur de test
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={'password': 'testpass123'}
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Utilisateur de test créé: {user.email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Utilisateur de test existant: {user.email}'))

        # Test 1: Créer une database
        self.stdout.write(self.style.HTTP_INFO('\nTest 1: Création d\'une database'))
        database = DatabaseModel.objects.create(
            title='Test Database',
            description='Database de test créée via management command',
            icon='📊',
            creator=user,
        )
        # Créer l'accès owner
        DatabaseAccess.objects.create(
            database=database,
            user=user,
            role='owner',
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Database créée avec ID: {database.id}'))
        self.stdout.write(self.style.HTTP_INFO(f'  Titre: {database.title}'))

        # Test 2: Créer une propriété
        self.stdout.write(self.style.HTTP_INFO('\nTest 2: Création d\'une propriété'))
        property_obj = DatabaseProperty.objects.create(
            database=database,
            name='Status',
            property_type='select',
            config={
                'options': [
                    {'id': '1', 'value': 'Todo', 'color': '#FF6B6B'},
                    {'id': '2', 'value': 'In Progress', 'color': '#4ECDC4'},
                    {'id': '3', 'value': 'Done', 'color': '#52B788'},
                ]
            },
            order=1,
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Propriété créée: {property_obj.name} (ID: {str(property_obj.id)[:8]}...)'))
        self.stdout.write(self.style.HTTP_INFO(f'  Type: {property_obj.property_type}'))
        self.stdout.write(self.style.HTTP_INFO(f'  Options: {len(property_obj.config.get("options", []))}'))

        # Test 3: Créer une vue
        self.stdout.write(self.style.HTTP_INFO('\nTest 3: Création d\'une vue'))
        view = DatabaseView.objects.create(
            database=database,
            name='Board View',
            view_type='board',
            filters=[],
            sorts=[],
            config={'groupByProperty': str(property_obj.id)},
            order=1,
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Vue créée: {view.name} (ID: {str(view.id)[:8]}...)'))
        self.stdout.write(self.style.HTTP_INFO(f'  Type: {view.view_type}'))

        # Test 4: Créer une ligne
        self.stdout.write(self.style.HTTP_INFO('\nTest 4: Création d\'une ligne'))
        row = DatabaseRow.objects.create(
            database=database,
            properties={str(property_obj.id): '1'},  # Status = Todo
            order=0,
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Ligne créée (ID: {str(row.id)[:8]}...)'))
        self.stdout.write(self.style.HTTP_INFO(f'  Propriétés: {row.properties}'))

        # Test 5: Mettre à jour la ligne
        self.stdout.write(self.style.HTTP_INFO('\nTest 5: Mise à jour de la ligne'))
        row.properties[str(property_obj.id)] = '3'  # Status = Done
        row.save()
        self.stdout.write(self.style.SUCCESS(f'✓ Ligne mise à jour'))
        self.stdout.write(self.style.HTTP_INFO(f'  Nouvelles propriétés: {row.properties}'))

        # Test 6: Ajouter un filtre à la vue
        self.stdout.write(self.style.HTTP_INFO('\nTest 6: Ajout de filtres à la vue'))
        view.filters = [
            {
                'id': 'filter-1',
                'propertyId': str(property_obj.id),
                'operator': 'equals',
                'value': '3',  # Status = Done
            }
        ]
        view.save()
        self.stdout.write(self.style.SUCCESS(f'✓ Vue mise à jour avec {len(view.filters)} filtre(s)'))

        # Test 7: Sérialiser la database complète
        self.stdout.write(self.style.HTTP_INFO('\nTest 7: Sérialisation de la database'))
        serializer = DatabaseSerializer(database, context={'request': type('obj', (object,), {'user': user})()})
        data = serializer.data
        self.stdout.write(self.style.SUCCESS(f'✓ Database sérialisée'))
        self.stdout.write(self.style.HTTP_INFO(f'  Propriétés: {len(data["properties"])}'))
        self.stdout.write(self.style.HTTP_INFO(f'  Vues: {len(data["views"])}'))
        self.stdout.write(self.style.HTTP_INFO(f'  Lignes: {len(data["rows"])}'))
        self.stdout.write(self.style.HTTP_INFO(f'  Accès: {len(data["accesses"])}'))

        # Test 8: Lister les databases
        self.stdout.write(self.style.HTTP_INFO('\nTest 8: Liste des databases'))
        databases = DatabaseModel.objects.filter(deleted_at__isnull=True)
        serializer = ListDatabaseSerializer(databases, many=True, context={'request': type('obj', (object,), {'user': user})()})
        self.stdout.write(self.style.SUCCESS(f'✓ Nombre de databases: {len(serializer.data)}'))
        for db_data in serializer.data:
            self.stdout.write(self.style.HTTP_INFO(f'  - {db_data["title"]} (ID: {db_data["id"][:8]}...)'))
            self.stdout.write(self.style.HTTP_INFO(f'    Properties: {db_data.get("nb_properties", 0)}, Rows: {db_data.get("nb_rows", 0)}, Views: {db_data.get("nb_views", 0)}'))

        # Test 9: Supprimer la ligne
        self.stdout.write(self.style.HTTP_INFO('\nTest 9: Suppression de la ligne'))
        row.delete()
        self.stdout.write(self.style.SUCCESS(f'✓ Ligne supprimée'))

        # Test 10: Soft delete de la database
        self.stdout.write(self.style.HTTP_INFO('\nTest 10: Suppression de la database (soft delete)'))
        from django.utils import timezone
        database.deleted_at = timezone.now()
        database.save()
        self.stdout.write(self.style.SUCCESS(f'✓ Database supprimée (soft delete)'))

        # Vérifier que la database n'apparaît plus dans la liste
        databases = DatabaseModel.objects.filter(deleted_at__isnull=True)
        self.stdout.write(self.style.HTTP_INFO(f'  Databases actives restantes: {databases.count()}'))

        # Nettoyer (supprimer définitivement pour les tests)
        self.stdout.write(self.style.HTTP_INFO('\nNettoyage: Suppression définitive de la database de test'))
        database.delete()
        self.stdout.write(self.style.SUCCESS(f'✓ Database supprimée définitivement'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Tous les tests sont terminés avec succès ! ✓'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')

