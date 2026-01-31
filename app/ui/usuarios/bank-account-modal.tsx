"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchBankByUsuario,
  crearCuentaBancaria,
  actualizarCuentaBancaria,
} from "@/app/lib/adbank-actions";
import { AdbankData } from "@/app/lib/definitions";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function BankAccountModal({
  isOpen,
  onClose,
  username,
}: BankAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentBank, setCurrentBank] = useState<AdbankData | null>(null);
  const [formData, setFormData] = useState({
    adbankncta: "",
    adbanktipo: "",
    adbankmone: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadBankData();
    }
  }, [isOpen]);

  const loadBankData = async () => {
    const data = await fetchBankByUsuario(username);
    if (data) {
      setCurrentBank(data);
      setFormData({
        adbankncta: data.adbankncta,
        adbanktipo: data.adbanktipo,
        adbankmone: data.adbankmone,
      });
    } else {
      setCurrentBank(null);
      setFormData({
        adbankncta: "",
        adbanktipo: "",
        adbankmone: "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (currentBank) {
        result = await actualizarCuentaBancaria(currentBank.adbankseri, formData);
      } else {
        result = await crearCuentaBancaria(username, formData);
      }

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4">
          {currentBank ? "Editar Cuenta Bancaria" : "Registrar Cuenta Bancaria"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              disabled
              className="w-full rounded-md border px-3 py-2 bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Número de Cuenta
            </label>
            <input
              type="text"
              name="adbankncta"
              value={formData.adbankncta}
              onChange={handleChange}
              placeholder="Ej: 12345678901234"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Cuenta
            </label>
            <input
              type="text"
              name="adbanktipo"
              value={formData.adbanktipo}
              onChange={handleChange}
              placeholder="Ej: Corriente, Ahorros"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Moneda</label>
            <input
              type="text"
              name="adbankmone"
              value={formData.adbankmone}
              onChange={handleChange}
              placeholder="Ej: USD, COP"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : currentBank ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
