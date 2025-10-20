"""URL configuration for the core app."""

from django.conf import settings
from django.urls import include, path, re_path

from lasuite.oidc_login.urls import urlpatterns as oidc_urls
from rest_framework.routers import DefaultRouter

from core.api import viewsets

# - Main endpoints
router = DefaultRouter()
router.register("templates", viewsets.TemplateViewSet, basename="templates")
router.register("documents", viewsets.DocumentViewSet, basename="documents")
router.register("databases", viewsets.DatabaseViewSet, basename="databases")
router.register("users", viewsets.UserViewSet, basename="users")

# - Routes nested under a document
document_related_router = DefaultRouter()
document_related_router.register(
    "accesses",
    viewsets.DocumentAccessViewSet,
    basename="document_accesses",
)
document_related_router.register(
    "invitations",
    viewsets.InvitationViewset,
    basename="invitations",
)

document_related_router.register(
    "ask-for-access",
    viewsets.DocumentAskForAccessViewSet,
    basename="ask_for_access",
)


# - Routes nested under a template
template_related_router = DefaultRouter()
template_related_router.register(
    "accesses",
    viewsets.TemplateAccessViewSet,
    basename="template_accesses",
)


# - Routes nested under a database
database_related_router = DefaultRouter()
database_related_router.register(
    "properties",
    viewsets.DatabasePropertyViewSet,
    basename="database_properties",
)
database_related_router.register(
    "views",
    viewsets.DatabaseViewViewSet,
    basename="database_views",
)
database_related_router.register(
    "rows",
    viewsets.DatabaseRowViewSet,
    basename="database_rows",
)
database_related_router.register(
    "accesses",
    viewsets.DatabaseAccessViewSet,
    basename="database_accesses",
)


urlpatterns = [
    path(
        f"api/{settings.API_VERSION}/",
        include(
            [
                *router.urls,
                *oidc_urls,
                re_path(
                    r"^documents/(?P<resource_id>[0-9a-z-]*)/",
                    include(document_related_router.urls),
                ),
                re_path(
                    r"^templates/(?P<resource_id>[0-9a-z-]*)/",
                    include(template_related_router.urls),
                ),
                re_path(
                    r"^databases/(?P<database_id>[0-9a-z-]*)/",
                    include(database_related_router.urls),
                ),
            ]
        ),
    ),
    path(f"api/{settings.API_VERSION}/config/", viewsets.ConfigView.as_view()),
]
