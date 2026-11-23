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
};
