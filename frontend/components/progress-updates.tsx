import Alert from "./alert";

interface ProgressUpdatesProps {
  progressMessage: string;
}

/**
 * ProgressUpdates component displays the current progress message.
 *
 * @param {ProgressUpdatesProps} props - The component props
 * @return {JSX.Element} The rendered ProgressUpdates component
 */
export default function ProgressUpdates({
  progressMessage,
}: ProgressUpdatesProps): JSX.Element {
  return (
    <section id="progress" className="mb-6">
      <Alert title={progressMessage} variant="progress" />
    </section>
  );
}
