import { accountAvatar } from "../accountAvatar";
import { authService } from "../../services/auth";
import { uploadAvatar } from "../../lib/api";

export default function AccountSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2 overflow-y-scroll";

  const header = document.createElement("div");
  header.className = "text-l";
  header.textContent = "Account Settings";

  page.appendChild(header);

  if (!authService.getUser()) {
    const alertModal = document.createElement("div");
    alertModal.className =
      "w-full h-fit p-4 grid place-items-center border border-[#1a1a1a] rounded-md text-neutral-500 space-y-2";
    alertModal.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info size-5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      <div>You will need to log in to access these settings.</div>
    `;

    page.appendChild(alertModal);

    return page;
  }

  const avatarUpload = document.createElement("div");
  avatarUpload.className = "group relative size-16 rounded-full cursor-pointer";

  const avatar = accountAvatar();
  avatar.className = "size-16";
  avatarUpload.appendChild(avatar);

  const avatarFileInput = document.createElement("input");
  avatarFileInput.className = "hidden";
  avatarFileInput.type = "file";
  avatarFileInput.accept = "image/*";

  avatarUpload.appendChild(avatarFileInput);

  avatarUpload.addEventListener("click", () => {
    avatarFileInput.dispatchEvent(new MouseEvent("click"));
  });

  avatarFileInput.addEventListener("change", async () => {
    const file = avatarFileInput.files[0];
    if (!file) return;

    const path = await uploadAvatar(file);
    if (!path) return;

    const user = authService.getUser();
    user!.avatar = path;
    authService.setUser(user);
  });

  const avatarEdit = document.createElement("div");
  avatarEdit.className =
    "absolute right-0 bottom-0 bg-white text-black rounded-full size-5 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300";
  avatarEdit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil size-3"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;

  avatarUpload.appendChild(avatarEdit);

  page.appendChild(avatarUpload);

  return page;
}
