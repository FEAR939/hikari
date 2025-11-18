import { authService } from "../../services/auth";
import { API } from "../../app";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { cn } from "../../lib/util";

export function AccountAvatar({ className = "" }: { className?: string } = {}) {
  const [user, setUser, subscribeUser] = createSignal<{
    username: string | null;
    avatar: string | null;
  } | null>(null);

  authService.subscribe((user) => {
    setUser(
      user
        ? {
            username: user.username || null,
            avatar: user.avatar || null,
          }
        : null,
    );
  });

  const authUser = authService.getUser();
  setUser(
    authUser
      ? {
          username: authUser?.username || null,
          avatar: authUser?.avatar || null,
        }
      : null,
  );

  return (
    <div class={cn("relative size-8 shrink-0", className)}>
      <div class="absolute inset-0 flex items-center justify-center cursor-pointer">
        {bind([user, setUser, subscribeUser], (value) => {
          if (value && value.avatar !== null) {
            return (
              <img
                src={`${API.baseurl}${value.avatar}`}
                alt="Avatar"
                class="absolute inset-0 min-w-full w-fit min-h-full h-fit object-cover object-center rounded-full"
              />
            );
          } else if (value && value.avatar === null) {
            return (
              <div class="h-full w-full flex items-center justify-center bg-pink-500 rounded-full">
                {value
                  ?.username!.replaceAll(" ", "")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            );
          } else {
            return (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-user-icon lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            );
          }
        })}
      </div>
    </div>
  );
}
