import {
  BadgeInfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  LucideProps,
} from "lucide-react";
import { AlertDescription, AlertTitle, Alert } from "@/components/ui/alert";
import { ForwardRefExoticComponent } from "react";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

// Types of alert variants
type Variant = "info" | "loader" | "progress" | "error";

interface AlertProps {
  title?: string;
  description?: string;
  variant?: Variant;
}

// Mapping of alert variants to their corresponding icons
const IconMap: Record<Variant, ForwardRefExoticComponent<LucideProps>> = {
  info: BadgeInfoIcon,
  loader: LoaderCircleIcon,
  progress: LoaderCircleIcon,
  error: TriangleAlertIcon,
};

/**
 * Alert component that displays an icon, title, and description based on the variant.
 *
 * @param {AlertProps} props - The properties for the Alert component
 * @return {JSX.Element} The rendered Alert component
 */
export default function AlertWrapper({
  title,
  description,
  variant = "info",
}: AlertProps): JSX.Element {
  const Icon = IconMap[variant];

  return (
    <div className="w-full max-w-2xl mb-8">
      <Alert
        variant={variant === "error" ? "destructive" : "default"}
        className="flex items-center space-x-2 space-y-2"
      >
        {/* Render the icon based on the variant */}
        {variant !== "progress" && (
          <div className={`${variant !== "error" ? "text-blue-500" : ""}`}>
            <Icon
              className={`${
                variant === "loader" ? "animate-spin" : ""
              } h-5 w-5`}
            />
          </div>
        )}

        {/* Alert title and description */}
        <div>
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && (
            <AlertDescription>
              {variant === "progress" ? (
                <AnimatedShinyText>{description}</AnimatedShinyText>
              ) : (
                <span>{description}</span>
              )}
            </AlertDescription>
          )}
        </div>
      </Alert>
    </div>
  );
}
