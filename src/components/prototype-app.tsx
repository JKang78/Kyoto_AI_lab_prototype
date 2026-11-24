"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type SetStateAction } from "react";
import Image from "next/image";
import { ExternalLink, Flag, FlaskConical, Shield, Sparkles, Trash2, UserRound, Volume2, VolumeX, WifiOff, X } from "lucide-react";
import { HomeScreen } from "@/components/home-screen";
import { Missions } from "@/components/missions-screen";
import { Rewards } from "@/components/rewards-screen";
import { act, useGame } from "@/lib/game-store";
import { activeRun, balance, placeById, walkById, type Game } from "@/lib/game";
import { COUPONS, type CampaignKind } from "@/config/game";
import { PREVIEW_CONTROLS } from "@/config/environment";
import { BottomNav, type Tab } from "@/components/bottom-nav";
import { KyotoMap } from "@/components/map/kyoto-map";
import { Button, ConfirmDialog, FoxAvatar, haptic, ICON_STROKE, Segmented } from "@/components/ui";
import { CURATED_WALKS } from "@/data/kyoto-walks";
import { formatKyotoDateTime, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { INITIAL_LOCATION_STATE, locationModeText, locationStatusText, type LocationState } from "@/lib/location";
import { clearProfile, getProfileSnapshot, readProfile, saveProfile, subscribeProfile, type Profile } from "@/lib/profile";
import { getMapPrefsSnapshot, parseMapPrefs, saveMapPrefs, subscribeMapPrefs, type MapPrefs } from "@/lib/map-prefs";
import { clearMusicPrefs, getMusicPrefsSnapshot, parseMusicPrefs, saveMusicPrefs, subscribeMusicPrefs } from "@/lib/music-prefs";
import { clearSaved, toggleSavedPlace, toggleSavedWalk, useSaved, type SavedItems } from "@/lib/saved";
import type { RouteFilter } from "@/lib/route-discovery";

const CACHE_TIME_KEY = "kyoto-ai-lab.cachedAt.v1";
const ETIQUETTE_KEY = "kyoto-ai-lab.etiquette.v1";
// The newest seal the passport has already celebrated, so the reward fox hops once per new seal.
const PASSPORT_SEAL_KEY = "kyoto-ai-lab.passportSeal.v1";

/** The most recently stamped seal; stamps from older saves without a time count in run order. */
function newestSeal(game: Game): { key: string; placeId: string } | null {
  let newest: { key: string; placeId: string; at: number } | null = null;
  for (const run of game.runs) for (const stamp of run.stamps) {
    const at = stamp.at ?? 0;
    if (!newest || at >= newest.at) newest = { key: `${run.id}:${stamp.placeId}`, placeId: stamp.placeId, at };
  }
  return newest && { key: newest.key, placeId: newest.placeId };
}
function readPassportSeal() {
  try { return typeof window === "undefined" ? null : window.localStorage.getItem(PASSPORT_SEAL_KEY); } catch { return null; }
}
const subscribeBrowserLocale = () => () => {};
const browserLocale = (): Locale => navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";

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

/** Background music mute toggle (src/lib/music-prefs.ts). */
function MusicSettings({ locale }: { locale: Locale }) {
  const t = (key: MessageKey) => translate(locale, key);
  const snapshot = useSyncExternalStore(subscribeMusicPrefs, getMusicPrefsSnapshot, () => null);
  const { muted } = parseMusicPrefs(snapshot);
  return <section className="settings-section">
    <h2>{muted ? <VolumeX size={18} strokeWidth={ICON_STROKE} aria-hidden="true" /> : <Volume2 size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />}{t("musicHeading")}</h2>
    <Switch checked={muted} onChange={(next) => saveMusicPrefs({ muted: next })}>{t("musicMuteSwitch")}</Switch>
    <p className="settings-hint">{t("musicHint")}</p>
  </section>;
}

/** Personal map look (src/lib/map-prefs.ts). Each switch is local to this browser and applies on the Explore map. */
function MapLookSettings({ locale }: { locale: Locale }) {
  const t = (key: MessageKey) => translate(locale, key);
  const snapshot = useSyncExternalStore(subscribeMapPrefs, getMapPrefsSnapshot, () => null);
  const prefs = parseMapPrefs(snapshot);
  const set = (patch: Partial<MapPrefs>) => saveMapPrefs({ ...prefs, ...patch });
  return <section className="settings-section">
    <h2><Sparkles size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("mapLookHeading")}</h2>
    <Switch checked={prefs.seasonalColours} onChange={(checked) => set({ seasonalColours: checked })}>{t("mapLookSeasonal")}</Switch>
    <Switch checked={prefs.largerLabels} onChange={(checked) => set({ largerLabels: checked })}>{t("mapLookLargerLabels")}</Switch>
    <Switch checked={prefs.landmarkLabelsOnly} onChange={(checked) => set({ landmarkLabelsOnly: checked })}>{t("mapLookLandmarks")}</Switch>
    <Switch checked={prefs.flatMap} onChange={(checked) => set({ flatMap: checked })}>{t("mapLookFlat")}</Switch>
    <p className="settings-hint">{t("mapLookHint")}</p>
  </section>;
}

