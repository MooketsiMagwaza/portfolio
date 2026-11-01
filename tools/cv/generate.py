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
    "profile": ParagraphStyle("Profile", parent=BASE["BodyText"], fontName=FONT, fontSize=8.4, leading=10.4, textColor=INK, spaceAfter=2),
    "project": ParagraphStyle("Project", parent=BASE["BodyText"], fontName=BOLD, fontSize=9, leading=10.5, textColor=INK),
    "right": ParagraphStyle("Right", parent=BASE["BodyText"], fontName=FONT, fontSize=8.2, leading=10.5, alignment=TA_RIGHT, textColor=INK),
    "meta": ParagraphStyle("Meta", parent=BASE["BodyText"], fontName=ITALIC, fontSize=8, leading=9.4, textColor=MUTED, spaceAfter=1.4),
    "bullet": ParagraphStyle("Bullet", parent=BASE["BodyText"], fontName=FONT, fontSize=7.95, leading=9.65, leftIndent=10, firstLineIndent=-7, textColor=INK, spaceAfter=0.8),
    "skills_label": ParagraphStyle("SkillsLabel", parent=BASE["BodyText"], fontName=BOLD, fontSize=7.6, leading=9.2, textColor=INK),
    "skills_value": ParagraphStyle("SkillsValue", parent=BASE["BodyText"], fontName=FONT, fontSize=7.6, leading=9.2, textColor=INK),
}


def section(title: str) -> list:
    return [
        Paragraph(title.upper(), S["section"]),
        HRFlowable(width="100%", thickness=0.65, color=RULE, spaceAfter=2.4),
    ]


