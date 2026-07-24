import {
  NextResponse,
} from "next/server";

import {
  destroyMemberSession,
} from "../../../../lib/member-session";

export async function POST(
  request: Request
) {
  await destroyMemberSession();

  return NextResponse.redirect(
    new URL(
      "/espace-membre/connexion",
      request.url
    ),
    303
  );
}
