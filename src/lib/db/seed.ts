import { db } from "./index";
import {
  projects,
  tags,
  projectTags,
  translations,
  pages,
  pageBlocks,
  categories,
} from "./schema";
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

  // ── Categories ─────────────────────────────────────────────────────
  const categoryData = [
    { slug: "tech", nameEn: "Tech", namePl: "Tech", position: 0 },
    { slug: "personal", nameEn: "Personal", namePl: "Osobiste", position: 1 },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryData)
    .onConflictDoNothing()
    .returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // FormattedAI — insert or fetch existing
  let [formattedai] = await db.select().from(projects).where(and(eq(projects.slug, "formattedai"), eq(projects.locale, "en")));
  if (!formattedai) {
    [formattedai] = await db
    .insert(projects)
    .values({
      title: "FormattedAI.pl",
      slug: "formattedai",
      coverImage: "/uploads/formatted_min.avif",
      imageUrl: "/uploads/formatted_ai_main.avif",
      description: "Privacy-first developer tools suite. 100% client-side processing, zero cookies, zero tracking. Includes CSS/JS minifiers, AVIF/WebP converter, Markdown editor, SEO/GEO analyzer, and article formatter. Built with Next.js and TypeScript.",
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
      coverImage: "/uploads/tutorhub_mini.avif",
      imageUrl: "/uploads/tutorhub.avif",
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
    { key: "projects.view_live", en: "View Live", pl: "Zobacz na żywo" },
    { key: "projects.source_code", en: "Source Code", pl: "Kod źródłowy" },

    // About page - bio
    { key: "about.bio_1", en: "I am Adam Szczotka, a Software Engineer and Product Architect. I have been coding since the age of 11. I build scalable backends, fast mobile applications, and privacy-first web tools.", pl: "Jestem Adam Szczotka, Software Engineer i Architekt Produktów. Koduję od 11. roku życia. Buduję skalowalne backendy, szybkie aplikacje mobilne i narzędzia webowe z naciskiem na prywatność." },
    { key: "about.bio_2", en: "My approach is shaped by discipline built through years of competitive sports and a personal transformation that included losing 70 kg. That same discipline drives how I build software: methodically, with attention to detail, and always delivering business value.", pl: "Moje podejście kształtuje dyscyplina zbudowana przez lata sportu wyczynowego i osobista transformacja, w tym utrata 70 kg. Ta sama dyscyplina napędza sposób, w jaki buduję oprogramowanie: metodycznie, z dbałością o szczegóły i zawsze dostarczając wartość biznesową." },
    { key: "about.bio_3", en: "I believe in building tools that respect user privacy. My projects like FormattedAI are 100% client-side with zero cookies and zero tracking. When I write code, I think about the person using it.", pl: "Wierzę w budowanie narzędzi, które szanują prywatność użytkowników. Moje projekty, takie jak FormattedAI, działają w 100% po stronie klienta — zero ciasteczek, zero śledzenia. Kiedy piszę kod, myślę o osobie, która go używa." },

    // Blog post - comments
    { key: "blog.comments", en: "Comments", pl: "Komentarze" },
    { key: "blog.leave_comment", en: "Leave a comment", pl: "Zostaw komentarz" },
    { key: "blog.comment_submitted", en: "Comment submitted. It will appear after moderation.", pl: "Komentarz wysłany. Pojawi się po moderacji." },
    { key: "blog.your_name", en: "Your name", pl: "Twoje imię" },
    { key: "blog.your_comment", en: "Your comment", pl: "Twój komentarz" },
    { key: "blog.submit_comment", en: "Submit Comment", pl: "Wyślij komentarz" },
    { key: "blog.submitting", en: "Submitting...", pl: "Wysyłanie..." },

    // Admin panel
    { key: "admin.title", en: "Admin", pl: "Admin" },
    { key: "admin.back_to_site", en: "Back to site", pl: "Wróć na stronę" },
    { key: "admin.dashboard", en: "Dashboard", pl: "Panel" },
    { key: "admin.posts", en: "Posts", pl: "Posty" },
    { key: "admin.projects", en: "Projects", pl: "Projekty" },
    { key: "admin.pages", en: "Pages", pl: "Strony" },
    { key: "admin.tags", en: "Tags", pl: "Tagi" },
    { key: "admin.comments", en: "Comments", pl: "Komentarze" },
    { key: "admin.translations", en: "Translations", pl: "Tłumaczenia" },
    { key: "admin.welcome", en: "Welcome,", pl: "Witaj," },
    { key: "admin.pending_comments", en: "Pending Comments", pl: "Oczekujące komentarze" },
    { key: "admin.manage_posts", en: "Manage Posts", pl: "Zarządzaj postami" },
    { key: "admin.manage_projects", en: "Manage Projects", pl: "Zarządzaj projektami" },
    { key: "admin.moderate_comments", en: "Moderate Comments", pl: "Moderuj komentarze" },
    { key: "admin.new_post", en: "New Post", pl: "Nowy post" },
    { key: "admin.new_project", en: "New Project", pl: "Nowy projekt" },
    { key: "admin.new_page", en: "New Page", pl: "Nowa strona" },
    { key: "admin.no_posts", en: "No posts yet.", pl: "Brak postów." },
    { key: "admin.no_projects", en: "No projects yet.", pl: "Brak projektów." },
    { key: "admin.no_pages", en: "No pages yet.", pl: "Brak stron." },
    { key: "admin.no_tags", en: "No tags yet.", pl: "Brak tagów." },
    { key: "admin.no_pending", en: "No pending comments.", pl: "Brak oczekujących komentarzy." },
    { key: "admin.published", en: "Published", pl: "Opublikowany" },
    { key: "admin.draft", en: "Draft", pl: "Szkic" },
    { key: "admin.delete", en: "Delete", pl: "Usuń" },
    { key: "admin.edit", en: "Edit", pl: "Edytuj" },
    { key: "admin.add", en: "Add", pl: "Dodaj" },
    { key: "admin.approve", en: "Approve", pl: "Zatwierdź" },
    { key: "admin.reject", en: "Reject", pl: "Odrzuć" },
    { key: "admin.pending", en: "pending", pl: "oczekujące" },
    { key: "admin.comment_moderation", en: "Comment Moderation", pl: "Moderacja komentarzy" },
    { key: "admin.tag_name", en: "Tag name", pl: "Nazwa tagu" },
    { key: "admin.page_title", en: "Title", pl: "Tytuł" },
    { key: "admin.page_slug", en: "auto-generated-from-title", pl: "automatycznie-z-tytulu" },
    { key: "admin.block", en: "block", pl: "blok" },
    { key: "admin.blocks", en: "blocks", pl: "bloków" },
    { key: "admin.on", en: "on", pl: "przy" },

    // Privacy Policy
    { key: "privacy.title", en: "Privacy Policy", pl: "Polityka prywatności" },
    { key: "privacy.last_updated", en: "Last updated: April 2026", pl: "Ostatnia aktualizacja: kwiecień 2026" },
    { key: "privacy.intro", en: "This website respects your privacy. Here is exactly what data is collected and why.", pl: "Ta strona szanuje Twoją prywatność. Oto dokładnie jakie dane są zbierane i dlaczego." },
    { key: "privacy.hosting_title", en: "Hosting & Infrastructure", pl: "Hosting i infrastruktura" },
    { key: "privacy.hosting_text", en: "This site is hosted on OVH. OVH may collect standard server logs (IP address, browser type, access times) for operational purposes. No additional tracking or analytics services are used.", pl: "Strona jest hostowana na OVH. OVH może zbierać standardowe logi serwera (adres IP, typ przeglądarki, czas dostępu) w celach operacyjnych. Nie są używane żadne dodatkowe usługi śledzenia ani analityki." },
    { key: "privacy.cookies_title", en: "Cookies", pl: "Ciasteczka (cookies)" },
    { key: "privacy.cookies_text", en: "This site uses only essential cookies: a theme preference (light/dark) and a language preference (EN/PL). No tracking cookies, no analytics cookies, no third-party cookies.", pl: "Ta strona używa wyłącznie niezbędnych ciasteczek: preferencja motywu (jasny/ciemny) i preferencja języka (EN/PL). Brak ciasteczek śledzących, analitycznych ani zewnętrznych." },
    { key: "privacy.comments_title", en: "Comments", pl: "Komentarze" },
    { key: "privacy.comments_text", en: "If you leave a comment on a blog post, your name and comment text are stored in the database. Comments are moderated before publication. No email address is required or collected.", pl: "Jeśli zostawisz komentarz pod wpisem na blogu, Twoje imię i treść komentarza są zapisywane w bazie danych. Komentarze są moderowane przed publikacją. Adres e-mail nie jest wymagany ani zbierany." },
    { key: "privacy.auth_title", en: "Authentication", pl: "Uwierzytelnianie" },
    { key: "privacy.auth_text", en: "The admin panel uses GitHub OAuth for authentication. No user passwords are stored. Authentication data is limited to session management for authorized administrators only.", pl: "Panel administracyjny używa GitHub OAuth do uwierzytelniania. Żadne hasła użytkowników nie są przechowywane. Dane uwierzytelniania ograniczają się do zarządzania sesjami wyłącznie dla autoryzowanych administratorów." },
    { key: "privacy.third_party_title", en: "Third-party Services", pl: "Usługi zewnętrzne" },
    { key: "privacy.third_party_text", en: "This site does not use Google Analytics, Facebook Pixel, or any other tracking service. External links (GitHub, LinkedIn) are standard hyperlinks with no tracking parameters.", pl: "Ta strona nie korzysta z Google Analytics, Facebook Pixel ani żadnych innych usług śledzących. Linki zewnętrzne (GitHub, LinkedIn) to standardowe odnośniki bez parametrów śledzenia." },
    { key: "privacy.rights_title", en: "Your Rights", pl: "Twoje prawa" },
    { key: "privacy.rights_text", en: "You can request deletion of any comment you have made by contacting me directly. Since no personal data beyond comments is collected, there is nothing else to delete.", pl: "Możesz poprosić o usunięcie komentarza, kontaktując się ze mną bezpośrednio. Ponieważ nie są zbierane żadne dane osobowe poza komentarzami, nie ma nic więcej do usunięcia." },
    { key: "privacy.contact_title", en: "Contact", pl: "Kontakt" },
    { key: "privacy.contact_text", en: "If you have questions about this privacy policy, contact me at", pl: "Jeśli masz pytania dotyczące tej polityki prywatności, skontaktuj się ze mną pod adresem" },
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

  // ── About Page ─────────────────────────────────────────────────────
  const [aboutPage] = await db
    .insert(pages)
    .values({ slug: "about", title: "About" })
    .onConflictDoNothing()
    .returning();

  if (aboutPage) {
    await db.insert(pageBlocks).values([
      {
        pageId: aboutPage.id,
        type: "page_header",
        position: 0,
        dataEn: {
          title: "About",
          description:
            "Software Engineer & Product Architect. Coding since age 11.",
        },
        dataPl: {
          title: "O mnie",
          description:
            "Inżynier Oprogramowania & Architekt Produktów. Koduję od 11. roku życia.",
        },
      },
      {
        pageId: aboutPage.id,
        type: "rich_text",
        position: 1,
        dataEn: {
          html: "<p>I am Adam Szczotka, a Software Engineer and Product Architect. I have been coding since the age of 11. I build scalable backends, fast mobile applications, and privacy-first web tools.</p><p>My approach is shaped by discipline built through years of competitive sports and a personal transformation that included losing 70 kg. That same discipline drives how I build software: methodically, with attention to detail, and always delivering business value.</p>",
        },
        dataPl: {
          html: "<p>Jestem Adam Szczotka, Software Engineer i Architekt Produktów. Koduję od 11. roku życia. Buduję skalowalne backendy, szybkie aplikacje mobilne i narzędzia webowe z naciskiem na prywatność.</p><p>Moje podejście kształtuje dyscyplina zbudowana przez lata sportu wyczynowego i osobista transformacja, w tym utrata 70 kg. Ta sama dyscyplina napędza sposób, w jaki buduję oprogramowanie: metodycznie, z dbałością o szczegóły i zawsze dostarczając wartość biznesową.</p>",
        },
      },
      {
        pageId: aboutPage.id,
        type: "cta",
        position: 2,
        dataEn: {
          heading: "Want to work together?",
          text: "I am open to interesting B2B projects, consulting, and architecture discussions.",
          buttonText: "Get in touch",
          email: "contact@adamszczotka.dev",
        },
        dataPl: {
          heading: "Chcesz współpracować?",
          text: "Jestem otwarty na ciekawe projekty B2B, konsulting i dyskusje o architekturze.",
          buttonText: "Skontaktuj się",
          email: "contact@adamszczotka.dev",
        },
      },
    ]);
    console.log("Seeded: About page with 3 blocks");
  } else {
    console.log("About page already exists, skipping");
  }

  // ── Privacy Page ───────────────────────────────────────────────────
  const [privacyPage] = await db
    .insert(pages)
    .values({ slug: "privacy", title: "Privacy Policy" })
    .onConflictDoNothing()
    .returning();

  if (privacyPage) {
    await db.insert(pageBlocks).values([
      {
        pageId: privacyPage.id,
        type: "page_header",
        position: 0,
        dataEn: {
          title: "Privacy Policy",
          description: "Last updated: April 2026",
        },
        dataPl: {
          title: "Polityka Prywatności",
          description: "Ostatnia aktualizacja: kwiecień 2026",
        },
      },
      {
        pageId: privacyPage.id,
        type: "rich_text",
        position: 1,
        dataEn: {
          html: "<p>This website respects your privacy. Here is exactly what data is collected and why.</p><h2>Hosting & Infrastructure</h2><p>This site is hosted on OVH. OVH may collect standard server logs (IP address, browser type, access times) for operational purposes. No additional tracking or analytics services are used.</p><h2>Cookies</h2><p>This site uses only essential cookies: a theme preference (light/dark) and a language preference (EN/PL). No tracking cookies, no analytics cookies, no third-party cookies.</p><h2>Comments</h2><p>If you leave a comment on a blog post, your name and comment text are stored in the database. Comments are moderated before publication. No email address is required or collected.</p><h2>Authentication</h2><p>The admin panel uses GitHub OAuth for authentication. No user passwords are stored. Authentication data is limited to session management for authorized administrators only.</p><h2>Your Rights</h2><p>You can request deletion of any comment you have made by contacting me directly. Since no personal data beyond comments is collected, there is nothing else to delete.</p>",
        },
        dataPl: {
          html: "<p>Ta strona szanuje Twoją prywatność. Oto dokładnie jakie dane są zbierane i dlaczego.</p><h2>Hosting i infrastruktura</h2><p>Strona jest hostowana na Vercel. Vercel może zbierać standardowe logi serwera (adres IP, typ przeglądarki, czas dostępu) w celach operacyjnych. Nie są używane żadne dodatkowe usługi śledzenia ani analityki.</p><h2>Ciasteczka (cookies)</h2><p>Ta strona używa wyłącznie niezbędnych ciasteczek: preferencja motywu (jasny/ciemny) i preferencja języka (EN/PL). Brak ciasteczek śledzących, analitycznych ani zewnętrznych.</p><h2>Komentarze</h2><p>Jeśli zostawisz komentarz pod wpisem na blogu, Twoje imię i treść komentarza są zapisywane w bazie danych. Komentarze są moderowane przed publikacją. Adres e-mail nie jest wymagany ani zbierany.</p><h2>Uwierzytelnianie</h2><p>Panel administracyjny używa GitHub OAuth do uwierzytelniania. Żadne hasła użytkowników nie są przechowywane. Dane uwierzytelniania ograniczają się do zarządzania sesjami wyłącznie dla autoryzowanych administratorów.</p><h2>Twoje prawa</h2><p>Możesz poprosić o usunięcie komentarza, kontaktując się ze mną bezpośrednio. Ponieważ nie są zbierane żadne dane osobowe poza komentarzami, nie ma nic więcej do usunięcia.</p>",
        },
      },
    ]);
    console.log("Seeded: Privacy page with 2 blocks");
  } else {
    console.log("Privacy page already exists, skipping");
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
