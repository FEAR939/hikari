import { getMultipleAnime } from "../anilist";
import { authService } from "../../services/auth";

export async function getContinueAnime() {
  const user = authService.getUser();
  if (!user) return false;

  try {
    const response = await fetch(
      `${localStorage.getItem("app_server_adress")}/get-last-watched`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    if (!response.ok || response.status !== 200) {
      throw new Error("Failed to fetch continue anime");
    }

    const data = await response.json();

    if (data.length === 0) {
      console.log("No continue anime found");
      return false;
    }

    const list = await getMultipleAnime(data.map((item) => item.anilist_id));

    return list;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

export async function setLeftoff(episode) {
  const formData = new FormData();
  formData.append("anilist_id", episode.anilist_id);
  formData.append("episode", episode.episode);
  formData.append("leftoff", episode.leftoff);

  const response = await fetch(
    `${localStorage.getItem("app_server_adress")}/set-leftoff-at`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    console.error("Failed to update leftoff time");
  }
}

export async function getLeftoff(episode) {
  try {
    const formData = new FormData();
    formData.append("anilist_id", episode.anilist_id);
    formData.append("episode_filter", `${episode.ident}-${episode.ident}`);

    const response = await fetch(
      `${localStorage.getItem("app_server_adress")}/get-leftoff-at`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      console.warn("Failed to get leftoff time");
      return false;
    }

    const data = await response.json();

    return data[0].leftoff;
  } catch (error) {
    console.warn("Error getting leftoff time: ", error);
    return false;
  }
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "0");

  const response = await fetch(
    `${localStorage.getItem("app_server_adress")}/upload-photo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    console.error("Failed to upload avatar");
    return false;
  }

  const data = await response.json();

  return data.path;
}
