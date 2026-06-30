/**
 * Portfolio content index.
 *
 * Combines English and zh-TW content into the contentByLanguage map consumed
 * by all React components. Import from this file or from the bridge at
 * src/content/portfolioContent.js — both resolve to the same export shape.
 */

import { en } from "./en.js";
import { zhTW } from "./zh-TW.js";

export const contentByLanguage = {
  en,
  "zh-TW": zhTW,
};
