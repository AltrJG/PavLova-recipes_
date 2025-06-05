import django_filters
from django.db.models import Avg
from .models import User, Ingrediente, Etiqueta, Categoria, Receta

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
    
class IngredienteFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(field_name="nombre", lookup_expr="icontains")
    tipo = django_filters.ChoiceFilter(
        method="filtrar_tipo",
        choices=[
            ("todos", "Todos"),
            ("global", "Global"),
            ("personal", "Personal"),
        ]
    )

    class Meta:
        model = Ingrediente
        fields = ["nombre", "tipo"]

    def filtrar_tipo(self, queryset, name, value):
        user = self.request.user

        if value == "global":
            return queryset.filter(tipo="global")
        elif value == "personal":
            return queryset.filter(tipo="personal", creador=user)
        return queryset
    
class EtiquetaFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(field_name="nombre", lookup_expr="icontains")

    class Meta:
        model = Etiqueta
        fields = ["nombre"]

class CategoriaFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(field_name="nombre", lookup_expr="icontains")

    class Meta:
        model = Categoria
        fields = ["nombre"]

class RecetaFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(field_name='nombre', lookup_expr='icontains')
    nombre_usuario = django_filters.CharFilter(field_name='creador__name', lookup_expr='icontains')
    categoria = django_filters.NumberFilter(field_name='categoria__id')
    tiempo_preparacion = django_filters.NumberFilter(field_name='tiempo_preparacion', lookup_expr='lte')
    tiempo_coccion = django_filters.NumberFilter(field_name='tiempo_coccion', lookup_expr='lte')
    rating = django_filters.NumberFilter(method='filter_rating')
    etiquetas = django_filters.BaseInFilter(field_name='etiquetas__id')
    #Recipe score por implementar

    tipoUsuario = django_filters.CharFilter(method='filtrar_tipo_usuario')

    def filtrar_tipo_usuario(self, queryset, name, value):
        value = value.lower()
        if value == 'usuarios':
            return queryset.filter(creador__is_staff=False, creador__is_superuser=False)
        elif value == 'moderadores':
            return queryset.filter(creador__is_staff=True, creador__is_superuser=False)
        elif value == 'administradores':
            return queryset.filter(creador__is_superuser=True)
        return queryset

    class Meta:
        model = Receta
        fields = ['nombre', 'nombre_usuario', 'categoria', 'tiempo_preparacion', 'tiempo_coccion', 'rating', 'etiquetas', 'tipoUsuario']

    def filter_rating(self, queryset, name, value):
        queryset = queryset.annotate(rating_anotado=Avg('comentarios__puntuacion'))
        return queryset.filter(rating_anotado__gte=value)