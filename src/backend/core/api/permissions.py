"""Permission handlers for the impress core app."""

from django.core import exceptions
from django.db.models import Q
from django.http import Http404

from rest_framework import permissions

from core import choices
from core.models import DocumentAccess, RoleChoices, get_trashbin_cutoff

ACTION_FOR_METHOD_TO_PERMISSION = {
    "versions_detail": {"DELETE": "versions_destroy", "GET": "versions_retrieve"},
    "children": {"GET": "children_list", "POST": "children_create"},
}


class IsAuthenticated(permissions.BasePermission):
    """
    Allows access only to authenticated users. Alternative method checking the presence
    of the auth token to avoid hitting the database.
    """

    def has_permission(self, request, view):
        return bool(request.auth) or request.user.is_authenticated


class IsAuthenticatedOrSafe(IsAuthenticated):
    """Allows access to authenticated users (or anonymous users but only on safe methods)."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return super().has_permission(request, view)


class IsSelf(IsAuthenticated):
    """
    Allows access only to authenticated users. Alternative method checking the presence
    of the auth token to avoid hitting the database.
    """

    def has_object_permission(self, request, view, obj):
        """Write permissions are only allowed to the user itself."""
        return obj == request.user


class IsOwnedOrPublic(IsAuthenticated):
    """
    Allows access to authenticated users only for objects that are owned or not related
    to any user via the "owner" field.
    """

    def has_object_permission(self, request, view, obj):
        """Unsafe permissions are only allowed for the owner of the object."""
        if obj.owner == request.user:
            return True

        if request.method in permissions.SAFE_METHODS and obj.owner is None:
            return True

        try:
            return obj.user == request.user
        except exceptions.ObjectDoesNotExist:
            return False


class CanCreateInvitationPermission(permissions.BasePermission):
    """
    Custom permission class to handle permission checks for managing invitations.
    """

    def has_permission(self, request, view):
        user = request.user

        # Ensure the user is authenticated
        if not (bool(request.auth) or request.user.is_authenticated):
            return False

        # Apply permission checks only for creation (POST requests)
        if view.action != "create":
            return True

        # Check if resource_id is passed in the context
        try:
            document_id = view.kwargs["resource_id"]
        except KeyError as exc:
            raise exceptions.ValidationError(
                "You must set a document ID in kwargs to manage document invitations."
            ) from exc

        # Check if the user has access to manage invitations (Owner/Admin roles)
        return DocumentAccess.objects.filter(
            Q(user=user) | Q(team__in=user.teams),
            document=document_id,
            role__in=[RoleChoices.OWNER, RoleChoices.ADMIN],
        ).exists()


class ResourceWithAccessPermission(permissions.BasePermission):
    """A permission class for templates and invitations."""

    def has_permission(self, request, view):
        """check create permission for templates."""
        return request.user.is_authenticated or view.action != "create"

    def has_object_permission(self, request, view, obj):
        """Check permission for a given object."""
        abilities = obj.get_abilities(request.user)
        action = view.action
        return abilities.get(action, False)


class DocumentPermission(permissions.BasePermission):
    """Subclass to handle soft deletion specificities."""

    def has_permission(self, request, view):
        """check create permission for documents."""
        return request.user.is_authenticated or view.action != "create"

    def has_object_permission(self, request, view, obj):
        """
        Return a 404 on deleted documents
        - for which the trashbin cutoff is past
        - for which the current user is not owner of the document or one of its ancestors
        """
        if (
            deleted_at := obj.ancestors_deleted_at
        ) and deleted_at < get_trashbin_cutoff():
            raise Http404

        abilities = obj.get_abilities(request.user)
        action = view.action
        try:
            action = ACTION_FOR_METHOD_TO_PERMISSION[view.action][request.method]
        except KeyError:
            pass

        has_permission = abilities.get(action, False)

        if obj.ancestors_deleted_at and not RoleChoices.OWNER in obj.user_roles:
            raise Http404

        return has_permission


class DatabasePermission(permissions.BasePermission):
    """Permission class for databases."""

    def has_permission(self, request, view):
        """Check create permission for databases."""
        return request.user.is_authenticated or view.action != "create"

    def has_object_permission(self, request, view, obj):
        """Check permission for a given database object."""
        abilities = obj.get_abilities(request.user)
        action = view.action
        return abilities.get(action, False)


class DatabaseNestedPermission(permissions.BasePermission):
    """Permission class for nested database objects (rows, properties, views, accesses)."""

    def has_permission(self, request, view):
        """Check permission based on the parent database."""
        if not request.user.is_authenticated:
            return False

        # Get the database from the URL kwargs
        database_id = view.kwargs.get("database_id")
        if not database_id:
            return False

        try:
            from core import models
            database = models.DatabaseModel.objects.get(id=database_id)
            abilities = database.get_abilities(request.user)

            # For create actions, check if user can update the database
            if view.action == "create":
                return abilities.get("update", False)

            # For list actions, check if user can retrieve the database
            return abilities.get("retrieve", False)
        except models.DatabaseModel.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        """Check permission based on the parent database."""
        # Get the database from the object
        database = obj.database if hasattr(obj, "database") else None
        if not database:
            return False

        abilities = database.get_abilities(request.user)
        action = view.action

        # Map actions to database abilities
        if action in ["update", "partial_update", "destroy"]:
            return abilities.get("update", False)
        elif action == "retrieve":
            return abilities.get("retrieve", False)

        return False


class ResourceAccessPermission(IsAuthenticated):
    """Permission class for document access objects."""

    def has_permission(self, request, view):
        """check create permission for accesses in documents tree."""
        if super().has_permission(request, view) is False:
            return False

        if view.action == "create":
            role = getattr(view, view.resource_field_name).get_role(request.user)
            if role not in choices.PRIVILEGED_ROLES:
                raise exceptions.PermissionDenied(
                    "You are not allowed to manage accesses for this resource."
                )

        return True

    def has_object_permission(self, request, view, obj):
        """Check permission for a given object."""
        abilities = obj.get_abilities(request.user)

        requested_role = request.data.get("role")
        if requested_role and requested_role not in abilities.get("set_role_to", []):
            return False

        action = view.action
        return abilities.get(action, False)
