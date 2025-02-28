import django_filters
from .models import User

# Se filtra de la siguiente forma en la URL: /users/?role=<rol> | /users/?name=<nombre> | /users/?email=<correo> o cualquier combinación de estos.
# Se combina de la siguiente forma en la URL: /users/?role=<rol>&name=<nombre>&email=<correo>
# Los roles válidos son: 'moderadores', 'administradores' y 'usuarios'

class UserFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")
    email = django_filters.CharFilter(field_name="email", lookup_expr="icontains")
    role = django_filters.CharFilter(method='filter_role')

    class Meta:
        model = User
        fields = ['name', 'email', 'role']

    def filter_role(self, queryset, name, value):
        value = value.lower()
        if value == 'moderadores':
            return queryset.filter(is_staff=True, is_superuser=False)
        elif value == 'administradores':
            return queryset.filter(is_superuser=True)
        elif value == 'usuarios':
            return queryset.filter(is_staff=False, is_superuser=False)
        return queryset