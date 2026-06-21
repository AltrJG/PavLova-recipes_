import uuid
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image, ImageOps

MAX_SAFE_WIDTH  = 4000
MAX_SAFE_HEIGHT = 4000
Image.MAX_IMAGE_PIXELS = 50_000_000

def process_image(
    image_file,
    max_width: int = 800,
    max_height: int = 800,
    quality: int = 85,
    force_white_bg: bool = True
) -> ContentFile:
    try:
        img_verify = Image.open(image_file)
        img_verify.verify()

        if img_verify.width > MAX_SAFE_WIDTH or img_verify.height > MAX_SAFE_HEIGHT:
            raise ValueError(
                f"Las dimensiones exceden el límite seguro de {MAX_SAFE_WIDTH}x{MAX_SAFE_HEIGHT}px."
            )
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Verificación de seguridad fallida: {exc}")

    image_file.seek(0)

    try:
        img = Image.open(image_file)
        img = ImageOps.exif_transpose(img)

        if force_white_bg and img.mode in ('RGBA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            mask = img.split()[3] if len(img.split()) == 4 else None
            background.paste(img, mask=mask)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        output = BytesIO()
        img.save(output, format='WEBP', quality=quality, optimize=True, method=6)
        output.seek(0)

        return ContentFile(output.read(), name=f"{uuid.uuid4().hex}.webp")

    except ValueError:
        raise
    except Exception:
        raise ValueError("El archivo no es una imagen válida o está corrupto.")