from pathlib import Path
from shutil import copy2, which
import subprocess

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT.parent
IMG_OUT = ROOT / "assets" / "images"
PDF_OUT = ROOT / "assets" / "brochures"


def src(name: str) -> Path:
    return DOWNLOADS / name


ASSETS = {
    "home-hero": ("PHOTO-2026-04-18-09-58-58.jpg", 0.025, 1800),
    "ashiyana-hero": ("PHOTO-2026-04-18-09-58-58.jpg", 0.025, 1800),
    "ashiyana-tower": ("PHOTO-2026-04-18-09-58-13.jpg", 0.03, 1800),
    "ashiyana-aerial": ("PHOTO-2026-04-18-10-01-32.jpg", 0.025, 1800),
    "ashiyana-gate": ("PHOTO-2026-04-18-09-57-58.jpg", 0.025, 1600),
    "ashiyana-rooftop": ("PHOTO-2026-04-18-10-01-21.jpg", 0.02, 1400),
    "ashiyana-garden": ("PHOTO-2026-04-18-09-59-10.jpg", 0.02, 1600),
    "ashiyana-courtyard": ("PHOTO-2026-04-18-09-58-41.jpg", 0.02, 1400),
    "ashiyana-play": ("PHOTO-2026-04-18-09-58-30.jpg", 0.02, 1600),
    "ashiyana-lobby": ("PHOTO-2026-04-18-09-59-46.jpg", 0.02, 1600),
    "ashiyana-lifts": ("PHOTO-2026-04-18-10-00-09.jpg", 0.02, 1600),
    "ashiyana-gym": ("PHOTO-2026-04-18-10-00-33.jpg", 0.02, 1600),
    "ashiyana-ev": ("PHOTO-2026-04-18-10-00-50.jpg", 0.02, 1600),
    "ashiyana-banquet": ("PHOTO-2026-04-18-10-01-06.jpg", 0.02, 1600),
    "ashiyana-plan-01": ("PHOTO-2026-04-18-09-44-04.jpg", 0.012, 1500),
    "ashiyana-plan-02": ("PHOTO-2026-04-18-09-44-21.jpg", 0.012, 1500),
    "ashiyana-plan-03": ("PHOTO-2026-04-18-09-45-36.jpg", 0.012, 1400),
    "ashiyana-plan-04": ("PHOTO-2026-04-18-09-47-42.jpg", 0.012, 1400),
    "ashiyana-plan-05": ("PHOTO-2026-04-18-09-52-43.jpg", 0.012, 1400),
    "sterling-heights-hero": ("PHOTO-2026-04-18-16-53-22.jpg", 0.03, 1800),
    "sterling-heights-view": ("PHOTO-2026-04-18-16-52-25.jpg", 0.03, 1800),
    "sapphire-hero": ("PHOTO-2026-04-18-16-54-04.jpg", 0.03, 1800),
    "apartments-photo": ("PHOTO-2026-04-18-09-38-06.jpg", 0.0, 1400),
    "complex-photo": ("PHOTO-2026-04-18-09-38-24.jpg", 0.0, 1400),
    "crescent-photo": ("PHOTO-2026-04-18-09-38-41.jpg", 0.0, 1400),
    "heights-photo": ("PHOTO-2026-04-18-09-38-58.jpg", 0.0, 1400),
    "enclave-photo": ("PHOTO-2026-04-18-09-39-17.jpg", 0.0, 1400),
    "kamal-kutir-photo": ("PHOTO-2026-04-18-09-39-46.jpg", 0.0, 1500),
    "residency-render": ("PHOTO-2026-04-18-09-42-10.jpg", 0.025, 1400),
    "residency-photo": ("PHOTO-2026-04-18-09-40-03.jpg", 0.0, 1400),
    "orchid-render": ("PHOTO-2026-04-18-11-27-58.jpg", 0.025, 1600),
    "orchid-photo": ("PHOTO-2026-04-18-11-28-26.jpg", 0.0, 1400),
    "classic-render": ("PHOTO-2026-04-18-12-34-33.jpg", 0.025, 900),
    "classic-photo": ("PHOTO-2026-04-18-12-32-50.jpg", 0.0, 1400),
    "royal-crest-render": ("PHOTO-2026-04-18-16-12-31.jpg", 0.025, 1600),
    "royal-crest-photo": ("PHOTO-2026-04-18-16-11-59.jpg", 0.0, 1400),
    "mrinalini-photo": ("PHOTO-2026-04-18-16-13-40.jpg", 0.0, 1400),
    "mayfair-manor-photo": ("PHOTO-2026-04-18-16-14-14.jpg", 0.0, 1400),
    "heritage-photo": ("PHOTO-2026-04-18-16-14-33.jpg", 0.0, 1400),
    "ashrayam-render": ("PHOTO-2026-04-18-16-15-27.jpg", 0.025, 1600),
    "white-orchid-photo": ("PHOTO-2026-04-18-16-17-17.jpg", 0.0, 1400),
    "serenity-render": ("PHOTO-2026-04-18-16-18-19.jpg", 0.025, 1600),
    "golden-crest-render": ("PHOTO-2026-04-18-16-18-45.jpg", 0.025, 1600),
    "golden-crest-photo": ("PHOTO-2026-04-18-16-19-59.jpg", 0.0, 1400),
    "jyoti-render": ("PHOTO-2026-04-18-16-35-52.jpg", 0.025, 1600),
    "jyoti-photo": ("PHOTO-2026-04-18-16-20-32.jpg", 0.0, 1400),
    "emerald-render": ("PHOTO-2026-04-18-16-36-12.jpg", 0.025, 1600),
    "emerald-photo": ("PHOTO-2026-04-18-16-36-36.jpg", 0.0, 1400),
    "eternity-render": ("PHOTO-2026-04-18-16-38-04.jpg", 0.025, 1600),
    "imperial-towers-day": ("PHOTO-2026-04-18-16-41-28.jpg", 0.025, 1600),
    "imperial-towers-night": ("PHOTO-2026-04-18-16-41-46.jpg", 0.04, 1600),
    "imperial-towers-photo": ("PHOTO-2026-04-18-16-39-01.jpg", 0.0, 1400),
    "golden-orchid-day": ("PHOTO-2026-04-18-16-48-47.jpg", 0.025, 1700),
    "golden-orchid-night": ("PHOTO-2026-04-18-16-49-06.jpg", 0.04, 1700),
}

