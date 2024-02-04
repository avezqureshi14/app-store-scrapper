import store from "app-store-scraper";
import { category } from "./constants/category.js";

import { Actor } from "apify";
const runActor = async () => {
  await Actor.init();

  const input = await Actor.getInput();
  const { action } = input;
  try {
    switch (action) {
      case "LIST_APPS":
        await listApps(input);
        break;
      case "LIST_DEVELOPER_APPS":
        await listDeveloperApps(input);
        break;
      case "GET_APP_DETAILS":
        await getAppDetails(input);
        break;
      default:
        console.error("Invalid action specified in input.");
        await Actor.pushData({ error: "Invalid action specified." });
        break;
    }
  } catch (error) {
    console.error("Error processing input:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }

  await Actor.exit();
};

const listApps = async ({ selectedCategory,limit, priceModel }) => {
  const appStoreCategory = category[selectedCategory];

  try {
    const allApps = await store.list({
      category: appStoreCategory,
      num: limit
    });

    let filteredApps = allApps;

    if (priceModel === "FREE") {
      filteredApps = filteredApps.filter((app) => app.free === true);
    } else if (priceModel === "PAID") {
      filteredApps = filteredApps.filter((app) => app.free === false);
    }
    await Actor.pushData(filteredApps.slice(0, limit));
  } catch (error) {
    console.error("Error fetching data from App Store:", error);
    await Actor.pushData({error:error.message});

  }
};

const listDeveloperApps = async ({ devId }) => {
  try {
    const apps = await store.developer({ devId: devId });
    await Actor.pushData(apps);
  } catch (error) {
    console.error("Error fetching data from Google Play:", error);
    await Actor.pushData({ error: error.message });
  }
};

const getAppDetails = async ({ appId }) => {
  try {
    const result = await store.app({ appId: appId });
    await Actor.pushData(result);
  } catch (error) {
    console.error("Error fetching data from App Store:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }
};

runActor();
