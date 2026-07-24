import {
  cookies,
} from "next/headers";

import {
  getDatabasePool,
} from "./database";

import {
  createSecureToken,
  hashToken,
} from "./member-auth";

const COOKIE_NAME =
  process.env.MEMBER_SESSION_COOKIE ||
  "damba_member_session";

const SESSION_DURATION_DAYS = 30;

export type CurrentMember = {
  accountId: string;
  memberId: string;
  memberNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  membershipStatus: string;
  contributionStatus: string;
  contributionValidUntil:
    | Date
    | string
    | null;
  accessStatus: string;
};

function getClientIp(request: Request) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwarded) {
    return forwarded
      .split(",")[0]
      .trim()
      .slice(0, 100);
  }

  return request.headers
    .get("x-real-ip")
    ?.slice(0, 100) || null;
}

export async function createMemberSession(
  request: Request,
  memberAccountId: string
) {
  const rawToken =
    createSecureToken();

  const tokenHash =
    hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DURATION_DAYS *
        24 *
        60 *
        60 *
        1000
  );

  const pool = getDatabasePool();

  await pool.query(
    `
      INSERT INTO member_sessions (
        member_account_id,
        session_token_hash,
        expires_at,
        ip_address,
        user_agent
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
    `,
    [
      memberAccountId,
      tokenHash,
      expiresAt,
      getClientIp(request),
      request.headers
        .get("user-agent")
        ?.slice(0, 500) || null,
    ]
  );

  const cookieStore =
    await cookies();

  cookieStore.set(
    COOKIE_NAME,
    rawToken,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    }
  );
}

export async function destroyMemberSession() {
  const cookieStore =
    await cookies();

  const rawToken =
    cookieStore.get(
      COOKIE_NAME
    )?.value;

  if (rawToken) {
    const pool =
      getDatabasePool();

    await pool.query(
      `
        UPDATE member_sessions
        SET revoked_at = NOW()
        WHERE session_token_hash = $1
          AND revoked_at IS NULL
      `,
      [hashToken(rawToken)]
    );
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentMember():
  Promise<CurrentMember | null> {
  const cookieStore =
    await cookies();

  const rawToken =
    cookieStore.get(
      COOKIE_NAME
    )?.value;

  if (!rawToken) {
    return null;
  }

  const pool =
    getDatabasePool();

  const result =
    await pool.query<{
      account_id: string;
      member_id: string;
      member_number: string | null;
      first_name: string;
      last_name: string;
      email: string;
      member_role: string;
      membership_status: string;
      contribution_status: string;
      contribution_valid_until:
        | Date
        | string
        | null;
      account_access_status: string;
    }>(
      `
        SELECT
          ma.id AS account_id,
          m.id AS member_id,
          m.member_number,
          m.first_name,
          m.last_name,
          ma.email,
          m.member_role,
          m.membership_status,
          m.contribution_status,
          m.contribution_valid_until,
          m.account_access_status
        FROM member_sessions s
        INNER JOIN member_accounts ma
          ON ma.id =
            s.member_account_id
        INNER JOIN membership_applications m
          ON m.id = ma.member_id
        WHERE
          s.session_token_hash = $1
          AND s.revoked_at IS NULL
          AND s.expires_at > NOW()
          AND m.application_status =
            'approved'
          AND m.account_access_status
            IN ('active', 'limited')
        LIMIT 1
      `,
      [hashToken(rawToken)]
    );

  const member =
    result.rows[0];

  if (!member) {
    return null;
  }

  return {
    accountId:
      member.account_id,
    memberId:
      member.member_id,
    memberNumber:
      member.member_number,
    firstName:
      member.first_name,
    lastName:
      member.last_name,
    email:
      member.email,
    role:
      member.member_role,
    membershipStatus:
      member.membership_status,
    contributionStatus:
      member.contribution_status,
    contributionValidUntil:
      member.contribution_valid_until,
    accessStatus:
      member.account_access_status,
  };
}
