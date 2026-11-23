"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type SetStateAction } from "react";
import Image from "next/image";
import { ArrowRight, Globe2, Info, LocateFixed, MapPin, Save, Footprints, Ticket } from "lucide-react";
import { WalkingHome, Missions, Rewards } from "@/components/game-screens";
import { act, useGame } from "@/lib/game-store";
import { activeRun, balance, type Game } from "@/lib/game";
import { COUPONS, GAME } from "@/config/game";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { KyotoMap } from "@/components/map/kyoto-map";
import { BottomSheet, Button, Card } from "@/components/ui";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import { INITIAL_LOCATION_STATE, locationModeText, locationStatusText, type LocationState } from "@/lib/location";
import { getProfileSnapshot, readProfile, saveProfile, subscribeProfile, type Profile } from "@/lib/profile";

function LanguageChoice({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return <div className="language-choice" role="group" aria-label={translate(locale, "chooseLanguage")}>
    <button type="button" className={locale === "en" ? "selected" : ""} aria-pressed={locale === "en"} onClick={() => onChange("en")}>English</button>
    <button type="button" className={locale === "ja" ? "selected" : ""} aria-pressed={locale === "ja"} onClick={() => onChange("ja")}>日本語</button>
  </div>;
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
      <label className="form-label">{t("chooseLanguage")}</label>
      <LanguageChoice locale={locale} onChange={onLocale} />
      <label htmlFor="nickname" className="form-label">{t("nicknameLabel")}</label>
      <input id="nickname" className="text-input" value={nickname} maxLength={40} autoComplete="nickname" placeholder={t("nicknamePlaceholder")} onChange={(event) => setNickname(event.target.value)} />
      <p className="form-hint">{t("nicknameHint")}</p>
      <Button type="submit" className="full-width">{t("startExploring")}<ArrowRight size={19} /></Button>
    </form>
  </main>;
}

function SettingsScreen({ game, onReset, locale, profile, location, onLocale, onSave, onDemoChange, onRecenter }: { game: Game; onReset: () => void; locale: Locale; profile: Profile; location: LocationState; onLocale: (locale: Locale) => void; onSave: (nickname: string) => void; onDemoChange: (enabled: boolean) => void; onRecenter: () => void }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const t = (key: MessageKey) => translate(locale, key);
  return <div className="content-screen settings-screen">
    <h1>{t("navSettings")}</h1>
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon"><Save size={20} /></span><h2>{t("profileHeading")}</h2></div><form onSubmit={(event) => { event.preventDefault(); onSave(nickname.trim()); setSaved(true); }}><label className="form-label" htmlFor="settings-nickname">{t("nicknameLabel")}</label><input className="text-input" id="settings-nickname" value={nickname} maxLength={40} onChange={(event) => { setNickname(event.target.value); setSaved(false); }} placeholder={t("nicknamePlaceholder")} /><Button type="submit" variant="secondary" className="full-width">{t("nicknameSave")}</Button>{saved && <p className="save-message" role="status">{t("nicknameSaved")}</p>}</form></Card>
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon gold"><Globe2 size={20} /></span><h2>{t("languageHeading")}</h2></div><LanguageChoice locale={locale} onChange={onLocale} /></Card>
    <Card className="settings-card"><div className="settings-card-heading"><span className="card-icon"><MapPin size={20} /></span><h2>{t("locationSettingsHeading")}</h2></div><dl className="location-settings-status"><div><dt>{t("locationSettingsMode")}</dt><dd>{locationModeText(locale, location.mode)}</dd></div><div><dt>{t("locationSettingsGps")}</dt><dd>{locationStatusText(locale, location)}</dd></div></dl><div className="location-settings-actions"><button type="button" className="location-demo-switch" role="switch" aria-checked={location.mode === "demo"} onClick={() => onDemoChange(location.mode !== "demo")}><span>{t("locationSettingsDemoSwitch")}</span><span className="location-switch-track" aria-hidden="true"><span /></span></button><Button type="button" variant="secondary" className="full-width" onClick={onRecenter}><LocateFixed size={18} aria-hidden="true" />{t("locationSettingsRecenter")}</Button></div><p className="location-settings-hint">{t("locationSettingsHint")}</p></Card>
    <Card className="settings-card">
      <div className="settings-card-heading"><span className="card-icon gold"><Footprints size={20} /></span><h2>{t("gameProgress")}</h2></div>
      <div className="location-settings-actions">
        <label className="location-demo-switch settings-switch" data-checked={game.peak}>
          <input type="checkbox" className="settings-switch-input" checked={game.peak} onChange={event => void act({ type: "peak", enabled: event.target.checked })} />
          <span>{translate(locale, "gamePeak", { percent: String(GAME.sampleBonusPercent) })}</span>
          <span className="location-switch-track" aria-hidden="true"><span /></span>
        </label>
        <Button variant="secondary" className="full-width" onClick={() => setResetOpen(true)}>{t("gameReset")}</Button>
      </div>
    </Card>
    <BottomSheet open={resetOpen} onClose={() => setResetOpen(false)} title={t("gameReset")} closeLabel={t("close")}>
      <p>{t("gameResetBody")}</p>
      <div className="game-actions">
        <Button variant="secondary" onClick={() => setResetOpen(false)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { await act({ type: "reset" }); onReset(); setResetOpen(false); }}>{t("gameConfirm")}</Button>
      </div>
    </BottomSheet>
    <Button variant="quiet" className="about-trigger" onClick={() => setAboutOpen(true)}><Info size={19} />{t("aboutButton")}<ArrowRight size={17} /></Button>
    <BottomSheet open={aboutOpen} onClose={() => setAboutOpen(false)} title={t("aboutHeading")} closeLabel={t("close")}><p>{t("aboutBody")}</p><p><a href="https://commons.wikimedia.org/wiki/File:Kyoto_Shijo_yu-suzumi-Cooling_Off_at_the_Kamo_River_near_Shijo_in_Kyoto_MET_DP123612.jpg">{t("printCredit")}</a></p></BottomSheet>
  </div>;
}

export function PrototypeApp() {
  const game = useGame();
  const snapshot = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => undefined);
  const ready = snapshot !== undefined;
  const profile = ready ? readProfile() : null;
  const [welcomeLocale, setWelcomeLocale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [browsedWalk, setSelectedWalkId] = useState<string | null>();
  const selectedWalkId = browsedWalk === undefined ? activeRun(game)?.walkId ?? null : browsedWalk;
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

  function updateProfile(next: Profile) { saveProfile(next); }
  function selectTab(tab: Tab) {
    if (activeTab === "map" && tab !== "map") {
      handleLocationChange((current) => current.mode === "live" && ["requesting", "active", "lowAccuracy", "outsideKyoto"].includes(current.gpsStatus)
        ? { mode: "live", gpsStatus: "paused", fix: null } : current);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (!ready) return <div className="loading-screen"><span className="brand-seal" aria-hidden="true">京</span><span>Kyoto AI Lab prototype</span></div>;
  if (!profile) return <Welcome locale={welcomeLocale} onLocale={setWelcomeLocale} onStart={(nickname) => { updateProfile({ nickname, locale: welcomeLocale }); setActiveTab("map"); }} />;

  const coins = balance(game);
  const nextCoupon = COUPONS.find(coupon => !game.claims.some(claim => claim.id === coupon.id));
  function openWalk(id: string) {
    setSelectedWalkId(id);
    selectTab("map");
  }
  return <div className="app-shell">
    <header className="app-header">
      <span className="brand-seal" aria-hidden="true">京</span><strong>KYOTO AI LAB</strong>
      {activeTab === "map" && <button className="header-wallet" onClick={() => selectTab("rewards")} aria-label={translate(locale, "gameWalletAction")}>
        <Ticket size={18} aria-hidden="true" />
        <span>{translate(locale, "gameBalance", { coins: String(coins) })}{nextCoupon && ` / ${nextCoupon.cost}`}
          {nextCoupon && <progress aria-hidden="true" max={nextCoupon.cost} value={Math.min(coins, nextCoupon.cost)} />}
        </span>
      </button>}
    </header>
    <main key={activeTab} id="main-content" className="app-main">
      {activeTab === "home" && <WalkingHome game={game} locale={locale} name={profile.nickname} onWalk={openWalk} />}
      {activeTab === "map" && <KyotoMap game={game} selectedWalkId={selectedWalkId} setSelectedWalkId={setSelectedWalkId} locale={locale} location={location} onLocationChange={handleLocationChange} settingsRecenterRequest={settingsRecenterRequest} onSettingsRecenterHandled={() => setSettingsRecenterRequest(false)} onRewards={() => selectTab("rewards")} />}
      {activeTab === "rewards" && <Rewards game={game} locale={locale} />}
      {activeTab === "missions" && <Missions game={game} locale={locale} onWalk={openWalk} />}
      {activeTab === "settings" && <SettingsScreen game={game} onReset={() => { setSelectedWalkId(null); handleLocationChange(INITIAL_LOCATION_STATE); }} locale={locale} profile={profile} location={location} onLocale={(next) => updateProfile({ ...profile, locale: next })} onSave={(nickname) => updateProfile({ ...profile, nickname })} onDemoChange={enabled => { handleLocationChange(INITIAL_LOCATION_STATE); void act({ type: "demo", enabled }); }} onRecenter={() => { setSettingsRecenterRequest(true); selectTab("map"); }} />}
    </main>
    <BottomNav active={activeTab} locale={locale} onSelect={selectTab} />
  </div>;
}
