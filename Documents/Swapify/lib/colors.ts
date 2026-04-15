"use client";

/**
 * Extract dominant colors from an image URL using a canvas.
 * Returns an array of hex color strings.
 */
export async function extractColors(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 50; // downsample for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(["#1DB954", "#191414"]);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Simple k-means-like bucketing into 4 colors
        const buckets: { r: number; g: number; b: number; count: number }[] = Array.from(
          { length: 4 },
          () => ({ r: 0, g: 0, b: 0, count: 0 })
        );

        // Sample every 4th pixel
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          // Map to bucket by quadrant position
          const pixelIndex = i / 4;
          const x = pixelIndex % size;
          const y = Math.floor(pixelIndex / size);
          const bucket = (x < size / 2 ? 0 : 1) + (y < size / 2 ? 0 : 2);
          buckets[bucket].r += r;
          buckets[bucket].g += g;
          buckets[bucket].b += b;
          buckets[bucket].count++;
        }

        const colors = buckets
          .filter((b) => b.count > 0)
          .map((b) => {
            const r = Math.round(b.r / b.count);
            const g = Math.round(b.g / b.count);
            const bl = Math.round(b.b / b.count);
            return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
          });

        resolve(colors.length > 0 ? colors : ["#1DB954", "#191414"]);
      } catch {
        resolve(["#1DB954", "#191414"]);
      }
    };
    img.onerror = () => resolve(["#1DB954", "#191414"]);
    img.src = imageUrl;
  });
}

/** Return "white" or "black" based on luminance of a hex color */
export function getContrastColor(hex: string): "white" | "black" {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
}

/** Darken a hex color by a given percentage */
export function darkenColor(hex: string, percent: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - percent)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - percent)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - percent)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
