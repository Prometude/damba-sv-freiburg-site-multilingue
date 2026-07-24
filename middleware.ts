import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse() {
  return new NextResponse(
    "Authentification administrateur requise.",
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Administration Damba SV Freiburg", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    }
  );
}

export function middleware(request: NextRequest) {
  const expectedUsername =
    process.env.ADMIN_USERNAME;

  const expectedPassword =
    process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    console.error(
      "ADMIN_USERNAME ou ADMIN_PASSWORD n’est pas configuré."
    );

    return new NextResponse(
      "Configuration administrateur incomplète.",
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  try {
    const encodedCredentials =
      authorization.slice("Basic ".length);

    const decodedCredentials =
      atob(encodedCredentials);

    const separatorIndex =
      decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {
      return unauthorizedResponse();
    }

    const username =
      decodedCredentials.slice(0, separatorIndex);

    const password =
      decodedCredentials.slice(separatorIndex + 1);

    if (
      username !== expectedUsername ||
      password !== expectedPassword
    ) {
      return unauthorizedResponse();
    }

    return NextResponse.next();
  } catch {
    return unauthorizedResponse();
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
