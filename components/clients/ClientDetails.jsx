import { Mail, Phone, MapPin, FileText } from "lucide-react";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
} from "@/components/layout/GradientCard";
import { formatDate } from "@/lib/formatDate";

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ClientDetails({ client }) {
  return (
    <GradientCard>
      <GradientCardHeader>
        <GradientCardTitle>{client.name}</GradientCardTitle>
        <GradientCardDescription>Added {formatDate(client.createdAt)}</GradientCardDescription>
      </GradientCardHeader>
      <GradientCardContent className="space-y-4">
        <DetailRow icon={Mail} label="Email" value={client.email} />
        <DetailRow icon={Phone} label="Phone" value={client.phone} />
        <DetailRow icon={MapPin} label="Address" value={client.address} />
        <DetailRow icon={FileText} label="Notes" value={client.notes} />
        {!client.email && !client.phone && !client.address && !client.notes ? (
          <p className="text-sm text-muted-foreground">No additional details on file.</p>
        ) : null}
      </GradientCardContent>
    </GradientCard>
  );
}
