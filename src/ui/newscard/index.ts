export function NewsCard(news) {
  const newsCard = document.createElement("div");
  newsCard.className = "h-fit w-full space-y-2";
  newsCard.innerHTML = `
    <img src="${news.image}" alt="${news.title}" class="w-full aspect-video object-cover rounded-md"/>
      <div class="text-lg">${news.title}</div>
      <div class="text-neutral-500">${new Date(news.date).toLocaleDateString()}</div>
    `;

  return newsCard;
}
