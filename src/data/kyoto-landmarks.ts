import type { LngLat, LocalizedText } from "../types/routes";

export type LandmarkIconId =
  | "castle"
  | "temple-stage"
  | "golden-pavilion"
  | "torii-tunnel"
  | "imperial-palace"
  | "grand-torii"
  | "tower-gate"
  | "bridge-moon"
  | "tower"
  | "pagoda"
  | "silver-pavilion"
  | "sanmon-gate"
  | "forest-shrine"
  | "market-lantern"
  | "temple-hall";

export type KyotoLandmark = Readonly<{
  id: string;
  name: LocalizedText;
  iconId: LandmarkIconId;
  location: LngLat;
  osmFeatureUrl: string;
  summary: LocalizedText;
  minZoom: number;
  linkedPlaceId?: string;
  nearbyWalkIds: readonly string[];
}>;

/**
 * Iconic Kyoto tourist landmarks for map orientation (docs/locations.md).
 * Coordinates and feature URLs come from OpenStreetMap; standalone landmarks
 * are orientation aids and are not check-in stamp stops.
 */
export const KYOTO_LANDMARKS: readonly KyotoLandmark[] = [
  {
    id: "nijo-castle",
    name: { en: "Nijō Castle", ja: "二条城" },
    iconId: "castle",
    location: [135.7482, 35.0142],
    osmFeatureUrl: "https://www.openstreetmap.org/relation/1222177",
    summary: {
      en: "A UNESCO World Heritage flatland castle built in 1603 as the Kyoto residence of the Tokugawa shoguns, famous for Ninomaru Palace's nightingale floors.",
      ja: "1603年に徳川家康が造営した世界遺産の平城。鶯張りの廊下で知られる二の丸御殿が見どころです。",
    },
    minZoom: 11.5,
    nearbyWalkIds: ["kyoto-gyoen"],
  },
  {
    id: "kiyomizu-dera",
    name: { en: "Kiyomizu-dera", ja: "清水寺" },
    iconId: "temple-stage",
    location: [135.785, 34.9949],
    osmFeatureUrl: "https://www.openstreetmap.org/way/31280205",
    summary: {
      en: "Hillside Buddhist temple in eastern Kyoto renowned for its soaring wooden stage overlooking seasonal cherry blossoms and autumn maples.",
      ja: "東山の斜面に建つ世界遺産の寺院。桜や紅葉を望む木造の「清水の舞台」で広く知られています。",
    },
    minZoom: 11.5,
    nearbyWalkIds: ["yasaka-maruyama", "shijo-yasaka"],
  },
  {
    id: "kinkaku-ji",
    name: { en: "Kinkaku-ji", ja: "金閣寺" },
    iconId: "golden-pavilion",
    location: [135.7292, 35.0394],
    osmFeatureUrl: "https://www.openstreetmap.org/way/121949865",
    summary: {
      en: "Officially Rokuon-ji, this Zen temple's top two storeys are covered in gold leaf and reflected in Mirror Pond.",
      ja: "正式名称は鹿苑寺。金箔をまとった舎利殿が鏡湖池に映る姿で知られる臨済宗の寺院です。",
    },
    minZoom: 11.5,
    nearbyWalkIds: [],
  },
  {
    id: "fushimi-inari",
    name: { en: "Fushimi Inari-taisha", ja: "伏見稲荷大社" },
    iconId: "torii-tunnel",
    location: [135.7727, 34.9671],
    osmFeatureUrl: "https://www.openstreetmap.org/relation/1925782",
    summary: {
      en: "Head shrine of Inari in southern Kyoto, famous for thousands of vermilion Senbon Torii gates winding up Mount Inari.",
      ja: "全国に祀られる稲荷神社の総本宮。稲荷山へ続く朱色の千本鳥居が象徴的な神社です。",
    },
    minZoom: 11.5,
    nearbyWalkIds: [],
  },
  {
    id: "kyoto-imperial-palace",
    name: { en: "Kyoto Imperial Palace", ja: "京都御所" },
    iconId: "imperial-palace",
    location: [135.7621, 35.0254],
    osmFeatureUrl: "https://www.openstreetmap.org/way/32258555",
    summary: {
      en: "Historic imperial palace set inside the broad gravel paths and pines of Kyoto Gyoen National Garden.",
      ja: "広大な京都御苑の中央に位置し、かつて天皇の住まいとして使われた格式ある宮殿です。",
    },
    minZoom: 11.5,
    linkedPlaceId: "kenreimon-avenue",
    nearbyWalkIds: ["kyoto-gyoen"],
  },
  {
    id: "heian-shrine",
    name: { en: "Heian Shrine", ja: "平安神宮" },
    iconId: "grand-torii",
    location: [135.7828, 35.016],
    osmFeatureUrl: "https://www.openstreetmap.org/way/426155048",
    summary: {
      en: "Built in 1895 for Heian-kyō's 1,100th anniversary, marked by its towering vermilion Ōtorii gate over Jingū-michi.",
      ja: "平安遷都1100年を記念して1895年に創建。神宮道にそびえる朱塗りの大鳥居が目印です。",
    },
    minZoom: 11.5,
    linkedPlaceId: "heian-otorii",
    nearbyWalkIds: ["okazaki-heian"],
  },
  {
    id: "yasaka-shrine",
    name: { en: "Yasaka Shrine", ja: "八坂神社" },
    iconId: "tower-gate",
    location: [135.7785, 35.0037],
    osmFeatureUrl: "https://www.openstreetmap.org/way/105449683",
    summary: {
      en: "Historic Gion shrine anchoring the eastern end of Shijō-dōri and home to Kyoto's famous summer Gion Festival.",
      ja: "四条通の東端に鎮座する祇園の象徴。夏の祇園祭で知られる歴史深い神社です。",
    },
    minZoom: 11.5,
    linkedPlaceId: "yasaka-west-view",
    nearbyWalkIds: ["shijo-yasaka", "yasaka-maruyama"],
  },
  {
    id: "togetsukyo",
    name: { en: "Togetsukyō Bridge", ja: "渡月橋" },
    iconId: "bridge-moon",
    location: [135.6778, 35.0129],
    osmFeatureUrl: "https://www.openstreetmap.org/way/519319727",
    summary: {
      en: "Arashiyama's signature 155 m bridge spanning the Katsura River beneath wooded mountain slopes.",
      ja: "嵐山を象徴する全長155メートルの橋。山の稜線と川面が織りなす風景が楽しめます。",
    },
    minZoom: 11.5,
    linkedPlaceId: "togetsukyo-bridge",
    nearbyWalkIds: ["arashiyama-riverside"],
  },
  {
    id: "kyoto-tower",
    name: { en: "Kyoto Tower", ja: "京都タワー" },
    iconId: "tower",
    location: [135.7593, 34.9875],
    osmFeatureUrl: "https://www.openstreetmap.org/way/43076195",
    summary: {
      en: "Kyoto's 131 m landmark observation spire rising directly across from Kyoto Station's Karasuma exit since 1964.",
      ja: "1964年開業、高さ131メートルの展望タワー。京都駅烏丸口の正面に立つ街のランドマークです。",
    },
    minZoom: 11.5,
    linkedPlaceId: "kyoto-station-plaza",
    nearbyWalkIds: ["station-umekoji"],
  },
  {
    id: "to-ji",
    name: { en: "Tō-ji Pagoda", ja: "東寺 五重塔" },
    iconId: "pagoda",
    location: [135.7478, 34.9806],
    osmFeatureUrl: "https://www.openstreetmap.org/way/43075690",
    summary: {
      en: "Japan's tallest wooden five-storey pagoda (55 m), standing in the grounds of Tō-ji Temple southwest of Kyoto Station.",
      ja: "高さ約55メートルを誇る日本一高い木造の五重塔。京都駅の南西、東寺の境内にそびえます。",
    },
    minZoom: 11.5,
    nearbyWalkIds: ["station-umekoji"],
  },
  {
    id: "ginkaku-ji",
    name: { en: "Ginkaku-ji", ja: "銀閣寺" },
    iconId: "silver-pavilion",
    location: [135.7982, 35.027],
    osmFeatureUrl: "https://www.openstreetmap.org/way/43575666",
    summary: {
      en: "Higashiyama Zen temple famed for its understated silver pavilion, moss garden, and raked white sand sea at the north end of the Philosopher's Path.",
      ja: "哲学の道の北端に佇む東山文化の象徴。わび・さびを体現する観音殿と銀沙灘で知られます。",
    },
    minZoom: 12.8,
    linkedPlaceId: "ginkakuji-bridge",
    nearbyWalkIds: ["philosophers-path"],
  },
  {
    id: "nanzen-ji",
    name: { en: "Nanzen-ji", ja: "南禅寺" },
    iconId: "sanmon-gate",
    location: [135.7937, 35.0112],
    osmFeatureUrl: "https://www.openstreetmap.org/way/190876301",
    summary: {
      en: "Major Rinzai Zen temple complex known for its monumental 1628 Sanmon gate and Meiji-era brick canal aqueduct.",
      ja: "壮大な三門と明治期の煉瓦造り水路閣で知られる臨済宗南禅寺派の大本山です。",
    },
    minZoom: 12.8,
    linkedPlaceId: "nanzenji-sanmon-approach",
    nearbyWalkIds: ["philosophers-path", "okazaki-heian"],
  },
  {
    id: "shimogamo-shrine",
    name: { en: "Shimogamo Shrine", ja: "下鴨神社" },
    iconId: "forest-shrine",
    location: [135.773, 35.0391],
    osmFeatureUrl: "https://www.openstreetmap.org/way/99189777",
    summary: {
      en: "One of Japan's oldest Shinto shrines, approached through the primeval deciduous woodland of Tadasu-no-Mori.",
      ja: "世界遺産に登録される古社。豊かな落葉樹が広がる糺の森の参道を通って参拝します。",
    },
    minZoom: 12.8,
    linkedPlaceId: "shimogamo-romon",
    nearbyWalkIds: ["kamogawa-tadasu"],
  },
  {
    id: "nishiki-market",
    name: { en: "Nishiki Market", ja: "錦市場" },
    iconId: "market-lantern",
    location: [135.7649, 35.005],
    osmFeatureUrl: "https://www.openstreetmap.org/way/143625204",
    summary: {
      en: "Historic five-block covered food arcade in downtown Kyoto lined with pickles, tea, sweets, and local kitchenware shops.",
      ja: "京の台所として親しまれる歴史ある商店街。漬物や茶、京菓子など地元の味覚が軒を連ねます。",
    },
    minZoom: 13.2,
    nearbyWalkIds: ["shijo-yasaka", "kamo-riverside"],
  },
  {
    id: "nishi-honganji",
    name: { en: "Nishi Hongan-ji", ja: "西本願寺" },
    iconId: "temple-hall",
    location: [135.7517, 34.9916],
    osmFeatureUrl: "https://www.openstreetmap.org/way/43076037",
    summary: {
      en: "UNESCO-listed head temple of Jōdo Shinshū Buddhism, featuring grand 17th-century timber halls and an ancient ginkgo tree.",
      ja: "世界遺産の浄土真宗本願寺派本山。国宝の御影堂と境内の大銀杏で知られます。",
    },
    minZoom: 13.2,
    linkedPlaceId: "nishi-honganji-gate",
    nearbyWalkIds: ["station-umekoji"],
  },
];

export const landmarkById = (id: string) =>
  KYOTO_LANDMARKS.find((item) => item.id === id);
