export function AsciiBackground() {
  return (
    <>
      <div
        data-aifx="ascii"
        data-aifx-colors="#242424,#3C3C3C,#5C5C5C,#848484"
        data-aifx-bg="#000000"
        data-aifx-speed="0.12"
        data-aifx-cell-size="16"
        data-aifx-levels="6"
        data-aifx-scale="2.0"
        data-aifx-glow="0.08"
        data-aifx-flicker="0.04"
        data-aifx-contrast="1.25"
        data-aifx-scanlines="0.08"
        className="ascii-plasma"
        aria-hidden="true"
      />
      <div className="ascii-veil" aria-hidden="true" />
    </>
  );
}
