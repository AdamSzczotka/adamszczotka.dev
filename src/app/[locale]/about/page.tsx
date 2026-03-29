import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import Image from "next/image";
import { personJsonLd } from "@/lib/utils/structured-data";

const SITE_URL = "https://adamszczotka.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

const content = {
  en: {
    title: "About",
    subtitle: "Junior Software Developer",
    bio: [
      "I am Adam Szczotka, 24 years old, a Computer Science student at Katowice School of Information Technology (WSTI) and Junior Web Developer at Euforia — a marketing and web agency based in Żory, Poland. I have been writing code since I was 11.",
      "At Euforia, I build and ship web applications and mobile apps for clients — from AI-powered automation to production infrastructure on GCP. I work across the full stack, from backend APIs to React Native mobile apps published on app stores.",
      "My strongest side is backend development, but I pick up new technologies fast. This portfolio and CMS is built with Next.js and TypeScript, which I learned specifically for this project.",
      "I have been tutoring math and computer science for 7 years — first 2 years privately, then 5 years at a tutoring school. That experience directly led to building TutorHub, a management system that automates the workflows I saw breaking down daily.",
      "I also have a background in cycling, including a Polish Championship medal. The discipline from years of structured training shapes how I approach engineering — consistent effort, measurable progress, and delivering results.",
    ],
    whatDrives: "What drives me",
    whatDrivesText:
      "I like building products that people actually use. Automation, clean architecture, and seeing real users interact with something I built — that is what keeps me going. My projects like FormattedAI are used by developers who need privacy-first tools they can trust with sensitive code.",
    experience: "Experience",
    experienceItems: [
      {
        period: "Apr 2025 — present",
        role: "Junior Web Developer",
        company: "Euforia SC, Żory",
        details: "Web and mobile apps, AI automation, GCP infrastructure",
      },
      {
        period: "Nov 2019 — present",
        role: "Math & CS Tutor",
        company: "Self-employed, then tutoring school",
        details: "7 years teaching students of all ages, managed scheduling and invoicing independently",
      },
    ],
    education: "Education",
    educationItems: [
      {
        period: "2023 — expected 2027",
        degree: "Bachelor of Engineering — Computer Science",
        school: "Katowice School of Information Technology (WSTI)",
      },
    ],
    languages: "Languages",
    languageItems: ["Polish — Native", "English — B2/C1"],
    sport: "Cycling",
    sportText:
      "Former cyclist with a Polish Championship medal. Years of structured training built the discipline and work ethic I bring to engineering — consistency, measurable progress, and pushing through when it gets hard.",
    stack: "Stack",
    connect: "Connect",
  },
  pl: {
    title: "O mnie",
    subtitle: "Junior Software Developer",
    bio: [
      "Jestem Adam Szczotka, mam 24 lata, student informatyki na Katowickiej Wyższej Szkole Technologii Informatycznych (WSTI) i Junior Web Developer w Euforia — agencji marketingowej i webowej z Żor. Kod piszę od 11. roku życia.",
      "W Euforia buduję i wdrażam aplikacje webowe i mobilne dla klientów — od automatyzacji opartej na AI po infrastrukturę produkcyjną na GCP. Pracuję w pełnym stacku, od backendowych API po aplikacje mobilne w React Native publikowane w sklepach.",
      "Moja najsilniejsza strona to backend, ale szybko przyswajam nowe technologie. To portfolio i CMS zbudowałem w Next.js i TypeScript, których nauczyłem się specjalnie pod ten projekt.",
      "Od 7 lat udzielam korepetycji z matematyki i informatyki — pierwsze 2 lata prywatnie, od 5 lat w szkole korepetycji. To doświadczenie bezpośrednio doprowadziło do stworzenia TutorHub — systemu zarządzania, który automatyzuje procesy, które codziennie widziałem jak się sypią.",
      "Mam też za sobą kolarstwo z medalem Mistrzostw Polski. Dyscyplina z lat strukturalnego treningu kształtuje moje podejście do inżynierii — konsekwentna praca, mierzalny postęp i dowożenie wyników.",
    ],
    whatDrives: "Co mnie napędza",
    whatDrivesText:
      "Lubię budować produkty, z których ludzie naprawdę korzystają. Automatyzacja, czysta architektura i widok prawdziwych użytkowników wchodzących w interakcję z czymś, co stworzyłem — to mnie trzyma. Moje projekty jak FormattedAI są używane przez deweloperów, którzy potrzebują narzędzi privacy-first, którym mogą zaufać z wrażliwym kodem.",
    experience: "Doświadczenie",
    experienceItems: [
      {
        period: "kwi 2025 — teraz",
        role: "Junior Web Developer",
        company: "Euforia SC, Żory",
        details: "Aplikacje webowe i mobilne, automatyzacja AI, infrastruktura GCP",
      },
      {
        period: "lis 2019 — teraz",
        role: "Korepetytor matematyki i informatyki",
        company: "Prywatnie, potem szkoła korepetycji",
        details: "7 lat nauczania uczniów w każdym wieku, samodzielne zarządzanie grafikiem i fakturami",
      },
    ],
    education: "Wykształcenie",
    educationItems: [
      {
        period: "2023 — planowany 2027",
        degree: "Inżynier — Informatyka",
        school: "Katowicka Wyższa Szkoła Technologii Informatycznych (WSTI)",
      },
    ],
    languages: "Języki",
    languageItems: ["Polski — ojczysty", "Angielski — B2/C1"],
    sport: "Kolarstwo",
    sportText:
      "Były kolarz z medalem Mistrzostw Polski. Lata strukturalnego treningu zbudowały dyscyplinę i etykę pracy, które wnoszę do inżynierii — konsekwencja, mierzalny postęp i praca mimo trudności.",
    stack: "Stack",
    connect: "Kontakt",
  },
};

