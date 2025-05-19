"use client";

import { useState, useEffect } from "react";
import Select from "react-select"; // Biblioteca para combos.
import DatePicker from "react-datepicker"; // Biblioteca para fechas.
import "react-datepicker/dist/react-datepicker.css";
import {
  Agenciafiltro,
  ServicioFiltro,
  SubservicioFiltro,
  Sucursalfiltro,
} from "@/app/lib/definitions";
import { formatDate } from "@/app/lib/utils";

//import { sucursales, agencias } from "@/app/ui/reportes/reportes-mock-data";

export default function Filters({
  onGenerateReport,
  sucursales,
  agencias,
  servicios,
  subservicios,
}: {
  onGenerateReport: (filters: any) => void;
  sucursales: Sucursalfiltro[];
  agencias: Agenciafiltro[];
  servicios: ServicioFiltro[];
  subservicios: SubservicioFiltro[];
}) {
  //const [sucursales, setSucursales] = useState([]);
  const [listaAgencias, setListaAgencias] = useState<Agenciafiltro[] | []>([]);
  const [listaSubservicios, setListaSubservicios] = useState<
    SubservicioFiltro[] | []
  >([]);
  const [selectedSucursales, setSelectedSucursales] = useState<
    Sucursalfiltro[] | []
  >([]);
  const [selectedAgencias, setSelectedAgencias] = useState<
    Agenciafiltro[] | []
  >([]);
  const [selectedServicios, setSelectedServicios] = useState<
    ServicioFiltro[] | []
  >([]);
  const [selectedSubservicios, setSelectedSubservcios] = useState<
    SubservicioFiltro[] | []
  >([]);

  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFinal, setFechaFinal] = useState<Date | null>(new Date());
  const [horaInicio, setHoraInicio] = useState("08:30:00");
  const [horaFinal, setHoraFinal] = useState("17:00:00");

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    // Solo se ejecuta en el cliente
    setIsClient(true);
  }, []);

  const handleSucursalChange = (selectedOptions: any) => {
    setSelectedSucursales(selectedOptions);
    console.log(selectedOptions);
    // Simular llamada API para agencias relacionadas con sucursales seleccionadas

    const filteredAgencias = agencias.filter((agencia) =>
      selectedOptions.some((s: any) => s.value === agencia.idSucursal)
    );
    console.log(filteredAgencias);
    setListaAgencias(filteredAgencias);
    setSelectedAgencias(filteredAgencias);
  };

  const handleServicioChange = (selectedOptions: any) => {
    setSelectedServicios(selectedOptions);
    const filteredSubservicios = subservicios.filter((subservicio) =>
      selectedOptions.some((s: any) => s.value === subservicio.idServicio)
    );
    setListaSubservicios(filteredSubservicios);
    setSelectedSubservcios(filteredSubservicios);
  };

  const handleAgenciaChange = (selectedOptions: any) => {
    setSelectedAgencias(selectedOptions);
  };

  const handlSubservicioChange = (selectedOptions: any) => {
    setSelectedSubservcios(selectedOptions);
  };

  const handleGenerateReport = () => {
    const filters = {
      sucursales: selectedSucursales.map((s: any) => s.value),
      agencias: selectedAgencias.map((a: any) => a.value),
      fechaInicio: formatDate(fechaInicio),
      fechaFinal: formatDate(fechaFinal),
      horaInicio,
      horaFinal,
    };
    onGenerateReport(filters); // Enviar los filtros solo cuando el usuario hace clic
  };

  if (!isClient) return null;

  return (
    <div className="container flex-col gap-4 md:flex-row md:items-center ">
      <div className="flex flex-col mb-4 md:flex-row gap-2 w-full ">
        {/* Sucursales */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="sucursales"
            className="mb-1 block text-sm font-medium text-left"
          >
            Sucursales:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <Select
              options={sucursales}
              isMulti
              placeholder="Seleccionar sucursales"
              onChange={handleSucursalChange}
              className="text-xs"
              //onChange={(selected) => setSelectedSucursales(selected || [])}
            />
          </div>
        </div>
        {/* Agencias */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label htmlFor="agencias" className="mb-2 block text-sm font-medium">
            Agencias:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <Select
              options={listaAgencias}
              isMulti
              placeholder="Seleccionar agencias"
              value={selectedAgencias}
              onChange={handleAgenciaChange}
              isDisabled={selectedSucursales.length === 0}
              className="text-xs"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col mb-4 md:flex-row gap-2 w-full ">
        {/* Sucursales */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="servicios"
            className="mb-1 block text-sm font-medium text-left"
          >
            Servicios:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <Select
              options={servicios}
              isMulti
              placeholder="Seleccionar servicios"
              onChange={handleServicioChange}
              className="text-xs"
              //onChange={(selected) => setSelectedSucursales(selected || [])}
            />
          </div>
        </div>
        {/* Agencias */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="subservicios"
            className="mb-2 block text-sm font-medium"
          >
            Subservicios:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <Select
              options={listaSubservicios}
              isMulti
              placeholder="Seleccionar subservicios"
              value={selectedSubservicios}
              onChange={handlSubservicioChange}
              isDisabled={selectedSubservicios.length === 0}
              className="text-xs"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col mb-4 md:flex-row gap-2 w-full">
        {/* Fecha Inicio */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="fechaInicio"
            className="mb-1 block text-sm font-medium text-left"
          >
            Fecha Inicio:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <DatePicker
              selected={fechaInicio}
              onChange={(date) => setFechaInicio(date)}
              placeholderText="Fecha Inicio"
              dateFormat="dd/MM/yyyy"
              className="text-xs w-full"
            />
          </div>
        </div>
        {/* Fecha Final */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="agencias"
            className="mb-1 block text-sm font-medium text-left"
          >
            Fecha Final:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <DatePicker
              selected={fechaFinal}
              onChange={(date) => setFechaFinal(date)}
              placeholderText="Fecha Final"
              dateFormat="dd/MM/yyyy"
              className="text-xs w-full"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col mb-4 md:flex-row gap-2 w-full">
        {/* Hora Inicio */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label
            htmlFor="horaInicio"
            className="mb-2 block text-sm font-medium"
          >
            Hora inicio:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <input
              id="horaInicio"
              name="horaInicio"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="input text-xs"
              placeholder="Hora Inicio"
            />
          </div>
        </div>
        {/* Hora Final */}
        <div className="flex-none mb-0 flex flex-col w-1/6 justify-center">
          <label htmlFor="agencias" className="mb-2 block text-sm font-medium">
            Hora Final:
          </label>
        </div>
        <div className="flex-none mb-0 flex flex-col w-full md:w-2/6">
          <div className="relative">
            <input
              type="time"
              value={horaFinal}
              onChange={(e) => setHoraFinal(e.target.value)}
              className="input text-xs"
              placeholder="Hora Final"
            />
          </div>
        </div>
      </div>
      {/* Botón para procesar el reporte */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Generar Reporte
        </button>
      </div>
    </div>
  );
}
