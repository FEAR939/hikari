import { AccountAvatar } from "../../accountAvatar";
import { authService } from "../../../services/auth";
import { API } from "../../../app";
import { h } from "../../../lib/jsx/runtime";
import { createSignal, bind } from "../../../lib/jsx/reactive";

export default function AccountSettings() {
  const [isAuth, setIsAuth, subscribeIsAuth] = createSignal(
    authService.getUser() !== null,
  );

  authService.subscribe((user) => {
    setIsAuth(!!user);
  });

  const page = (
    <div class="h-full w-full space-y-4 overflow-y-scroll">
      <div class="text-xl">Account Settings</div>
      {bind([isAuth, setIsAuth, subscribeIsAuth], (value) =>
        value ? (
          <div class="h-full w-full flex">
            <div class="group w-20 space-y-2">
              <div
                class="relative size-20"
                onClick={async () => {
                  try {
                    const [fileHandle] = await window.showOpenFilePicker({
                      types: [
                        {
                          description: "Images",
                          accept: { "image/*": [".png", ".jpg", ".jpeg"] },
                        },
                      ],
                      multiple: false,
                    });

                    const file = await fileHandle.getFile();
                    if (!file) return;
                    const path = await API.uploadAvatar(file);
                    if (!path) return;

                    const user = authService.getUser();
                    user!.avatar = path as string;
                    authService.setUser(user);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                <AccountAvatar className="size-20" />
                <div class="absolute right-0 bottom-0 bg-white text-black rounded-full size-6 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-pencil-icon lucide-pencil size-3"
                  >
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </div>
              </div>
              <div class="w-20 text-xs text-neutral-500 hidden group-hover:block">
                Aspect ratio of 1:1 is recommended. 5MB Max
              </div>
            </div>
            <div class="w-full h-full px-4 space-y-2">
              <div>Name</div>
              <div class="text-neutral-500">
                {authService.getUser()?.username}
              </div>
              <div>Email</div>
              <div class="text-neutral-500">{authService.getUser()?.email}</div>
            </div>
          </div>
        ) : (
          <div class="w-full h-fit p-4 grid place-items-center border border-[#1a1a1a] rounded-md text-neutral-500 space-y-2">
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
              class="lucide lucide-info-icon lucide-info size-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div>You will need to log in to access these settings.</div>
          </div>
        ),
      )}
    </div>
  ) as HTMLElement;

  return page;
}
