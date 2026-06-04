import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
};

/** Consistent titled card used for every section of the portal. */
export const SectionCard = ({ title, description, icon, children }: SectionCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        {icon}
        {title}
      </CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
