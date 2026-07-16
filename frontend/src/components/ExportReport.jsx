import React from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExportReport({

  doctors,

  patients,

  appointments,

  waiting,

  inProgress,

  completed,

  cancelled,

  averageWaiting,

}) {

  const generatePDF = () => {

    const doc = new jsPDF();

    // ==========================
    // Header
    // ==========================

    doc.setFontSize(20);
    doc.setTextColor(13, 110, 253);

    doc.text(
      "SMART QUEUE MANAGEMENT SYSTEM",
      105,
      20,
      { align: "center" }
    );

    doc.setFontSize(15);
    doc.setTextColor(0);

    doc.text(
      "Hospital Analytics Report",
      105,
      30,
      { align: "center" }
    );

    // ==========================
    // Date
    // ==========================

    const now = new Date();

    doc.setFontSize(11);

    doc.text(
      `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      14,
      42
    );

    // ==========================
    // Statistics Table
    // ==========================

    autoTable(doc, {

      startY: 50,

      head: [["Metric", "Value"]],

      body: [

        ["Total Doctors", doctors],

        ["Total Patients", patients],

        ["Total Appointments", appointments],

        ["Waiting", waiting],

        ["In Progress", inProgress],

        ["Completed", completed],

        ["Cancelled", cancelled],

        ["Average Waiting Time", `${averageWaiting} mins`],

      ],

      theme: "grid",

      headStyles: {

        fillColor: [13, 110, 253],

        textColor: 255,

        halign: "center",

      },

      bodyStyles: {

        halign: "center",

      },

      alternateRowStyles: {

        fillColor: [245, 245, 245],

      },

    });

    // ==========================
    // Footer
    // ==========================

    const pageHeight = doc.internal.pageSize.height;

    doc.setDrawColor(200);

    doc.line(
      14,
      pageHeight - 25,
      196,
      pageHeight - 25
    );

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(
      "Smart Queue Prediction & Dynamic Appointment Scheduling System",
      105,
      pageHeight - 17,
      {
        align: "center",
      }
    );

    doc.text(
      "Generated using Smart Queue Management System",
      105,
      pageHeight - 10,
      {
        align: "center",
      }
    );

    // ==========================
    // Download PDF
    // ==========================

    doc.save("Hospital_Report.pdf");

  };

  return (

    <button
      className="btn btn-danger shadow"
      onClick={generatePDF}
    >
      📄 Export Hospital Report
    </button>

  );

}

export default ExportReport;