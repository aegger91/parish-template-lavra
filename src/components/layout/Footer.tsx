"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { schedule, site } from "@/lib/content";
import { subscribeNewsletter } from "@/lib/handlers";
import { pagePath } from "@/lib/routes";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { PaintedBand } from "@/components/orthodox/Ornaments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNav } from "./useNav";

function SocialIcon({ network }: { network: string }) {
  const common = { className: "size-5", viewBox: "0 0 24 24", "aria-hidden": true, fill: "currentColor" } as const;
  if (network === "facebook")
    return (
      <svg {...common}>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H8v3h2.5V21z" />
      </svg>
    );
  if (network === "youtube")
    return (
      <svg {...common}>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
      </svg>
    );
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      return;
    }
    setState("sending");
    await subscribeNewsletter(email);
    setState("done");
  };
  return (
    <div className="fresco-card p-5 text-ink sm:p-6">
      <div className="relative z-10">
        <p className="rubric text-sm">{t("newsletter.label")}</p>
        <h2 className="mt-1 text-2xl text-ink">{t("newsletter.title")}</h2>
        <p className="mt-1.5 text-[0.95rem] text-ink-soft">{t("newsletter.text")}</p>
        {state === "done" ? (
          <p role="status" className="mt-4 rounded border border-verdigris/40 bg-verdigris/10 px-3 py-2 text-[0.95rem]">
            {t("newsletter.done")}
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="newsletter-email" className="sr-only">
                {t("form.email")}
              </Label>
              <Input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder={t("newsletter.placeholder")}
                aria-invalid={state === "error"}
                aria-describedby={state === "error" ? "newsletter-error" : undefined}
                className="h-11 bg-white/70 text-base"
              />
            </div>
            <button type="submit" className="btn-lavra btn-lapis" disabled={state === "sending"}>
              {state === "sending" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t("newsletter.submit")}
            </button>
          </form>
        )}
        {state === "error" && (
          <p id="newsletter-error" className="mt-2 text-sm text-cinnabar">
            {t("form.emailInvalid")}
          </p>
        )}
        <p className="mt-3 text-[0.8rem] text-ink-faint">{t("newsletter.note")}</p>
      </div>
    </div>
  );
}

export function Footer() {
  const { lang, locale, tr, t, fmtTime } = useI18n();
  const { links, buttons, label, href } = useNav();
  const days = [0, 1, 2, 3, 4, 5, 6];
  const weekdayName = (d: number) =>
    new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + d)));
  const services = schedule.weekly.filter((w) => !["class", "community"].includes(w.kind));

  return (
    <footer className="mt-20">
      <PaintedBand variant="diamond" />
      <div className="plaster-lapis">
        <div className="container-lavra grid gap-10 py-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <Cross className="h-10 text-ochre-light" />
              <div>
                <p className="font-heading text-2xl font-bold text-[#fbf1da]">{tr(site.parish.name)}</p>
                <p className="label-sc text-sm text-ochre-light">{tr(site.parish.jurisdiction)}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2.5 text-[0.97rem]">
              <li className="flex gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-ochre-light" aria-hidden="true" />
                <span>{site.contact.addressLines.join(", ")}</span>
              </li>
              <li>
                <a className="flex gap-2.5 hover:text-white max-lg:min-h-11 max-lg:items-center" href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`}>
                  <Phone className="size-4 shrink-0 text-ochre-light lg:mt-1" aria-hidden="true" />
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a className="flex gap-2.5 [overflow-wrap:anywhere] hover:text-white max-lg:min-h-11 max-lg:items-center" href={`mailto:${site.contact.email}`}>
                  <Mail className="size-4 shrink-0 text-ochre-light lg:mt-1" aria-hidden="true" />
                  {site.contact.email}
                </a>
              </li>
            </ul>
            <ul className="mt-6 flex gap-2" aria-label={t("footer.social")}>
              {site.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    className="grid size-11 place-items-center rounded-full border border-ochre-light/40 text-ochre-light transition hover:border-ochre-light hover:bg-white/10"
                    aria-label={s.label}
                  >
                    <SocialIcon network={s.network} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="label-sc text-lg text-ochre-light">{t("footer.serviceTimes")}</h2>
            <dl className="mt-4 space-y-3 text-[0.97rem]">
              {days
                .map((d) => ({ d, list: services.filter((s) => s.dayOfWeek === d) }))
                .filter((x) => x.list.length)
                .map(({ d, list }) => (
                  <div key={d}>
                    <dt className="font-heading font-bold capitalize text-[#fbf1da]">{weekdayName(d)}</dt>
                    {list.map((s) => (
                      <dd key={s.id} className="flex gap-2 text-[#efe2c4]">
                        <span className="w-[4.6rem] shrink-0 whitespace-nowrap tabular-nums text-ochre-light">{fmtTime(s.time)}</span>
                        <span>{tr(s.name)}</span>
                      </dd>
                    ))}
                  </div>
                ))}
            </dl>
            <Link href={pagePath(lang, "services")} className="mt-4 inline-flex items-center text-ochre-light underline underline-offset-4 hover:text-white max-lg:min-h-11">
              {t("footer.fullSchedule")}
            </Link>
          </div>

          <div className="lg:col-span-2">
            <h2 className="label-sc text-lg text-ochre-light">{t("footer.explore")}</h2>
            <ul className="mt-4 grid gap-x-6 text-[0.97rem] max-lg:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] lg:space-y-2">
              {[...links, ...buttons].map((n) => (
                <li key={n.id}>
                  <Link href={href(n)} className="hover:text-white hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:min-w-11 max-lg:items-center">
                    {label(n)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">{site.orthodoxConnect.newsletter.enabled && <Newsletter />}</div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-lavra flex flex-col gap-2 py-5 text-[0.85rem] text-[#d9cbab] sm:flex-row sm:items-center sm:justify-between">
            <p>{site.sampleNotice ? t("footer.sampleNotice") : `© ${tr(site.parish.name)}`}</p>
            <p>{t("footer.connect")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
