"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type SetStateAction } from "react";
import Image from "next/image";
import { ArrowRight, Globe2, LocateFixed, MapPin, Sparkles, UserRound } from "lucide-react";
import { Quests } from "@/components/quests-screen";
import { Wallet } from "@/components/wallet-screen";
import { act, useGame } from "@/lib/game-store";
import { activeRun, type Game } from "@/lib/game";
import { OFF_PEAK } from "@/config/game";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { KyotoMap } from "@/components/map/kyoto-map";
import { Button, ConfirmDialog, haptic, ICON_STROKE } from "@/components/ui";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { INITIAL_LOCATION_STATE, locationModeText, locationStatusText, type LocationState } from "@/lib/location";
import { getProfileSnapshot, readProfile, saveProfile, subscribeProfile, type Profile } from "@/lib/profile";
import type { RouteFilter } from "@/lib/route-discovery";

function LanguageChoice({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return <div className="segmented" role="group" aria-label={translate(locale, "chooseLanguage")}>
    <button type="button" aria-pressed={locale === "en"} onClick={() => onChange("en")}>English</button>
    <button type="button" aria-pressed={locale === "ja"} onClick={() => onChange("ja")}>日本語</button>
  </div>;
}

function Switch({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return <button type="button" className="switch-row" role="switch" aria-checked={checked} onClick={() => { haptic(); onChange(!checked); }}>
    <span>{children}</span><span className="switch-track" aria-hidden="true"><span /></span>
  </button>;
}

function Welcome({ locale, onLocale, onStart }: { locale: Locale; onLocale: (locale: Locale) => void; onStart: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");
  const t = (key: MessageKey) => translate(locale, key);
  return <main className="welcome-screen">
    <div className="welcome-top"><span className="brand-seal" aria-hidden="true">京</span><span>{t("appName")}</span></div>
    <div className="walk-cover">
      <h1>{t("welcomeTitle")}</h1>
      <Image src="/art/kamo-woodblock.webp" width={320} height={468} alt={t("printAlt")} priority />
    </div>
    <p className="welcome-instruction">{t("welcomeBody")}</p>
    <form className="welcome-form" onSubmit={(event) => { event.preventDefault(); onStart(nickname.trim()); }}>
      <p className="form-label">{t("chooseLanguage")}</p>
      <LanguageChoice locale={locale} onChange={onLocale} />
      <label htmlFor="nickname" className="form-label">{t("nicknameLabel")}</label>
      <input id="nickname" className="text-input" value={nickname} maxLength={40} autoComplete="nickname" placeholder={t("nicknamePlaceholder")} onChange={(event) => setNickname(event.target.value)} />
      <p className="form-hint">{t("nicknameHint")}</p>
      <Button type="submit" className="full-width">{t("startExploring")}<ArrowRight size={19} strokeWidth={ICON_STROKE} /></Button>
    </form>
  </main>;
}

function SettingsScreen({ game, onReset, locale, profile, location, onLocale, onSave, onDemoChange, onRecenter }: { game: Game; onReset: () => void; locale: Locale; profile: Profile; location: LocationState; onLocale: (locale: Locale) => void; onSave: (nickname: string) => void; onDemoChange: (enabled: boolean) => void; onRecenter: () => void }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  return <div className="content-screen settings-screen">
    <h1>{t("navSettings")}</h1>
    <section className="settings-section">
      <h2><Globe2 size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("languageHeading")}</h2>
      <LanguageChoice locale={locale} onChange={onLocale} />
    </section>
    <section className="settings-section">
      <h2><UserRound size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("profileHeading")}</h2>
      <form onSubmit={(event) => { event.preventDefault(); onSave(nickname.trim()); setSaved(true); }}>
        <label className="form-label" htmlFor="settings-nickname">{t("nicknameLabel")}</label>
        <input className="text-input" id="settings-nickname" value={nickname} maxLength={40} onChange={(event) => { setNickname(event.target.value); setSaved(false); }} placeholder={t("nicknamePlaceholder")} />
        <Button type="submit" variant="secondary" className="full-width">{t("nicknameSave")}</Button>
        {saved && <p className="save-message" role="status">{t("nicknameSaved")}</p>}
      </form>
    </section>
    <section className="settings-section">
      <h2><MapPin size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("locationSettingsHeading")}</h2>
      <dl className="settings-status">
        <div><dt>{t("locationSettingsMode")}</dt><dd>{locationModeText(locale, location.mode)}</dd></div>
        <div><dt>{t("locationSettingsGps")}</dt><dd>{locationStatusText(locale, location)}</dd></div>
      </dl>
      <Switch checked={location.mode === "demo"} onChange={onDemoChange}>{t("locationSettingsDemoSwitch")}</Switch>
      <Button type="button" variant="secondary" className="full-width" onClick={onRecenter}><LocateFixed size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("locationSettingsRecenter")}</Button>
      <p className="settings-hint">{t("locationSettingsHint")}</p>
    </section>
    <section className="settings-section">
      <h2><Sparkles size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gameProgress")}</h2>
      <Switch checked={game.offPeak} onChange={enabled => void act({ type: "offPeak", enabled })}>{t("offPeakSimulateSwitch", { multiplier: OFF_PEAK.multiplier.toFixed(1) })}</Switch>
      <p className="settings-hint">{t("offPeakSimulateHint")}</p>
      <Button variant="secondary" className="full-width" onClick={() => setResetOpen(true)}>{t("gameReset")}</Button>
    </section>
    <details className="settings-about">
      <summary>{t("aboutHeading")}</summary>
      <p>{t("aboutBody")}</p>
      <p><a href="https://commons.wikimedia.org/wiki/File:Kyoto_Shijo_yu-suzumi-Cooling_Off_at_the_Kamo_River_near_Shijo_in_Kyoto_MET_DP123612.jpg">{t("printCredit")}</a></p>
    </details>
    <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} title={t("gameReset")} closeLabel={t("close")}>
      <p>{t("gameResetBody")}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={() => setResetOpen(false)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { await act({ type: "reset" }); onReset(); setResetOpen(false); }}>{t("gameConfirm")}</Button>
      </div>
    </ConfirmDialog>
  </div>;
}

