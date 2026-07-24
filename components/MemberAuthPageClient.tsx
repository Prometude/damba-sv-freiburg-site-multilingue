"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
} from "react";

import {
  useLanguage,
} from "./LanguageProvider";

import MemberLoginForm from
  "./MemberLoginForm";

import MemberActivationForm from
  "./MemberActivationForm";

import {
  getMemberText,
} from "../lib/member-i18n";

type Props =
  | {
      mode: "login";
    }
  | {
      mode: "activation";
      token: string;
    };

export default function MemberAuthPageClient(
  props: Props
) {
  const { language } =
    useLanguage();

  const text = (
    key: Parameters<
      typeof getMemberText
    >[1]
  ) => getMemberText(language, key);

  const isLogin =
    props.mode === "login";

  return (
    <main className="member-auth-page">
      <section className="member-auth-card">
        <div className="member-auth-brand">
          <Image
            src="/damba.png"
            alt="Damba SV Freiburg"
            width={92}
            height={92}
            priority
          />

          <div>
            <span>
              {isLogin
                ? text("auth.secureArea")
                : text("auth.memberArea")}
            </span>

            <h1>
              {isLogin
                ? text("auth.loginTitle")
                : text(
                    "activation.title"
                  )}
            </h1>
          </div>
        </div>

        <p className="member-auth-intro">
          {isLogin
            ? text("auth.loginIntro")
            : text(
                "activation.intro"
              )}
        </p>

        {isLogin ? (
          <Suspense
            fallback={
              <p>
                {text(
                  "common.loading"
                )}
              </p>
            }
          >
            <MemberLoginForm />
          </Suspense>
        ) : (
          <MemberActivationForm
            token={props.token}
          />
        )}

        <Link
          href={
            isLogin
              ? "/"
              : "/espace-membre/connexion"
          }
          className="member-auth-link"
        >
          {isLogin
            ? text("auth.backPublic")
            : text(
                "activation.backLogin"
              )}
        </Link>
      </section>
    </main>
  );
}
