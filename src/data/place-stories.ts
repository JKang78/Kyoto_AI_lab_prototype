import type { LocalizedText } from "../types/routes";

/**
 * Short place stories, unlocked at check-in (docs/visuals.md M3).
 *
 * Every sentence restates its cited sources, checked 2026-11-24. They are drafts:
 * status "draft" must stay until a local reviewer approves the text (PRODUCT_REQUIREMENTS §10),
 * and the Japanese needs a native review. Do not add facts without a source.
 */
export type PlaceStory = Readonly<{
  text: LocalizedText;
  sources: readonly { title: string; url: string }[];
  status: "draft";
  checkedOn: string;
}>;

const wiki = (title: string, url: string) => ({ title, url });

export const PLACE_STORIES: Readonly<Record<string, PlaceStory>> = {
  "shijo-kawaramachi": {
    text: {
      en: "Kyoto's busiest downtown crossroads, where Shijō-dōri meets Kawaramachi-dōri. During the Gion Festival float procession, the huge floats are turned here in a manoeuvre called tsuji-mawashi, one of the parade's highlights.",
      ja: "四条通と河原町通が交わる、京都最大の繁華街の交差点です。祇園祭の山鉾巡行では、巨大な山鉾がこの交差点で向きを変える「辻回し」が見どころの一つです。",
    },
    sources: [wiki("四条河原町 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%9B%9B%E6%9D%A1%E6%B2%B3%E5%8E%9F%E7%94%BA")],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "shijo-ohashi": {
    text: {
      en: "Today's bridge was completed in 1942, after the great Kyoto flood of 1935. Its railings, replaced in 1965, were designed from entries to what was Japan's first public design competition for them. A statue of Izumo no Okuni and the Minamiza theatre stand at the east end.",
      ja: "現在の橋は1935年の京都大水害を経て1942年に完成しました。1965年に付け替えられた高欄は、全国初の一般公募で寄せられた案をもとにデザインされました。東詰には出雲阿国の像と南座があります。",
    },
    sources: [wiki("四条大橋 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%9B%9B%E6%9D%A1%E5%A4%A7%E6%A9%8B")],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "yasaka-west-view": {
    text: {
      en: "Yasaka Shrine's West Tower Gate (Nishirōmon) faces the end of Shijō-dōri. Rebuilt in 1497 after the Ōnin War, it is an Important Cultural Property. When Shijō-dōri was widened in 1913, the gate was moved 6 m east and 3 m north.",
      ja: "四条通の突き当たりに建つ八坂神社の西楼門は、応仁の乱の後、1497年に再建された重要文化財です。1913年の四条通拡幅の際、東へ6メートル、北へ3メートル移されました。",
    },
    sources: [wiki("八坂神社 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%85%AB%E5%9D%82%E7%A5%9E%E7%A4%BE")],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "kawabata-riverside": {
    text: {
      en: "The Kamo River's banks are a favourite walking spot. From May to September, restaurants on the west bank build wooden nōryō-yuka platforms out over the riverbed. Between Sanjō and Shijō bridges, people sitting along the bank are said to space themselves evenly: the \"Kamogawa equal-spacing rule\".",
      ja: "鴨川の河岸は人気の散策路です。5月から9月にかけて、西岸の料理店が河原に張り出す納涼床を設けます。三条大橋と四条大橋の間では、川岸に座る人々が等間隔に並ぶ「鴨川等間隔の法則」が知られています。",
    },
    sources: [
      wiki("Kamo River – Wikipedia (en)", "https://en.wikipedia.org/wiki/Kamo_River"),
      wiki("鴨川 (京都府) – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E9%B4%A8%E5%B7%9D_(%E4%BA%AC%E9%83%BD%E5%BA%9C)"),
    ],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "sanjo-ohashi": {
    text: {
      en: "In the Edo period this bridge was the Kyoto end of the Tōkaidō, the great road to Edo. Statues of Yajirobē and Kitahachi, the travellers of the comic novel Tōkaidōchū Hizakurige, stand nearby, and Japan's first ekiden relay race started here in 1917.",
      ja: "江戸時代には東海道五十三次の西の起点でした。『東海道中膝栗毛』の弥次郎兵衛と喜多八の像があり、1917年には日本初の駅伝がここをスタートしました。",
    },
    sources: [
      wiki("三条大橋 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%B8%89%E6%9D%A1%E5%A4%A7%E6%A9%8B"),
      wiki("Sanjō Ōhashi – Wikipedia (en)", "https://en.wikipedia.org/wiki/Sanj%C5%8D_%C5%8Chashi"),
    ],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "maruyama-cherry-path": {
    text: {
      en: "Maruyama Park is Kyoto's best-known cherry-blossom spot. Its star is a weeping cherry (shidarezakura) that is lit up at night, and in April the park can become extremely crowded.",
      ja: "円山公園は京都を代表する花見の名所です。主役のしだれ桜は夜にライトアップされ、4月には大変混雑することがあります。",
    },
    sources: [wiki("Maruyama Park (Kyoto) – Wikipedia (en)", "https://en.wikipedia.org/wiki/Maruyama_Park_(Kyoto)")],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "chionin-south-gate-path": {
    text: {
      en: "This path passes Chion-in's South Gate, which stands between the temple and Maruyama Park. Chion-in is the head temple of Jōdo-shū, founded by Hōnen; its great Sanmon gate, built in 1621, is a National Treasure.",
      ja: "この道は、知恩院と円山公園の間にある南門のそばを通ります。知恩院は法然を開祖とする浄土宗の総本山で、1621年に建てられた三門は国宝です。",
    },
    sources: [
      wiki("知恩院 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%9F%A5%E6%81%A9%E9%99%A2"),
      wiki("Chion-in – Wikipedia (en)", "https://en.wikipedia.org/wiki/Chion-in"),
    ],
    status: "draft",
    checkedOn: "2026-11-24",
  },
  "sosui-museum-basin": {
    text: {
      en: "The Lake Biwa Canal Museum opened in 1989 to mark the canal's centenary. The boat basin in front is the foot of the 640 m Keage Incline, where boats rode on rail cars between the upper and lower canals until 1948.",
      ja: "琵琶湖疏水記念館は、疏水完成100周年を記念して1989年に開館しました。前の南禅寺船溜りは延長640メートルの蹴上インクラインの下端で、1948年まで船を台車に載せて上下の水路の間を運んでいました。",
    },
    sources: [
      wiki("琵琶湖疏水記念館 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%90%B5%E7%90%B6%E6%B9%96%E7%96%8F%E6%B0%B4%E8%A8%98%E5%BF%B5%E9%A4%A8"),
      wiki("蹴上インクライン – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E8%B9%B4%E4%B8%8A%E3%82%A4%E3%83%B3%E3%82%AF%E3%83%A9%E3%82%A4%E3%83%B3"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "okazaki-canal-promenade": {
    text: {
      en: "This stretch is the Ōtō Canal, part of the Lake Biwa Canal completed in 1890. From the late Heian period, Okazaki held six imperial temples whose names contain 'shō' (the Rokushōji); the site of the largest, Hosshō-ji, lies largely under today's Kyoto City Zoo.",
      ja: "この水路は1890年に完成した琵琶湖疏水の鴨東運河です。平安時代後期、岡崎には「勝」の字を持つ6つの御願寺（六勝寺）が建ち並びました。筆頭の法勝寺の伽藍の南半分は、現在の京都市動物園にあたると考えられています。",
    },
    sources: [
      wiki("琵琶湖疏水 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%90%B5%E7%90%B6%E6%B9%96%E7%96%8F%E6%B0%B4"),
      wiki("六勝寺 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%85%AD%E5%8B%9D%E5%AF%BA"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "heian-otorii": {
    text: {
      en: "This reinforced-concrete torii stands 24.4 m tall. When it was built in the late 1920s it was the largest in Japan, and it is now a Registered Tangible Cultural Property. Museums, a library, a theatre and the zoo of Okazaki Park, the former 1895 exposition grounds, stand on either side.",
      ja: "鉄筋コンクリート造の大鳥居は高さ24.4メートルで、昭和初期の造営当初は日本一の大きさを誇り、国の登録有形文化財です。両側には1895年の博覧会跡地である岡崎公園の美術館、図書館、劇場、動物園などが並びます。",
    },
    sources: [wiki("平安神宮 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%B9%B3%E5%AE%89%E7%A5%9E%E5%AE%AE")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "heian-otenmon": {
    text: {
      en: "Heian Shrine was built in 1895 for the 1,100th anniversary of the move of the capital to Heian-kyō. Its vermilion Ōtenmon gate copies the gate of the old palace's Chōdō-in at about five-eighths scale and is an Important Cultural Property.",
      ja: "平安神宮は平安遷都1100年を記念して1895年に創建されました。朱塗りの應天門は平安京朝堂院の応天門を約8分の5の規模で模したもので、重要文化財に指定されています。",
    },
    sources: [
      wiki("平安神宮 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%B9%B3%E5%AE%89%E7%A5%9E%E5%AE%AE"),
      wiki("Kyoto City Tourism — Heian-jingu Shrine", "https://kyoto.travel/en/destinations/heianjingu-shrine/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "ginkakuji-bridge": {
    text: {
      en: "Ginkakuji Bridge on Imadegawa-dōri marks the north end of the Philosopher's Path, about 1.5 km of canal-side walkway. Its cherry trees began with 300 saplings that the painter Hashimoto Kansetsu and his wife Yone gave the city in 1921, and are still called Kansetsu-zakura.",
      ja: "今出川通の銀閣寺橋は、疏水沿いに約1.5キロメートル続く哲学の道の北端です。桜並木は1921年に日本画家の橋本関雪と妻よねが京都市に寄贈した300本の苗木に始まり、今も「関雪桜」と呼ばれています。",
    },
    sources: [wiki("哲学の道 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%93%B2%E5%AD%A6%E3%81%AE%E9%81%93")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "honenin-junction": {
    text: {
      en: "The path began as a maintenance road for the canal branch completed in 1890, and took the name Philosopher's Path in 1972 after thinkers such as Nishida Kitarō who walked here. A stone near Hōnen-in, set up in 1981, carries one of Nishida's poems.",
      ja: "この道は1890年の疏水分線完成時に管理用道路として設けられ、西田幾多郎らが散策したことから1972年に「哲学の道」と名付けられました。法然院近くには1981年に西田の歌碑が建てられています。",
    },
    sources: [wiki("哲学の道 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%93%B2%E5%AD%A6%E3%81%AE%E9%81%93")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "wakaoji-bridge": {
    text: {
      en: "Nyakuōji Bridge marks the south end of the Philosopher's Path. Kumano Nyakuōji Shrine beside it was founded in 1160, when the cloistered emperor Go-Shirakawa enshrined the Kumano deities as guardians of Zenrin-ji (Eikan-dō).",
      ja: "若王子橋は哲学の道の南端です。そばの熊野若王子神社は、1160年に後白河法皇が禅林寺（永観堂）の鎮守として熊野権現を勧請したことに始まります。",
    },
    sources: [
      wiki("哲学の道 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%93%B2%E5%AD%A6%E3%81%AE%E9%81%93"),
      wiki("熊野若王子神社 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%86%8A%E9%87%8E%E8%8B%A5%E7%8E%8B%E5%AD%90%E7%A5%9E%E7%A4%BE"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "eikando-gate": {
    text: {
      en: "Zenrin-ji, known as Eikan-dō, has long been called 'Eikan-dō for autumn leaves'. Its main image, the Mikaeri Amida, looks back over its shoulder; legend says that in 1082 the Buddha stepped down to walk with the monk Eikan and turned to say, 'Eikan, you are slow.'",
      ja: "禅林寺は永観堂の通称で知られ、古くから「秋はもみじの永観堂」といわれます。本尊の「みかえり阿弥陀」は顔を横に向けた姿で、1082年に永観と共に行道した阿弥陀如来が振り返って「永観遅し」と言ったと伝えられます。",
    },
    sources: [wiki("禅林寺 (京都市) – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%A6%85%E6%9E%97%E5%AF%BA_(%E4%BA%AC%E9%83%BD%E5%B8%82)")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "nanzenji-sanmon-approach": {
    text: {
      en: "Nanzen-ji's Sanmon gate was donated in 1628 by the daimyō Tōdō Takatora in memory of his clan's warriors killed in the Osaka summer campaign. In kabuki, the outlaw Ishikawa Goemon cries 'What a view!' from it, though the gate was built more than 30 years after his death.",
      ja: "南禅寺の三門は、1628年に藤堂高虎が大坂夏の陣で戦死した一門の武士の冥福を祈って寄進しました。歌舞伎では石川五右衛門が「絶景かな」と見得を切りますが、実際の三門は五右衛門の死後30年以上たってから建てられました。",
    },
    sources: [
      wiki("南禅寺 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%8D%97%E7%A6%85%E5%AF%BA"),
      wiki("Kyoto City Tourism — Nanzen-ji Temple", "https://kyoto.travel/en/destinations/nanzenji-temple/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kawai-bridge": {
    text: {
      en: "Kawai Bridge is the first crossing on Kyoto City Tourism's walking route from Demachiyanagi Station to Shimogamo Shrine. The station's name joins Demachi, the old name for the west-bank area, with Yanagi on the east bank; Eizan trains have started here since 1925 and Keihan trains since 1989.",
      ja: "河合橋は、京都市観光協会が案内する出町柳駅から下鴨神社への徒歩ルートで最初に渡る橋です。駅名は鴨川西岸の俗称「出町」と東岸の地名「柳」を合わせたもので、1925年に叡山電鉄、1989年に京阪の駅が開業しました。",
    },
    sources: [
      wiki("出町柳駅 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%87%BA%E7%94%BA%E6%9F%B3%E9%A7%85"),
      wiki("Kyoto City Tourism — Comfortable access to Kyoto Imperial Palace and Shimogamo", "https://kyoto.travel/en/getting-around/comfortable-access-to-kyoto-imperial-palace-shimogamo/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kamogawa-delta": {
    text: {
      en: "The 'Kamogawa Delta' is the triangle where the Kamo and Takano rivers meet. Once called Tadasu-gawara, it hosted sumo and sarugaku; in 1464 the shogun Ashikaga Yoshimasa watched a benefit sarugaku performance here. Its turtle-shaped stepping stones were laid in 1993.",
      ja: "鴨川デルタは賀茂川と高野川の合流点にできた三角地帯の通称です。かつては糺河原と呼ばれ、相撲や猿楽が催されました。1464年には将軍足利義政が勧進猿楽を見物しています。亀形の飛び石は1993年に設置されました。",
    },
    sources: [wiki("鴨川デルタ – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E9%B4%A8%E5%B7%9D%E3%83%87%E3%83%AB%E3%82%BF")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "tadasu-south-side": {
    text: {
      en: "Tadasu-no-Mori is the shrine forest of Shimogamo Shrine: about 124,000 m² of mostly deciduous trees such as zelkova and hackberry. Fire in the Ōnin War burned about 70% of it in 1470, and the whole forest was designated a National Historic Site in 1983.",
      ja: "糺の森は下鴨神社の境内に広がる社叢林で、面積は約12万4千平方メートル、ケヤキやエノキなどの落葉樹が中心です。1470年には応仁の乱の兵火で7割を焼失し、1983年に森の全域が国の史跡に指定されました。",
    },
    sources: [wiki("糺の森 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E7%B3%BA%E3%81%AE%E6%A3%AE")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kawai-shrine-approach": {
    text: {
      en: "Kawai Shrine, a subsidiary shrine of Shimogamo in Tadasu-no-Mori, honours Tamayori-hime and is visited by people praying for beauty, who draw faces on mirror-shaped ema plaques. Kamo no Chōmei, author of the Hōjōki, grew up here as the son of a shrine priest; a replica of his hut stands nearby.",
      ja: "糺の森にある下鴨神社の摂社・河合神社は玉依姫命を祀り、美麗の神として信仰されています。手鏡形の「鏡絵馬」に顔を描いて奉納します。『方丈記』の鴨長明は当社の禰宜の子として幼少期を過ごし、近くに方丈の庵が復元されています。",
    },
    sources: [wiki("河合神社 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%B2%B3%E5%90%88%E7%A5%9E%E7%A4%BE")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "shimogamo-romon": {
    text: {
      en: "Shimogamo Shrine, formally Kamo-mioya Shrine, is one of Japan's oldest Shinto shrines and part of the UNESCO 'Historic Monuments of Ancient Kyoto'. Most of the shrine was rebuilt in 1629, and its vermilion two-storey Rōmon gate is an Important Cultural Property.",
      ja: "下鴨神社（賀茂御祖神社）は日本で最も古い神社の一つで、世界遺産「古都京都の文化財」の構成資産です。社殿の多くは1629年に再建され、朱塗りの楼門は重要文化財に指定されています。",
    },
    sources: [
      wiki("Shimogamo Shrine – Wikipedia (en)", "https://en.wikipedia.org/wiki/Shimogamo_Shrine"),
      wiki("賀茂御祖神社 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E8%B3%80%E8%8C%82%E5%BE%A1%E7%A5%96%E7%A5%9E%E7%A4%BE"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "nakanoshima-bridge": {
    text: {
      en: "Nakanoshima, the island in the river below Arashiyama, forms the Nakanoshima area of Kyoto Prefecture's Arashiyama Park, alongside the Kameyama and Rinsenji areas. Togetsukyō links the island to the river's north bank.",
      ja: "嵐山のふもとの中州・中ノ島は京都府営嵐山公園の中之島地区で、ほかに亀山地区と臨川寺地区があります。渡月橋がこの中州と北岸を結んでいます。",
    },
    sources: [
      wiki("嵐山公園 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%B5%90%E5%B1%B1%E5%85%AC%E5%9C%92"),
      wiki("渡月橋 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%B8%A1%E6%9C%88%E6%A9%8B"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "togetsukyo-bridge": {
    text: {
      en: "A bridge here is said to date from 836. Emperor Kameyama is said to have likened the moon passing over it to a moon crossing a bridge, which may explain the name 'Togetsukyō'. Today's 155 m bridge, finished in 1934, is concrete, but its gentle arch and wooden lattice railings echo the old timber bridge.",
      ja: "渡月橋は836年に道昌が架けたのが始まりとされます。亀山上皇が橋の上を移る月を「くまなき月の渡るに似たり」と評したことが名の由来ともいわれます。現在の長さ155メートルの橋は1934年完成のコンクリート橋ですが、弓なりの形と木の高欄で旧木造橋の姿を受け継いでいます。",
    },
    sources: [
      wiki("渡月橋 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%B8%A1%E6%9C%88%E6%A9%8B"),
      wiki("Kyoto City Tourism — Togetsu-kyo Bridge", "https://kyoto.travel/en/destinations/togetsukyo-bridge/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "katsura-north-bank": {
    text: {
      en: "The river has several names: below Togetsukyō it is the Katsura, above it the Ōi, and through the Hozu gorge from Kameoka the Hozu. In the early 17th century the Saga merchant Suminokura Ryōi improved it for boats, opening a route for goods down to Yodo and Osaka.",
      ja: "この川は渡月橋より下流を桂川、上流を大堰川、亀岡から保津峡までを保津川と呼び分けます。17世紀初め、嵐山の豪商角倉了以が川を整備・開削し、淀や大坂まで舟で物資を運べるようになりました。",
    },
    sources: [
      wiki("桂川 (淀川水系) – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%A1%82%E5%B7%9D_(%E6%B7%80%E5%B7%9D%E6%B0%B4%E7%B3%BB)"),
      wiki("Arashiyama – Wikipedia (en)", "https://en.wikipedia.org/wiki/Arashiyama"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kameyama-riverside": {
    text: {
      en: "Upstream of the bridge lies the Kameyama area of Arashiyama Park. A stone in Kameyama Park is engraved with 'Arashiyama in the Rain', poems that Zhou Enlai wrote after a visit, moved by the cherry blossoms and mountain greenery.",
      ja: "渡月橋の上流には嵐山公園の亀山地区が広がります。亀山公園には、桜と山の緑に心を動かされた周恩来が詠んだ詩「雨中嵐山」を刻んだ石碑があります。",
    },
    sources: [
      wiki("嵐山公園 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%B5%90%E5%B1%B1%E5%85%AC%E5%9C%92"),
      wiki("Arashiyama – Wikipedia (en)", "https://en.wikipedia.org/wiki/Arashiyama"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "sakaimachi-gomon": {
    text: {
      en: "Sakaimachi Gate is the main gate of the Kyoto Gyoen, used for imperial processions. It is one of nine Edo-period gates set along the garden's edge in the Meiji era. At the end of the Edo period, Chōshū samurai were removed from guarding it and barred from entering, an episode known as the Sakaimachi Gate incident.",
      ja: "堺町御門は京都御苑の正門で、行幸・還幸の際に使われます。江戸時代から遺る9つの御門の一つで、明治期に外周に移設・配置されました。幕末には長州藩士が門の警備を外され、出入りを禁じられました（堺町御門の変）。",
    },
    sources: [wiki("京都御苑 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%BA%AC%E9%83%BD%E5%BE%A1%E8%8B%91")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kujo-pond": {
    text: {
      en: "Kujō Pond belonged to the residence of the Kujō family of court nobles, and their tea house Shūsuitei still faces it. Takakura Bridge across the pond was completed in 1883, and the small Itsukushima Shrine, the family's guardian shrine, is said to have been brought from Itsukushima on Miyajima.",
      ja: "九條池は公家の九条家の邸宅にあった池で、茶室「拾翠亭」が今も面しています。池に架かる高倉橋は1883年の竣工で、九条家の鎮守社である厳島神社は安芸の宮島から勧請されたと伝わります。",
    },
    sources: [wiki("京都御苑 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%BA%AC%E9%83%BD%E5%BE%A1%E8%8B%91")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kenreimon-avenue": {
    text: {
      en: "Kenreimon is the south main gate of the Kyoto Imperial Palace and its most formal, reserved for the emperor and visiting heads of state. The broad avenue in front was rebuilt for the Taishō enthronement and is where the Aoi and Jidai festival processions set out.",
      ja: "建礼門は京都御所の南面正門で、天皇・皇后や外国元首級のみが通る最も格式の高い門とされます。前の大通りは大正天皇の大礼に向けて整備され、葵祭と時代祭の行列の出発地点になっています。",
    },
    sources: [
      wiki("建礼門 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%BB%BA%E7%A4%BC%E9%96%80"),
      wiki("京都御苑 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%BA%AC%E9%83%BD%E5%BE%A1%E8%8B%91"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "hamaguri-gomon": {
    text: {
      en: "Officially Shinzaike Gate, Hamaguri ('clam') Gate is said to be named for opening, like a clam in a fire, only when the palace burned. In 1864 it was the scene of fierce fighting with Chōshū forces in the Kinmon Incident, and bullet marks are still visible on its pillars.",
      ja: "蛤御門の正式名は新在家御門です。めったに開かない門が大火の時に開いたことを、火にあぶられて開くハマグリにたとえた名とされます。1864年の禁門の変では長州藩との激戦地となり、門柱には今も弾痕が残っています。",
    },
    sources: [
      wiki("蛤御門 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E8%9B%A4%E5%BE%A1%E9%96%80"),
      wiki("Kyoto City Tourism — Kyoto Gyoen National Garden", "https://kyoto.travel/en/destinations/kyoto-gyoen-national-garden/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "kyoto-station-plaza": {
    text: {
      en: "Kyoto Station first opened in 1877. The present building, designed by Hiroshi Hara, opened in 1997 for Kyoto's 1,200th anniversary and is 70 m high and 470 m long. Facing the Karasuma exit is Kyoto Tower, completed in 1964 and 131 m tall.",
      ja: "京都駅は1877年に開業しました。現在の駅ビルは原広司の設計で、1997年に完成した4代目の駅舎です。烏丸口のほぼ正面には、1964年に開業した高さ131メートルの京都タワーが建っています。",
    },
    sources: [
      wiki("Kyōto Station – Wikipedia (en)", "https://en.wikipedia.org/wiki/Ky%C5%8Dto_Station"),
      wiki("京都駅 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%BA%AC%E9%83%BD%E9%A7%85"),
      wiki("京都タワー – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E4%BA%AC%E9%83%BD%E3%82%BF%E3%83%AF%E3%83%BC"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "higashi-honganji-plaza": {
    text: {
      en: "Higashi Hongan-ji, popularly called Ohigashi-san, is the head temple of the Ōtani branch of Jōdo Shinshū. Its Founder's Hall and Amida Hall were rebuilt with followers' donations and completed in 1895, and its Founder's Hall gate is counted among Kyoto's three great gates.",
      ja: "東本願寺は真宗大谷派の本山で、「お東さん」の愛称で親しまれています。御影堂と阿弥陀堂は門徒の寄進によって1895年に再建され、御影堂門は京都三大門の一つに数えられます。",
    },
    sources: [
      wiki("東本願寺 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%9D%B1%E6%9C%AC%E9%A1%98%E5%AF%BA"),
      wiki("南禅寺 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E5%8D%97%E7%A6%85%E5%AF%BA"),
      wiki("Kyoto City Tourism — Higashi-Hongan-ji Temple", "https://kyoto.travel/en/destinations/higashihonganji-temple/"),
    ],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "nishi-honganji-gate": {
    text: {
      en: "Nishi Hongan-ji, head temple of the Hongwanji branch of Jōdo Shinshū, moved here in 1591 on land granted by Toyotomi Hideyoshi. Its Founder's Hall, rebuilt in 1636, is a National Treasure, and the temple is part of the UNESCO 'Historic Monuments of Ancient Kyoto'.",
      ja: "西本願寺は浄土真宗本願寺派の本山で、1591年に豊臣秀吉から寄進されたこの地に移りました。1636年に再建された御影堂は国宝で、世界遺産「古都京都の文化財」の構成資産です。",
    },
    sources: [wiki("西本願寺 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E8%A5%BF%E6%9C%AC%E9%A1%98%E5%AF%BA")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
  "umekoji-park-east": {
    text: {
      en: "Umekōji Park opened in 1995 on the site of a former freight yard, created to mark the 1,200th anniversary of Heian-kyō. The south of the park overlaps the site of Nishi-Hachijō, the mansion of Taira no Kiyomori.",
      ja: "梅小路公園は、貨物駅の跡地に平安遷都1200年を記念して整備され、1995年に開園しました。公園の南部は平清盛の邸宅・西八条第の跡にあたります。",
    },
    sources: [wiki("梅小路公園 – Wikipedia (ja)", "https://ja.wikipedia.org/wiki/%E6%A2%85%E5%B0%8F%E8%B7%AF%E5%85%AC%E5%9C%92")],
    status: "draft",
    checkedOn: "2026-11-25",
  },
};
