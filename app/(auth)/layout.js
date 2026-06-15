export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-sidebar-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,103,181,0.14),transparent_55%)]" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
