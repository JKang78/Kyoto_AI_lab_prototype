import type { CuratedPlace, CuratedWalk, RouteSource } from "@/types/routes";

// These fixtures are map-based proposals, not field-audited navigation instructions.
// Geometry is the full OSM pedestrian-router output in GeoJSON [lng, lat] order.
// See docs/ROUTE_DATA.md for validation, attribution, and access limits.

export const ROUTE_SOURCES: readonly RouteSource[] = [
  {
    "id": "osm",
    "title": "OpenStreetMap contributors — Kyoto pedestrian ways and place features",
    "url": "https://www.openstreetmap.org/copyright",
    "accessedOn": "2026-11-18",
    "license": "ODbL 1.0"
  },
  {
    "id": "osm-foot-router",
    "title": "OpenStreetMap Germany pedestrian routing service",
    "url": "https://routing.openstreetmap.de/",
    "accessedOn": "2026-11-18"
  },
  {
    "id": "kyoto-gion-access",
    "title": "Kyoto City Tourism — Comfortable access to Gion (Yasaka-jinja Shrine)",
    "url": "https://www.kyoto.travel/en/getting-around/comfortable-access-to-gion-yasaka-jinja-shrine/",
    "accessedOn": "2026-11-18"
  },
  {
    "id": "kyoto-maruyama",
    "title": "Kyoto City Tourism — Maruyama Park",
    "url": "https://kyoto.travel/en/destinations/maruyama-park/",
    "accessedOn": "2026-11-18"
  },
  {
    "id": "kyoto-chionin",
    "title": "Kyoto City Tourism — Chion-in Temple",
    "url": "https://kyoto.travel/en/destinations/chionin-temple/",
    "accessedOn": "2026-11-18"
  },
  {
    "id": "kyoto-river",
    "title": "Kyoto City Tourism — Choosing accommodation: Shijo-Kawaramachi and Kamo River",
    "url": "https://kyoto.travel/en/travel-inspiration/choosing-accommodation-key-features-of-each-area/",
    "accessedOn": "2026-11-18"
  },
  {
    "id": "kyoto-okazaki",
    "title": "Kyoto City Tourism — Okazaki area",
    "url": "https://kyoto.travel/en/areas/okazaki/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-lake-biwa-canal",
    "title": "Kyoto City Tourism — Lake Biwa Canal Cruise",
    "url": "https://kyoto.travel/en/travel-inspiration/lake-biwa-canal-cruise/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-heian",
    "title": "Kyoto City Tourism — Heian-jingu Shrine",
    "url": "https://kyoto.travel/en/destinations/heianjingu-shrine/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-philosophers-path",
    "title": "Kyoto City Tourism — Philosopher's Path (Tetsugaku-no-michi)",
    "url": "https://kyoto.travel/en/destinations/philosophers-path-tetsugakunomichi/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-ginkakuji-access",
    "title": "Kyoto City Tourism — Comfortable access to Ginkaku-ji Temple and the Philosopher's Path",
    "url": "https://kyoto.travel/en/getting-around/comfortable-access-to-ginkaku-ji-temple-philosophers-path/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-eikando",
    "title": "Kyoto City Tourism — Eikando Temple (Zenrin-ji Temple)",
    "url": "https://kyoto.travel/en/destinations/eikando-temple-zenrinji-temple/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-nanzenji",
    "title": "Kyoto City Tourism — Nanzen-ji Temple",
    "url": "https://kyoto.travel/en/destinations/nanzenji-temple/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-shimogamo",
    "title": "Kyoto City Tourism — Shimogamo-jinja Shrine",
    "url": "https://kyoto.travel/en/destinations/shimogamojinja-shrine/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-shimogamo-access",
    "title": "Kyoto City Tourism — Comfortable access to Kyoto Imperial Palace and Shimogamo",
    "url": "https://kyoto.travel/en/getting-around/comfortable-access-to-kyoto-imperial-palace-shimogamo/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-arashiyama",
    "title": "Kyoto City Tourism — Saga-Arashiyama area",
    "url": "https://kyoto.travel/en/areas/saga-arashiyama/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-togetsukyo",
    "title": "Kyoto City Tourism — Togetsu-kyo Bridge",
    "url": "https://kyoto.travel/en/destinations/togetsukyo-bridge/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-gyoen",
    "title": "Kyoto City Tourism — Kyoto Gyoen National Garden",
    "url": "https://kyoto.travel/en/destinations/kyoto-gyoen-national-garden/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-station-area",
    "title": "Kyoto City Tourism — Around Kyoto Station",
    "url": "https://kyoto.travel/en/areas/around-kyoto-station/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-higashi-honganji",
    "title": "Kyoto City Tourism — Higashi-Hongan-ji Temple",
    "url": "https://kyoto.travel/en/destinations/higashihonganji-temple/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-nishi-honganji",
    "title": "Kyoto City Tourism — Nishi-Hongwanji Temple",
    "url": "https://kyoto.travel/en/destinations/nishihongwanji-temple/",
    "accessedOn": "2026-11-25"
  },
  {
    "id": "kyoto-umekoji",
    "title": "Kyoto City Tourism — Umekoji area",
    "url": "https://kyoto.travel/en/travel-inspiration/umekoji/",
    "accessedOn": "2026-11-25"
  }
];

