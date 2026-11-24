"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type SetStateAction } from "react";
import Image from "next/image";
import { ArrowRight, FlaskConical, Globe2, LocateFixed, MapPin, Sparkles, UserRound, X } from "lucide-react";
import { HomeScreen } from "@/components/home-screen";
import { Missions } from "@/components/missions-screen";
import { Rewards } from "@/components/rewards-screen";
import { act, useGame } from "@/lib/game-store";
import { activeRun, balance, type Game } from "@/lib/game";
import { COUPONS, type CampaignKind } from "@/config/game";
import { PREVIEW_CONTROLS } from "@/config/environment";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { KyotoMap } from "@/components/map/kyoto-map";
import { Button, ConfirmDialog, FoxAvatar, haptic, ICON_STROKE, Segmented } from "@/components/ui";
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

function MeScreen({ game, onReset, locale, profile, location, onLocale, onSave, onDemoChange, onRecenter }: { game: Game; onReset: () => void; locale: Locale; profile: Profile; location: LocationState; onLocale: (locale: Locale) => void; onSave: (nickname: string) => void; onDemoChange: (enabled: boolean) => void; onRecenter: () => void }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  return <div className="content-screen settings-screen">
    <h1>{t("navMe")}</h1>
    {/* Passport header (visuals.md Me2): one sentence of progress, not a KPI grid. */}
    <section className="passport" aria-label={t("passportLabel")}>
      <FoxAvatar state="idle" size={88} />
      <div>
        <p className="passport-name">{profile.nickname || t("guestName")}</p>
        <p className="passport-line">{t("passportLine", {
          seals: String(new Set(game.runs.flatMap(run => run.stamps.map(stamp => stamp.placeId))).size),
          walks: String(game.runs.filter(run => run.complete).length),
          used: String(game.claims.filter(claim => claim.redeemedAt !== undefined).length),
        })}</p>
      </div>
    </section>
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
      {PREVIEW_CONTROLS && <Switch checked={location.mode === "demo"} onChange={onDemoChange}>{t("locationSettingsDemoSwitch")}</Switch>}
      <Button type="button" variant="secondary" className="full-width" onClick={onRecenter}><LocateFixed size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("locationSettingsRecenter")}</Button>
      <p className="settings-hint">{t("locationSettingsHint")}</p>
    </section>
    {PREVIEW_CONTROLS && <section className="settings-section demo-controls">
      <h2><FlaskConical size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("demoControlsHeading")}</h2>
      <p className="form-label">{t("scenarioLabel")}</p>
      <Segmented<"none" | CampaignKind> label={t("scenarioLabel")} value={game.scenario ?? "none"}
        onChange={kind => { haptic(); void act({ type: "scenario", kind: kind === "none" ? null : kind }); }} options={[
          { id: "none", label: t("scenarioNone") },
          { id: "bus_relief", label: t("scenarioBus") },
          { id: "quiet_hour", label: t("scenarioQuiet") },
        ]} />
      <p className="settings-hint">{t("scenarioHint")}</p>
    </section>}
    <section className="settings-section">
      <h2><Sparkles size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("gameProgress")}</h2>
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
  const storedProfile = ready ? readProfile() : null;
  const [welcomeLocale, setWelcomeLocale] = useState<Locale>(() => typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [browsedWalk, setSelectedWalkId] = useState<string | null | undefined>(undefined);
  const selectedWalkId = browsedWalk === undefined ? activeRun(game)?.walkId ?? null : browsedWalk;
  // Search and filters survive tab switches for the session.
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
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
  // A public build has no simulation controls, so clear any demo state saved by an earlier preview build.
  useEffect(() => {
    if (PREVIEW_CONTROLS) return;
    if (game.demo) void act({ type: "demo", enabled: false });
    if (game.scenario) void act({ type: "scenario", kind: null });
  }, [game.demo, game.scenario]);
  const [celebrating, setCelebrating] = useState(false);
  const [stampBookFocus, setStampBookFocus] = useState(false);

  // Unlock toast and tab dots (visuals.md C2, C3). Baselines start from whatever already exists when
  // the app opens, so only progress made in this session is announced.
  const points = balance(game);
  const affordable = COUPONS.filter(coupon => !game.claims.some(claim => claim.id === coupon.id) && points >= coupon.cost).map(coupon => coupon.id);
  const sealCount = new Set(game.runs.flatMap(run => run.stamps.map(stamp => stamp.placeId))).size;
  const [seen, setSeen] = useState<{ rewards: string[]; toast: string[]; seals: number } | null>(null);
  if (ready && seen === null) setSeen({ rewards: affordable, toast: affordable, seals: sealCount });
  const toastId = seen && !celebrating ? affordable.find(id => !seen.toast.includes(id)) : undefined;
  const dismissToast = useCallback((id: string) => setSeen(current => current && { ...current, toast: [...current.toast, id] }), []);
  useEffect(() => {
    if (!toastId) return;
    const timer = window.setTimeout(() => dismissToast(toastId), 6000);
    return () => window.clearTimeout(timer);
  }, [toastId, dismissToast]);

  const profile: Profile | null = storedProfile;
  const locale = profile?.locale ?? welcomeLocale;
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  function selectTab(tab: Tab) {
    if (activeTab === "explore" && tab !== "explore") {
      handleLocationChange((current) => current.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(current.gpsStatus)
        ? { mode: "live", gpsStatus: "paused", fix: null } : current);
    }
    setActiveTab(tab);
    setStampBookFocus(false);
    if (tab === "rewards") setSeen(current => current && { ...current, rewards: affordable, toast: [...new Set([...current.toast, ...affordable])] });
    if (tab === "missions") setSeen(current => current && { ...current, seals: sealCount });
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!ready) return <div className="loading-screen"><span className="brand-seal" aria-hidden="true">京</span><span>Kyoto AI Lab prototype</span></div>;
  if (!profile) return <Welcome locale={welcomeLocale} onLocale={setWelcomeLocale} onStart={(nickname) => { saveProfile({ nickname, locale: welcomeLocale }); setActiveTab("home"); }} />;

  function openWalk(id: string) {
    setSelectedWalkId(id);
    selectTab("explore");
  }
  const hasRewardsDot = Boolean(seen && affordable.some(id => !seen.rewards.includes(id)));
  const hasMissionsDot = Boolean(seen && sealCount > seen.seals);
  return <div className="app-shell" data-tab={activeTab}>
    <main key={activeTab} id="main-content" className="app-main">
      {activeTab === "home" && <HomeScreen game={game} locale={locale} name={profile.nickname || translate(locale, "guestName")} hasNotice={hasRewardsDot || hasMissionsDot} onExplore={() => selectTab("explore")} onRewards={() => selectTab("rewards")} onMissions={() => selectTab("missions")} onMe={() => selectTab("me")} />}
      {activeTab === "explore" && <KyotoMap game={game} selectedWalkId={selectedWalkId} setSelectedWalkId={setSelectedWalkId} query={query} setQuery={setQuery} routeFilter={routeFilter} setRouteFilter={setRouteFilter} locale={locale} location={location} onLocationChange={handleLocationChange} settingsRecenterRequest={settingsRecenterRequest} onSettingsRecenterHandled={() => setSettingsRecenterRequest(false)} onRewards={() => selectTab("rewards")} onStampBook={() => { selectTab("missions"); setStampBookFocus(true); }} onCelebrationChange={setCelebrating} viewMode={viewMode} setViewMode={setViewMode} />}
      {activeTab === "missions" && <Missions game={game} locale={locale} onWalk={openWalk} focusStampBook={stampBookFocus} />}
      {activeTab === "rewards" && <Rewards game={game} locale={locale} />}
      {activeTab === "me" && <MeScreen game={game} onReset={() => { setSelectedWalkId(null); handleLocationChange(INITIAL_LOCATION_STATE); }} locale={locale} profile={profile} location={location} onLocale={(next) => saveProfile({ ...profile, locale: next })} onSave={(nickname) => saveProfile({ ...profile, nickname })} onDemoChange={enabled => { handleLocationChange(INITIAL_LOCATION_STATE); void act({ type: "demo", enabled }); }} onRecenter={() => { setSettingsRecenterRequest(true); selectTab("explore"); }} />}
    </main>
    {toastId && <div className="unlock-toast" role="status">
      <FoxAvatar state="reward" size={36} />
      <p><strong>{translate(locale, "unlockToast")}</strong>
        <small>{COUPONS.find(coupon => coupon.id === toastId)?.offer[locale]} · {translate(locale, "demoNotRedeemable")}</small></p>
      <Button onClick={() => selectTab("rewards")}>{translate(locale, "unlockToastView")}</Button>
      <button type="button" className="icon-button" aria-label={translate(locale, "close")} onClick={() => dismissToast(toastId)}><X size={18} strokeWidth={ICON_STROKE} /></button>
    </div>}
    <BottomNav active={activeTab} locale={locale} onSelect={selectTab} dots={{
      rewards: activeTab !== "rewards" && hasRewardsDot,
      missions: activeTab !== "missions" && hasMissionsDot,
    }} />
  </div>;
}
