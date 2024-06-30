"use client";

import { useFormState } from "react-dom";
import { FuelType, getBestStation } from "./actions";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [fuelType, setFuelType] = useState<FuelType>("e5");
  const [fuelConsumption, setFuelConsumption] = useState<number>(0);
  const [fuelCapacity, setFuelCapacity] = useState<number>(0);
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false);

  const [state, formAction] = useFormState(
    getBestStation.bind(null, coordinates),
    null
  );

  useEffect(() => {
    if (localStorage.getItem("fuel-type")) {
      setFuelType(localStorage.getItem("fuel-type") as FuelType);
    }

    if (localStorage.getItem("fuel-consumption")) {
      setFuelConsumption(Number(localStorage.getItem("fuel-consumption")));
    }

    if (localStorage.getItem("fuel-capacity")) {
      setFuelCapacity(Number(localStorage.getItem("fuel-capacity")));
    }

    if (localStorage.getItem("station-open")) {
      setOnlyOpen(localStorage.getItem("station-open") === "true");
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("fuel-type", fuelType);
    localStorage.setItem("fuel-consumption", fuelConsumption.toString());
    localStorage.setItem("fuel-capacity", fuelCapacity.toString());
    localStorage.setItem("station-open", onlyOpen.toString());
  }, [fuelType, fuelConsumption, fuelCapacity, onlyOpen]);

  return (
    <main className="mt-10 mx-auto px-4 pb-4 space-y-8 max-w-prose text-slate-500 font-sans">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">
          ⛽️ PumpPal
        </h1>

        <p className="text-lg font-light">
          Tired of overpaying at the pump? Let PumpPal lead you to the cheapest
          gas prices in town!
        </p>
      </header>

      <form action={formAction} className="space-y-4">
        <label className="block" htmlFor="fuel-type">
          <span className="block text-slate-900">1. Select your fuel type</span>

          <select
            required
            name="fuel-type"
            id="fuel-type"
            className="w-full px-4 py-2 flex items-center bg-transparent border border-slate-300"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
          >
            <option value="e5">E-5</option>
            <option value="e10">E-10</option>
            <option value="diesel">Diesel</option>
          </select>
        </label>

        <label className="block" htmlFor="fuel-consumption">
          <span className="block text-slate-900">
            2. Enter your fuel consumption
          </span>

          <input
            required
            name="fuel-consumption"
            id="fuel-consumption"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(Number(e.target.value))}
            min={0}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 flex items-center bg-transparent border border-slate-300"
          />
        </label>

        <label className="block" htmlFor="fuel-capacity">
          <span className="block text-slate-900">
            3. Enter your fuel capacity
          </span>

          <input
            required
            name="fuel-capacity"
            id="fuel-capacity"
            value={fuelCapacity}
            onChange={(e) => setFuelCapacity(Number(e.target.value))}
            min={0}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 flex items-center bg-transparent border border-slate-300"
          />
        </label>

        <label className="block space-y-1" htmlFor="station-open">
          <span className="block text-slate-900">4. Find gas station</span>

          <div>
            <input
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              type="checkbox"
              name="station-open"
              id="station-open"
            />
            <span className="text-slate-900"> Only show open stations </span>
          </div>

          <button
            id="analyze"
            className="px-4 py-2 bg-purple-500 text-slate-50"
          >
            ✨ Analyze ✨
          </button>
        </label>
      </form>

      <p>
        {state ? (
          <>
            <span className="block text-purple-500">Best station:</span>
            <span className="block text-slate-500">
              {state.name} ({state.brand})<br />
              <Link
                className="underline"
                href={`https://www.google.com/maps/search/?api=1&query=${state.address}`}
              >
                {state.address}
              </Link>
              <br />
              {state.price}€/L (in total: {Math.round(state.total)}€)
            </span>
          </>
        ) : (
          "No results found."
        )}
      </p>
    </main>
  );
}
