"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

/**
 * Provider component wraps children in a ThemeProvider for theme management.
 *
 * @param {ProviderProps} props - The component props
 * @return {JSX.Element} The rendered Provider component
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
