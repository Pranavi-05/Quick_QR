"use client";

import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function BulkQRGenerator() {
  const [emailsText, setEmailsText] = useState(""); // Input for multiple emails
  const qrRefs = useRef([]);

  const downloadPDF = async () => {
    const emails = emailsText
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const padding = 10;
    const qrSize = 80;
    const cols = 2; // 2 QR codes per row

    let x = 10;
    let y = 10;
    let colCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const element = qrRefs.current[i];
      if (!element) continue;

      // Capture QR + email block in high resolution
      const canvas = await html2canvas(element, { scale: 4, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      pdf.addImage(imgData, "JPEG", x, y, qrSize, qrSize);

      x += qrSize + padding;
      colCount++;

      if (colCount === cols) {
        colCount = 0;
        x = 10;
        y += qrSize + padding;
      }

      if (y + qrSize > pageHeight - padding) {
        pdf.addPage();
        x = 10;
        y = 10;
        colCount = 0;
      }
    }

    pdf.save("bulk-qr-codes-HD.pdf");
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Bulk QR Code Generator</h1>
      <p>Enter emails, one per line:</p>
      <textarea
        rows={10}
        value={emailsText}
        onChange={(e) => setEmailsText(e.target.value)}
        placeholder="Enter emails here, one per line"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={downloadPDF}
        disabled={!emailsText.trim()}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: emailsText.trim() ? "pointer" : "not-allowed",
          backgroundColor: emailsText.trim() ? "#0070f3" : "#999",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
        }}
      >
        Download PDF
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "30px" }}>
        {emailsText
          .split("\n")
          .map((email) => email.trim())
          .filter((email) => email.length > 0)
          .map((email, index) => (
            <div
              key={index}
              ref={(el) => (qrRefs.current[index] = el)}
              style={{
                width: 150,
                margin: 10,
                textAlign: "center",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <QRCodeCanvas value={email} size={100} />
              <p style={{ fontSize: "12px", color: "#000", marginTop: "8px" }}>{email}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
