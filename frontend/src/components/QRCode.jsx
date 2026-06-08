import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

function QRCode({ value, size = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#2d3148",
        light: "#fffaf5",
      },
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label="QR code"
      className="rounded-2xl"
      style={{ display: "block" }}
    />
  );
}

export default QRCode;
