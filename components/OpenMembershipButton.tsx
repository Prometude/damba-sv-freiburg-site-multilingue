import type { ReactNode } from "react";
import Link from "next/link";

type OpenMembershipButtonProps = {
  children: ReactNode;
  className?: string;
};

export default function OpenMembershipButton({
  children,
  className = "btn",
}: OpenMembershipButtonProps) {
  return (
    <Link
      href="/inscription"
      className={className}
    >
      {children}
    </Link>
  );
}
