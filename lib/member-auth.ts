import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";

import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export function createSecureToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function hashPassword(
  password: string
) {
  const salt = randomBytes(16).toString("hex");

  const derivedKey = (await scrypt(
    password,
    salt,
    64
  )) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
) {
  const [
    algorithm,
    salt,
    storedKeyHex,
  ] = storedHash.split(":");

  if (
    algorithm !== "scrypt" ||
    !salt ||
    !storedKeyHex
  ) {
    return false;
  }

  try {
    const storedKey =
      Buffer.from(storedKeyHex, "hex");

    const derivedKey = (await scrypt(
      password,
      salt,
      storedKey.length
    )) as Buffer;

    return (
      storedKey.length === derivedKey.length &&
      timingSafeEqual(storedKey, derivedKey)
    );
  } catch {
    return false;
  }
}

export function validatePassword(
  password: string
) {
  if (password.length < 10) {
    return {
      valid: false,
      error:
        "Le mot de passe doit contenir au moins 10 caractères.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error:
        "Le mot de passe doit contenir une lettre minuscule.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error:
        "Le mot de passe doit contenir une lettre majuscule.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error:
        "Le mot de passe doit contenir un chiffre.",
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      error:
        "Le mot de passe doit contenir un caractère spécial.",
    };
  }

  return {
    valid: true,
    error: "",
  };
}

export function isFinanciallyEligible(
  contributionStatus: string
) {
  return [
    "paid",
    "exempt",
    "grace_period",
  ].includes(contributionStatus);
}
