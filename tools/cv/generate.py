from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor("#102A43")
INK = colors.HexColor("#243B53")
MUTED = colors.HexColor("#627D98")
TEAL = colors.HexColor("#0F766E")
PALE_TEAL = colors.HexColor("#E8F5F2")
PALE_BLUE = colors.HexColor("#F2F6FA")
LINE = colors.HexColor("#D9E2EC")
WHITE = colors.white


def register_fonts() -> tuple[str, str]:
    windows_fonts = Path("C:/Windows/Fonts")
    regular = windows_fonts / "segoeui.ttf"
    semibold = windows_fonts / "seguisb.ttf"
    if regular.exists() and semibold.exists():
        pdfmetrics.registerFont(TTFont("CVSans", regular))
        pdfmetrics.registerFont(TTFont("CVSans-Semibold", semibold))
        return "CVSans", "CVSans-Semibold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


def styles() -> dict[str, ParagraphStyle]:
    sample = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "Name",
            parent=sample["Title"],
            fontName=FONT_BOLD,
            fontSize=24,
            leading=27,
            textColor=WHITE,
            spaceAfter=2,
        ),
        "role": ParagraphStyle(
            "Role",
            parent=sample["Normal"],
            fontName=FONT,
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#D9F3EE"),
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=sample["Normal"],
            fontName=FONT,
            fontSize=8.5,
            leading=12,
            textColor=WHITE,
            alignment=TA_RIGHT,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=sample["Heading2"],
            fontName=FONT_BOLD,
            fontSize=11,
            leading=14,
            textColor=TEAL,
            spaceBefore=2,
            spaceAfter=5,
            uppercase=True,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=9.1,
            leading=13.1,
            textColor=INK,
            spaceAfter=5,
        ),
        "project": ParagraphStyle(
            "Project",
            parent=sample["Heading3"],
            fontName=FONT_BOLD,
            fontSize=11,
            leading=14,
            textColor=NAVY,
            spaceAfter=1,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=8.2,
            leading=11,
            textColor=MUTED,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=8.7,
            leading=12.2,
            textColor=INK,
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=8.5,
            leading=11.7,
            leftIndent=10,
            firstLineIndent=-7,
            textColor=INK,
            spaceAfter=1.5,
        ),
        "skill_label": ParagraphStyle(
            "SkillLabel",
            parent=sample["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.9,
            leading=10,
            textColor=NAVY,
        ),
        "skill_body": ParagraphStyle(
            "SkillBody",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=7.8,
            leading=10.2,
            textColor=INK,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=sample["BodyText"],
            fontName=FONT,
            fontSize=7.7,
            leading=10.5,
            textColor=MUTED,
        ),
    }


S = styles()


def header() -> Table:
    left = [
        Paragraph("Mooketsi Vincent Magwaza", S["name"]),
        Paragraph("Full-stack engineer | Product systems, backend platforms, and operations", S["role"]),
    ]
    right = Paragraph(
        "Gaborone, Botswana<br/>"
        '<link href="mailto:mooketsimagwazajr@gmail.com" color="#FFFFFF">mooketsimagwazajr@gmail.com</link><br/>'
        '<link href="https://github.com/MooketsiMagwaza" color="#FFFFFF">github.com/MooketsiMagwaza</link><br/>'
        '<link href="https://mooketsimagwaza.github.io/portfolio/" color="#FFFFFF">mooketsimagwaza.github.io</link>',
        S["contact"],
    )
    table = Table([[left, right]], colWidths=[118 * mm, 58 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (0, 0), 8 * mm),
                ("RIGHTPADDING", (-1, 0), (-1, 0), 8 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 7 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7 * mm),
            ]
        )
    )
    return table


def section_title(text: str) -> list:
    return [
        Paragraph(text.upper(), S["section"]),
        HRFlowable(width="100%", thickness=0.7, color=LINE, spaceAfter=5),
    ]


