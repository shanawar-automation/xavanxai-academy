/**
 * `template.tsx` re-mounts on every navigation (unlike layout.tsx),
 * which gives us a smooth fade between pages for free.
 * Opacity only — a persistent `transform` would trap `position: fixed` modals.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
