import React from "react";
import { FaFilePdf, FaFileExcel, FaFileCsv } from "react-icons/fa";
import { exportDashboardReport } from "../../https/dashboard";

const ExportReports = () => {
  const exportPDF = () => {
    exportDashboardReport("pdf");
  };

  const exportExcel = () => {
    exportDashboardReport("excel");
  };

  const exportCSV = () => {
    exportDashboardReport("csv");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Export Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={exportPDF}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-6 flex flex-col items-center"
        >
          <FaFilePdf size={40} />
          <span className="mt-3 font-semibold">
            Export PDF
          </span>
        </button>

        <button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 flex flex-col items-center"
        >
          <FaFileExcel size={40} />
          <span className="mt-3 font-semibold">
            Export Excel
          </span>
        </button>

        <button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 flex flex-col items-center"
        >
          <FaFileCsv size={40} />
          <span className="mt-3 font-semibold">
            Export CSV
          </span>
        </button>
      </div>
    </div>
  );
};

export default ExportReports;
