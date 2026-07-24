import { NextResponse } from "next/server";

import { getDatabasePool } from "../../../lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttendanceStatus =
  | "present"
  | "absent";

type AttendancePayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  status?: unknown;
  guestCount?: unknown;
  language?: unknown;
  website?: unknown;
};

type BerlinDateTime = {
  year: number;
  month: number;
  day: number;
  weekday: string;
  hour: number;
  minute: number;
};

function getBerlinDateTime(
  date = new Date()
): BerlinDateTime {
  const formatter = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
  );

  const parts = formatter.formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)
      ?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    weekday: getPart("weekday"),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
  };
}

function formatYmd(
  year: number,
  month: number,
  day: number
) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function addDaysToYmd(
  year: number,
  month: number,
  day: number,
  numberOfDays: number
) {
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  date.setUTCDate(
    date.getUTCDate() + numberOfDays
  );

  return formatYmd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

function getAttendanceWindow(date = new Date()) {
  const berlin = getBerlinDateTime(date);

  const minutesSinceMidnight =
    berlin.hour * 60 + berlin.minute;

  const afterFridayOpening =
    berlin.weekday === "Friday" &&
    minutesSinceMidnight >= 5 * 60 + 30;

  const beforeSaturdayClosing =
    berlin.weekday === "Saturday" &&
    minutesSinceMidnight < 5 * 60 + 30;

  const isOpen =
    afterFridayOpening ||
    beforeSaturdayClosing;

  let trainingDate: string | null = null;

  if (afterFridayOpening) {
    trainingDate = addDaysToYmd(
      berlin.year,
      berlin.month,
      berlin.day,
      1
    );
  }

  if (beforeSaturdayClosing) {
    trainingDate = formatYmd(
      berlin.year,
      berlin.month,
      berlin.day
    );
  }

  return {
    isOpen,
    trainingDate,
  };
}

function cleanName(value: unknown) {
  return typeof value === "string"
    ? value
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 100)
    : "";
}

function cleanEmail(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase().slice(0, 254)
    : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createParticipantKey(
  firstName: string,
  lastName: string
) {
  return `${firstName} ${lastName}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureAttendanceTable() {
  const pool = getDatabasePool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS training_attendance (
      id UUID PRIMARY KEY,
      training_date DATE NOT NULL,
      participant_key TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      attendance_status TEXT NOT NULL
        CHECK (
          attendance_status IN (
            'present',
            'absent'
          )
        ),
      submitted_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),
      UNIQUE (
        training_date,
        participant_key
      )
    )
  `);

  await pool.query(`
    ALTER TABLE training_attendance
    ADD COLUMN IF NOT EXISTS
      guest_count INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    UPDATE training_attendance
    SET guest_count = 0
    WHERE guest_count IS NULL
       OR guest_count < 0
       OR guest_count > 3
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS
      training_attendance_date_idx
    ON training_attendance (
      training_date DESC
    )
  `);
}

export async function GET() {
  const window = getAttendanceWindow();

  return NextResponse.json(
    {
      isOpen: window.isOpen,
      trainingDate: window.trainingDate,
      trainingTime: "17:00–19:00",
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const window = getAttendanceWindow();

    if (
      !window.isOpen ||
      !window.trainingDate
    ) {
      return NextResponse.json(
        {
          error:
            "La confirmation de présence est actuellement fermée.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      (await request.json()) as AttendancePayload;

    // Champ anti-robot invisible
    if (
      typeof body.website === "string" &&
      body.website.trim()
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    const firstName =
      cleanName(body.firstName);

    const lastName =
      cleanName(body.lastName);

    const email =
      cleanEmail(body.email);

    const status =
      body.status === "present" ||
      body.status === "absent"
        ? body.status
        : "";

    const language =
      body.language === "en" ||
      body.language === "de"
        ? body.language
        : "fr";

    const rawGuestCount =
      typeof body.guestCount === "number"
        ? body.guestCount
        : Number(body.guestCount);

    const guestCount =
      status === "present" &&
      Number.isInteger(rawGuestCount) &&
      rawGuestCount >= 0 &&
      rawGuestCount <= 3
        ? rawGuestCount
        : 0;

    if (firstName.length < 2) {
      return NextResponse.json(
        {
          error:
            "Veuillez indiquer votre prénom.",
        },
        {
          status: 400,
        }
      );
    }

    if (lastName.length < 2) {
      return NextResponse.json(
        {
          error:
            "Veuillez indiquer votre nom.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Veuillez indiquer une adresse e-mail valide.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error:
            "Veuillez indiquer votre présence ou votre absence.",
        },
        {
          status: 400,
        }
      );
    }

    await ensureAttendanceTable();

    const participantKey =
      createParticipantKey(
        firstName,
        lastName
      );

    const pool = getDatabasePool();

    await pool.query(
      `
        INSERT INTO training_attendance (
          id,
          training_date,
          participant_key,
          first_name,
          last_name,
          email,
          attendance_status,
          guest_count,
          review_status
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        ON CONFLICT (
          training_date,
          participant_key
        )
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          attendance_status =
            EXCLUDED.attendance_status,
          guest_count =
            EXCLUDED.guest_count,
          review_status =
            EXCLUDED.review_status,
          rejection_reason = NULL,
          reviewed_at = NULL,
          reviewed_by = NULL,
          notification_sent_at = NULL,
          updated_at = NOW()
      `,
      [
        window.trainingDate,
        participantKey,
        firstName,
        lastName,
        email,
        status,
        guestCount,
        status === "present" ? "pending" : "absent",
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          language === "en"
            ? status === "present"
              ? "Your request has been recorded. A club official will review it and you will receive the decision by email."
              : "Your absence has been recorded."
            : language === "de"
              ? status === "present"
                ? "Ihre Anfrage wurde gespeichert. Ein Verantwortlicher wird sie prüfen und Sie erhalten die Entscheidung per E-Mail."
                : "Ihre Abwesenheit wurde gespeichert."
              : status === "present"
                ? "Votre demande a été enregistrée. Un responsable doit examiner votre éligibilité. Vous recevrez la décision par e-mail."
                : "Votre absence a bien été enregistrée.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erreur d’enregistrement de présence :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d’enregistrer votre réponse.",
      },
      {
        status: 500,
      }
    );
  }
}
