from django.db import transaction

from apps.users.models import UserSocialLink

@transaction.atomic
def sync_social_links(user, social_links: list[dict]) -> None:

    existing = {
        link.platform: link
        for link in user.social_links.all()
    }

    incoming = {
        item["platform"]: item
        for item in social_links
    }

    UserSocialLink.objects.filter(
        user=user,
        platform__in=existing.keys() - incoming.keys(),
    ).delete()

    links_to_update = []

    for platform in existing.keys() & incoming.keys():
        link = existing[platform]
        new_url = incoming[platform]["url"]

        if link.url != new_url:
            link.url = new_url
            links_to_update.append(link)

    if links_to_update:
        UserSocialLink.objects.bulk_update(
            links_to_update,
            ["url"],
        )

    links_to_create = [
        UserSocialLink(
            user=user,
            platform=platform,
            url=data["url"],
        )
        for platform, data in incoming.items()
        if platform not in existing
    ]

    if links_to_create:
        UserSocialLink.objects.bulk_create(links_to_create)