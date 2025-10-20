import { router } from "../../lib/router";
import { h } from "../../lib/jsx/runtime";

interface CardOptions {
  label?: boolean;
  type?: CardType;
  size?: CardSize;
}

export enum CardType {
  DEFAULT = 0,
  RELATION = 1,
}

export enum CardSize {
  AUTO = 0,
  MANUAL = 1,
}

export function Card({
  item,
  options = {},
}: {
  item: any;
  options?: CardOptions;
}) {
  if (!options.size) options.size = CardSize.MANUAL;
  if (!options.type) options.type = CardType.DEFAULT;
  if (!options.label) options.label = false;

  return (
    <div>
      <div
        class={`h-fit ${options.size === CardSize.MANUAL ? "w-36 md:w-48" : "w-full"} shrink-0 cursor-pointer`}
        onclick={() => router.navigate(`/anime?id=${item.id}`)}
      >
        <img
          src={item.coverImage.large}
          class="w-full aspect-[5/7] object-cover rounded-lg"
          loading="lazy"
        />
        {options.label && (
          <div class="text-sm mt-2 font-medium space-y-1">
            <div class="text-white line-clamp-2">
              {item.title.english || item.title.romaji}
            </div>
            {item.relationType && (
              <div class="text-neutral-500 text-xs">{item.relationType}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
