import { regionRepository } from "@/repositories/RegionRepository";

// Приклад використання репозиторію
async function exampleUsage() {
  try {
    // Отримання всіх регіонів користувача
    const regions = await regionRepository.getAllUserRegions("user-id");
    console.log("User regions:", regions);

    // Створення нового регіону
    const newRegion = await regionRepository.createRegion({
      user_id: "user-id",
      region_name: "New Region",
      latitude: 50.4501,
      longitude: 30.5234,
      radius: 100
    });
    console.log("Created region:", newRegion);

    // Оновлення регіону
    const updatedRegion = await regionRepository.updateRegion(newRegion.id, {
      region_name: "Updated Region Name"
    });
    console.log("Updated region:", updatedRegion);

    // Отримання регіону за ID
    const region = await regionRepository.getRegionById(newRegion.id);
    console.log("Retrieved region:", region);

    // Видалення регіону
    await regionRepository.deleteRegion(newRegion.id);
    console.log("Region deleted successfully");

  } catch (error) {
    console.error("Error in example usage:", error);
  }
}