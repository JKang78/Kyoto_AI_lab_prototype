"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Flower2, Gift, Globe2, Info, MapPin, Save, Sparkles, Ticket } from "lucide-react";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { KyotoMap } from "@/components/map/kyoto-map";
import { BottomSheet, Button, Card, MarkerPlaceholder, Pill } from "@/components/ui";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { INITIAL_LOCATION_STATE, locationModeText, locationStatusText, type LocationState } from "@/lib/location";
import { getProfileSnapshot, readProfile, saveProfile, subscribeProfile, type Profile } from "@/lib/profile";

function LanguageChoice({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return <div className="language-choice" role="group" aria-label={translate(locale, "chooseLanguage")}>
    <button className={locale === "en" ? "selected" : ""} aria-pressed={locale === "en"} onClick={() => onChange("en")}>English</button>
    <button className={locale === "ja" ? "selected" : ""} aria-pressed={locale === "ja"} onClick={() => onChange("ja")}>日本語</button>
  </div>;
}

function Welcome({ locale, onLocale, onStart }: { locale: Locale; onLocale: (locale: Locale) => void; onStart: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");
  const t = (key: MessageKey) => translate(locale, key);
  return <main className="welcome-screen">
    <div className="welcome-top"><span className="brand-seal"><Flower2 size={21} /></span><span>{t("appName")}</span></div>
    <div className="welcome-art"><div className="art-ring art-ring--one" /><div className="art-ring art-ring--two" /><span className="art-spark art-spark--one">✦</span><span className="art-spark art-spark--two">✦</span><MarkerPlaceholder size="large" /><span className="art-caption">KYOTO · 京都</span></div>
    <div className="welcome-copy"><Pill>{t("welcomeEyebrow")}</Pill><h1>{t("welcomeTitle")}</h1><p>{t("welcomeBody")}</p></div>
    <form className="welcome-form" onSubmit={(event) => { event.preventDefault(); onStart(nickname.trim()); }}>
      <label className="form-label">{t("chooseLanguage")}</label>
      <LanguageChoice locale={locale} onChange={onLocale} />
      <label htmlFor="nickname" className="form-label">{t("nicknameLabel")}</label>
      <input id="nickname" className="text-input" value={nickname} maxLength={40} autoComplete="nickname" placeholder={t("nicknamePlaceholder")} onChange={(event) => setNickname(event.target.value)} />
      <p className="form-hint">{t("nicknameHint")}</p>
      <Button type="submit" className="full-width">{t("startExploring")}<ArrowRight size={19} /></Button>
    </form>
  </main>;
}

function SectionHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body: string }) {
  return <div className="section-header">{eyebrow && <Pill>{eyebrow}</Pill>}<h1>{title}</h1><p>{body}</p></div>;
}

function HomeScreen({ locale, name, onMap }: { locale: Locale; name: string; onMap: () => void }) {
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  return <div className="content-screen home-screen">
    <Pill>{t("homeGreeting", { name })}</Pill>
    <div className="home-hero"><span className="hero-flower" aria-hidden="true"><Flower2 size={118} strokeWidth={0.7} /></span><h1>{t("homeTitle")}</h1><p>{t("homeBody")}</p><Button onClick={onMap}>{t("exploreMap")}<ArrowRight size={18} /></Button></div>
    <div className="card-stack"><Card><div className="card-icon"><Sparkles size={22} /></div><h2>{t("homeValueTitle")}</h2><p>{t("homeValueBody")}</p></Card><Card><div className="card-icon gold"><MapPin size={22} /></div><h2>{t("homeComingTitle")}</h2><p>{t("homeComingBody")}</p></Card></div>
  </div>;
}

function FutureScreen({ locale, kind }: { locale: Locale; kind: "rewards" | "missions" }) {
  const t = (key: MessageKey) => translate(locale, key);
  const isRewards = kind === "rewards";
  const Icon = isRewards ? Gift : Ticket;
  return <div className="content-screen future-screen">
    <SectionHeader eyebrow={t("prototypeBadge")} title={t(isRewards ? "rewardsTitle" : "missionsTitle")} body={t(isRewards ? "rewardsBody" : "missionsBody")} />
    <div className="future-art"><div className="future-art-circle"><Icon size={70} strokeWidth={1.2} /></div><span className="future-art-dot a" /><span className="future-art-dot b" /><span className="future-art-dot c" /></div>
    <Card className="future-status"><span className="status-icon"><Info size={19} /></span><p>{t(isRewards ? "rewardsStatus" : "missionsStatus")}</p></Card>
  </div>;
}

