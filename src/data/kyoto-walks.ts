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
  }
];
