import {
  BadgeInfoIcon,
  LoaderCircleIcon,
  BrainIcon,
  TriangleAlertIcon,
  LucideProps,
} from "lucide-react";
import { AlertDescription, AlertTitle, Alert as BaseAlert } from "./ui/alert";
import { ForwardRefExoticComponent } from "react";

type Variant = "info" | "loader" | "progress" | "error";

interface AlertProps {
  title: string;
  description: string;
  variant?: Variant;
}

const IconMap: Record<Variant, ForwardRefExoticComponent<LucideProps>> = {
  info: BadgeInfoIcon,
  loader: LoaderCircleIcon,
  progress: BrainIcon,
  error: TriangleAlertIcon,
};

export default function Alert({
  title,
  description,
  variant = "info",
}: AlertProps) {
  const Icon = IconMap[variant as Variant];
  return (
    <div className="w-full max-w-2xl mb-8">
      <BaseAlert
        variant={variant === "error" ? "destructive" : "default"}
        className="flex items-center space-x-2 space-y-2"
      >
        <Icon
          className={`${
            variant === "loader" || variant === "progress" ? "animate-spin" : ""
          } h-5 w-5`}
        />
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
      </BaseAlert>
    </div>
  );
}