export function PrototypeApp() {
  const game = useGame();
  const snapshot = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => undefined);
  const ready = snapshot !== undefined;
  const profile = ready ? readProfile() : null;
  const [welcomeLocale, setWelcomeLocale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [browsedWalk, setSelectedWalkId] = useState<string | null>();
  const selectedWalkId = browsedWalk === undefined ? activeRun(game)?.walkId ?? null : browsedWalk;
  // Search and filters survive tab switches for the session.
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>(null);
  const [deviceLocation, setDeviceLocation] = useState<LocationState>(INITIAL_LOCATION_STATE);
  const handleLocationChange = useCallback((next: SetStateAction<LocationState>) => {
    setDeviceLocation((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      return resolved.mode === "demo" ? INITIAL_LOCATION_STATE : resolved;
    });
  }, []);
  const location: LocationState = game.demo
    ? { mode: "demo", gpsStatus: "off", fix: null }
    : deviceLocation;
  const prevDemoRef = useRef(game.demo);
  useEffect(() => {
    const wasDemo = prevDemoRef.current;
    prevDemoRef.current = game.demo;
    if (!wasDemo && game.demo) {
      const timer = window.setTimeout(() => setDeviceLocation(INITIAL_LOCATION_STATE), 0);
      return () => window.clearTimeout(timer);
    }
  }, [game.demo]);
  const [settingsRecenterRequest, setSettingsRecenterRequest] = useState(false);

  const locale = profile?.locale ?? welcomeLocale;
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  function selectTab(tab: Tab) {
    if (activeTab === "explore" && tab !== "explore") {
      handleLocationChange((current) => current.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(current.gpsStatus)
        ? { mode: "live", gpsStatus: "paused", fix: null } : current);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!ready) return <div className="loading-screen"><span className="brand-seal" aria-hidden="true">京</span><span>Kyoto AI Lab prototype</span></div>;
  if (!profile) return <Welcome locale={welcomeLocale} onLocale={setWelcomeLocale} onStart={(nickname) => { saveProfile({ nickname, locale: welcomeLocale }); setActiveTab("explore"); }} />;

  function openWalk(id: string) {
    setSelectedWalkId(id);
    selectTab("explore");
  }
  return <div className="app-shell" data-tab={activeTab}>
    <main key={activeTab} id="main-content" className="app-main">
      {activeTab === "explore" && <KyotoMap game={game} selectedWalkId={selectedWalkId} setSelectedWalkId={setSelectedWalkId} query={query} setQuery={setQuery} routeFilter={routeFilter} setRouteFilter={setRouteFilter} locale={locale} location={location} onLocationChange={handleLocationChange} settingsRecenterRequest={settingsRecenterRequest} onSettingsRecenterHandled={() => setSettingsRecenterRequest(false)} onWallet={() => selectTab("wallet")} />}
      {activeTab === "quests" && <Quests game={game} locale={locale} onWalk={openWalk} />}
      {activeTab === "wallet" && <Wallet game={game} locale={locale} />}
      {activeTab === "settings" && <SettingsScreen game={game} onReset={() => { setSelectedWalkId(null); handleLocationChange(INITIAL_LOCATION_STATE); }} locale={locale} profile={profile} location={location} onLocale={(next) => saveProfile({ ...profile, locale: next })} onSave={(nickname) => saveProfile({ ...profile, nickname })} onDemoChange={enabled => { handleLocationChange(INITIAL_LOCATION_STATE); void act({ type: "demo", enabled }); }} onRecenter={() => { setSettingsRecenterRequest(true); selectTab("explore"); }} />}
    </main>
    <BottomNav active={activeTab} locale={locale} onSelect={selectTab} />
  </div>;
}
