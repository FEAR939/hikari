import { authService } from "../../services/auth";
import { API } from "../../app";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";

export function accountAvatar() {
  const [user, setUser, subscribeUser] = createSignal<{
    username: string;
    avatar: string | null;
  } | null>(null);

  authService.subscribe((user) => {
    setUser({
      username: user?.username || "",
      avatar: user?.avatar || null,
    });
  });

  const authUser = authService.getUser();
  setUser({
    username: authUser?.username || "",
    avatar: authUser?.avatar || null,
  });

  return (
    <div class="relative size-8">
      <div class="absolute inset-0 flex items-center justify-center cursor-pointer">
        {bind([user, setUser, subscribeUser], (value) => {
          if (value) {
            if (value.avatar !== null) {
              return (
                <img
                  src={`${API.baseurl}${value.avatar}`}
                  alt="Avatar"
                  class="absolute inset-0 w-full h-full object-cover object-center rounded-full"
                />
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
          } else {
            return (
              <div class="h-full w-full flex items-center justify-center bg-gray-300 rounded-full">
                {value?.username
                  .replaceAll(" ", "")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
