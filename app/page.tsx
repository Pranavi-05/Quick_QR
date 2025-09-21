"use client";

import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function BulkQRGenerator() {
  const [emailsText, setEmailsText] = useState("");
  const qrRefs = useRef<Array<HTMLDivElement | null>>([]);

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
    const cols = 2;

    let x = 10;
    let y = 10;
    let colCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const element = qrRefs.current[i];
      if (!element) continue;

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
    <div
      style={{
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#fef8f5",
        minHeight: "100vh",
        color: "#333",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#ff6f50" }}>
        Bulk QR Code Generator
      </h1>

      <textarea
        rows={8}
        value={emailsText}
        onChange={(e) => setEmailsText(e.target.value)}
        placeholder="Enter emails here, one per line"
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "15px",
          borderRadius: "10px",
          border: "1px solid #ffc1a1",
          marginBottom: "20px",
          resize: "vertical",
          backgroundColor: "#fffaf7",
          outline: "none",
          transition: "border 0.2s",
        }}
      />

      <button
        onClick={downloadPDF}
        disabled={!emailsText.trim()}
        style={{
          padding: "12px 25px",
          fontSize: "16px",
          cursor: emailsText.trim() ? "pointer" : "not-allowed",
          backgroundColor: emailsText.trim() ? "#ff8c66" : "#ffc4b2",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          boxShadow: emailsText.trim()
            ? "0 4px 12px rgba(255, 140, 102, 0.3)"
            : "none",
          transition: "all 0.2s ease-in-out",
        }}
      >
        Download PDF
      </button>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "30px",
          gap: "15px",
        }}
      >
        {emailsText
          .split("\n")
          .map((email) => email.trim())
          .filter((email) => email.length > 0)
          .map((email, index) => (
            <div
              key={index}
              ref={(el) => {
                qrRefs.current[index] = el;
              }}
              style={{
                width: 150,
                padding: 10,
                textAlign: "center",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.transform = "translateY(-3px)";
                target.style.boxShadow = "0 8px 18px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.transform = "translateY(0)";
                target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
              }}
            >
              <QRCodeCanvas value={email} size={100} />
              <p
                style={{
                  fontSize: "12px",
                  color: "#000",
                  marginTop: "8px",
                  wordBreak: "break-word",
                }}
              >
                {email}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
