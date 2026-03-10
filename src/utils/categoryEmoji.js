const emojis = {
  cóctel:      "🍹",
  coctel:      "🍹",
  limonada:    "🍋",
  frappe:      "🧋",
  jugo:        "🥤",
  gaseosa:     "🥤",
  cerveza:     "🍺",
  caliente:    "☕",
  hamburguesa: "🍔",
  plato:       "🍱",
  postre:      "🍰",
  bebida:      "🥤",
  combo:       "🍽️",
};

export function categoryEmoji(category) {
  return emojis[category?.toLowerCase()] || "🍽️";
}