PDFS = {
    "vijaya-ashiyana.pdf": "vijaya-ashiyana.pdf",
    "vijaya-sapphire.pdf": "Vijaya Sapphire Brochure.pdf",
    "vijaya-sterling-heights.pdf": "Vijaya Sterling Heights.pdf",
}


def crop_edges(img: Image.Image, pct: float) -> Image.Image:
    if pct <= 0:
        return img
    w, h = img.size
    dx = round(w * pct)
    dy = round(h * pct)
    return img.crop((dx, dy, w - dx, h - dy))


def resize_max(img: Image.Image, max_width: int) -> Image.Image:
    if img.width <= max_width:
        return img
    ratio = max_width / img.width
    return img.resize((max_width, round(img.height * ratio)), Image.Resampling.LANCZOS)


def render_pdf_preview(pdf_path: Path, output_name: str) -> None:
    renderer = which("pdftoppm")
    if renderer is None:
        raise RuntimeError("pdftoppm is required to generate brochure previews")

    temp_base = IMG_OUT / f"{Path(output_name).stem}-preview"
    temp_png = temp_base.with_suffix(".png")
    subprocess.run(
        [renderer, "-f", "1", "-singlefile", "-png", "-r", "150", str(pdf_path), str(temp_base)],
        check=True,
    )
    image = Image.open(temp_png).convert("RGB")
    image = resize_max(image, 1100)
    image.save(IMG_OUT / f"{Path(output_name).stem}-preview.webp", "WEBP", quality=84, method=6)
    temp_png.unlink(missing_ok=True)


def main() -> None:
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    PDF_OUT.mkdir(parents=True, exist_ok=True)

    for name, (filename, crop_pct, max_width) in ASSETS.items():
        source = src(filename)
        if not source.exists():
            raise FileNotFoundError(source)
        image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
        image = crop_edges(image, crop_pct)
        image = resize_max(image, max_width)
        image.save(IMG_OUT / f"{name}.webp", "WEBP", quality=84, method=6)

    for output_name, input_name in PDFS.items():
        source = src(input_name)
        if source.exists():
            pdf_path = PDF_OUT / output_name
            copy2(source, pdf_path)
            render_pdf_preview(pdf_path, output_name)

    print(f"Prepared {len(ASSETS)} images and {len(PDFS)} brochure slots.")


if __name__ == "__main__":
    main()
