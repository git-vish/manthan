"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

/**
 * Props for the Provider component, accepting children elements to be rendered.
 */
interface ProviderProps {
  children: ReactNode;
}

/**
 * Provider component wraps its children with a ThemeProvider to enable theme management.
 * It manages the theme settings, including system default and disabling transitions on theme changes.
 *
 * @param {ProviderProps} props - The component props, including children to be wrapped.
 * @return {JSX.Element} The rendered component wrapped with ThemeProvider for theme control.
 */
export function Provider({ children }: ProviderProps): JSX.Element {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
