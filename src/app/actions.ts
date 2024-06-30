"use server";

import { cookies } from "next/headers";

export type FuelType = "e5" | "e10" | "diesel";

type StationRaw = {
  id: string;
  name: string;
  brand: string;
  street: string;
  place: string;
  lat: number;
  lng: number;
  dist: number;
  price: number;
  isOpen: boolean;
  houseNumber: string;
  postCode: number;
};

type Station = {
  id: string;
  name: string;
  brand: string;
  address: string;
  price: number;
  total: number;
  isOpen: boolean;
};

const getTotalPrice = (
  station: StationRaw,
  fuelConsumption: number,
  fuelCapacity: number
) => {
  return (
    station.price * (2 * (fuelConsumption / 100) * station.dist + fuelCapacity)
  );
};

export async function getBestStation(
  coordinates: [number, number],
  prevState: unknown,
  formData: FormData
) {
  try {
    const [latitude, longitude] = coordinates;
    const fuelType = formData.get("fuel-type") as string;
    const fuelConsumption = Number(formData.get("fuel-consumption"));
    const fuelCapacity = Number(formData.get("fuel-capacity"));
    const onlyOpen = formData.get("station-open") === "on";

    cookies().set("fuel-type", fuelType);
    cookies().set("fuel-consumption", fuelConsumption.toString());
    cookies().set("fuel-capacity", fuelCapacity.toString());
    cookies().set("station-open", onlyOpen.toString());

    // fetch stations in the vicinity
    const url = new URL(process.env.API_URL!);
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lng", longitude.toString());
    url.searchParams.set("type", fuelType);
    url.searchParams.set("apikey", process.env.API_KEY!);

    url.searchParams.set("sort", "price");
    url.searchParams.set("rad", "25"); // max. 25km

    const response = await fetch(url.toString());
    const stations = (await response.json()) as { stations: StationRaw[] };

    // calculate the best station
    const potential = stations.stations.filter(
      (station) => !onlyOpen || station.isOpen
    );

    const bestStation = potential.reduce((station, best) => {
      if (
        getTotalPrice(station, fuelConsumption, fuelCapacity) <
        getTotalPrice(best, fuelConsumption, fuelCapacity)
      ) {
        return station;
      }

      return best;
    }, stations.stations[0]);

    // transform the station
    return {
      id: bestStation.id,
      name: bestStation.name,
      brand: bestStation.brand,
      address: `${bestStation.street} ${bestStation.houseNumber}, ${bestStation.postCode} ${bestStation.place}`,
      price: bestStation.price,
      total: getTotalPrice(bestStation, fuelConsumption, fuelCapacity),
      isOpen: bestStation.isOpen,
    } satisfies Station;
  } catch (error) {
    console.error(error);
    return null;
  }
}
