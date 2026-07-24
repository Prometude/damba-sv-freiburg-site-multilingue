import MemberAuthPageClient from
  "../../../components/MemberAuthPageClient";

export const metadata = {
  title:
    "Account activation | Damba SV Freiburg",
  description:
    "Activate your Damba SV Freiburg member account.",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function MemberActivationPage({
  searchParams,
}: PageProps) {
  const parameters =
    await searchParams;

  const token =
    typeof parameters.token === "string"
      ? parameters.token
      : "";

  return (
    <MemberAuthPageClient
      mode="activation"
      token={token}
    />
  );
}