def skill_table() -> Table:
    rows = [
        ("Backend", "Rust, Axum, Python, FastAPI, Go, Java, REST APIs"),
        ("Web", "TypeScript, React, Next.js, Vite, responsive and accessible UI"),
        ("Data", "PostgreSQL, PostGIS, Redis, SQLAlchemy, sqlx, Alembic"),
        ("Operations", "Docker, nginx, GitHub Actions, OpenTelemetry, Prometheus, Grafana, Tempo"),
        ("Native", "Tauri, Rust, SwiftUI, Android platform APIs, Bluetooth HID"),
    ]
    data = [[Paragraph(label, S["skill_label"]), Paragraph(body, S["skill_body"])] for label, body in rows]
    table = Table(data, colWidths=[24 * mm, 152 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ]
        )
    )
    return table


def project(title: str, link: str, scope: str, summary: str, bullets: list[str]) -> KeepTogether:
    content = [
        Paragraph(f'<link href="{link}" color="#102A43"><u>{title}</u></link>', S["project"]),
        Paragraph(scope, S["meta"]),
        Paragraph(summary, S["body"]),
    ]
    content.extend(Paragraph(f"- {bullet}", S["bullet"]) for bullet in bullets)
    content.append(Spacer(1, 3.5 * mm))
    return KeepTogether(content)


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 12 * mm, 192 * mm, 12 * mm)
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 7.5 * mm, "Project-led CV - claims are limited to repository evidence and recorded verification.")
    canvas.drawRightString(192 * mm, 7.5 * mm, f"{doc.page}")
    canvas.restoreState()


