export function PageIntro({ description, children, extra }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {extra}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
