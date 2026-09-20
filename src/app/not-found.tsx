import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center bg-bg px-6">
      <div className="mx-auto w-full max-w-[420px]">
        <p className="font-mono text-[11px] tracking-[0.22em] text-dim">
          ARCHIVE SYSTEM
        </p>
        <p className="mt-8 font-mono text-[13px] tracking-[0.12em] text-mute">
          RECORD NOT FOUND
        </p>
        <Link
          href="/"
          className="mt-12 inline-block font-mono text-[11px] tracking-[0.22em] text-mute transition-colors duration-300 hover:text-ink"
        >
          [ RETURN ]
        </Link>
      </div>
    </div>
  );
}
