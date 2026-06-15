export function getPageTitle(pathname) {
  if (pathname === "/dashboard" || pathname === "/") return "Dashboard";
  if (pathname.startsWith("/clients/new")) return "Add client";
  if (pathname.startsWith("/clients/")) return "Client details";
  if (pathname === "/clients") return "Clients";
  if (pathname.startsWith("/payments/new")) return "Add payment";
  if (pathname.startsWith("/payments/")) return "Payment details";
  if (pathname === "/payments") return "Payments";
  if (pathname === "/reports") return "Reports";
  if (pathname.startsWith("/settings/users")) return "Users";
  if (pathname.startsWith("/settings/custom-fields")) return "Custom fields";
  if (pathname.startsWith("/settings/payment-methods")) return "Payment methods";
  if (pathname.startsWith("/settings/payment-statuses")) return "Payment statuses";
  if (pathname.startsWith("/settings/business-profile")) return "Business profile";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Axaline";
}
