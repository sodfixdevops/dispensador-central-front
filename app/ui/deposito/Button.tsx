import {
  TrashIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

/* =========================
   CONTAR
   ========================= */
type BtnContarProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function BtnContar({ onClick, disabled }: BtnContarProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
    >
      <span className="hidden md:block">Contar</span>
      <CurrencyDollarIcon className="h-5 md:ml-4" />
    </button>
  );
}

/* =========================
   DEPOSITAR
   ========================= */
type BtnDepositarProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function BtnDepositar({ onClick, disabled }: BtnDepositarProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
    >
      <span className="hidden md:block">Depositar</span>
      <ArrowDownTrayIcon className="h-5 md:ml-4" />
    </button>
  );
}

/* =========================
   CANCELAR (EL TUYO)
   ========================= */
type BtnCancelarProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function BtnCancelar({ onClick, disabled, loading }: BtnCancelarProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-10 items-center rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
    >
      <span className="hidden md:block">
        {loading ? "Cancelando..." : "Cancelar"}
      </span>

      {loading ? (
        <svg
          className="ml-2 h-4 w-4 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        <TrashIcon className="h-5 md:ml-4" />
      )}
    </button>
  );
}