def build(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=17 * mm,
        leftMargin=17 * mm,
        topMargin=14 * mm,
        bottomMargin=17 * mm,
        title="Mooketsi Vincent Magwaza - Project CV",
        author="Mooketsi Vincent Magwaza",
        subject="Full-stack engineering portfolio and selected project experience",
    )

    story = [header(), Spacer(1, 6 * mm)]
    story.extend(section_title("Profile"))
    story.append(
        Paragraph(
            "Full-stack engineer who turns early product ideas into working systems: interface, API, data model, "
            "authentication, documentation, deployment path, and operational tooling. Strongest in backend, "
            "full-stack, and platform-focused work where product constraints and system boundaries matter.",
            S["summary"],
        )
    )
    story.extend(section_title("Core toolkit"))
    story.extend([skill_table(), Spacer(1, 5 * mm)])
    story.extend(section_title("Selected project experience"))
    story.append(
        project(
            "Kori - offline-first wildlife sightings for Botswana",
            "https://github.com/MooketsiMagwaza/kori",
            "Next.js, TypeScript, MapLibre, IndexedDB | FastAPI, PostGIS, SQLAlchemy, Alembic | Docker and observability",
            "Designed and built a four-app product for logging, reviewing, and sharing wildlife sightings in areas with unreliable connectivity.",
            [
                "Built an offline field workflow with IndexedDB outbox storage, downloaded PMTiles packs, device-side photo metadata stripping, QR sharing, and routing constrained to known tracks.",
                "Produced a private Savuti pack from OpenStreetMap and Sentinel-2 data; verified satellite-first rendering, OSM-track guidance, attribution, and offline behavior in 16 of 16 automated checks.",
                "Implemented a FastAPI and PostGIS backend covering accounts, API keys, uploads, review, trips, publication delays, spatial privacy rules, migrations, and scheduled lifecycle jobs.",
                "Defined Docker Compose, OpenTelemetry, Prometheus, Grafana, Tempo, backup and recovery tooling, and CI checks. The backend is tested but not yet connected to the apps.",
            ],
        )
    )
    story.append(
        project(
            "Tagwise - shared asset and stock register",
            "https://github.com/MooketsiMagwaza/tagwise",
            "React, TypeScript, Vite, MapLibre | Rust, Axum, PostgreSQL, Redis | nginx, Docker, OpenTelemetry",
            "Built a responsive asset and stock workspace for organisations moving from spreadsheets to a shared register.",
            [
                "Delivered register views, QR labels, browser scanning with manual fallback, Excel and CSV import validation, collaborative stock-takes, roles, conflict handling, and sites on a map.",
                "Shaped the application into a flat Apple-style interface with no decorative gradients while keeping the marketing page a distinct product presentation.",
                "Built five Rust services - identity, register, notifications, media, and ops - behind an nginx gateway with isolated PostgreSQL databases and Redis.",
                "Added database concurrency and idempotency tests, API docs, observability, Docker Compose, and GitHub Actions. The browser app still uses a labelled sample workspace and does not yet call the services.",
            ],
        )
    )

    story.append(PageBreak())
    story.extend(section_title("Selected project experience - continued"))
    story.append(
        project(
            "Zenith - time tracking with intention",
            "https://github.com/MooketsiMagwaza/Zenith",
            "React, TypeScript, Vite, TanStack Router | Tauri 2 and Rust | SQLite, rustls, SPAKE2, Automerge",
            "Created a local-first focus workspace built around one active card, one journal, and a clear record of deliberate work.",
            [
                "Built timers, decks and cards, markdown journals, history, Zen mode, optional goals, progress, Pomodoro, calendar, and open-format import and export.",
                "Structured one repository for browser and Tauri desktop targets, an always-on-top pop-up, a static marketing site, and a Rust sync crate.",
                "Implemented an account-free device pairing and sync foundation using SPAKE2, mutual TLS with pinned certificates, Automerge, mDNS, and 36 local tests. The sync crate is not yet wired into the app.",
            ],
        )
    )
    story.append(
        project(
            "University CS Docs - open learning platform",
            "https://github.com/MooketsiMagwaza/university-cs-docs",
            "Next.js, MDX, reusable interactive components | CI, CodeQL, dependency review",
            "Built and deployed a contribution-friendly study hub for University of Botswana computer-science courses.",
            [
                "Organised course notes, code, quizzes, semester views, and a focus timer as reusable MDX-driven learning surfaces.",
                "Backed the repository with CI, CodeQL, dependency review, project governance, and a documented contributor path.",
            ],
        )
    )
    story.extend(section_title("Engineering practice"))
    practice = [
        [
            Paragraph("Product", S["skill_label"]),
            Paragraph("Start from the user journey, then make system constraints visible in the interface and docs.", S["skill_body"]),
        ],
        [
            Paragraph("Architecture", S["skill_label"]),
            Paragraph("Give data, services, permissions, and failure modes explicit owners; keep boundaries understandable.", S["skill_body"]),
        ],
        [
            Paragraph("Operations", S["skill_label"]),
            Paragraph("Treat authentication, validation, rate limits, tracing, recovery, and deployment as product work.", S["skill_body"]),
        ],
        [
            Paragraph("Evidence", S["skill_label"]),
            Paragraph("Separate verified behavior from planned work and sample data; record tests, screenshots, runbooks, and limits.", S["skill_body"]),
        ],
    ]
    practice_table = Table(practice, colWidths=[26 * mm, 150 * mm], hAlign="LEFT")
    practice_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE_TEAL),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#B9DDD6")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CBE6E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.extend([practice_table, Spacer(1, 5 * mm)])
    story.extend(section_title("Additional technical work"))
    story.append(
        Paragraph(
            "Zenith Agent (Electron prototype), GlassHID (Android Bluetooth HID controller), and Obsidian "
            "Excalidraw Low Latency (pen-input companion). More project detail and current repository links are available in the portfolio.",
            S["body"],
        )
    )
    story.append(Spacer(1, 3 * mm))
    story.append(
        Paragraph(
            '<b>Contact:</b> <link href="mailto:mooketsimagwazajr@gmail.com" color="#0F766E">mooketsimagwazajr@gmail.com</link>  |  '
            '<link href="https://github.com/MooketsiMagwaza" color="#0F766E">GitHub</link>  |  '
            '<link href="https://mooketsimagwaza.github.io/portfolio/" color="#0F766E">Portfolio</link>',
            S["small"],
        )
    )

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/pdf/Mooketsi-Magwaza-CV.pdf")
    build(target.resolve())
    print(target.resolve())
