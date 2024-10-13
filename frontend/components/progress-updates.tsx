import Alert from "./alert";

interface ProgressUpdatesProps {
  progressMessage: string;
}

export default function ProgressUpdates({
  progressMessage,
}: ProgressUpdatesProps) {
  return (
    <section id="progress" className="mb-8">
      <Alert title={progressMessage} variant="progress" />
    </section>
  );
}
