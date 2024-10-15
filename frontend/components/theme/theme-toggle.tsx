"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

/**
 * ThemeToggle component enables users to switch between light and dark themes
 * by toggling the current theme state using `next-themes`.
 *
 * @return {JSX.Element} The rendered ThemeToggle component
 */
export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();

  /**
   * Toggles the theme between light and dark modes based on the current theme.
   * Sets the theme to 'dark' if the current theme is 'light', otherwise sets it to 'light'.
   */
  const toggleTheme = (): void => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      type="button"
      size="icon"
      className="px-2 rounded-full"
      onClick={toggleTheme}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
      <MoonIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
    </Button>
  );
}