export const CURATED_PLACES: readonly CuratedPlace[] = [
  {
    "id": "shijo-kawaramachi",
    "name": {
      "en": "Shijō Kawaramachi",
      "ja": "四条河原町"
    },
    "description": {
      "en": "A central intersection and starting point for the Shijō approach.",
      "ja": "四条通を歩き始める中心部の交差点です。"
    },
    "location": [135.76932, 35.00378],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/224811905",
    "sourceIds": [
      "osm",
      "kyoto-gion-access"
    ],
    "accessNotes": {
      "en": "Start at the mapped crossing; obey traffic signals.",
      "ja": "地図上の横断歩道から出発し、信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Urban crossings and curb conditions need an on-site check.",
      "ja": "横断歩道や縁石の状態は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "shijo-ohashi",
    "name": {
      "en": "Shijō Bridge",
      "ja": "四条大橋"
    },
    "description": {
      "en": "A public bridge crossing the Kamo River between downtown and Gion.",
      "ja": "中心街と祇園を結ぶ鴨川の公共の橋です。"
    },
    "location": [135.772116, 35.003826],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/304471500",
    "sourceIds": [
      "osm",
      "kyoto-gion-access"
    ],
    "accessNotes": {
      "en": "Use the mapped pedestrian crossing and bridge sidewalk.",
      "ja": "地図上の横断歩道と橋の歩道を利用してください。"
    },
    "accessibilityNotes": {
      "en": "Bridge and crossing width, curb ramps, and tactile paving need an on-site check.",
      "ja": "橋や横断歩道の幅、縁石のスロープ、点字ブロックは現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "yasaka-west-view",
    "name": {
      "en": "Yasaka Shrine west-gate view",
      "ja": "八坂神社 西楼門前"
    },
    "description": {
      "en": "The Shijō approach ends at a public sidewalk viewpoint by Yasaka Shrine.",
      "ja": "四条通から八坂神社の西楼門前の歩道に到着します。"
    },
    "location": [135.777362, 35.003745],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/105449683",
    "sourceIds": [
      "osm",
      "kyoto-gion-access"
    ],
    "accessNotes": {
      "en": "The route stops before the gate stairs; entering shrine grounds is optional and subject to site rules.",
      "ja": "ルートは門の階段手前で終了します。境内に入る場合は現地の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "The west gate has mapped stairs; this waypoint is on the approach sidewalk.",
      "ja": "西楼門には地図上で階段があります。この地点は参道の歩道上です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kawabata-riverside",
    "name": {
      "en": "Kawabata riverside sidewalk",
      "ja": "川端通の川沿い歩道"
    },
    "description": {
      "en": "A mapped sidewalk segment beside the Kamo River.",
      "ja": "鴨川沿いにある地図上の歩道です。"
    },
    "location": [135.772395, 35.006606],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/273471647",
    "sourceIds": [
      "osm",
      "kyoto-river"
    ],
    "accessNotes": {
      "en": "Stay on marked footways and crossings; do not descend to the riverbed.",
      "ja": "歩道と横断歩道を利用し、河川敷には下りないでください。"
    },
    "accessibilityNotes": {
      "en": "The mapped route has no steps, but curb ramps and surface continuity need an on-site check.",
      "ja": "地図上のルートに階段はありませんが、縁石のスロープと路面の連続性は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "sanjo-ohashi",
    "name": {
      "en": "Sanjō Bridge",
      "ja": "三条大橋"
    },
    "description": {
      "en": "A public bridge and endpoint for the riverside walk.",
      "ja": "川沿いの散歩の終点となる公共の橋です。"
    },
    "location": [135.772365, 35.009106],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/304471388",
    "sourceIds": [
      "osm"
    ],
    "accessNotes": {
      "en": "Finish at the mapped crossing by the bridge; obey traffic signals.",
      "ja": "橋のそばの地図上の横断歩道で終了し、信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Crossing and curb conditions need an on-site check.",
      "ja": "横断歩道と縁石の状態は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "maruyama-cherry-path",
    "name": {
      "en": "Maruyama Park weeping cherry path",
      "ja": "円山公園 しだれ桜付近の園路"
    },
    "description": {
      "en": "A public park path near the weeping cherry tree.",
      "ja": "しだれ桜の近くを通る公園の園路です。"
    },
    "location": [135.781693, 35.003198],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/13375802571",
    "sourceIds": [
      "osm",
      "kyoto-maruyama"
    ],
    "accessNotes": {
      "en": "The waypoint is on the mapped path about 9 m from the mapped tree; remain on park paths.",
      "ja": "地点は地図上のしだれ桜から約9 m離れた園路上です。園路から外れないでください。"
    },
    "accessibilityNotes": {
      "en": "This route reaches the park through mapped stairs and some service paths; step-free access is unverified.",
      "ja": "このルートには階段と管理用通路が含まれます。段差のない経路は未確認です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "chionin-south-gate-path",
    "name": {
      "en": "Chion-in south-gate side of Maruyama Park",
      "ja": "円山公園 知恩院南門側"
    },
    "description": {
      "en": "A mapped park path near the side leading toward Chion-in Temple.",
      "ja": "知恩院方面へ続く円山公園の園路です。"
    },
    "location": [135.7808, 35.004423],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/88108403",
    "sourceIds": [
      "osm",
      "kyoto-maruyama",
      "kyoto-chionin"
    ],
    "accessNotes": {
      "en": "The walk ends on a park path; temple access and opening conditions must be checked separately.",
      "ja": "散歩は公園の園路で終了します。寺院への入場条件は別途確認してください。"
    },
    "accessibilityNotes": {
      "en": "Park surface and the approach to the temple have not been field-audited.",
      "ja": "公園の路面と寺院への動線は現地調査をしていません。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "sosui-museum-basin",
    "name": {
      "en": "Lake Biwa Canal Museum basin",
      "ja": "琵琶湖疏水記念館前"
    },
    "description": {
      "en": "The canal boat basin in front of the Lake Biwa Canal Museum, at the foot of the Keage Incline.",
      "ja": "蹴上インクラインの下、琵琶湖疏水記念館の前に広がる船溜りです。"
    },
    "location": [135.788019, 35.011609],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/219968173",
    "sourceIds": [
      "osm",
      "kyoto-lake-biwa-canal",
      "kyoto-okazaki"
    ],
    "accessNotes": {
      "en": "Start on the public paths by the museum; museum entry is separate and optional.",
      "ja": "記念館前の公共の通路から出発します。記念館への入館は任意です。"
    },
    "accessibilityNotes": {
      "en": "A short mapped stair segment is near this point; step-free access needs an on-site check.",
      "ja": "この地点の近くに地図上の短い階段があります。段差のない経路は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "okazaki-canal-promenade",
    "name": {
      "en": "Okazaki canal path",
      "ja": "岡崎疏水沿いの小径"
    },
    "description": {
      "en": "A mapped footpath along the south bank of the Okazaki stretch of the Lake Biwa Canal.",
      "ja": "琵琶湖疏水の岡崎区間の南岸に沿った、地図上の歩道です。"
    },
    "location": [135.783797, 35.01192],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/306349256",
    "sourceIds": [
      "osm",
      "kyoto-okazaki",
      "kyoto-lake-biwa-canal"
    ],
    "accessNotes": {
      "en": "Stay on the canal-side footpath; do not climb the canal banks.",
      "ja": "疏水沿いの歩道を歩き、護岸には近づかないでください。"
    },
    "accessibilityNotes": {
      "en": "Path width, surface and the crossing at Okazaki-michi need an on-site check.",
      "ja": "歩道の幅や路面、岡崎道の横断箇所は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "heian-otorii",
    "name": {
      "en": "Heian Shrine Ōtorii",
      "ja": "平安神宮 大鳥居"
    },
    "description": {
      "en": "The giant torii over Jingū-michi on the approach to Heian Shrine.",
      "ja": "平安神宮へ向かう神宮道にかかる大鳥居です。"
    },
    "location": [135.782681, 35.012599],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/100398421",
    "sourceIds": [
      "osm",
      "kyoto-heian"
    ],
    "accessNotes": {
      "en": "View from the sidewalk; obey signals when crossing Jingū-michi.",
      "ja": "歩道から見学し、神宮道を渡る際は信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Crossings and curb ramps around the torii need an on-site check.",
      "ja": "鳥居周辺の横断歩道と縁石のスロープは現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "heian-otenmon",
    "name": {
      "en": "Heian Shrine Ōtenmon gate",
      "ja": "平安神宮 應天門前"
    },
    "description": {
      "en": "The walk ends on the park path in front of Heian Shrine's vermilion main gate.",
      "ja": "平安神宮の朱塗りの應天門前、公園内の園路で終了します。"
    },
    "location": [135.782507, 35.0149],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/426155048",
    "sourceIds": [
      "osm",
      "kyoto-heian"
    ],
    "accessNotes": {
      "en": "The route stops outside the gate; entering the shrine is optional and subject to its rules.",
      "ja": "ルートは門の手前で終了します。境内に入る場合は神社の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "The grounds beyond the gate are gravel; surfaces need an on-site check.",
      "ja": "門の内側は砂利敷きです。路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "ginkakuji-bridge",
    "name": {
      "en": "Ginkakuji Bridge",
      "ja": "銀閣寺橋"
    },
    "description": {
      "en": "The bridge on Imadegawa-dōri at the north end of the Philosopher's Path.",
      "ja": "哲学の道の北端、今出川通にかかる橋です。"
    },
    "location": [135.79506, 35.027222],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/1556602852",
    "sourceIds": [
      "osm",
      "kyoto-philosophers-path",
      "kyoto-ginkakuji-access"
    ],
    "accessNotes": {
      "en": "Start on the Imadegawa-dōri sidewalk and join the canal path; keep the bridge clear.",
      "ja": "今出川通の歩道から疏水沿いの道に入ります。橋の上で立ち止まらないでください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "honenin-junction",
    "name": {
      "en": "Philosopher's Path near Hōnen-in",
      "ja": "哲学の道 法然院付近"
    },
    "description": {
      "en": "A point on the canal path where the lane to Hōnen-in Temple branches off.",
      "ja": "法然院へ向かう道が分かれる、疏水沿いの地点です。"
    },
    "location": [135.794924, 35.022479],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/196173120",
    "sourceIds": [
      "osm",
      "kyoto-philosophers-path"
    ],
    "accessNotes": {
      "en": "Stay on the canal path; the temple lane leads into a residential area.",
      "ja": "疏水沿いの道を歩いてください。寺へ向かう道は住宅地に入ります。"
    },
    "accessibilityNotes": {
      "en": "The path mixes stone paving and gravel; surfaces need an on-site check.",
      "ja": "石畳と砂利が混在しています。路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "wakaoji-bridge",
    "name": {
      "en": "Nyakuōji Bridge",
      "ja": "若王子橋"
    },
    "description": {
      "en": "The bridge at the south end of the Philosopher's Path, beside Kumano Nyakuōji Shrine.",
      "ja": "熊野若王子神社のそばにある、哲学の道の南端の橋です。"
    },
    "location": [135.7958, 35.015386],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/190875838",
    "sourceIds": [
      "osm",
      "kyoto-philosophers-path"
    ],
    "accessNotes": {
      "en": "Continue west on Reisen-dōri; the shrine is optional and subject to its rules.",
      "ja": "冷泉通を西へ進みます。神社への参拝は任意です。現地の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "eikando-gate",
    "name": {
      "en": "Eikan-dō (Zenrin-ji) gate",
      "ja": "永観堂（禅林寺）門前"
    },
    "description": {
      "en": "The street outside the main gate of Zenrin-ji, known as Eikan-dō.",
      "ja": "永観堂の名で知られる禅林寺の総門前の通りです。"
    },
    "location": [135.793729, 35.014601],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/8042265340",
    "sourceIds": [
      "osm",
      "kyoto-eikando"
    ],
    "accessNotes": {
      "en": "The stop is on the street; temple entry and opening hours must be checked separately.",
      "ja": "地点は通り沿いです。寺の拝観と開門時間は別途確認してください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "nanzenji-sanmon-approach",
    "name": {
      "en": "Nanzen-ji Sanmon approach",
      "ja": "南禅寺 三門前"
    },
    "description": {
      "en": "The open approach on the east side of Nanzen-ji's Sanmon gate.",
      "ja": "南禅寺の三門東側に広がる参道です。"
    },
    "location": [135.792899, 35.011276],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/190876301",
    "sourceIds": [
      "osm",
      "kyoto-nanzenji"
    ],
    "accessNotes": {
      "en": "The walk ends before the gate stairs; climbing the gate is ticketed and optional.",
      "ja": "ルートは三門の階段手前で終了します。三門の楼上拝観は有料で任意です。"
    },
    "accessibilityNotes": {
      "en": "Three mapped steps are on the path into the temple grounds; the gate itself has stairs.",
      "ja": "境内へ入る道に地図上で3段の階段があります。三門自体にも階段があります。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kawai-bridge",
    "name": {
      "en": "Kawai Bridge (Demachiyanagi)",
      "ja": "河合橋（出町柳）"
    },
    "description": {
      "en": "The bridge beside Demachiyanagi Station on the way to Shimogamo Shrine.",
      "ja": "下鴨神社へ向かう途中、出町柳駅のそばにある橋です。"
    },
    "location": [135.772588, 35.030423],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/620036418",
    "sourceIds": [
      "osm",
      "kyoto-shimogamo-access"
    ],
    "accessNotes": {
      "en": "Start on the bridge sidewalk; obey signals at the Kawabata-dōri crossing.",
      "ja": "橋の歩道から出発し、川端通の交差点では信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kamogawa-delta",
    "name": {
      "en": "Kamogawa Delta",
      "ja": "鴨川デルタ"
    },
    "description": {
      "en": "The tip of the riverside park where the Kamo and Takano rivers meet.",
      "ja": "賀茂川と高野川が合流する、河川敷公園の先端です。"
    },
    "location": [135.771751, 35.02975],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/278411068",
    "sourceIds": [
      "osm",
      "kyoto-shimogamo-access"
    ],
    "accessNotes": {
      "en": "Stay on the park paths; this walk does not use the stepping stones across the river.",
      "ja": "公園内の通路を歩いてください。このルートは川の飛び石を使いません。"
    },
    "accessibilityNotes": {
      "en": "Mapped stairs lead down from the bridge level; step-free access needs an on-site check.",
      "ja": "橋の高さから地図上の階段で下ります。段差のない経路は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "tadasu-south-side",
    "name": {
      "en": "Tadasu-no-Mori, south side",
      "ja": "糺の森 南側"
    },
    "description": {
      "en": "A mapped path on the south side of the Shimogamo Shrine forest.",
      "ja": "下鴨神社の森の南側を通る、地図上の通路です。"
    },
    "location": [135.772215, 35.031599],
    "osmFeatureUrl": "https://www.openstreetmap.org/relation/5646741",
    "sourceIds": [
      "osm",
      "kyoto-shimogamo"
    ],
    "accessNotes": {
      "en": "Follow the mapped path north; treat the forest as shrine grounds.",
      "ja": "地図上の通路を北へ進みます。森は神社の境内として配慮してください。"
    },
    "accessibilityNotes": {
      "en": "Forest path surfaces have not been checked; an on-site check is needed.",
      "ja": "森の通路の路面は確認していません。現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kawai-shrine-approach",
    "name": {
      "en": "Kawai Shrine approach",
      "ja": "河合神社前"
    },
    "description": {
      "en": "The path by Kawai Shrine, a subsidiary shrine of Shimogamo inside Tadasu-no-Mori.",
      "ja": "糺の森の中にある下鴨神社の摂社、河合神社のそばの通路です。"
    },
    "location": [135.772384, 35.034562],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/351136449",
    "sourceIds": [
      "osm",
      "kyoto-shimogamo"
    ],
    "accessNotes": {
      "en": "The stop is on the forest path; entering the shrine is optional and subject to its rules.",
      "ja": "地点は森の通路上です。神社に入る場合は現地の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Surfaces near the shrine have not been checked; an on-site check is needed.",
      "ja": "神社周辺の路面は確認していません。現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "shimogamo-romon",
    "name": {
      "en": "Shimogamo Shrine Rōmon gate",
      "ja": "下鴨神社 楼門前"
    },
    "description": {
      "en": "The walk ends on the approach in front of Shimogamo Shrine's vermilion tower gate.",
      "ja": "下鴨神社の朱塗りの楼門前、参道上で終了します。"
    },
    "location": [135.772828, 35.038119],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/99189777",
    "sourceIds": [
      "osm",
      "kyoto-shimogamo"
    ],
    "accessNotes": {
      "en": "The route stops outside the gate; entering the shrine is optional and subject to its rules.",
      "ja": "ルートは門の手前で終了します。境内に入る場合は神社の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "The approach surface has not been checked; an on-site check is needed.",
      "ja": "参道の路面は確認していません。現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "nakanoshima-bridge",
    "name": {
      "en": "Nakanoshima Bridge",
      "ja": "中ノ島橋"
    },
    "description": {
      "en": "A bridge onto Nakanoshima, the island in the river below Arashiyama.",
      "ja": "嵐山のふもと、川の中州である中ノ島へ渡る橋です。"
    },
    "location": [135.68062, 35.011933],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/519319728",
    "sourceIds": [
      "osm",
      "kyoto-arashiyama"
    ],
    "accessNotes": {
      "en": "Start at the east end of the bridge; the riverside path is shared with cyclists.",
      "ja": "橋の東側から出発します。川沿いの道は自転車と共用です。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "togetsukyo-bridge",
    "name": {
      "en": "Togetsukyō Bridge",
      "ja": "渡月橋"
    },
    "description": {
      "en": "The landmark bridge between Nakanoshima and the north bank of the river.",
      "ja": "中ノ島と川の北岸を結ぶ、嵐山を象徴する橋です。"
    },
    "location": [135.677762, 35.01287],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/519319727",
    "sourceIds": [
      "osm",
      "kyoto-togetsukyo"
    ],
    "accessNotes": {
      "en": "Use the raised sidewalks; do not stop on the roadway for photos.",
      "ja": "一段高い歩道を歩き、車道で立ち止まって撮影しないでください。"
    },
    "accessibilityNotes": {
      "en": "Curb heights and the crossings at each end need an on-site check.",
      "ja": "縁石の高さと橋の両端の横断歩道は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "katsura-north-bank",
    "name": {
      "en": "North-bank riverside promenade",
      "ja": "大堰川北岸の遊歩道"
    },
    "description": {
      "en": "The riverside promenade upstream of Togetsukyō, beside the boat landings.",
      "ja": "渡月橋の上流、船着き場のそばの川沿いの遊歩道です。"
    },
    "location": [135.674955, 35.013363],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/152194156",
    "sourceIds": [
      "osm",
      "kyoto-arashiyama"
    ],
    "accessNotes": {
      "en": "Keep to the promenade or sidewalk; do not block the boat landings.",
      "ja": "遊歩道か歩道を歩き、船着き場の通行を妨げないでください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kameyama-riverside",
    "name": {
      "en": "Arashiyama Park, Kameyama riverside",
      "ja": "嵐山公園 亀山地区の川沿い"
    },
    "description": {
      "en": "The riverside edge of the Kameyama area of Arashiyama Park.",
      "ja": "嵐山公園亀山地区の川沿いです。"
    },
    "location": [135.671832, 35.013457],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/319336216",
    "sourceIds": [
      "osm",
      "kyoto-arashiyama"
    ],
    "accessNotes": {
      "en": "The walk ends on the riverside path; paths up the hill are optional and not part of this route.",
      "ja": "散歩は川沿いの道で終了します。山へ上る道はこのルートに含まれません。"
    },
    "accessibilityNotes": {
      "en": "No steps are mapped to this point; the endpoint and any paths beyond it need an on-site check.",
      "ja": "この地点までの線上に階段はありません。終点とその先の道は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "sakaimachi-gomon",
    "name": {
      "en": "Sakaimachi Gate",
      "ja": "堺町御門"
    },
    "description": {
      "en": "The main south gate of the Kyoto Gyoen, facing Marutamachi-dōri.",
      "ja": "丸太町通に面した、京都御苑南側の正門です。"
    },
    "location": [135.76316, 35.0176],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/5556969796",
    "sourceIds": [
      "osm",
      "kyoto-gyoen"
    ],
    "accessNotes": {
      "en": "Enter through the open gate; obey signals on Marutamachi-dōri.",
      "ja": "開放された門から入り、丸太町通では信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Gyoen paths are gravel; surfaces need an on-site check.",
      "ja": "御苑内の道は砂利敷きです。路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kujo-pond",
    "name": {
      "en": "Kujō Pond",
      "ja": "九條池"
    },
    "description": {
      "en": "A garden pond by Takakura Bridge and Itsukushima Shrine in the south of the Gyoen.",
      "ja": "御苑南部、高倉橋と厳島神社のそばにある池です。"
    },
    "location": [135.761955, 35.018317],
    "osmFeatureUrl": "https://www.openstreetmap.org/relation/7997766",
    "sourceIds": [
      "osm",
      "kyoto-gyoen"
    ],
    "accessNotes": {
      "en": "Stay on the paths around the pond and keep off the planted banks.",
      "ja": "池の周りの通路を歩き、植え込みのある岸には入らないでください。"
    },
    "accessibilityNotes": {
      "en": "Gravel paths and the bridge approach need an on-site check.",
      "ja": "砂利道と橋へのアプローチは現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kenreimon-avenue",
    "name": {
      "en": "Kenreimon avenue",
      "ja": "建礼門前大通"
    },
    "description": {
      "en": "The broad gravel avenue in front of Kenreimon, the south gate of the Imperial Palace.",
      "ja": "京都御所の南門、建礼門の前に広がる砂利敷きの大通りです。"
    },
    "location": [135.762144, 35.0226],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/554879266",
    "sourceIds": [
      "osm",
      "kyoto-gyoen"
    ],
    "accessNotes": {
      "en": "View the gate from the avenue; the palace is entered only on its own visitor route.",
      "ja": "大通りから門を見学してください。御所の参観は所定の入口から行います。"
    },
    "accessibilityNotes": {
      "en": "Deep gravel can be hard going for wheels; an on-site check is needed.",
      "ja": "厚い砂利は車輪での移動が難しい場合があります。現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "hamaguri-gomon",
    "name": {
      "en": "Hamaguri Gate",
      "ja": "蛤御門"
    },
    "description": {
      "en": "A west gate of the Kyoto Gyoen facing Karasuma-dōri.",
      "ja": "烏丸通に面した京都御苑西側の門です。"
    },
    "location": [135.7597, 35.023126],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/5325050265",
    "sourceIds": [
      "osm",
      "kyoto-gyoen"
    ],
    "accessNotes": {
      "en": "The walk ends at the gate; obey signals when crossing Karasuma-dōri.",
      "ja": "散歩は門で終了します。烏丸通を渡る際は信号に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Gravel at the gate and the crossing need an on-site check.",
      "ja": "門付近の砂利と横断歩道は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kyoto-station-plaza",
    "name": {
      "en": "Kyoto Station Karasuma plaza",
      "ja": "京都駅 烏丸口"
    },
    "description": {
      "en": "The plaza outside the Karasuma (north) exit of Kyoto Station, facing Kyoto Tower.",
      "ja": "京都タワーの向かい、京都駅烏丸口（北側）の駅前広場です。"
    },
    "location": [135.758954, 34.986538],
    "osmFeatureUrl": "https://www.openstreetmap.org/node/267316272",
    "sourceIds": [
      "osm",
      "kyoto-station-area"
    ],
    "accessNotes": {
      "en": "Start on the plaza walkway; keep bus-stop queues clear.",
      "ja": "広場の歩行者通路から出発し、バス停の列をふさがないでください。"
    },
    "accessibilityNotes": {
      "en": "Mapped stairs are next to this point; use the level walkway and check crossings on site.",
      "ja": "この地点の隣に地図上の階段があります。段差のない通路を使い、横断歩道は現地確認してください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "higashi-honganji-plaza",
    "name": {
      "en": "Higashi Hongan-ji front plaza",
      "ja": "東本願寺前 お東さん広場"
    },
    "description": {
      "en": "The public plaza along Karasuma-dōri in front of Higashi Hongan-ji.",
      "ja": "烏丸通沿い、東本願寺の前に広がる公共の広場です。"
    },
    "location": [135.75983, 34.99035],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/46699198",
    "sourceIds": [
      "osm",
      "kyoto-higashi-honganji"
    ],
    "accessNotes": {
      "en": "Stay in the plaza; entering the temple is optional and subject to its rules.",
      "ja": "広場内を歩いてください。境内に入る場合は寺の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "nishi-honganji-gate",
    "name": {
      "en": "Nishi Hongan-ji Goeidō-mon gate",
      "ja": "西本願寺 御影堂門前"
    },
    "description": {
      "en": "The sidewalk on Horikawa-dōri outside Nishi Hongan-ji's Founder's Hall gate.",
      "ja": "西本願寺の御影堂門前、堀川通の歩道です。"
    },
    "location": [135.752858, 34.99155],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/372432409",
    "sourceIds": [
      "osm",
      "kyoto-nishi-honganji"
    ],
    "accessNotes": {
      "en": "The stop is on the sidewalk; entering the temple is optional and subject to its rules.",
      "ja": "地点は歩道上です。境内に入る場合は寺の案内に従ってください。"
    },
    "accessibilityNotes": {
      "en": "Horikawa-dōri crossings and curb ramps need an on-site check.",
      "ja": "堀川通の横断歩道と縁石のスロープは現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "umekoji-park-east",
    "name": {
      "en": "Umekōji Park, east side",
      "ja": "梅小路公園 東側"
    },
    "description": {
      "en": "The east edge of Umekōji Park along Ōmiya-dōri.",
      "ja": "大宮通に面した梅小路公園の東側です。"
    },
    "location": [135.749089, 34.987434],
    "osmFeatureUrl": "https://www.openstreetmap.org/way/121131295",
    "sourceIds": [
      "osm",
      "kyoto-umekoji"
    ],
    "accessNotes": {
      "en": "The walk ends at the park edge on the public sidewalk; facilities inside the park are separate.",
      "ja": "散歩は公園東端の歩道で終了します。園内の施設は別に利用案内を確認してください。"
    },
    "accessibilityNotes": {
      "en": "Crossings, curb ramps and surfaces need an on-site check.",
      "ja": "横断歩道、縁石のスロープ、路面は現地確認が必要です。"
    },
    "communityInputStatus": "not-consulted"
  }
];

export const CURATED_WALKS: readonly CuratedWalk[] = [
  {
    "id": "shijo-yasaka",
    "name": {
      "en": "Shijō to Yasaka",
      "ja": "四条通から八坂神社へ"
    },
    "description": {
      "en": "Follow the public Shijō corridor from downtown to a view of Yasaka Shrine.",
      "ja": "中心街から四条通を歩き、八坂神社の西楼門前へ向かいます。"
    },
    "theme": "culture",
    "placeIds": [
      "shijo-kawaramachi",
      "shijo-ohashi",
      "yasaka-west-view"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.76932, 35.00378],
        [135.769683, 35.003787],
        [135.769689, 35.003693],
        [135.77038, 35.003712],
        [135.770421, 35.003713],
        [135.770438, 35.003713],
        [135.770455, 35.003713],
        [135.770479, 35.003714],
        [135.7705, 35.003709],
        [135.770515, 35.003697],
        [135.770556, 35.003697],
        [135.770586, 35.003697],
        [135.770605, 35.003709],
        [135.770632, 35.003719],
        [135.77066, 35.003721],
        [135.770985, 35.003725],
        [135.771129, 35.003727],
        [135.771802, 35.003731],
        [135.77182, 35.003823],
        [135.771855, 35.003824],
        [135.771946, 35.003824],
        [135.771998, 35.003825],
        [135.772037, 35.003825],
        [135.772116, 35.003826],
        [135.772189, 35.003826],
        [135.772201, 35.003924],
        [135.772217, 35.003913],
        [135.772301, 35.003913],
        [135.772407, 35.003913],
        [135.772602, 35.003914],
        [135.772639, 35.003915],
        [135.772679, 35.003915],
        [135.772948, 35.003918],
        [135.773015, 35.003918],
        [135.773088, 35.003918],
        [135.773153, 35.003917],
        [135.773205, 35.003919],
        [135.774368, 35.003917],
        [135.77438, 35.003923],
        [135.774396, 35.003931],
        [135.774922, 35.003934],
        [135.77498, 35.003933],
        [135.775001, 35.003942],
        [135.775121, 35.003945],
        [135.775187, 35.003944],
        [135.775237, 35.003924],
        [135.775472, 35.003921],
        [135.776134, 35.00391],
        [135.776389, 35.00391],
        [135.77667, 35.003888],
        [135.776808, 35.003877],
        [135.776962, 35.003866],
        [135.777083, 35.003928],
        [135.777211, 35.003993],
        [135.777306, 35.003968],
        [135.777342, 35.003959],
        [135.777417, 35.003939],
        [135.777384, 35.003839],
        [135.777362, 35.003745]
      ]
    },
    "estimatedMeters": 798,
    "estimatedMinutes": 11,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-gion-access"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.76932,35.0037796;135.7721155,35.0038257;135.7773624,35.0037447?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-18",
    "mappedSteps": false,
    "accessibilityNotes": {
      "en": "No steps are mapped on this line; crossings, curb ramps, and crowding need an on-site check. The route ends before the gate stairs.",
      "ja": "この線上に階段はありません。横断歩道、縁石のスロープ、混雑は現地確認が必要です。門の階段手前で終了します。"
    },
    "residentNotes": {
      "en": "Keep the busy Shijō corridor clear; do not stop in shop entrances or block the shrine gate.",
      "ja": "四条通の通行を妨げず、店舗の入口や神社の門前を塞がないでください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kamo-riverside",
    "name": {
      "en": "Kamo riverside sidewalk",
      "ja": "鴨川沿いの歩道"
    },
    "description": {
      "en": "Walk on mapped public sidewalks and crossings between Shijō and Sanjō bridges.",
      "ja": "四条大橋から三条大橋まで、地図上の歩道と横断歩道を歩きます。"
    },
    "theme": "riverside",
    "placeIds": [
      "shijo-ohashi",
      "kawabata-riverside",
      "sanjo-ohashi"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.772116, 35.003826],
        [135.772144, 35.004012],
        [135.772207, 35.004006],
        [135.77223, 35.004138],
        [135.772253, 35.004274],
        [135.77226, 35.00431],
        [135.772285, 35.004344],
        [135.772287, 35.00436],
        [135.77229, 35.004381],
        [135.772291, 35.004394],
        [135.772341, 35.004896],
        [135.772301, 35.004901],
        [135.772311, 35.005031],
        [135.772315, 35.005074],
        [135.772317, 35.005115],
        [135.772307, 35.005124],
        [135.77231, 35.005312],
        [135.772311, 35.005344],
        [135.772313, 35.005376],
        [135.772354, 35.005378],
        [135.772423, 35.006448],
        [135.772423, 35.006529],
        [135.772423, 35.006577],
        [135.772395, 35.006606],
        [135.772313, 35.006606],
        [135.772238, 35.006607],
        [135.772174, 35.006607],
        [135.772193, 35.007807],
        [135.772194, 35.007843],
        [135.772177, 35.008435],
        [135.772163, 35.00856],
        [135.77216, 35.008746],
        [135.772135, 35.0088],
        [135.772136, 35.008924],
        [135.77218, 35.008971],
        [135.772266, 35.008971],
        [135.772345, 35.00897],
        [135.772365, 35.009106]
      ]
    },
    "estimatedMeters": 639,
    "estimatedMinutes": 9,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-river"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.7721155,35.0038257;135.7723951,35.0066055;135.7723653,35.0091057?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-18",
    "mappedSteps": false,
    "accessibilityNotes": {
      "en": "No steps are mapped on this sidewalk route; it is not a certified step-free route. Check curb ramps, roadworks, and wet surfaces.",
      "ja": "この歩道ルートに階段はありませんが、バリアフリー認証済みではありません。縁石のスロープ、工事、濡れた路面を確認してください。"
    },
    "residentNotes": {
      "en": "Stay on the main riverside sidewalk and crossings; leave space for residents, commuters, and cyclists.",
      "ja": "川沿いの歩道と横断歩道を利用し、住民、通勤者、自転車の通行スペースを空けてください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "yasaka-maruyama",
    "name": {
      "en": "Yasaka and Maruyama Park",
      "ja": "八坂神社と円山公園"
    },
    "description": {
      "en": "A short shrine-and-park walk toward the Chion-in side of Maruyama Park.",
      "ja": "八坂神社から円山公園を通り、知恩院側へ向かう短い散歩です。"
    },
    "theme": "park",
    "placeIds": [
      "yasaka-west-view",
      "maruyama-cherry-path",
      "chionin-south-gate-path"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.777362, 35.003745],
        [135.777384, 35.003743],
        [135.777464, 35.003736],
        [135.777482, 35.003734],
        [135.77758, 35.003726],
        [135.77769, 35.003716],
        [135.777736, 35.003712],
        [135.777787, 35.003708],
        [135.777787, 35.003743],
        [135.777793, 35.00378],
        [135.777803, 35.003809],
        [135.77782, 35.003835],
        [135.777853, 35.003854],
        [135.777892, 35.003867],
        [135.77798, 35.00389],
        [135.778169, 35.003922],
        [135.778196, 35.003929],
        [135.778362, 35.003951],
        [135.77859, 35.003987],
        [135.778869, 35.003992],
        [135.778973, 35.003971],
        [135.778998, 35.003973],
        [135.779149, 35.003982],
        [135.779183, 35.003965],
        [135.779219, 35.003952],
        [135.779257, 35.003943],
        [135.779296, 35.003939],
        [135.779336, 35.003939],
        [135.779375, 35.003944],
        [135.779524, 35.003904],
        [135.779881, 35.003813],
        [135.780001, 35.003792],
        [135.780287, 35.003768],
        [135.780325, 35.003763],
        [135.780362, 35.003755],
        [135.780398, 35.003744],
        [135.780433, 35.003729],
        [135.780465, 35.003712],
        [135.780495, 35.003692],
        [135.780521, 35.003669],
        [135.780548, 35.003645],
        [135.780563, 35.003546],
        [135.78077, 35.003539],
        [135.78087, 35.003533],
        [135.781072, 35.003521],
        [135.781306, 35.003481],
        [135.781353, 35.003472],
        [135.781357, 35.003438],
        [135.781365, 35.003405],
        [135.781377, 35.003372],
        [135.781394, 35.003341],
        [135.781414, 35.003312],
        [135.781437, 35.003284],
        [135.781472, 35.003268],
        [135.78151, 35.00326],
        [135.78155, 35.003258],
        [135.781589, 35.003263],
        [135.781693, 35.003198],
        [135.781589, 35.003263],
        [135.78155, 35.003258],
        [135.78151, 35.00326],
        [135.781472, 35.003268],
        [135.781437, 35.003284],
        [135.781414, 35.003312],
        [135.781394, 35.003341],
        [135.781377, 35.003372],
        [135.781365, 35.003405],
        [135.781357, 35.003438],
        [135.781353, 35.003472],
        [135.781306, 35.003481],
        [135.781287, 35.003543],
        [135.781276, 35.003581],
        [135.781234, 35.003674],
        [135.781083, 35.003728],
        [135.780994, 35.003772],
        [135.780941, 35.003827],
        [135.780882, 35.003845],
        [135.780615, 35.003825],
        [135.78051, 35.003824],
        [135.780641, 35.004104],
        [135.780672, 35.004174],
        [135.780684, 35.004202],
        [135.780753, 35.004341],
        [135.78076, 35.004353],
        [135.780785, 35.004399],
        [135.7808, 35.004423]
      ]
    },
    "estimatedMeters": 666,
    "estimatedMinutes": 9,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-maruyama",
      "kyoto-chionin"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.7773624,35.0037447;135.781633,35.003134;135.780796,35.004425?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-18",
    "mappedSteps": true,
    "accessibilityNotes": {
      "en": "Mapped stairs include 19 steps at the west gate and 7 more within the precinct; park service paths and surfaces are not field-audited. Do not present this as wheelchair accessible.",
      "ja": "西楼門の19段と境内の7段を含む階段が地図上にあります。公園の管理用通路と路面は現地調査をしていません。車いす対応ルートとして案内しないでください。"
    },
    "residentNotes": {
      "en": "Stay on open shrine and park paths, keep voices low, and avoid blocking worship or park maintenance. Community review has not occurred.",
      "ja": "開放された境内と園路を歩き、静かに過ごし、参拝や公園の管理作業を妨げないでください。地域の意見聴取は未実施です。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "okazaki-heian",
    "name": {
      "en": "Okazaki Canal & Heian Shrine",
      "ja": "岡崎疏水と平安神宮"
    },
    "description": {
      "en": "Follow the Okazaki canal path from the Lake Biwa Canal Museum to the Ōtorii and Heian Shrine's Ōtenmon gate.",
      "ja": "琵琶湖疏水記念館から岡崎疏水沿いの小径を歩き、大鳥居と平安神宮の應天門前へ向かいます。"
    },
    "theme": "culture",
    "placeIds": [
      "sosui-museum-basin",
      "okazaki-canal-promenade",
      "heian-otorii",
      "heian-otenmon"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.788019, 35.011609],
        [135.787969, 35.01168],
        [135.787962, 35.011684],
        [135.787902, 35.011713],
        [135.787857, 35.011753],
        [135.787801, 35.011751],
        [135.787766, 35.011773],
        [135.787692, 35.011818],
        [135.787611, 35.01186],
        [135.787503, 35.011895],
        [135.787392, 35.011909],
        [135.787207, 35.011912],
        [135.786011, 35.011913],
        [135.785021, 35.011914],
        [135.784948, 35.011909],
        [135.78491, 35.011893],
        [135.784864, 35.011907],
        [135.784851, 35.011922],
        [135.784804, 35.011993],
        [135.784734, 35.011993],
        [135.784644, 35.011993],
        [135.78461, 35.011914],
        [135.784581, 35.011901],
        [135.784523, 35.011912],
        [135.784437, 35.011915],
        [135.784347, 35.011917],
        [135.78428, 35.011916],
        [135.784189, 35.011916],
        [135.784119, 35.011915],
        [135.783953, 35.011915],
        [135.783879, 35.011915],
        [135.783797, 35.01192],
        [135.783708, 35.011919],
        [135.783646, 35.011913],
        [135.783602, 35.011912],
        [135.783541, 35.011911],
        [135.783479, 35.011913],
        [135.783374, 35.011914],
        [135.783207, 35.011912],
        [135.783092, 35.011914],
        [135.783, 35.011916],
        [135.782946, 35.011912],
        [135.782907, 35.011906],
        [135.782884, 35.011902],
        [135.782861, 35.011896],
        [135.782848, 35.011907],
        [135.782839, 35.011919],
        [135.782836, 35.011945],
        [135.782622, 35.011946],
        [135.782611, 35.012136],
        [135.782572, 35.012196],
        [135.782536, 35.01226],
        [135.782508, 35.012621],
        [135.782679, 35.01263],
        [135.782681, 35.012599],
        [135.782679, 35.01263],
        [135.782508, 35.012621],
        [135.7825, 35.01272],
        [135.782497, 35.012763],
        [135.782494, 35.012806],
        [135.782491, 35.012849],
        [135.782488, 35.012892],
        [135.78248, 35.012987],
        [135.782477, 35.013016],
        [135.782473, 35.013076],
        [135.782469, 35.01312],
        [135.782466, 35.013163],
        [135.782462, 35.013208],
        [135.782457, 35.013272],
        [135.782438, 35.0135],
        [135.782438, 35.013535],
        [135.782436, 35.013567],
        [135.782436, 35.013649],
        [135.782435, 35.013705],
        [135.782434, 35.013723],
        [135.782433, 35.013774],
        [135.782587, 35.013784],
        [135.782586, 35.013805],
        [135.782567, 35.014061],
        [135.782566, 35.014084],
        [135.782556, 35.014222],
        [135.782552, 35.014275],
        [135.782534, 35.014534],
        [135.78253, 35.01458],
        [135.782521, 35.014719],
        [135.782517, 35.014763],
        [135.782507, 35.0149]
      ]
    },
    "estimatedMeters": 903,
    "estimatedMinutes": 12,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-okazaki",
      "kyoto-heian"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.788019,35.011609;135.783797,35.01192;135.782681,35.012599;135.782507,35.0149?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": true,
    "accessibilityNotes": {
      "en": "One short stair segment is mapped near the canal museum basin, and the gate approach is gravel. Crossings, curb ramps and crowding need an on-site check.",
      "ja": "疏水記念館前に地図上の短い階段が1か所あり、門前は砂利敷きです。横断歩道、縁石のスロープ、混雑は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "Keep the narrow canal path clear and walk in single file when it is busy; do not block the museum entrance or the shrine approach.",
      "ja": "狭い疏水沿いの道をふさがず、混雑時は一列で歩いてください。記念館の入口や神社の参道をふさがないでください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "philosophers-path",
    "name": {
      "en": "Philosopher's Path",
      "ja": "哲学の道"
    },
    "description": {
      "en": "Walk the canal-side Philosopher's Path from Ginkakuji Bridge to Nyakuōji Bridge, then continue past Eikan-dō to Nanzen-ji.",
      "ja": "銀閣寺橋から若王子橋まで疏水沿いの哲学の道を歩き、永観堂の前を通って南禅寺へ向かいます。"
    },
    "theme": "riverside",
    "placeIds": [
      "ginkakuji-bridge",
      "honenin-junction",
      "wakaoji-bridge",
      "eikando-gate",
      "nanzenji-sanmon-approach"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.79506, 35.027222],
        [135.795019, 35.027223],
        [135.794984, 35.027217],
        [135.794934, 35.027203],
        [135.795035, 35.027164],
        [135.795054, 35.027176],
        [135.795067, 35.027179],
        [135.795078, 35.027178],
        [135.795103, 35.027157],
        [135.795199, 35.027079],
        [135.795296, 35.026989],
        [135.795346, 35.026921],
        [135.795351, 35.026913],
        [135.795366, 35.026887],
        [135.795461, 35.026714],
        [135.795486, 35.026621],
        [135.795501, 35.026515],
        [135.795511, 35.026271],
        [135.795522, 35.026162],
        [135.795541, 35.026061],
        [135.795579, 35.025965],
        [135.795614, 35.025891],
        [135.795653, 35.025812],
        [135.795759, 35.025624],
        [135.795837, 35.025529],
        [135.795904, 35.025452],
        [135.795927, 35.025427],
        [135.796013, 35.025333],
        [135.796087, 35.02525],
        [135.796151, 35.025164],
        [135.796173, 35.025133],
        [135.796207, 35.025086],
        [135.796273, 35.024991],
        [135.796345, 35.024873],
        [135.796364, 35.02483],
        [135.796401, 35.024712],
        [135.796448, 35.024558],
        [135.796467, 35.024423],
        [135.796466, 35.024338],
        [135.796452, 35.024194],
        [135.796447, 35.024165],
        [135.796429, 35.024043],
        [135.796427, 35.024033],
        [135.796389, 35.024009],
        [135.796384, 35.023983],
        [135.796349, 35.023915],
        [135.796333, 35.023862],
        [135.796319, 35.023765],
        [135.796251, 35.023633],
        [135.796179, 35.023516],
        [135.796099, 35.023455],
        [135.796075, 35.02342],
        [135.796035, 35.023361],
        [135.795909, 35.023185],
        [135.795809, 35.023085],
        [135.795731, 35.023018],
        [135.795632, 35.022955],
        [135.795617, 35.022946],
        [135.79548, 35.022854],
        [135.795117, 35.022596],
        [135.794924, 35.022479],
        [135.794901, 35.022465],
        [135.794823, 35.022407],
        [135.794758, 35.022357],
        [135.794532, 35.02214],
        [135.79451, 35.022143],
        [135.794399, 35.021995],
        [135.79439, 35.021981],
        [135.794259, 35.021679],
        [135.794204, 35.021499],
        [135.794199, 35.021408],
        [135.794029, 35.020767],
        [135.793981, 35.020564],
        [135.793966, 35.020526],
        [135.793918, 35.020401],
        [135.793882, 35.020182],
        [135.793884, 35.020158],
        [135.793894, 35.019959],
        [135.793916, 35.019848],
        [135.793932, 35.019773],
        [135.793936, 35.019689],
        [135.794036, 35.019513],
        [135.794057, 35.019478],
        [135.794122, 35.019367],
        [135.794276, 35.019142],
        [135.794454, 35.018933],
        [135.794483, 35.018844],
        [135.794518, 35.0188],
        [135.794611, 35.018731],
        [135.794726, 35.018585],
        [135.79491, 35.018347],
        [135.794971, 35.018254],
        [135.795353, 35.017873],
        [135.795516, 35.017692],
        [135.795611, 35.017611],
        [135.795769, 35.017541],
        [135.795913, 35.017501],
        [135.796008, 35.017421],
        [135.79603, 35.017329],
        [135.79601, 35.017128],
        [135.795987, 35.016858],
        [135.795902, 35.016247],
        [135.795768, 35.015675],
        [135.795735, 35.015494],
        [135.795733, 35.015457],
        [135.795735, 35.01539],
        [135.795767, 35.015388],
        [135.7958, 35.015386],
        [135.795767, 35.015388],
        [135.795735, 35.01539],
        [135.795603, 35.015395],
        [135.795412, 35.015409],
        [135.795383, 35.015411],
        [135.795336, 35.015415],
        [135.795216, 35.015425],
        [135.795109, 35.015435],
        [135.795025, 35.015443],
        [135.794915, 35.015455],
        [135.794859, 35.015461],
        [135.794804, 35.015465],
        [135.79476, 35.015467],
        [135.7945, 35.015477],
        [135.794238, 35.015486],
        [135.794093, 35.015485],
        [135.793883, 35.01548],
        [135.793811, 35.015482],
        [135.793657, 35.015492],
        [135.793597, 35.015494],
        [135.793626, 35.015228],
        [135.793647, 35.015118],
        [135.793675, 35.014962],
        [135.793719, 35.014723],
        [135.793726, 35.014663],
        [135.793729, 35.014601],
        [135.793744, 35.014287],
        [135.793747, 35.014056],
        [135.79375, 35.014013],
        [135.793792, 35.013663],
        [135.793797, 35.013547],
        [135.793805, 35.013419],
        [135.793816, 35.01327],
        [135.793811, 35.013107],
        [135.793807, 35.013065],
        [135.793806, 35.013061],
        [135.793801, 35.013035],
        [135.793798, 35.013029],
        [135.793778, 35.012979],
        [135.793757, 35.012929],
        [135.793752, 35.012914],
        [135.79372, 35.012851],
        [135.79364, 35.012712],
        [135.793566, 35.012587],
        [135.793539, 35.012548],
        [135.793504, 35.012507],
        [135.793479, 35.012477],
        [135.793408, 35.012396],
        [135.793297, 35.012288],
        [135.793253, 35.012269],
        [135.792686, 35.012113],
        [135.792695, 35.012076],
        [135.792701, 35.012054],
        [135.792722, 35.01197],
        [135.792696, 35.011591],
        [135.792746, 35.011589],
        [135.792732, 35.011281],
        [135.792899, 35.011276]
      ]
    },
    "estimatedMeters": 2269,
    "estimatedMinutes": 30,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-philosophers-path",
      "kyoto-ginkakuji-access",
      "kyoto-eikando",
      "kyoto-nanzenji"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.79506,35.027222;135.794924,35.022479;135.7958,35.015386;135.793729,35.014601;135.792899,35.011276?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": true,
    "accessibilityNotes": {
      "en": "Three steps are mapped on the path into Nanzen-ji's grounds, and the canal path mixes stone paving and gravel. The walk ends before the Sanmon gate stairs. Crossings, curb ramps and crowding need an on-site check.",
      "ja": "南禅寺の境内へ入る道に地図上で3段の階段があり、疏水沿いの道は石畳と砂利が混在しています。三門の階段手前で終了します。横断歩道、縁石のスロープ、混雑は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "North of Ōtoyo Shrine the path runs between homes: keep voices low, stay on the path, and do not photograph private houses or gardens.",
      "ja": "大豊神社より北は住宅の間を通ります。声を控え、道から外れず、民家や庭を撮影しないでください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kamogawa-tadasu",
    "name": {
      "en": "Kamogawa Delta & Tadasu-no-Mori",
      "ja": "鴨川デルタと糺の森"
    },
    "description": {
      "en": "From Kawai Bridge, visit the tip of the Kamogawa Delta, then walk north through Tadasu-no-Mori to Shimogamo Shrine's Rōmon gate.",
      "ja": "河合橋から鴨川デルタの先端を訪ね、糺の森を北へ抜けて下鴨神社の楼門前へ向かいます。"
    },
    "theme": "park",
    "placeIds": [
      "kawai-bridge",
      "kamogawa-delta",
      "tadasu-south-side",
      "kawai-shrine-approach",
      "shimogamo-romon"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.772588, 35.030423],
        [135.772575, 35.030391],
        [135.772558, 35.030347],
        [135.77255, 35.030326],
        [135.772477, 35.030378],
        [135.771964, 35.030501],
        [135.771901, 35.030516],
        [135.771893, 35.030497],
        [135.771844, 35.030388],
        [135.771817, 35.030331],
        [135.771764, 35.030173],
        [135.771762, 35.030145],
        [135.771749, 35.029996],
        [135.77169, 35.030025],
        [135.771675, 35.029991],
        [135.77175, 35.029929],
        [135.771751, 35.029867],
        [135.771751, 35.02975],
        [135.771751, 35.029867],
        [135.77175, 35.029929],
        [135.771825, 35.029997],
        [135.771811, 35.030035],
        [135.771878, 35.030077],
        [135.771935, 35.030228],
        [135.771987, 35.030351],
        [135.772036, 35.030466],
        [135.772151, 35.030683],
        [135.771986, 35.03073],
        [135.772002, 35.030778],
        [135.772013, 35.030815],
        [135.772025, 35.030863],
        [135.77203, 35.03088],
        [135.772038, 35.030909],
        [135.772104, 35.031113],
        [135.772145, 35.031259],
        [135.772181, 35.031408],
        [135.772208, 35.031523],
        [135.772215, 35.031599],
        [135.772251, 35.031981],
        [135.772393, 35.032872],
        [135.772416, 35.032976],
        [135.772441, 35.033204],
        [135.772443, 35.033226],
        [135.772444, 35.033235],
        [135.772511, 35.033878],
        [135.772528, 35.034046],
        [135.772529, 35.034061],
        [135.772482, 35.034062],
        [135.772483, 35.034104],
        [135.772483, 35.034139],
        [135.772484, 35.034146],
        [135.772526, 35.034149],
        [135.772524, 35.034382],
        [135.772534, 35.03458],
        [135.772468, 35.034574],
        [135.772389, 35.034563],
        [135.772468, 35.034574],
        [135.772534, 35.03458],
        [135.772553, 35.034766],
        [135.772564, 35.03515],
        [135.772621, 35.036057],
        [135.772658, 35.03685],
        [135.77266, 35.036885],
        [135.772662, 35.036927],
        [135.772684, 35.037426],
        [135.772684, 35.03746],
        [135.772688, 35.037544],
        [135.772693, 35.037629],
        [135.772725, 35.037774],
        [135.772745, 35.037905],
        [135.772828, 35.038119]
      ]
    },
    "estimatedMeters": 1165,
    "estimatedMinutes": 16,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-shimogamo",
      "kyoto-shimogamo-access"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.772588,35.030423;135.771751,35.02975;135.772215,35.031599;135.772384,35.034562;135.772828,35.038119?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": true,
    "accessibilityNotes": {
      "en": "Mapped stairs connect the bridge level to the delta, and forest path surfaces have not been checked. The route does not use the river stepping stones. Crossings, curb ramps and crowding need an on-site check.",
      "ja": "橋の高さとデルタの間は地図上の階段でつながり、森の通路の路面は確認していません。ルートは川の飛び石を使いません。横断歩道、縁石のスロープ、混雑は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "Keep the delta paths clear and treat Tadasu-no-Mori as shrine grounds: walk quietly, stay on the paths and follow shrine signs.",
      "ja": "デルタの通路をふさがないでください。糺の森は神社の境内です。静かに歩き、通路から外れず、神社の案内に従ってください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "arashiyama-riverside",
    "name": {
      "en": "Arashiyama Togetsukyō & Riverside",
      "ja": "嵐山 渡月橋と川沿い"
    },
    "description": {
      "en": "Cross Nakanoshima and Togetsukyō Bridge, then follow the north-bank promenade upstream to Arashiyama Park's Kameyama area.",
      "ja": "中ノ島から渡月橋を渡り、北岸の遊歩道を上流へ歩いて嵐山公園亀山地区へ向かいます。"
    },
    "theme": "riverside",
    "placeIds": [
      "nakanoshima-bridge",
      "togetsukyo-bridge",
      "katsura-north-bank",
      "kameyama-riverside"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.68062, 35.011933],
        [135.680322, 35.011874],
        [135.68023, 35.01186],
        [135.680212, 35.011893],
        [135.680085, 35.012145],
        [135.68008, 35.012152],
        [135.680045, 35.012222],
        [135.679978, 35.012201],
        [135.679711, 35.012126],
        [135.679196, 35.011981],
        [135.678883, 35.011893],
        [135.678833, 35.011813],
        [135.678765, 35.011792],
        [135.67827, 35.011676],
        [135.678195, 35.011876],
        [135.678184, 35.011909],
        [135.678174, 35.011936],
        [135.678159, 35.011962],
        [135.678138, 35.011986],
        [135.678114, 35.012006],
        [135.678085, 35.012023],
        [135.678054, 35.012036],
        [135.678021, 35.012044],
        [135.677919, 35.012059],
        [135.67774, 35.012087],
        [135.677713, 35.012091],
        [135.677662, 35.0121],
        [135.677678, 35.012187],
        [135.677762, 35.01287],
        [135.677847, 35.013555],
        [135.677849, 35.013576],
        [135.677804, 35.013576],
        [135.677789, 35.013591],
        [135.677775, 35.013592],
        [135.677764, 35.013623],
        [135.677356, 35.013558],
        [135.676884, 35.013512],
        [135.676484, 35.013467],
        [135.675665, 35.01338],
        [135.675388, 35.01335],
        [135.675049, 35.013351],
        [135.674955, 35.013363],
        [135.675049, 35.013351],
        [135.674946, 35.013314],
        [135.674225, 35.013282],
        [135.673971, 35.013275],
        [135.673527, 35.013263],
        [135.673345, 35.01327],
        [135.673022, 35.013276],
        [135.67264, 35.01332],
        [135.672418, 35.013339],
        [135.672153, 35.013364],
        [135.672068, 35.013379],
        [135.671976, 35.013403],
        [135.671832, 35.013457]
      ]
    },
    "estimatedMeters": 1079,
    "estimatedMinutes": 14,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-arashiyama",
      "kyoto-togetsukyo"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.68062,35.011933;135.677762,35.01287;135.674955,35.013363;135.671832,35.013457?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": false,
    "accessibilityNotes": {
      "en": "No steps are mapped on this line. Bridge curbs, crossings, the shared cycle path and crowding need an on-site check.",
      "ja": "この線上に階段はありません。橋の縁石、横断歩道、自転車との共用区間、混雑は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "Keep the bridge sidewalks moving and stay off the roadway; do not block shop entrances or the boat landings.",
      "ja": "橋の歩道で立ち止まらず、車道に出ないでください。店舗の入口や船着き場をふさがないでください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "kyoto-gyoen",
    "name": {
      "en": "Kyoto Imperial Palace Park",
      "ja": "京都御苑"
    },
    "description": {
      "en": "Enter at Sakaimachi Gate, pass Kujō Pond, cross the broad Kenreimon avenue and leave by Hamaguri Gate.",
      "ja": "堺町御門から入り、九條池を経て建礼門前の大通りを横切り、蛤御門へ抜けます。"
    },
    "theme": "park",
    "placeIds": [
      "sakaimachi-gomon",
      "kujo-pond",
      "kenreimon-avenue",
      "hamaguri-gomon"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.76316, 35.0176],
        [135.76316, 35.017667],
        [135.76316, 35.017686],
        [135.763161, 35.017705],
        [135.763162, 35.017838],
        [135.763166, 35.018233],
        [135.762239, 35.018519],
        [135.762159, 35.018454],
        [135.762074, 35.018392],
        [135.761985, 35.018334],
        [135.761955, 35.018317],
        [135.761985, 35.018334],
        [135.762074, 35.018392],
        [135.762159, 35.018454],
        [135.762239, 35.018519],
        [135.762157, 35.018795],
        [135.762141, 35.020973],
        [135.762143, 35.022357],
        [135.762144, 35.0226],
        [135.762143, 35.022357],
        [135.761672, 35.022355],
        [135.761169, 35.022086],
        [135.760919, 35.022266],
        [135.760808, 35.022349],
        [135.760482, 35.022266],
        [135.760471, 35.022508],
        [135.760498, 35.02266],
        [135.760498, 35.022704],
        [135.760516, 35.022822],
        [135.760458, 35.022907],
        [135.760409, 35.023123],
        [135.760235, 35.023124],
        [135.7597, 35.023126]
      ]
    },
    "estimatedMeters": 1045,
    "estimatedMinutes": 17,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-gyoen"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.76316,35.0176;135.761955,35.018317;135.762144,35.0226;135.7597,35.023126?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": false,
    "accessibilityNotes": {
      "en": "No steps are mapped on this line, but most Gyoen paths are gravel, which can be hard going for wheels. Surfaces and the street crossings need an on-site check.",
      "ja": "この線上に階段はありませんが、御苑内の道の多くは砂利敷きで、車輪での移動が難しい場合があります。路面と通りの横断箇所は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "The Gyoen is a national garden used every day by residents; keep to the paths and enter the palace only on its own visitor route.",
      "ja": "京都御苑は市民が日常的に利用する国民公園です。道から外れず、御所には所定の参観ルートから入ってください。"
    },
    "communityInputStatus": "not-consulted"
  },
  {
    "id": "station-umekoji",
    "name": {
      "en": "Kyoto Station to the Hongan-ji temples and Umekōji",
      "ja": "京都駅から東西本願寺・梅小路公園へ"
    },
    "description": {
      "en": "Walk up Karasuma-dōri to Higashi Hongan-ji, along Shichijō-dōri to Nishi Hongan-ji's gate, and on to Umekōji Park.",
      "ja": "烏丸通を北へ東本願寺まで歩き、七条通を経て西本願寺の門前へ、さらに梅小路公園へ向かいます。"
    },
    "theme": "culture",
    "placeIds": [
      "kyoto-station-plaza",
      "higashi-honganji-plaza",
      "nishi-honganji-gate",
      "umekoji-park-east"
    ],
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [135.758954, 34.986538],
        [135.758952, 34.986591],
        [135.758727, 34.986591],
        [135.758722, 34.986814],
        [135.758722, 34.986882],
        [135.758717, 34.987028],
        [135.758715, 34.987155],
        [135.758713, 34.987214],
        [135.758713, 34.987227],
        [135.758712, 34.987249],
        [135.758711, 34.987261],
        [135.758746, 34.987261],
        [135.75889, 34.987263],
        [135.758914, 34.987265],
        [135.758914, 34.987285],
        [135.758947, 34.987285],
        [135.758992, 34.987292],
        [135.759017, 34.987296],
        [135.759017, 34.987321],
        [135.759035, 34.987322],
        [135.759544, 34.987322],
        [135.759616, 34.98738],
        [135.759616, 34.98772],
        [135.759613, 34.987814],
        [135.759631, 34.987814],
        [135.759636, 34.987813],
        [135.759636, 34.987837],
        [135.759636, 34.987859],
        [135.759636, 34.98789],
        [135.759635, 34.987924],
        [135.759631, 34.988581],
        [135.75963, 34.988597],
        [135.75963, 34.988616],
        [135.759631, 34.988648],
        [135.759632, 34.988788],
        [135.759633, 34.988855],
        [135.759633, 34.988873],
        [135.759634, 34.988893],
        [135.759637, 34.989037],
        [135.759637, 34.989047],
        [135.759632, 34.989059],
        [135.759613, 34.989101],
        [135.759564, 34.989146],
        [135.759529, 34.989168],
        [135.759528, 34.98924],
        [135.759528, 34.989324],
        [135.759558, 34.989331],
        [135.75959, 34.989362],
        [135.75959, 34.989461],
        [135.7596, 34.98949],
        [135.759605, 34.989506],
        [135.75961, 34.989527],
        [135.759618, 34.989584],
        [135.759635, 34.989685],
        [135.759659, 34.989838],
        [135.759656, 34.990359],
        [135.759702, 34.990358],
        [135.75983, 34.990357],
        [135.759702, 34.990358],
        [135.759656, 34.990359],
        [135.759659, 34.989838],
        [135.759635, 34.989685],
        [135.759618, 34.989584],
        [135.75961, 34.989527],
        [135.759605, 34.989506],
        [135.7596, 34.98949],
        [135.75959, 34.989461],
        [135.75959, 34.989362],
        [135.759558, 34.989331],
        [135.759528, 34.989324],
        [135.759499, 34.989318],
        [135.759383, 34.989317],
        [135.75901, 34.989315],
        [135.758251, 34.989309],
        [135.757354, 34.98931],
        [135.756871, 34.989312],
        [135.756792, 34.989312],
        [135.756764, 34.989312],
        [135.756726, 34.989313],
        [135.756668, 34.989313],
        [135.756058, 34.989321],
        [135.755337, 34.989322],
        [135.755316, 34.989322],
        [135.755296, 34.989334],
        [135.755233, 34.989334],
        [135.755195, 34.989334],
        [135.75517, 34.989312],
        [135.755107, 34.989311],
        [135.754551, 34.989304],
        [135.75451, 34.989305],
        [135.754465, 34.989305],
        [135.753815, 34.989304],
        [135.753764, 34.989297],
        [135.753309, 34.9893],
        [135.753279, 34.989314],
        [135.753274, 34.989448],
        [135.753247, 34.990317],
        [135.753248, 34.990334],
        [135.753251, 34.990365],
        [135.753225, 34.990376],
        [135.7532, 34.990401],
        [135.753197, 34.990418],
        [135.753165, 34.991426],
        [135.753097, 34.991425],
        [135.752967, 34.991423],
        [135.752917, 34.991422],
        [135.752861, 34.991421],
        [135.752859, 34.991504],
        [135.752858, 34.99155],
        [135.752859, 34.991504],
        [135.752861, 34.991421],
        [135.752885, 34.99017],
        [135.752892, 34.989822],
        [135.752896, 34.989596],
        [135.752908, 34.989443],
        [135.752911, 34.989404],
        [135.752869, 34.989372],
        [135.752849, 34.989356],
        [135.752805, 34.989325],
        [135.752271, 34.989312],
        [135.752186, 34.989306],
        [135.752102, 34.9893],
        [135.752048, 34.989286],
        [135.750922, 34.989267],
        [135.750922, 34.989254],
        [135.750924, 34.989195],
        [135.750926, 34.989137],
        [135.750865, 34.989136],
        [135.750846, 34.989132],
        [135.750837, 34.989121],
        [135.750827, 34.989123],
        [135.750796, 34.989122],
        [135.749559, 34.9891],
        [135.749497, 34.98909],
        [135.749364, 34.988974],
        [135.749334, 34.988683],
        [135.749334, 34.987954],
        [135.749218, 34.987954],
        [135.749087, 34.987953],
        [135.749083, 34.987892],
        [135.749075, 34.987865],
        [135.749058, 34.987814],
        [135.749083, 34.987771],
        [135.749088, 34.98748],
        [135.749089, 34.987434]
      ]
    },
    "estimatedMeters": 2316,
    "estimatedMinutes": 31,
    "sourceIds": [
      "osm",
      "osm-foot-router",
      "kyoto-station-area",
      "kyoto-higashi-honganji",
      "kyoto-nishi-honganji",
      "kyoto-umekoji"
    ],
    "routingRequestUrl": "https://routing.openstreetmap.de/routed-foot/route/v1/driving/135.758954,34.986538;135.75983,34.99035;135.752858,34.99155;135.749089,34.987434?overview=full&geometries=geojson&steps=true",
    "reviewedOn": "2026-11-25",
    "mappedSteps": false,
    "accessibilityNotes": {
      "en": "No steps are mapped on this line. It follows city sidewalks with several signalled crossings; curb ramps, crossings and crowding near the station need an on-site check.",
      "ja": "この線上に階段はありません。信号のある横断歩道が複数ある市街地の歩道です。縁石のスロープ、横断歩道、駅周辺の混雑は現地確認が必要です。"
    },
    "residentNotes": {
      "en": "These are busy commuter sidewalks: keep to one side, follow signals, and do not block bus stops or temple gates.",
      "ja": "通勤客の多い歩道です。片側に寄って歩き、信号に従い、バス停や寺の門前をふさがないでください。"
    },
    "communityInputStatus": "not-consulted"
  }
];
