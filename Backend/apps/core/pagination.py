from rest_framework.pagination import CursorPagination, PageNumberPagination

class DefaultCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-id'
    page_size_query_param = 'page_size'
    max_page_size = 100

class SearchPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50