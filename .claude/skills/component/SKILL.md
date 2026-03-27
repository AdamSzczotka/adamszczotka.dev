---
name: component
description: Tworzy nowy komponent UI w stylu Linear/Vercel
argument-hint: "<nazwa-komponentu>"
---

Stworz nowy komponent UI dla projektu adamszczotka.dev. Nazwa: $ARGUMENTS

Zasady tworzenia komponentu:

1. **Lokalizacja**: Okresl czy to komponent:
   - `src/components/ui/` -- bazowy (Button, Card, Input, Badge)
   - `src/components/layout/` -- layoutowy (Nav, Footer, ThemeToggle)
   - `src/components/` -- domenowy (ProjectCard, BlogPost, CommentForm)

2. **Styl kodu**:
   - Server Component domyslnie. "use client" TYLKO gdy potrzebny stan/efekty/eventy
   - TypeScript z exportowanym typem Props
   - Tailwind CSS -- klasy inline, ZERO css modulow
   - Warianty dark/light: uzywaj `dark:` prefix
   - Import z `@/` alias

3. **Design System (BEZWZGLEDNE)**:
   - Zero emotikon, zero gradientow
   - Ostre krawedzie: `rounded-none` lub `rounded-sm`
   - Obramowania: `border border-neutral-200 dark:border-neutral-800`
   - Hovery: `hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors`
   - Duzy whitespace: `py-24`, `gap-8` minimum
   - Font mono dla tagow technicznych: `font-mono text-sm`
   - Akcent TYLKO na glowne CTA

4. **Struktura pliku**:
   ```tsx
   // Opcjonalnie: "use client"

   interface NazwaProps {
     // props
   }

   export function Nazwa({ ...props }: NazwaProps) {
     return (
       // JSX
     );
   }
   ```

5. Pokaz uzytkownikowi gotowy komponent i przyklad uzycia.
