from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


INK = colors.HexColor("#111111")
MUTED = colors.HexColor("#444444")
RULE = colors.HexColor("#333333")


def register_fonts() -> tuple[str, str, str]:
    fonts = Path("C:/Windows/Fonts")
    regular, bold, italic = fonts / "times.ttf", fonts / "timesbd.ttf", fonts / "timesi.ttf"
    if regular.exists() and bold.exists() and italic.exists():
        pdfmetrics.registerFont(TTFont("CVSerif", regular))
        pdfmetrics.registerFont(TTFont("CVSerif-Bold", bold))
        pdfmetrics.registerFont(TTFont("CVSerif-Italic", italic))
        return "CVSerif", "CVSerif-Bold", "CVSerif-Italic"
    return "Times-Roman", "Times-Bold", "Times-Italic"


FONT, BOLD, ITALIC = register_fonts()
BASE = getSampleStyleSheet()
S = {
    "name": ParagraphStyle("Name", parent=BASE["Title"], fontName=BOLD, fontSize=20, leading=22, alignment=TA_CENTER, textColor=INK, spaceAfter=2),
    "role": ParagraphStyle("Role", parent=BASE["Normal"], fontName=FONT, fontSize=9.5, leading=11, alignment=TA_CENTER, textColor=INK, spaceAfter=2),
    "contact": ParagraphStyle("Contact", parent=BASE["Normal"], fontName=FONT, fontSize=8.2, leading=10, alignment=TA_CENTER, textColor=INK),
    "section": ParagraphStyle("Section", parent=BASE["Heading2"], fontName=FONT, fontSize=10.2, leading=11.5, textColor=INK, spaceBefore=2.5, spaceAfter=1.5),
    "project": ParagraphStyle("Project", parent=BASE["BodyText"], fontName=BOLD, fontSize=9, leading=10.5, textColor=INK),
    "right": ParagraphStyle("Right", parent=BASE["BodyText"], fontName=FONT, fontSize=8.2, leading=10.5, alignment=TA_RIGHT, textColor=INK),
    "meta": ParagraphStyle("Meta", parent=BASE["BodyText"], fontName=ITALIC, fontSize=8, leading=9.4, textColor=MUTED, spaceAfter=1.4),
    "bullet": ParagraphStyle("Bullet", parent=BASE["BodyText"], fontName=FONT, fontSize=7.95, leading=9.65, leftIndent=10, firstLineIndent=-7, textColor=INK, spaceAfter=0.8),
    "skills": ParagraphStyle("Skills", parent=BASE["BodyText"], fontName=FONT, fontSize=8.1, leading=10.1, textColor=INK, spaceAfter=0.8),
}


def section(title: str) -> list:
    return [
        Paragraph(title.upper(), S["section"]),
        HRFlowable(width="100%", thickness=0.65, color=RULE, spaceAfter=2.4),
    ]


def entry(title: str, link: str, right: str, meta: str, bullets: list[str]) -> KeepTogether:
    heading_title = f'<link href="{link}" color="#111111">{title}</link>' if link else title
    heading = Table(
        [[Paragraph(heading_title, S["project"]), Paragraph(right, S["right"])]],
        colWidths=[137 * mm, 37 * mm],
        hAlign="LEFT",
    )
    heading.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    body = [heading, Paragraph(meta, S["meta"])]
    body.extend(Paragraph(f"• {bullet}", S["bullet"]) for bullet in bullets)
    body.append(Spacer(1, 1.4 * mm))
    return KeepTogether(body)


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8 * mm, "Engineering CV - claims are limited to repository evidence and recorded verification.")
    canvas.drawRightString(192 * mm, 8 * mm, "Mooketsi Vincent Magwaza")
    canvas.restoreState()


