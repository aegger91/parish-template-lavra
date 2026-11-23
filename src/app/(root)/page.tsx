import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { Cross } from "@/components/orthodox/Cross";

const codes = site.languages.map((l) => l.code);
const pick = `(function(){var c=${JSON.stringify(codes)},d=${JSON.stringify(site.defaultLanguage)},l=(navigator.languages||[navigator.language||""]);for(var i=0;i<l.length;i++){var b=String(l[i]).toLowerCase().split("-")[0];if(c.indexOf(b)>-1){d=b;break}}location.replace("./"+d+"/"+location.hash)})();`;

/** Sends visitors to their language when it is configured, otherwise to the default language. */
export default function RootPage() {
  const name = tr(site.parish.name, site.defaultLanguage, site.defaultLanguage);
  return (
    <>
      <meta httpEquiv="refresh" content={`2; url=./${site.defaultLanguage}/`} />
      <script dangerouslySetInnerHTML={{ __html: pick }} />
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="fresco-card max-w-md p-8 text-center">
          <div className="relative z-10 grid justify-items-center gap-4">
            <Cross variant="slavic" className="h-14 w-auto text-cinnabar" />
            <h1 className="text-3xl">{name}</h1>
            <ul className="flex flex-wrap justify-center gap-2">
              {site.languages.map((l) => (
                <li key={l.code}>
                  <a href={`./${l.code}/`} lang={l.locale} className="btn-lavra btn-ghost">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