function SettingsScreen({ locale, profile, location, onLocale, onSave }: { locale: Locale; profile: Profile; location: LocationState; onLocale: (locale: Locale) => void; onSave: (nickname: string) => void }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [saved, setSaved] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const t = (key: MessageKey) => translate(locale, key);
  return <div className="content-screen settings-screen">
    <SectionHeader eyebrow={t("prototypeBadge")} title={t("settingsTitle")} body={t("settingsBody")} />
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon"><Save size={20} /></span><h2>{t("profileHeading")}</h2></div><form onSubmit={(event) => { event.preventDefault(); onSave(nickname.trim()); setSaved(true); }}><label className="form-label" htmlFor="settings-nickname">{t("nicknameLabel")}</label><input className="text-input" id="settings-nickname" value={nickname} maxLength={40} onChange={(event) => { setNickname(event.target.value); setSaved(false); }} placeholder={t("nicknamePlaceholder")} /><Button type="submit" variant="secondary" className="full-width">{t("nicknameSave")}</Button>{saved && <p className="save-message" role="status">{t("nicknameSaved")}</p>}</form></Card>
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon gold"><Globe2 size={20} /></span><h2>{t("languageHeading")}</h2></div><LanguageChoice locale={locale} onChange={onLocale} /></Card>
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon"><MapPin size={20} /></span><h2>{t("locationSettingsHeading")}</h2></div><dl className="location-settings-status"><div><dt>{t("locationSettingsMode")}</dt><dd>{locationModeText(locale, location.mode)}</dd></div><div><dt>{t("locationSettingsGps")}</dt><dd>{locationStatusText(locale, location)}</dd></div></dl><p className="location-settings-hint">{t("locationSettingsHint")}</p></Card>
    <Button variant="quiet" className="about-trigger" onClick={() => setAboutOpen(true)}><Info size={19} />{t("aboutButton")}<ArrowRight size={17} /></Button>
    <BottomSheet open={aboutOpen} onClose={() => setAboutOpen(false)} title={t("aboutHeading")} closeLabel={t("close")}><p>{t("aboutBody")}</p></BottomSheet>
  </div>;
}

export function PrototypeApp() {
  const snapshot = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => undefined);
  const ready = snapshot !== undefined;
  const profile = ready ? readProfile() : null;
  const [welcomeLocale, setWelcomeLocale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [location, setLocation] = useState<LocationState>(INITIAL_LOCATION_STATE);

  const locale = profile?.locale ?? welcomeLocale;
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  function updateProfile(next: Profile) { saveProfile(next); }
  function selectTab(tab: Tab) {
    if (activeTab === "map" && tab !== "map") {
      setLocation((current) => current.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(current.gpsStatus)
        ? { mode: "live", gpsStatus: "paused", fix: null } : current);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!ready) return <div className="loading-screen"><span className="brand-seal"><Flower2 size={25} /></span><span>Kyoto AI Lab prototype</span></div>;
  if (!profile) return <Welcome locale={welcomeLocale} onLocale={setWelcomeLocale} onStart={(nickname) => { updateProfile({ nickname, locale: welcomeLocale }); setActiveTab("map"); }} />;

  const name = profile.nickname || translate(locale, "guestName");
  return <div className="app-shell">
    <header className="app-header"><span className="brand-seal"><Flower2 size={20} /></span><div><strong>KYOTO AI LAB</strong><small>{translate(locale, "tagline")}</small></div><span className="header-spark" aria-hidden="true">✦</span></header>
    <main id="main-content" className="app-main">
      {activeTab === "home" && <HomeScreen locale={locale} name={name} onMap={() => selectTab("map")} />}
      {activeTab === "map" && <KyotoMap locale={locale} location={location} onLocationChange={setLocation} onRewards={() => selectTab("rewards")} />}
      {activeTab === "rewards" && <FutureScreen locale={locale} kind="rewards" />}
      {activeTab === "missions" && <FutureScreen locale={locale} kind="missions" />}
      {activeTab === "settings" && <SettingsScreen locale={locale} profile={profile} location={location} onLocale={(next) => updateProfile({ ...profile, locale: next })} onSave={(nickname) => updateProfile({ ...profile, nickname })} />}
    </main>
    <BottomNav active={activeTab} locale={locale} onSelect={selectTab} />
  </div>;
}
