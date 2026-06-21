import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User

pytestmark = pytest.mark.django_db

class TestUserViewSet:
    
    def setup_method(self):
        self.client = APIClient()

    def test_user_registration_success(self):
        """Cualquier persona no autenticada debe poder registrarse."""
        url = reverse('user-list')
        data = {
            'email': 'newcomer@test.com', 
            'username': 'newcomer', 
            'password': 'SecurePassword123!'
        }
        
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert response.data['username'] == 'newcomer'
        assert 'password' not in response.data 

    def test_trigram_unaccent_search_engine(self):
        User.objects.create_user(email='e@test.com', username='Érika')
        User.objects.create_user(email='r@test.com', username='Raúl')
        User.objects.create_user(email='m@test.com', username='Maria')
        
        searcher = User.objects.create_user(email='search@test.com', username='searcher')
        self.client.force_authenticate(user=searcher)
        
        url = reverse('user-list')
        
        response = self.client.get(url, {'search': 'erika'})
        assert response.status_code == status.HTTP_200_OK
        
        results = response.data.get('results', response.data)
        assert len(results) == 1
        assert results[0]['username'] == 'Érika'

        response_typo = self.client.get(url, {'search': 'Raaul'})
        assert response_typo.status_code == status.HTTP_200_OK
        
        results_typo = response_typo.data.get('results', response_typo.data)
        assert len(results_typo) == 1
        assert results_typo[0]['username'] == 'Raúl'

    def test_rbac_dynamic_serialization(self):
        admin = User.objects.create_superuser(email='admin@test.com', username='admin', password='123')
        normal = User.objects.create_user(email='normal@test.com', username='normal')
        
        url = reverse('user-list')

        self.client.force_authenticate(user=normal)
        res_normal = self.client.get(url)
        
        assert res_normal.status_code == status.HTTP_200_OK
        results_normal = res_normal.data.get('results', res_normal.data)
        assert 'email' not in results_normal[0] 

        self.client.force_authenticate(user=admin)
        res_admin = self.client.get(url)
        
        assert res_admin.status_code == status.HTTP_200_OK
        results_admin = res_admin.data.get('results', res_admin.data)
        assert 'email' in results_admin[0]

    def test_me_endpoint_retrieves_own_profile(self):
        user = User.objects.create_user(email='me@test.com', username='me')
        self.client.force_authenticate(user=user)
        
        url = reverse('user-me')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'me@test.com'