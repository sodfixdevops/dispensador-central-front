"use client";

export default function StatusBadge({ value }: { value?: string }) {
  if (!value) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  // Extraer el código hex y la descripción
  const hexMatch = value.match(/0x[0-9a-fA-F]+/);
  const description = value.replace(/\s*0x[0-9a-fA-F]+\s*/g, "").trim();

  const getColorClass = (desc: string) => {
    if (
      desc.includes("error") ||
      desc.includes("Error") ||
      desc.includes("not full") ||
      desc.includes("empty")
    ) {
      return "bg-red-100 text-red-800";
    }
    if (
      desc.includes("Login mode") ||
      desc.includes("Stand by") ||
      desc.includes("closed")
    ) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (
      desc.includes("Ready") ||
      desc.includes("OK") ||
      desc.includes("Complete") ||
      desc.includes("clear")
    ) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="text-xs">
      <div className={`inline-block px-2 py-1 rounded-full font-semibold ${getColorClass(description)}`}>
        {hexMatch ? hexMatch[0] : value}
      </div>
      {description && (
        <div className="text-gray-600 text-xs mt-1 max-w-xs">
          {description}
        </div>
      )}
    </div>
  );
}
