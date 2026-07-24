import {
  redirect,
} from "next/navigation";

import MemberAuthPageClient from
  "../../../components/MemberAuthPageClient";

import {
  getCurrentMember,
} from "../../../lib/member-session";

export const metadata = {
  title:
    "Member login | Damba SV Freiburg",
  description:
    "Secure member area of Damba SV Freiburg.",
};

export default async function MemberLoginPage() {
  const currentMember =
    await getCurrentMember();

  if (currentMember) {
    redirect("/espace-membre");
  }

  return (
    <MemberAuthPageClient
      mode="login"
    />
  );
}
