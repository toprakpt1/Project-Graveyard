export function GraveyardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 20h18" />
      <path d="M7 20V10a2 2 0 0 1 4 0v10" />
      <path d="M15 20V13a1.5 1.5 0 0 1 3 0v7" />
    </svg>
  )
}