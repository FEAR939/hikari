import { router } from "../../lib/router";

interface CardOptions {
  label?: boolean;
  type?: CardType;
}

export enum CardType {
  DEFAULT = 0,
  RELATION = 1,
}

export function Card(item, options: CardOptions = {}) {
  const card = document.createElement("div");
  card.className = "h-fit w-36 md:w-48 shrink-0 cursor-pointer";

  const cardImage = document.createElement("img");
  cardImage.src = item.coverImage.large;
  cardImage.className = "w-full aspect-[5/7] object-cover rounded-lg";
  cardImage.loading = "lazy"; // Add lazy loading

  card.appendChild(cardImage);

  if (options.type === CardType.RELATION && options.label) {
    const cardLabel = document.createElement("div");
    cardLabel.className = "text-sm mt-2 font-medium space-y-1";
    cardLabel.innerHTML = `<div class="text-white line-clamp-2">${item.title.english || item.title.romaji}</div><div class="text-neutral-500 text-xs">${item.relationType}</div>`;

    card.appendChild(cardLabel);
  }

  card.addEventListener("click", () => {
    router.navigate(`/anime?id=${item.id}`);
  });

  return card;
}
