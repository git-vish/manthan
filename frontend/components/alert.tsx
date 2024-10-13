import {
  BadgeInfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  LucideProps,
} from "lucide-react";
import { AlertDescription, AlertTitle, Alert as BaseAlert } from "./ui/alert";
import { ForwardRefExoticComponent } from "react";
import AnimatedShinyText from "./ui/animated-shiny-text";

type Variant = "info" | "loader" | "progress" | "error";

interface AlertProps {
  title: string;
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
 * Alert component for displaying notifications to the user.
 *
 * @param {AlertProps} props - The properties for the Alert component
 * @return {JSX.Element} The rendered Alert component
 */
export default function Alert({
  title,
  description = " ",
  variant = "info",
}: AlertProps): JSX.Element {
  const Icon = IconMap[variant]; // Get the icon based on the variant

  return (
    <div className="w-full max-w-2xl mb-8">
      <BaseAlert
        variant={variant === "error" ? "destructive" : "default"}
        className="flex items-center space-x-2 space-y-2"
      >
        {/* Render the icon if it's not a progress variant */}
        {variant !== "progress" && (
          <div className={`${variant !== "error" ? "text-blue-500" : ""}`}>
            <Icon
              className={`${
                variant === "loader" ? "animate-spin" : ""
              } h-5 w-5`}
            />
          </div>
        )}
        <div>
          <AlertTitle>
            {variant === "progress" ? (
              <AnimatedShinyText>{title}</AnimatedShinyText>
            ) : (
              <span>{title}</span>
            )}
          </AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
      </BaseAlert>
    </div>
  );
}
