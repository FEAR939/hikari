import { getMultipleAnime } from "../anilist";

export async function getContinueAnime() {
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
