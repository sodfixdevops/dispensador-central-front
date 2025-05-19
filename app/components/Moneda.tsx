"use client";

import { useEffect, useState } from "react";

interface MonedasProps {
  onSelect: (moneda: string) => void; // Definir la función que se pasará como prop
  selectedMoneda: string;
}

const Monedas = ({ onSelect, selectedMoneda }: MonedasProps) => {
  const [selected, setSelected] = useState<string>("");

  //const monedas = ["BOB", "USD", "CPTO"];
  const monedas = ["BOB"];

  const handleClick = (moneda: string) => {
    setSelected(moneda);
    onSelect(moneda); // Llamar a la función de callback cuando se selecciona una moneda
  };

  // Usar useEffect para actualizar el estado local cuando la moneda seleccionada cambie
  useEffect(() => {
    setSelected(selectedMoneda);
  }, [selectedMoneda]);

  return (
    <div className="flex justify-start space-x-2 md:space-x-4">
      {monedas.map((moneda) => (
        <button
          key={moneda}
          type="button"
          onClick={() => handleClick(moneda)}
          className={`px-4 py-2 border rounded-md w-24
            ${
              selected === moneda
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }
            hover:bg-blue-400 hover:text-white transition-all`}
        >
          {moneda}
        </button>
      ))}
    </div>
  );
};

export default Monedas;
