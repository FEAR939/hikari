import { router } from "../../lib/router";

export function Card(item) {
  const card = document.createElement("div");
  card.className = "h-fit w-36 md:w-48 shrink-0 cursor-pointer";

  const cardImage = document.createElement("img");
  cardImage.src = item.coverImage.large;
  cardImage.className = "w-full aspect-[5/7] object-cover rounded-lg";
  cardImage.loading = "lazy"; // Add lazy loading

  card.appendChild(cardImage);
  card.addEventListener("click", () => {
    router.navigate(`/anime?id=${item.id}`);
  });

  return card;
}
