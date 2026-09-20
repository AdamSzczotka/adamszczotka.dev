"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // next-themes injects its own inline theme script, and on React 19 none of
  // the props given to it reach the rendered tag — nonce included (verified
  // with a plain data-attribute, which never appeared either). The CSP
  // therefore allows that one script by hash; see THEME_SCRIPT_HASH in
  // src/proxy.ts for how to regenerate it.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  );
}
