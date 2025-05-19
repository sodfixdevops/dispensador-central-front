import { date } from "zod";
import { ConceptosData, Revenue } from "./definitions";

// Tremor cx [v0.0.0]

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US"
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const formatDateLatam = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth()).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDate = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0]; // Formato 'yyyy-mm-dd'
};

export const transformToMap = (
  data: ConceptosData[]
): Record<string, ConceptosData> => {
  return data.reduce<Record<string, ConceptosData>>((acc, item) => {
    const key = `${item.prefijo}-${item.correlativo}`;
    //console.log(`Procesando: ${key}`, item); // Log para verificar
    acc[key] = item; // Aquí TypeScript debería reconocer el tipo
    return acc;
  }, {}); // No es necesario el cast aquí, ya que se especifica el tipo en reduce
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const formatMoneyInput = (): void => {
  // Seleccionamos todos los inputs con la clase 'money'
  const moneyInputs = document.querySelectorAll<HTMLInputElement>(".money");

  moneyInputs.forEach((input) => {
    // Agregamos el evento blur para cuando el usuario pierde el foco
    input.addEventListener("blur", () => {
      let value = parseFloat(input.value);

      // Validamos que el valor sea un número válido
      if (!isNaN(value)) {
        // Redondeamos el valor a 2 decimales siempre
        input.value = value.toFixed(2);
      } else {
        // Si el valor es inválido, se deja vacío
        input.value = "";
      }
    });
  });
};

export const showMessage = (type: string, content: string) => {
  const messageBox = document.getElementById("message-box");
  const messageContent = document.getElementById("message-content");

  if (messageBox && messageContent) {
    // Mostrar el mensaje y cambiar el contenido
    messageContent.textContent = content;

    // Cambiar el color según el tipo de mensaje
    if (type === "success") {
      messageBox.classList.remove("bg-red-500");
      messageBox.classList.add("bg-green-500");
    } else if (type === "error") {
      messageBox.classList.remove("bg-green-500");
      messageBox.classList.add("bg-red-500");
    }

    // Mostrar el mensaje
    messageBox.classList.remove("hidden");

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      messageBox.classList.add("hidden");
    }, 5000);
  }
};