def build(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=11 * mm,
        bottomMargin=13 * mm,
        title="Mooketsi Vincent Magwaza - Full-Stack Engineer CV",
        author="Mooketsi Vincent Magwaza",
        subject="ATS-friendly education, engineering experience, selected projects, and technical skills",
        keywords="full-stack engineer, HarvestFlow, BioAmps, University of Botswana, TypeScript, React, Rust, Axum, Python, FastAPI, PostgreSQL, PostGIS, Redis, Docker, Kubernetes, GitHub Actions, OpenTelemetry, Grafana, offline-first, agricultural marketplace, clean energy",
    )

    story = [
        Paragraph("Mooketsi Vincent Magwaza", S["name"]),
        Paragraph("Full-Stack Engineer · Backend, Product Systems & Platform Engineering", S["role"]),
        Paragraph(
            'Gaborone, Botswana &nbsp;|&nbsp; <link href="mailto:mooketsimagwazajr@gmail.com" color="#1F4E79">mooketsimagwazajr@gmail.com</link> &nbsp;|&nbsp; '
            '<link href="https://github.com/MooketsiMagwaza" color="#1F4E79">github.com/MooketsiMagwaza</link> &nbsp;|&nbsp; '
            '<link href="https://mooketsimagwaza.github.io/portfolio/" color="#1F4E79">Portfolio</link>',
            S["contact"],
        ),
        Spacer(1, 2.2 * mm),
    ]
    story.extend(section("Education"))
    story.append(
        entry(
            "University of Botswana",
            "https://www.ub.bw/",
            "2025 - Present",
            "Computer Science | Gaborone, Botswana",
            [],
        )
    )

    story.extend(section("Experience"))
    story.append(
        entry(
            "HarvestFlow - Full-Stack Engineer",
            "",
            "May 2026 - October 2026",
            "Agricultural marketplace | React 19, TypeScript, Tauri 2, Rust/Axum, PostgreSQL, Redis",
            [
                "Developed an offline-aware Botswana marketplace connecting farmers, buyers, input suppliers, and logistics providers through produce listings, server-priced orders, transport offers, trip milestones, and append-only settlement records.",
                "Built React/Vite/Tauri clients and a Rust/Axum API with PostgreSQL and Redis; added role-based OTP onboarding, bounded offline caches, queued GPS check-ins, an admin operations console, Docker environments, Kubernetes manifests, and Prometheus/Grafana monitoring.",
            ],
        )
    )
    story.append(
        entry(
            "BioAmps Pty Ltd - Full-Stack Engineer",
            "",
            "November 2025 - March 2026",
            "Clean-energy software | React, TypeScript, Vite, Tailwind CSS, Supabase, IoT monitoring",
            [
                "Developed the responsive BioAmps company platform covering its mission, clean-energy projects, gallery, contact, newsletter verification, and Energy Africa Conference content.",
                "Contributed to the Mokgosi biogas monitoring system: user and admin dashboards for sensor readings, trends, alerts, generator status, fault events, and automation controls across edge, aggregator, and cloud-facing workflows.",
            ],
        )
    )

    story.extend(section("Selected Project Experience"))
    story.append(
        entry(
            "Kori - Offline-First Wildlife Platform",
            "https://github.com/MooketsiMagwaza/kori",
            "2026",
            "Product design, full-stack engineering, geospatial data, privacy, and operations",
            [
                "Built four Next.js/TypeScript apps for low-connectivity safari use: a phone field app, landing site, review console, and API reference; sightings queue in IndexedDB and sync when connectivity returns.",
                "Implemented MapLibre/PMTiles offline maps, QR sharing, photo-metadata removal, delayed coarse location sharing, and track-only routing; a private Savuti satellite pack passed 16/16 offline checks.",
                "Developed a tested FastAPI/PostGIS backend with migrations, accounts, scoped API keys, uploads, reviews, trips, lifecycle jobs, Docker Compose, OpenTelemetry, Prometheus, Grafana, Tempo, backups, and CI.",
            ],
        )
    )
    story.append(
        entry(
            "Tagwise - Browser-Based Asset, Stock & Expiry Register",
            "https://github.com/MooketsiMagwaza/tagwise",
            "2026",
            "Product strategy, React application, spreadsheet workflows, Rust services, and data integrity",
            [
                "Started from a pharmacy problem: my sister needed a practical way to track batches, bulk stock, and expiry dates without buying a desktop POS subscription plus separate extensions.",
                "Built a responsive React/TypeScript workspace with an Excel-like register, QR/barcode scanning, labels, batch and expiry alerts, stock-takes, roles, history, conflict handling, and validated Excel/CSV import.",
                "Built five Axum services behind nginx with PostgreSQL, Redis, migrations, concurrency/idempotency tests, OpenAPI docs, Docker Compose, GitHub Actions, and OpenTelemetry/Prometheus/Grafana/Tempo.",
            ],
        )
    )

    story.extend(section("Technical Skills"))
    skill_groups = [
        ("Languages", "TypeScript, Rust, Python, SQL, JavaScript, Go, Java"),
        ("Frameworks", "React, Next.js, Vite, Axum, FastAPI, Tauri 2, SQLAlchemy"),
        ("Developer Tools", "Git, Docker, nginx, GitHub Actions, Kubernetes, OpenTelemetry, Prometheus, Grafana, Tempo, Trivy"),
        ("Data & Platforms", "PostgreSQL, PostGIS, Redis, IndexedDB, sqlx, Alembic, MapLibre, PMTiles, WebView2, Windows APIs"),
    ]
    story.extend(
        Paragraph(f'<font name="{BOLD}">{label}:</font> {value}', S["skills"])
        for label, value in skill_groups
    )

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public/Mooketsi-Magwaza-CV.pdf")
    build(target.resolve())
    print(target.resolve())