function MeScreen({ game, saved, onReset, onDeleteAll, onLogout, onOpenWalk, onOpenPlace, locale, profile, location, onLocale, onSave, onDemoChange, onRecenter }: {
  game: Game; saved: SavedItems; onReset: () => void; onDeleteAll: () => Promise<void>; onLogout: () => void;
  onOpenWalk: (id: string) => void; onOpenPlace: (id: string) => void;
  locale: Locale; profile: Profile; location: LocationState; onLocale: (locale: Locale) => void;
  onSave: (nickname: string) => void; onDemoChange: (enabled: boolean) => void; onRecenter: () => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const newest = newestSeal(game);
  // Hop on the first passport visit after earning a new seal; later visits show the still sprite.
  const [hop] = useState(() => newest !== null && readPassportSeal() !== newest.key);
  const newestKey = newest?.key;
  useEffect(() => {
    if (!newestKey) return;
    try { window.localStorage.setItem(PASSPORT_SEAL_KEY, newestKey); } catch { /* Storage blocked: the hop simply repeats. */ }
  }, [newestKey]);
  const [savedMsg, setSavedMsg] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportWalk, setReportWalk] = useState<string>(CURATED_WALKS[0].id);
  const [reportKind, setReportKind] = useState<"blocked" | "access" | "signage">("blocked");
  const [reportNotes, setReportNotes] = useState("");
  const [reportPrepared, setReportPrepared] = useState(false);
  const t = (key: MessageKey, values?: Record<string, string>) => translate(locale, key, values);
  return <div className="content-screen settings-screen figma-account">
    <div className="figma-account-header"><h1>{t("navMe")}</h1><div><button type="button" aria-label={t("profileHeading")} onClick={() => setEditOpen(value => !value)}><Image src="/assets/figma/pencil-icon.svg" width={22} height={22} alt="" /></button><button type="button" aria-label={t("mapLookHeading")} onClick={() => setAdvancedOpen(value => !value)}><Image src="/assets/figma/settings-icon.svg" width={22} height={22} alt="" /></button></div></div>
    {/* Passport header (visuals.md Me2): one sentence of progress, not a KPI grid. */}
    <section className="passport" aria-label={t("passportLabel")}>
      <FoxAvatar state="idle" size={88} still={hop} />
      <div>
        <p className="passport-name">{profile.nickname || t("guestName")}</p>
        <p className="passport-line">{new Set(game.runs.flatMap(run => run.stamps.map(stamp => stamp.placeId))).size} {locale === "ja" ? "スタンプ" : "seals"} · {game.runs.filter(run => run.complete).length} {locale === "ja" ? "散歩" : "walks"} · {game.claims.filter(claim => claim.redeemedAt !== undefined).length} {locale === "ja" ? "利用済み" : "vouchers used"}</p>
      </div>
      {newest && <div className="passport-newest">
        <FoxAvatar state="reward" size={48} animated={hop} framed={false} />
        <p><small>{t("passportNewestSeal")}</small><strong>{placeById(newest.placeId)?.name[locale] ?? newest.placeId}</strong></p>
      </div>}
    </section>
    <section className="settings-section">
      <h2><Image src="/assets/figma/heart-icon.svg" width={20} height={20} alt="" />{t("savedHeading")}</h2>
      {saved.walks.length || saved.places.length ? <ul className="saved-list">
        {saved.walks.map(id => {
          const walk = walkById(id);
          return walk ? <li key={`walk-${id}`}>
            <span>{walk.name[locale]}</span>
            <div className="saved-list-actions">
              <button type="button" onClick={() => onOpenWalk(id)}>{t("savedOpen")}</button>
              <button type="button" onClick={() => toggleSavedWalk(id)}>{t("savedRemove")}</button>
            </div>
          </li> : null;
        })}
        {saved.places.map(id => {
          const place = placeById(id);
          return place ? <li key={`place-${id}`}>
            <span>{place.name[locale]}</span>
            <div className="saved-list-actions">
              <button type="button" onClick={() => onOpenPlace(id)}>{t("savedOpen")}</button>
              <button type="button" onClick={() => toggleSavedPlace(id)}>{t("savedRemove")}</button>
            </div>
          </li> : null;
        })}
      </ul> : <p className="settings-hint">{t("savedEmpty")}</p>}
    </section>
    <section className="settings-section">
      <h2><Image src="/assets/figma/earth-icon.svg" width={20} height={20} alt="" />{t("languageHeading")}</h2>
      <LanguageChoice locale={locale} onChange={onLocale} />
    </section>
    <MusicSettings locale={locale} />
    {editOpen && <section className="settings-section figma-profile-editor">
      <h2><UserRound size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("profileHeading")}</h2>
      <form onSubmit={(event) => { event.preventDefault(); onSave(nickname.trim()); setSavedMsg(true); }}>
        <label className="form-label" htmlFor="settings-nickname">{t("nicknameLabel")}</label>
        <input className="text-input" id="settings-nickname" value={nickname} maxLength={40} onChange={(event) => { setNickname(event.target.value); setSavedMsg(false); }} placeholder={t("nicknamePlaceholder")} />
        <Button type="submit" variant="secondary" className="full-width">{t("nicknameSave")}</Button>
        {savedMsg && <p className="save-message" role="status">{t("nicknameSaved")}</p>}
      </form>
    </section>}
    <section className="settings-section">
      <h2><Image src="/assets/figma/pin-icon.svg" width={20} height={20} alt="" />{t("locationSettingsHeading")}</h2>
      <dl className="settings-status">
        <div><dt>{t("locationSettingsMode")}</dt><dd>{locationModeText(locale, location.mode)}</dd></div>
        <div><dt>{t("locationSettingsGps")}</dt><dd>{locationStatusText(locale, location)}</dd></div>
      </dl>
      {PREVIEW_CONTROLS && advancedOpen && <Switch checked={location.mode === "demo"} onChange={onDemoChange}>{t("locationSettingsDemoSwitch")}</Switch>}
      <Button type="button" variant="secondary" className="full-width" onClick={onRecenter}><Image src="/assets/figma/locate-icon.svg" width={17} height={17} alt="" />{t("locationSettingsRecenter")}</Button>
      <p className="settings-hint">{t("locationSettingsHint")}</p>
    </section>
    <section className="figma-account-actions"><h2>{locale === "ja" ? "アカウント操作" : "Account actions"}</h2><button type="button" onClick={onLogout}>{locale === "ja" ? "ログアウト" : "Log out"}</button><button type="button" onClick={() => setDeleteAllOpen(true)}>{locale === "ja" ? "アカウントを削除" : "Delete account"}</button></section>
    {advancedOpen && <div className="figma-advanced-settings"><MapLookSettings locale={locale} />
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
    <section className="settings-section">
      <h2><Shield size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("privacyHeading")}</h2>
      <p className="settings-hint">{t("privacyBody")}</p>
      <Button type="button" variant="secondary" className="full-width" onClick={() => setDeleteAllOpen(true)}>
        <Trash2 size={17} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("deleteAllData")}
      </Button>
    </section>
    <section className="settings-section">
      <h2><Flag size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />{t("safetyHeading")}</h2>
      <p className="settings-hint">{t("safetyBody")}</p>
      <div className="safety-links">
        <a href="https://www.data.jma.go.jp/multi/index.html" target="_blank" rel="noreferrer">{t("safetyJma")}<ExternalLink size={14} aria-hidden="true" /></a>
        <a href="https://www.bousai-kyoto-city.jp/" target="_blank" rel="noreferrer">{t("safetyKyoto")}<ExternalLink size={14} aria-hidden="true" /></a>
      </div>
      <Button type="button" variant="secondary" className="full-width" onClick={() => { setReportPrepared(false); setReportOpen(true); }}>{t("reportIssueButton")}</Button>
    </section>
    <details className="settings-about">
      <summary>{t("aboutHeading")}</summary>
      <p>{t("aboutBody")}</p>
      <p><a href="https://commons.wikimedia.org/wiki/File:Kyoto_Shijo_yu-suzumi-Cooling_Off_at_the_Kamo_River_near_Shijo_in_Kyoto_MET_DP123612.jpg">{t("printCredit")}</a></p>
    </details>
    </div>}
    <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} title={t("gameReset")} closeLabel={t("close")}>
      <p>{t("gameResetBody")}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={() => setResetOpen(false)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { await act({ type: "reset" }); onReset(); setResetOpen(false); }}>{t("gameConfirm")}</Button>
      </div>
    </ConfirmDialog>
    <ConfirmDialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)} title={t("deleteAllData")} closeLabel={t("close")}>
      <p>{t("deleteAllDataBody")}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={() => setDeleteAllOpen(false)}>{t("gameCancel")}</Button>
        <Button onClick={async () => { await onDeleteAll(); setDeleteAllOpen(false); }}>{t("deleteAllConfirm")}</Button>
      </div>
    </ConfirmDialog>
    <ConfirmDialog open={reportOpen} onClose={() => setReportOpen(false)} title={t("reportIssueTitle")} closeLabel={t("close")}>
      <p>{t("reportIssueBody")}</p>
      <form className="report-form" onSubmit={(event) => { event.preventDefault(); setReportPrepared(true); }}>
        <label className="form-label" htmlFor="report-walk">{t("reportIssueWalk")}</label>
        <select id="report-walk" className="text-input" value={reportWalk} onChange={(e) => setReportWalk(e.target.value)}>
          {CURATED_WALKS.map(walk => <option key={walk.id} value={walk.id}>{walk.name[locale]}</option>)}
        </select>
        <label className="form-label" htmlFor="report-kind">{t("reportIssueKind")}</label>
        <select id="report-kind" className="text-input" value={reportKind} onChange={(e) => setReportKind(e.target.value as "blocked" | "access" | "signage")}>
          <option value="blocked">{t("reportIssueBlocked")}</option>
          <option value="access">{t("reportIssueAccess")}</option>
          <option value="signage">{t("reportIssueSignage")}</option>
        </select>
        <label className="form-label" htmlFor="report-notes">{t("reportIssueNotes")}</label>
        <textarea id="report-notes" className="text-input" rows={3} value={reportNotes} maxLength={300} placeholder={t("reportIssueNotesPlaceholder")} onChange={(e) => setReportNotes(e.target.value)} />
        <Button type="submit" className="full-width">{t("reportIssueSubmit")}</Button>
        {reportPrepared && <p className="save-message" role="status">{t("reportIssueSaved")}</p>}
      </form>
    </ConfirmDialog>
  </div>;
}