const techStack = [
  { name: "Python", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "PHP", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "Cloud SQL", category: "Backend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "React Native", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "HTMX", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "GCP", category: "Infra" },
  { name: "Docker", category: "Infra" },
  { name: "CI/CD", category: "Infra" },
  { name: "Nginx", category: "Infra" },
  { name: "Redis", category: "Infra" },
  { name: "n8n", category: "Infra" },
];

const links = [
  { label: "GitHub", url: "https://github.com/AdamSzczotka" },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/adam-szczotka",
  },
  { label: "Email", url: "mailto:adam@adamszczotka.dev" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale as "en" | "pl"] || content.en;

  return {
    title: c.title,
    description: c.bio[0],
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: {
        en: `${SITE_URL}/en/about`,
        pl: `${SITE_URL}/pl/about`,
        "x-default": `${SITE_URL}/en/about`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.bio[0],
      url: `${SITE_URL}/${locale}/about`,
      type: "profile",
      locale: locale === "pl" ? "pl_PL" : "en_US",
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(c.title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.bio[0],
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(c.title)}`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const c = content[(locale as "en" | "pl")] || content.en;
  const jsonLd = personJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Hero: photo + intro */}
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-14 items-start">
          <div className="shrink-0">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-sm border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/30">
              <Image
                src="/uploads/hero-adam.avif"
                alt="Adam Szczotka"
                width={192}
                height={192}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 30%" }}
                priority
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
              {c.subtitle}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
              Adam Szczotka
            </h1>
            <div className="mt-6 space-y-4 text-[var(--muted)] leading-relaxed">
              {c.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* What drives me */}
        <section className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold tracking-tight">{c.whatDrives}</h2>
          <p className="mt-4 text-[var(--muted)] leading-relaxed max-w-2xl">
            {c.whatDrivesText}
          </p>
        </section>

        {/* Experience + Education side by side */}
        <div className="mt-16 pt-12 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-12">
          <section>
            <h2 className="text-lg font-semibold tracking-tight">{c.experience}</h2>
            <div className="mt-6 space-y-6">
              {c.experienceItems.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-mono text-[var(--muted)]">{item.period}</p>
                  <p className="mt-1 font-medium">{item.role}</p>
                  <p className="text-sm text-[var(--muted)]">{item.company}</p>
                  {item.details && (
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.details}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold tracking-tight">{c.education}</h2>
            <div className="mt-6 space-y-6">
              {c.educationItems.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-mono text-[var(--muted)]">{item.period}</p>
                  <p className="mt-1 font-medium">{item.degree}</p>
                  <p className="text-sm text-[var(--muted)]">{item.school}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Languages */}
        <section className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold tracking-tight">{c.languages}</h2>
          <div className="mt-4 space-y-2">
            {c.languageItems.map((lang, i) => (
              <p key={i} className="text-sm text-[var(--muted)]">{lang}</p>
            ))}
          </div>
        </section>

        {/* Sport */}
        <section className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold tracking-tight">{c.sport}</h2>
          <p className="mt-4 text-[var(--muted)] leading-relaxed max-w-2xl">
            {c.sportText}
          </p>
        </section>

        {/* Stack */}
        <section className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold tracking-tight">{c.stack}</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {["Backend", "Frontend", "Infra"].map((cat) => (
              <div key={cat}>
                <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-widest">
                  {cat}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {techStack
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <span
                        key={t.name}
                        className="font-mono text-xs text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded-sm"
                      >
                        {t.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect */}
        <section className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-lg font-semibold tracking-tight">{c.connect}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-2 border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]/50 rounded-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