def entry(title: str, link: str, right: str, meta: str, bullets: list[str]) -> KeepTogether:
    heading = Table(
        [[Paragraph(f'<link href="{link}" color="#111111">{title}</link>', S["project"]), Paragraph(right, S["right"])]],
        colWidths=[142 * mm, 32 * mm],
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
    canvas.drawString(18 * mm, 8 * mm, "Project experience CV · Claims are limited to repository evidence and recorded verification.")
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
        subject="ATS-friendly project experience, technical skills, and product engineering work",
        keywords="full-stack engineer, backend engineer, platform engineer, TypeScript, React, Next.js, Rust, Axum, Python, FastAPI, Tauri, Windows APIs, PostgreSQL, PostGIS, Redis, Docker, GitHub Actions, OpenTelemetry, MapLibre, offline-first, inventory management, expiry tracking",
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
    story.extend(section("Professional Summary"))
    story.append(
        Paragraph(
            "Product-minded full-stack engineer who turns real operational problems into working software across interface, API, data, security, documentation, deployment, and observability. Experience includes offline-first geospatial systems, browser-based inventory and expiry tracking, distributed Rust services, local-first desktop software, PostgreSQL/PostGIS, CI/CD, and Docker-based operations. Strongest where user workflow, data integrity, and system boundaries must be designed together.",
            S["profile"],
        )
    )

    story.extend(section("Selected Project Experience"))
    story.append(
        entry(
            "Kori — Offline-First Wildlife Platform",
            "https://github.com/MooketsiMagwaza/kori",
            "2026",
            "Product design, full-stack engineering, geospatial data, privacy, and operations",
            [
                "Built four Next.js/TypeScript apps for low-connectivity safari use: a phone field app, landing site, review console, and API reference; sightings queue in IndexedDB and sync when connectivity returns.",
                "Implemented MapLibre and PMTiles offline maps, QR sharing, on-device photo metadata removal, review delays, coarse spatial cells, and track-only routing that excludes sensitive species.",
                "Built and privately verified a Savuti pack from OpenStreetMap tracks and Sentinel-2 imagery; satellite-first rendering, attribution, local storage, routing, and offline reload passed 16/16 automated checks.",
                "Developed a FastAPI/PostGIS backend with Alembic migrations, accounts, scoped API keys, uploads, reviews, trips, lifecycle jobs, Docker Compose, OpenTelemetry, Prometheus, Grafana, Tempo, backup tooling, and CI. The backend is tested but not yet connected to the apps.",
            ],
        )
    )
    story.append(
        entry(
            "Tagwise — Browser-Based Asset, Stock & Expiry Register",
            "https://github.com/MooketsiMagwaza/tagwise",
            "2026",
            "Product strategy, React application, spreadsheet workflows, Rust services, and data integrity",
            [
                "Started from a pharmacy problem: my sister needed a practical way to track batches, bulk stock, and expiry dates without buying a desktop POS subscription plus separate extensions.",
                "Built a responsive React/TypeScript workspace with an Excel-like register, saved views, QR/barcode scanning, printable labels, batch and expiry fields, expiring-stock alerts, multi-person stock-takes, roles, history, and stale-edit conflict handling.",
                "Implemented Excel/CSV import with column matching, date and duplicate validation, preview-before-write, problem reports, and formula-injection guards; the browser build works with a labelled local sample workspace and requires no dedicated desktop app.",
                "Built five Axum services in Rust behind nginx with PostgreSQL, Redis, migrations, concurrency/idempotency tests, OpenAPI docs, Docker Compose, GitHub Actions, and OpenTelemetry/Prometheus/Grafana/Tempo. The web app is not yet connected to these services.",
            ],
        )
    )
    story.append(
        entry(
            "Opaline — Windows Desktop Launcher",
            "https://github.com/MooketsiMagwaza/opaline",
            "2026",
            "Tauri 2, Rust, TypeScript, CSS, WebView2, and Windows APIs",
            [
                "Built a full-screen acrylic launcher that organises existing Desktop items into virtual panes and adds installed-app search, custom home screens, a taskbar mirror, local screen-time totals, and focus tools.",
                "Defined a strict safety boundary: Opaline reads Desktop files but never moves, renames, or deletes them and makes no network requests; shipped v0.2.1 as NSIS, MSI, and portable Windows builds.",
            ],
        )
    )
    story.append(
        entry(
            "University CS Docs — Open Learning Platform",
            "https://github.com/MooketsiMagwaza/university-cs-docs",
            "2026",
            "Next.js, MDX, reusable learning components, CI, CodeQL, and contributor documentation",
            [
                "Built and deployed a contribution-friendly study hub for University of Botswana computer-science courses, with course notes, code, quizzes, semester views, and a focus timer.",
            ],
        )
    )

    story.extend(section("Technical Skills"))
    skill_rows = [
        ("Languages", "TypeScript, JavaScript, Rust, Python, SQL, Go, Java"),
        ("Frontend", "React, Next.js, Vite, responsive UI, accessibility, IndexedDB"),
        ("Backend", "Axum, FastAPI, REST APIs, authentication, background jobs"),
        ("Data", "PostgreSQL, PostGIS, Redis, SQLAlchemy, sqlx, Alembic"),
        ("DevOps & Observability", "Docker, nginx, GitHub Actions, OpenTelemetry, Prometheus, Grafana, Tempo, Trivy"),
        ("Native & Geospatial", "Tauri 2, Windows APIs, WebView2, MapLibre, PMTiles"),
    ]
    skills_table = Table(
        [[Paragraph(label, S["skills_label"]), Paragraph(value, S["skills_value"])] for label, value in skill_rows],
        colWidths=[39 * mm, 135 * mm],
        hAlign="LEFT",
    )
    skills_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F1F1F1")),
                ("LINEBELOW", (0, 0), (-1, -2), 0.25, colors.HexColor("#D7D7D7")),
                ("BOX", (0, 0), (-1, -1), 0.35, colors.HexColor("#BDBDBD")),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D7D7D7")),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story.append(skills_table)

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public/Mooketsi-Magwaza-CV.pdf")
    build(target.resolve())
    print(target.resolve())