export function PrototypeApp() {
  const game = useGame();
  const saved = useSaved();
  const snapshot = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => undefined);
  const ready = snapshot !== undefined;
  const storedProfile = ready ? readProfile() : null;
  const detectedLocale = useSyncExternalStore(subscribeBrowserLocale, browserLocale, () => "en" as Locale);
  const [guestLocaleOverride, setGuestLocaleOverride] = useState<Locale | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [browsedWalk, setSelectedWalkId] = useState<string | null | undefined>(undefined);
  const selectedWalkId = browsedWalk === undefined ? activeRun(game)?.walkId ?? null : browsedWalk;
  // Search, filters and starting landmark survive tab switches for the session.
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>(null);
  const [startPlaceId, setStartPlaceId] = useState<string | null>(null);
  const [initialPlaceId, setInitialPlaceId] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  useEffect(() => {
    const syncNetwork = () => {
      const isOnline = navigator.onLine;
      setOffline(!isOnline);
      if (isOnline) {
        const now = Date.now();
        setCachedAt(now);
        try { window.localStorage.setItem(CACHE_TIME_KEY, String(now)); } catch { /* ignore */ }
      } else {
        try {
          const savedAt = Number(window.localStorage.getItem(CACHE_TIME_KEY));
          if (Number.isFinite(savedAt) && savedAt > 0) setCachedAt(savedAt);
        } catch { /* ignore */ }
      }
    };
    syncNetwork();
    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* Optional offline cache. */ });
    }
    return () => {
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
    };
  }, []);
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

  const profile: Profile = storedProfile ?? { nickname: "", locale: guestLocaleOverride ?? detectedLocale };
  const locale = profile.locale;
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

  function openWalk(id: string) {
    setSelectedWalkId(id);
    selectTab("explore");
  }
  function openPlace(id: string) {
    setInitialPlaceId(id);
    selectTab("explore");
  }
  async function deleteAllLocalData() {
    await act({ type: "reset" });
    clearSaved();
    clearMusicPrefs();
    clearProfile();
    try {
      window.localStorage.removeItem(ETIQUETTE_KEY);
      window.localStorage.removeItem(PASSPORT_SEAL_KEY);
      window.localStorage.removeItem(CACHE_TIME_KEY);
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }
    } catch { /* Ignore blocked storage or cache errors. */ }
    setSelectedWalkId(null);
    setStartPlaceId(null);
    setCachedAt(null);
    handleLocationChange(INITIAL_LOCATION_STATE);
    setActiveTab("home");
  }
  const hasRewardsDot = Boolean(seen && affordable.some(id => !seen.rewards.includes(id)));
  const hasMissionsDot = Boolean(seen && sealCount > seen.seals);
  return <div className="app-shell" data-tab={activeTab}>
    {offline && <div className="offline-banner" role="status">
      <WifiOff size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
      <span>{translate(locale, "offlineBanner")}{cachedAt ? ` · ${translate(locale, "offlineCacheAge", { time: formatKyotoDateTime(locale, cachedAt) })}` : ""}</span>
    </div>}
    <main key={activeTab} id="main-content" className="app-main">
      {activeTab === "home" && <HomeScreen game={game} locale={locale} name={profile.nickname || translate(locale, "guestName")} hasNotice={hasRewardsDot || hasMissionsDot} onExplore={() => selectTab("explore")} onRewards={() => selectTab("rewards")} onMissions={() => selectTab("missions")} onMe={() => selectTab("me")} />}
      {activeTab === "explore" && <KyotoMap game={game} selectedWalkId={selectedWalkId} setSelectedWalkId={setSelectedWalkId} query={query} setQuery={setQuery} routeFilter={routeFilter} setRouteFilter={setRouteFilter} locale={locale} location={location} onLocationChange={handleLocationChange} settingsRecenterRequest={settingsRecenterRequest} onSettingsRecenterHandled={() => setSettingsRecenterRequest(false)} onRewards={() => selectTab("rewards")} onStampBook={() => { selectTab("missions"); setStampBookFocus(true); }} onCelebrationChange={setCelebrating} startPlaceId={startPlaceId} setStartPlaceId={setStartPlaceId} saved={saved} initialPlaceId={initialPlaceId} onInitialPlaceHandled={() => setInitialPlaceId(null)} />}
      {activeTab === "missions" && <Missions game={game} locale={locale} onWalk={openWalk} focusStampBook={stampBookFocus} />}
      {activeTab === "rewards" && <Rewards game={game} locale={locale} />}
      {activeTab === "me" && <MeScreen game={game} saved={saved} onReset={() => { setSelectedWalkId(null); handleLocationChange(INITIAL_LOCATION_STATE); }} onDeleteAll={deleteAllLocalData} onLogout={() => { setGuestLocaleOverride(profile.locale); clearProfile(); selectTab("home"); }} onOpenWalk={openWalk} onOpenPlace={openPlace} locale={locale} profile={profile} location={location} onLocale={(next) => saveProfile({ ...profile, locale: next })} onSave={(nickname) => saveProfile({ ...profile, nickname })} onDemoChange={enabled => { handleLocationChange(INITIAL_LOCATION_STATE); void act({ type: "demo", enabled }); }} onRecenter={() => { setSettingsRecenterRequest(true); selectTab("explore"); }} />}
    </main>
    {toastId && <div className="unlock-toast" role="status">
      <FoxAvatar state="reward" size={36} />
      <p><strong>{translate(locale, "unlockToast")}</strong>
        <small>{COUPONS.find(coupon => coupon.id === toastId)?.offer[locale]}</small></p>
      <Button onClick={() => selectTab("rewards")}>{translate(locale, "unlockToastView")}</Button>
      <button type="button" className="icon-button" aria-label={translate(locale, "close")} onClick={() => dismissToast(toastId)}><X size={18} strokeWidth={ICON_STROKE} /></button>
    </div>}
    <BottomNav active={activeTab} locale={locale} onSelect={selectTab} dots={{
      rewards: activeTab !== "rewards" && hasRewardsDot,
      missions: activeTab !== "missions" && hasMissionsDot,
    }} />
  </div>;
}
