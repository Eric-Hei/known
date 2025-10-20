#!/usr/bin/env python
"""
Script de test pour l'API Database
Teste les endpoints CRUD pour databases, properties, views, rows
"""

import requests
import json
import os
from pprint import pprint

# Utiliser l'URL interne du container ou localhost selon l'environnement
BASE_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api/v1.0")

# Couleurs pour l'affichage
GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    print(f"{RED}✗ {message}{RESET}")

def print_info(message):
    print(f"{BLUE}ℹ {message}{RESET}")

def get_auth_token():
    """Récupère un token d'authentification"""
    # Essayer de se connecter avec un utilisateur existant
    login_payload = {
        "username": "admin@example.com",
        "password": "admin",
    }

    response = requests.post(f"{BASE_URL.replace('/api/v1.0', '')}/api/v1.0/auth/login/", json=login_payload)

    if response.status_code == 200:
        data = response.json()
        return data.get("access")

    # Si échec, essayer avec un autre endpoint ou retourner None
    print_error("Impossible de s'authentifier. Assurez-vous qu'un utilisateur existe.")
    return None

def test_create_database(headers):
    """Test de création d'une database"""
    print_info("Test 1: Création d'une database")
    
    payload = {
        "title": "Test Database",
        "description": "Database de test créée via API",
        "icon": "📊",
    }
    
    response = requests.post(f"{BASE_URL}/databases/", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print_success(f"Database créée avec ID: {data['id']}")
        print_info(f"Titre: {data['title']}")
        print_info(f"Propriétés: {len(data.get('properties', []))}")
        print_info(f"Vues: {len(data.get('views', []))}")
        print_info(f"Lignes: {len(data.get('rows', []))}")
        return data['id']
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return None

def test_list_databases():
    """Test de liste des databases"""
    print_info("\nTest 2: Liste des databases")
    
    response = requests.get(f"{BASE_URL}/databases/")
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Nombre de databases: {len(data)}")
        for db in data:
            print_info(f"  - {db['title']} (ID: {db['id'][:8]}...)")
            print_info(f"    Properties: {db.get('nb_properties', 0)}, Rows: {db.get('nb_rows', 0)}, Views: {db.get('nb_views', 0)}")
        return True
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return False

def test_get_database(database_id):
    """Test de récupération d'une database"""
    print_info(f"\nTest 3: Récupération de la database {database_id[:8]}...")
    
    response = requests.get(f"{BASE_URL}/databases/{database_id}/")
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Database récupérée: {data['title']}")
        print_info(f"Description: {data.get('description', 'N/A')}")
        print_info(f"Icon: {data.get('icon', 'N/A')}")
        print_info(f"Propriétés: {len(data.get('properties', []))}")
        print_info(f"Vues: {len(data.get('views', []))}")
        print_info(f"Lignes: {len(data.get('rows', []))}")
        return data
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return None

def test_create_property(database_id):
    """Test de création d'une propriété"""
    print_info(f"\nTest 4: Création d'une propriété")
    
    payload = {
        "name": "Status",
        "property_type": "select",
        "config": {
            "options": [
                {"id": "1", "value": "Todo", "color": "#FF6B6B"},
                {"id": "2", "value": "In Progress", "color": "#4ECDC4"},
                {"id": "3", "value": "Done", "color": "#52B788"},
            ]
        },
        "order": 1,
    }
    
    response = requests.post(f"{BASE_URL}/databases/{database_id}/properties/", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print_success(f"Propriété créée: {data['name']} (ID: {data['id'][:8]}...)")
        print_info(f"Type: {data['property_type']}")
        print_info(f"Options: {len(data.get('config', {}).get('options', []))}")
        return data['id']
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return None

def test_create_view(database_id):
    """Test de création d'une vue"""
    print_info(f"\nTest 5: Création d'une vue")
    
    payload = {
        "name": "Board View",
        "view_type": "board",
        "filters": [],
        "sorts": [],
        "config": {
            "groupByProperty": "status",
        },
        "order": 1,
    }
    
    response = requests.post(f"{BASE_URL}/databases/{database_id}/views/", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print_success(f"Vue créée: {data['name']} (ID: {data['id'][:8]}...)")
        print_info(f"Type: {data['view_type']}")
        return data['id']
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return None

def test_create_row(database_id, property_id):
    """Test de création d'une ligne"""
    print_info(f"\nTest 6: Création d'une ligne")
    
    payload = {
        "properties": {
            property_id: "1",  # Status = Todo
        },
        "order": 0,
    }
    
    response = requests.post(f"{BASE_URL}/databases/{database_id}/rows/", json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print_success(f"Ligne créée (ID: {data['id'][:8]}...)")
        print_info(f"Propriétés: {data['properties']}")
        return data['id']
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return None

def test_update_row(database_id, row_id, property_id):
    """Test de mise à jour d'une ligne"""
    print_info(f"\nTest 7: Mise à jour de la ligne")
    
    payload = {
        "properties": {
            property_id: "3",  # Status = Done
        },
    }
    
    response = requests.patch(f"{BASE_URL}/databases/{database_id}/rows/{row_id}/", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Ligne mise à jour")
        print_info(f"Nouvelles propriétés: {data['properties']}")
        return True
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return False

def test_update_view_filters(database_id, view_id, property_id):
    """Test de mise à jour des filtres d'une vue"""
    print_info(f"\nTest 8: Ajout de filtres à la vue")
    
    payload = {
        "filters": [
            {
                "id": "filter-1",
                "propertyId": property_id,
                "operator": "equals",
                "value": "3",  # Status = Done
            }
        ],
    }
    
    response = requests.patch(f"{BASE_URL}/databases/{database_id}/views/{view_id}/", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Vue mise à jour avec {len(data['filters'])} filtre(s)")
        return True
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return False

def test_delete_row(database_id, row_id):
    """Test de suppression d'une ligne"""
    print_info(f"\nTest 9: Suppression de la ligne")
    
    response = requests.delete(f"{BASE_URL}/databases/{database_id}/rows/{row_id}/")
    
    if response.status_code == 204:
        print_success(f"Ligne supprimée")
        return True
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return False

def test_delete_database(database_id):
    """Test de suppression d'une database (soft delete)"""
    print_info(f"\nTest 10: Suppression de la database")
    
    response = requests.delete(f"{BASE_URL}/databases/{database_id}/")
    
    if response.status_code == 204:
        print_success(f"Database supprimée (soft delete)")
        return True
    else:
        print_error(f"Erreur {response.status_code}: {response.text}")
        return False

def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Test de l'API Database - Known{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Test 1: Créer une database
    database_id = test_create_database()
    if not database_id:
        print_error("\nTests arrêtés : impossible de créer une database")
        return
    
    # Test 2: Lister les databases
    test_list_databases()
    
    # Test 3: Récupérer la database
    database = test_get_database(database_id)
    if not database:
        return
    
    # Test 4: Créer une propriété
    property_id = test_create_property(database_id)
    if not property_id:
        return
    
    # Test 5: Créer une vue
    view_id = test_create_view(database_id)
    if not view_id:
        return
    
    # Test 6: Créer une ligne
    row_id = test_create_row(database_id, property_id)
    if not row_id:
        return
    
    # Test 7: Mettre à jour la ligne
    test_update_row(database_id, row_id, property_id)
    
    # Test 8: Mettre à jour les filtres de la vue
    test_update_view_filters(database_id, view_id, property_id)
    
    # Test 9: Supprimer la ligne
    test_delete_row(database_id, row_id)
    
    # Test 10: Supprimer la database
    test_delete_database(database_id)
    
    print(f"\n{GREEN}{'='*60}{RESET}")
    print(f"{GREEN}Tous les tests sont terminés !{RESET}")
    print(f"{GREEN}{'='*60}{RESET}\n")

if __name__ == "__main__":
    main()

