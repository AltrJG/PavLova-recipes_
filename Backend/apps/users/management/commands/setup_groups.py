from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from users.models import User, UserSocialLink


class Command(BaseCommand):
    help = "Crea los grupos base y asigna sus permisos."

    GROUP_PERMISSIONS = {
        "Moderator": [
            (User,           ["view_user", "change_user"]),
            (UserSocialLink, ["view_usersociallink"]),
        ],
        "Content Manager": [
            (User,           ["view_user"]),
            (UserSocialLink, ["view_usersociallink", "change_usersociallink"]),
        ],
        "Support": [
            (User,           ["view_user"]),
        ],
    }

    def handle(self, *args, **options):
        for group_name, model_perms in self.GROUP_PERMISSIONS.items():
            group, created = Group.objects.get_or_create(name=group_name)
            action = "Creado" if created else "Actualizado"

            all_permissions = []

            for model, codenames in model_perms:
                ct = ContentType.objects.get_for_model(model)
                for codename in codenames:
                    try:
                        perm = Permission.objects.get(content_type=ct, codename=codename)
                        all_permissions.append(perm)
                    except Permission.DoesNotExist:
                        self.stderr.write(
                            f"Permiso: '{codename}' no encontrado para "
                            f"{model.__name__} — ¿Corriste migrate?"
                        )

            group.permissions.set(all_permissions)
            self.stdout.write(f"{action}: Grupo: '{group_name}' con {len(all_permissions)} permiso(s).")

        self.stdout.write(self.style.SUCCESS("Grupos configurados correctamente."))