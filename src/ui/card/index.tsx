import { router } from "../../lib/router";
import { h } from "../../lib/jsx/runtime";
import { twMerge } from "tailwind-merge";

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
  className = "",
  options = {},
}: {
  item: any;
  className?: string;
  options?: CardOptions;
}) {
  if (!options.size) options.size = CardSize.MANUAL;
  if (!options.type) options.type = CardType.DEFAULT;
  if (!options.label) options.label = false;

  return (
    <div
      class={twMerge(
        className,
        `h-fit ${options.size === CardSize.MANUAL ? "w-36 md:w-48" : "w-full"} cursor-pointer shrink-0`,
      )}
      onclick={() => router.navigate(`/anime?id=${item.id}`)}
    >
      <img
        src={item.attributes.posterImage.original}
        class="w-full aspect-[5/7] object-cover rounded-lg"
        loading="lazy"
      />
      {options.label && (
        <div class="text-sm mt-2 font-medium space-y-1">
          <div class="text-white line-clamp-2">
            {item.attributes.titles.en ||
              item.attributes.titles.en_us ||
              item.attributes.titles.en_jp}
          </div>
          {item.relationType && (
            <div class="text-neutral-500 text-xs">{item.relationType}</div>
          )}
        </div>
      )}
    </div>
  );
}
