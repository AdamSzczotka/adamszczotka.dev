import { db } from "./index";
import { projects, tags, projectTags, translations, pages, pageBlocks } from "./schema";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Tags
  const tagData = [
    { name: "TypeScript", slug: "typescript" },
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Python", slug: "python" },
    { name: "Django", slug: "django" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Docker", slug: "docker" },
    { name: "Privacy", slug: "privacy" },
    { name: "SSG", slug: "ssg" },
    { name: "i18n", slug: "i18n" },
    { name: "B2B", slug: "b2b" },
  ];

  const insertedTags = await db.insert(tags).values(tagData).onConflictDoNothing().returning();
  console.log(`Inserted ${insertedTags.length} tags`);

  // FormattedAI — insert or fetch existing
  let [formattedai] = await db.select().from(projects).where(and(eq(projects.slug, "formattedai"), eq(projects.locale, "en")));
  if (!formattedai) {
    [formattedai] = await db
    .insert(projects)
    .values({
      title: "FormattedAI.pl",
      slug: "formattedai",
      description: "Privacy-first developer tools. 100% client-side processing, zero cookies, zero tracking.",
      content: `<h2>The Problem</h2>
<p>Every formatting and conversion tool on the market sends your data to external servers. For developers working under NDA, this is a direct violation of their agreements. On top of that, most tools track users with cookies, analytics, and advertising pixels.</p>

<h2>The Solution</h2>
<p>FormattedAI is a suite of developer tools that runs entirely in the browser. Nothing ever leaves your machine:</p>
<ul>
<li><strong>Markdown Formatter</strong> — clean, consistent markdown output with live preview</li>
<li><strong>AVIF Converter</strong> — client-side image compression using WebAssembly</li>
<li><strong>CSS Minifier</strong> — strip comments, whitespace, and optimize selectors</li>
<li><strong>JS/JSON Formatter</strong> — beautify or minify JavaScript and JSON</li>
<li><strong>SEO Meta Generator</strong> — generate structured metadata for any page</li>
</ul>

<h2>Technical Decisions</h2>
<p>The entire application is built with vanilla JavaScript and compiled SCSS. No frameworks, no build-time dependencies beyond Sass and esbuild. This keeps the bundle tiny and eliminates supply chain risk.</p>
<p>Internationalization (Polish/English) is rendered at build time using SSG — no runtime i18n library, no FOUC, no layout shifts. Each language gets its own pre-rendered HTML.</p>
<p>Image conversion uses <code>@aspect/avif</code> compiled to WebAssembly, running entirely in a Web Worker to avoid blocking the main thread.</p>

<h2>Results</h2>
<ul>
<li>100/100 Lighthouse score across all pages</li>
<li>Zero external requests (no analytics, no CDN, no API calls)</li>
<li>Under 50KB total JavaScript per tool page</li>
<li>Used by developers in companies with strict data handling policies</li>
</ul>`,
      liveUrl: "https://formattedai.pl",
      githubUrl: "https://github.com/AdamSzczotka/formattedai",
    })
    .returning();
    console.log("Created FormattedAI project");
  } else {
    console.log("FormattedAI project already exists");
  }

  // TutorHub — insert or fetch existing
  let [tutorhub] = await db.select().from(projects).where(and(eq(projects.slug, "tutorhub"), eq(projects.locale, "en")));
  if (!tutorhub) {
    [tutorhub] = await db
    .insert(projects)
    .values({
      title: "TutorHub",
      slug: "tutorhub",
      description: "B2B tutoring school management system. Django monolith replacing Excel-based workflows.",
      content: `<h2>The Problem</h2>
<p>A tutoring school with 200+ active students was managing everything in Excel: student records, teacher schedules, lesson tracking, payment status, and parent communication. The owner spent 10+ hours per week on administrative tasks that should have been automated.</p>
<p>Common issues included double-booked teachers, missed payments going unnoticed for weeks, and no way to generate reports for tax season without manual data aggregation.</p>

<h2>The Solution</h2>
<p>A custom-built Django monolith with a relational PostgreSQL database designed around the school's actual workflows:</p>
<ul>
<li><strong>Student Management</strong> — profiles, contact info, lesson history, payment records</li>
<li><strong>Teacher Scheduling</strong> — availability matrix, conflict detection, automatic slot assignment</li>
<li><strong>Lesson Tracking</strong> — attendance, notes, homework assignments per student</li>
<li><strong>Invoicing</strong> — automatic monthly invoice generation based on completed lessons</li>
<li><strong>Reporting</strong> — revenue breakdowns, teacher utilization, student retention metrics</li>
</ul>

<h2>Technical Decisions</h2>
<p>Django was chosen over a SPA framework because the client needed server-rendered pages that work on older devices (some parents access the system from 5-year-old Android phones). Django's admin interface also provided an immediate internal tool for the school owner.</p>
<p>The database schema uses composite keys for schedule slots and enforces constraints at the database level (not just application level) to prevent double-booking even under concurrent access.</p>
<p>Deployment is fully Dockerized — a single <code>docker-compose up</code> brings up the app, database, and Nginx reverse proxy on any VPS.</p>

<h2>Results</h2>
<ul>
<li>Admin time reduced from 10h to under 1h per week</li>
<li>Zero double-booking incidents since deployment</li>
<li>Automated invoicing saves 3 days of manual work per month</li>
<li>System handles 200+ concurrent users without performance issues</li>
</ul>`,
      githubUrl: null,
      liveUrl: null,
    })
    .returning();
    console.log("Created TutorHub project");
  } else {
    console.log("TutorHub project already exists");
  }

  // Link tags to projects
  const allTags = await db.select().from(tags);
  const tagMap = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));

  const formattedaiTags = ["typescript", "privacy", "ssg", "i18n"];
  const tutorhubTags = ["python", "django", "postgresql", "docker", "b2b"];

  for (const slug of formattedaiTags) {
    if (tagMap[slug]) {
      await db.insert(projectTags).values({ projectId: formattedai.id, tagId: tagMap[slug] }).onConflictDoNothing();
    }
  }

  for (const slug of tutorhubTags) {
    if (tagMap[slug]) {
      await db.insert(projectTags).values({ projectId: tutorhub.id, tagId: tagMap[slug] }).onConflictDoNothing();
    }
  }

  console.log("Seeded: FormattedAI + TutorHub projects with tags");

  // ── Translations ───────────────────────────────────────────────────
  const translationData = [
    // Navigation
    { key: "nav.projects", en: "Projects", pl: "Projekty" },
    { key: "nav.blog", en: "Blog", pl: "Blog" },
    { key: "nav.about", en: "About", pl: "O mnie" },

    // Hero section
    { key: "home.hero.name", en: "Adam Szczotka", pl: "Adam Szczotka" },
    { key: "home.hero.subtitle", en: "Software Engineer & Product Architect", pl: "Inżynier Oprogramowania & Architekt Produktów" },
    { key: "home.hero.description", en: "Coding since age 11. I build scalable backends, fast mobile apps, and privacy-first web tools. I deliver business value, not just code.", pl: "Koduję od 11. roku życia. Buduję skalowalne backendy, szybkie aplikacje mobilne i bezpieczne narzędzia webowe (Privacy-First). Dowożę wartość biznesową, nie tylko kod." },
    { key: "home.hero.cta_projects", en: "View my projects", pl: "Zobacz moje projekty" },
    { key: "home.hero.cta_github", en: "GitHub", pl: "GitHub" },

    // Projects section
    { key: "home.projects.label", en: "Selected Work", pl: "Wybrane Realizacje" },
    { key: "home.projects.title", en: "Projects", pl: "Projekty" },

    // Blog section
    { key: "home.blog.label", en: "Latest", pl: "Najnowsze" },
    { key: "home.blog.title", en: "From the blog", pl: "Z bloga" },
    { key: "home.blog.empty", en: "Posts coming soon. Building in public.", pl: "Posty już wkrótce. Buduję publicznie." },
    { key: "home.blog.all", en: "All posts", pl: "Wszystkie wpisy" },

    // CTA
    { key: "home.cta.heading", en: "Got an interesting problem to solve?", pl: "Masz ciekawy problem do rozwiązania?" },
    { key: "home.cta.text", en: "I am always happy to exchange experience, discuss architecture, or explore a new B2B project. Let's talk.", pl: "Zawsze chętnie wymienię się doświadczeniami, porozmawiam o architekturze lub nowym projekcie B2B. Odezwij się." },
    { key: "home.cta.button", en: "Send a message", pl: "Wyślij wiadomość" },

    // Footer
    { key: "footer.status", en: "All systems operational", pl: "Wszystkie systemy sprawne" },
    { key: "footer.privacy", en: "Privacy", pl: "Prywatność" },

    // About
    { key: "about.title", en: "About", pl: "O mnie" },
    { key: "about.stack", en: "Stack", pl: "Technologie" },

    // Blog page
    { key: "blog.title", en: "Blog", pl: "Blog" },
    { key: "blog.description", en: "Thoughts on engineering, architecture, and building products.", pl: "Przemyślenia o inżynierii, architekturze i budowaniu produktów." },

    // Projects page
    { key: "projects.title", en: "Projects", pl: "Projekty" },
    { key: "projects.description", en: "Case studies and things I have built.", pl: "Case studies i rzeczy, które zbudowałem." },
  ];

  const insertedTranslations = await db
    .insert(translations)
    .values(translationData)
    .onConflictDoNothing()
    .returning();
  console.log(`Inserted ${insertedTranslations.length} translations`);

  // ── Homepage & Page Blocks ─────────────────────────────────────────
  const [homepage] = await db
    .insert(pages)
    .values({ slug: "home", title: "Homepage" })
    .onConflictDoNothing()
    .returning();

  if (homepage) {
    await db
      .insert(pageBlocks)
      .values([
        {
          pageId: homepage.id,
          type: "hero",
          position: 0,
          dataEn: {
            title: "Adam Szczotka",
            subtitle: "Software Engineer & Product Architect",
            description: "Coding since age 11. I build scalable backends, fast mobile apps, and privacy-first web tools. I deliver business value, not just code.",
            buttonText: "View my projects",
            buttonUrl: "#projects",
          },
          dataPl: {
            title: "Adam Szczotka",
            subtitle: "Inżynier Oprogramowania & Architekt Produktów",
            description: "Koduję od 11. roku życia. Buduję skalowalne backendy, szybkie aplikacje mobilne i bezpieczne narzędzia webowe (Privacy-First). Dowożę wartość biznesową, nie tylko kod.",
            buttonText: "Zobacz moje projekty",
            buttonUrl: "#projects",
          },
        },
        {
          pageId: homepage.id,
          type: "project_showcase",
          position: 1,
          dataEn: { projectId: formattedai.id },
          dataPl: { projectId: formattedai.id },
        },
        {
          pageId: homepage.id,
          type: "project_showcase",
          position: 2,
          dataEn: { projectId: tutorhub.id },
          dataPl: { projectId: tutorhub.id },
        },
        {
          pageId: homepage.id,
          type: "blog_feed",
          position: 3,
          dataEn: { count: 3 },
          dataPl: { count: 3 },
        },
        {
          pageId: homepage.id,
          type: "cta",
          position: 4,
          dataEn: {
            heading: "Got an interesting problem to solve?",
            text: "I am always happy to exchange experience, discuss architecture, or explore a new B2B project. Let's talk.",
            buttonText: "Send a message",
            email: "contact@adamszczotka.dev",
          },
          dataPl: {
            heading: "Masz ciekawy problem do rozwiązania?",
            text: "Zawsze chętnie wymienię się doświadczeniami, porozmawiam o architekturze lub nowym projekcie B2B. Odezwij się.",
            buttonText: "Wyślij wiadomość",
            email: "contact@adamszczotka.dev",
          },
        },
      ]);
    console.log("Seeded: Homepage with 5 page blocks");
  } else {
    console.log("Homepage already exists, skipping page blocks");
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
