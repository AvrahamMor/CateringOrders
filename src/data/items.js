export const CATEGORIES = {
  salads: "סלטים וממרחים",
  fish: "דגים",
  mains: "מנות עיקריות ותוספות",
  tasting: "טועמיה",
  extras: "קינוחים ונשנושים"
};

export const PACKAGE_TYPES = [
  "מארז VIP",
  "מארז רגיל",
  "מארז VIP + טועמיה",
  "מארז רגיל + טועמיה"
];

// 2 = זוג, 3 = שלישיה, 4 = רביעייה, 5 = חמישייה, 6 = שישייה
export const GROUP_SIZES = [
  { id: 2, name: "זוגות (2)" },
  { id: 3, name: "שלישיות (3)" },
  { id: 4, name: "רביעיות (4)" },
  { id: 5, name: "חמישיות (5)" },
  { id: 6, name: "שישיות (6)" },
];

export const ITEMS = [
  { id: "tomato_dip", name: "טומיטו דיפ", category: "salads" },
  { id: "coleslaw", name: "קולסלואו", category: "salads" },
  { id: "pickles", name: "ירקות כבושים", category: "salads" },
  { id: "tahini", name: "טחינה", category: "salads" },
  { id: "eggplant_mayo", name: "חציל במיונז", category: "salads" },
  { id: "fried_eggplant", name: "חציל מטוגן", category: "salads" },
  { id: "eggplant_liver", name: "חציל בטעם כבד", category: "salads" },
  { id: "spicy", name: "חריף", category: "salads" },
  { id: "cucumber_salad", name: "סלט מלפפון", category: "salads" },
  { id: "tuna_salad", name: "סלט טונה", category: "salads" },
  { id: "egg_salad", name: "סלט ביצים", category: "salads" },
  { id: "fruit_salad", name: "סלט פירות", category: "salads" },
  { id: "apple_compote", name: "לפתן תפוחים", category: "salads" },
  { id: "chopped_liver", name: "כבד קצוץ", category: "salads" },
  { id: "arbes", name: "ארבעס", category: "salads" },
  { id: "bubes", name: "בובעס", category: "salads" },
  { id: "kneidlach", name: "קניידלאך", category: "salads" },
  { id: "lokshen", name: "לאקשן (אטריות)", category: "salads" },
  { id: "gala", name: "גאלע", category: "salads" },

  { id: "salmon_herbs", name: "דג סלומון בעשבי תיבול", category: "fish" },
  { id: "salmon_mustard", name: "דג סלומון חרדל ודבש", category: "fish" },
  { id: "white_fish", name: "וויט פיש", category: "fish" },
  { id: "gefilte_fish", name: "געפילטע פיש", category: "fish" },
  { id: "herring", name: "הערינג", category: "fish" },

  { id: "cholent", name: "טשולנט בקר קישקע", category: "mains" },
  { id: "kugel_noodles", name: "קוגל אטריות", category: "mains" },
  { id: "kugel_potato", name: "קוגל תפו\"א", category: "mains" },
  { id: "chicken", name: "עוף הונגרי", category: "mains" },
  { id: "asado", name: "אסאדו", category: "mains" },
  { id: "farfel", name: "פערפל", category: "mains" },
  { id: "soup", name: "מרק", category: "mains" },
  { id: "tzimmes", name: "צימעס", category: "mains" },
  { id: "rice", name: "אורז", category: "mains" },
  { id: "pastrami", name: "פסטרמה", category: "mains" },

  { id: "crackers", name: "קרקרים", category: "extras" },
  { id: "nuts", name: "מארז פיצוחים", category: "extras" },
  { id: "souffle", name: "קינוח סופלה", category: "extras" },
  { id: "cake", name: "עוגה/רוגלעך", category: "extras" },

  { id: "tasting_cholent", name: "טשולנט (טועמיה)", category: "tasting" },
  { id: "tasting_farfel", name: "פערפל (טועמיה)", category: "tasting" },
  { id: "tasting_kugel_potato", name: "קוגל תפו\"א (טועמיה)", category: "tasting" },
  { id: "tasting_kugel_noodles", name: "קוגל אטריות (טועמיה)", category: "tasting" }
];

// Helper to generate a default template where everything is 0 except some basics
const generateDefaultTemplate = (pkgName = "") => {
  const tpl = {};
  ITEMS.forEach(item => {
    // Defaults based on common sense from the image
    if (item.category === 'salads') tpl[item.id] = 1;
    else if (item.id === 'cholent') tpl[item.id] = 1;
    else if (item.id === 'soup') tpl[item.id] = 1;
    else if (['kugel_noodles', 'kugel_potato', 'chicken', 'salmon_herbs', 'salmon_mustard', 'gefilte_fish', 'white_fish', 'asado'].includes(item.id)) tpl[item.id] = 2;
    else if (item.id === 'pastrami') {
      // Add pastrami only for VIP packages
      tpl[item.id] = pkgName.includes('VIP') ? 1 : 0;
    }
    else if (item.category === 'tasting') {
      // Add tasting items only for packages with tasting
      tpl[item.id] = pkgName.includes('טועמיה') ? 1 : 0;
    }
    else tpl[item.id] = 1;
  });
  return tpl;
};

// Default constants for each package type
export const DEFAULT_TEMPLATES = {
  "מארז VIP": generateDefaultTemplate("מארז VIP"),
  "מארז רגיל": generateDefaultTemplate("מארז רגיל"),
  "מארז VIP + טועמיה": generateDefaultTemplate("מארז VIP + טועמיה"),
  "מארז רגיל + טועמיה": generateDefaultTemplate("מארז רגיל + טועמיה")
};
