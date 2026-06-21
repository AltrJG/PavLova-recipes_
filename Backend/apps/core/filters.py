from django.db import models
from django.db.models import Func, F, Q
from django.db.models.functions import Greatest
from django.contrib.postgres.search import TrigramSimilarity
from rest_framework import filters


class Unaccent(Func):
    function = 'immutable_unaccent'
    template = '%(function)s(%(expressions)s)'
    output_field = models.TextField()


class GenericTrigramSearchFilter(filters.BaseFilterBackend):

    def get_schema_operation_parameters(self, view):
        return [
            {
                'name': 'search',
                'required': False,
                'in': 'query',
                'description': (
                    'Búsqueda difusa por similitud '
                    '(insensible a acentos y mayúsculas).'
                ),
                'schema': {'type': 'string'},
            },
        ]

    def filter_queryset(self, request, queryset, view):
        search_query = request.query_params.get('search', '').strip()

        if not search_query:
            return queryset

        search_fields = getattr(view, 'search_fields', None)
        if not search_fields:
            return queryset

        threshold = getattr(view, 'search_similarity_threshold', 0.3)

        annotations = {}

        for field in search_fields:
            name = f'_clean_{field.replace("__", "_")}'

            annotations[name] = Unaccent(F(field))

        queryset = queryset.annotate(**annotations)

        q = Q()
        for field in search_fields:
            clean_name = f'_clean_{field.replace("__", "_")}'

            q |= Q(**{
                f'{clean_name}__trigram_similar': search_query
            })

        queryset = queryset.filter(q)

        sim_annotations = {}

        for field in search_fields:
            clean_name = f'_clean_{field.replace("__", "_")}'
            sim_name = f'_sim_{field.replace("__", "_")}'

            sim_annotations[sim_name] = TrigramSimilarity(
                clean_name,
                search_query
            )

        queryset = queryset.annotate(**sim_annotations)

        if len(search_fields) == 1:
            field = search_fields[0]
            return queryset.order_by(f'-_sim_{field.replace("__", "_")}', '-id')

        queryset = queryset.annotate(
            similarity=Greatest(*[
                f'_sim_{f.replace("__", "_")}' for f in search_fields
            ])
        )

        return queryset.order_by('-similarity', '-id')