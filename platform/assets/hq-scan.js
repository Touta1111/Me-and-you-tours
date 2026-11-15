// QR scanning with the browser BarcodeDetector (camera); manual entry is always possible.
import { toast } from "./core.js";
export async function startScanner(video, onCode) {
  if (!("BarcodeDetector" in window)) return toast("This browser cannot scan QR codes. Paste the code instead.", true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream; video.style.display = "block"; await video.play();
    const det = new BarcodeDetector({ formats: ["qr_code"] });
    const loop = async () => { if (!video.isConnected) return stream.getTracks().forEach((t) => t.stop());
      const codes = await det.detect(video).catch(() => []); if (codes[0]) { stream.getTracks().forEach((t) => t.stop()); video.style.display = "none"; onCode(codes[0].rawValue); } else requestAnimationFrame(loop); };
    loop();
  } catch { toast("Camera not available. Paste the code instead.", true); }
}
