import random
import time
import unicodedata

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from faker import Faker

from apps.users.models import User

SPANISH_NAMES = [
    "José", "María", "Andrés", "Sofía", "Víctor", "Angélica",
    "Héctor", "Verónica", "Mónica", "Nicolás", "Tomás", "Inés",
    "Álvaro", "Lucía", "Rubén", "Jimén", "Darío", "Estéfany",
    "Sebastián", "Valentína", "Jesús", "Azucena", "Ramón", "Cármen",
    "Jose", "Maria", "Andres", "Sofia", "Victor", "Angelica",
    "Hector", "Veronica", "Monica", "Nicolas", "Tomas", "Ines",
    "Alvaro", "Lucia", "Ruben", "Dario", "Sebastian", "Valentina",
    "Jesus", "Ramon", "Carmen",
    "JOSE", "MARIA", "SOFIA", "VICTOR", "MONICA", "LUCIA",
    "CARMEN", "ANDRES", "TOMAS", "NICOLAS",
    "jOsé", "mArÍa", "sOfÍa", "vÍcTor", "mÓnIcA",
]

SPANISH_SURNAMES = [
    "García", "Martínez", "López", "González", "Rodríguez",
    "Hernández", "Pérez", "Sánchez", "Ramírez", "Flores",
    "Torres", "Díaz", "Reyes", "Morales", "Jiménez",
    "Muñoz", "Álvarez", "Romero", "Gutiérrez", "Castillo",
    "Garcia", "Martinez", "Lopez", "Gonzalez", "Rodriguez",
    "Hernandez", "Perez", "Sanchez", "Ramirez",
    "Diaz", "Jimenez", "Munoz", "Alvarez", "Gutierrez",
    "GARCIA", "MARTINEZ", "LOPEZ", "GONZALEZ", "PEREZ",
]

SEPARATORS = ["", "_", ".", "-", "__"]


def make_username(fake: Faker) -> str:
    """
    Genera un username con variaciones realistas de acentos,
    mayúsculas y formatos para estresar el índice GIN.
    """
    strategy = random.randint(0, 5)

    if strategy == 0:
        name = random.choice(SPANISH_NAMES)
        surname = random.choice(SPANISH_SURNAMES)
        sep = random.choice(SEPARATORS)
        return f"{name}{sep}{surname}"

    elif strategy == 1:
        name = random.choice(SPANISH_NAMES)
        return f"{name}{random.randint(1, 999)}"

    elif strategy == 2:
        return fake.user_name()

    elif strategy == 3:
        name = random.choice(SPANISH_NAMES).lower()
        surname = random.choice(SPANISH_SURNAMES).lower()
        sep = random.choice(SEPARATORS)
        return f"{name}{sep}{surname}"

    elif strategy == 4:
        name = random.choice(SPANISH_NAMES).upper()
        surname = random.choice(SPANISH_SURNAMES).upper()
        sep = random.choice(SEPARATORS)
        return f"{name}{sep}{surname}"

    else:
        name = random.choice(SPANISH_NAMES)
        suffix = fake.numerify(text="##")
        return f"{name}{suffix}"


class Command(BaseCommand):
    help = (
        "Genera usuarios mock con variaciones de acentos y capitalización "
        "para probar el índice GIN trigram + immutable_unaccent."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50_000,
            help='Número de usuarios a generar (default: 50,000)',
        )
        parser.add_argument(
            '--batch',
            type=int,
            default=5_000,
            help='Tamaño del batch para bulk_create (default: 5,000)',
        )

    def handle(self, *args, **options):
        fake = Faker(['es_ES', 'es_MX', 'en_US'])
        Faker.seed(42)
        random.seed(42)

        count      = options['count']
        batch_size = options['batch']

        self.stdout.write(
            self.style.WARNING(
                f'Generando {count:,} usuarios en batches de {batch_size:,}...'
            )
        )

        default_password = make_password('PavlovaTest2026!')
        batch      = []
        inserted   = 0
        start_time = time.time()

        for i in range(count):
            username = make_username(fake)

            username = username[:255]

            batch.append(
                User(
                    email=fake.unique.email(),
                    username=username,
                    country='',
                    about='',
                    password=default_password,
                    is_active=True,
                )
            )

            if len(batch) >= batch_size:
                User.objects.bulk_create(batch, batch_size=batch_size)
                inserted += len(batch)
                batch = []
                elapsed = time.time() - start_time
                self.stdout.write(
                    f'  {inserted:,}/{count:,} usuarios '
                    f'({elapsed:.1f}s)'
                )

        if batch:
            User.objects.bulk_create(batch, batch_size=batch_size)
            inserted += len(batch)

        elapsed = time.time() - start_time
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ {inserted:,} usuarios generados en {elapsed:.2f}s '
                f'({inserted / elapsed:,.0f} usuarios/seg)'
            )
        )