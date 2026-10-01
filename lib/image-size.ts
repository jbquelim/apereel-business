// The pixel size of a remote image from its first bytes (PNG, JPEG, GIF,
// WebP), without downloading the whole file. Used to keep small product
// photos out of full-screen layouts where they'd look blurry.

export async function imageSize(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-131071", "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok && res.status !== 206) return null;
    const b = new Uint8Array(await res.arrayBuffer());
    const u16 = (i: number) => (b[i] << 8) | b[i + 1];
    const le16 = (i: number) => b[i] | (b[i + 1] << 8);
    const u32 = (i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
    // PNG
    if (b[0] === 0x89 && b[1] === 0x50) return { width: u32(16), height: u32(20) };
    // GIF
    if (b[0] === 0x47 && b[1] === 0x49) return { width: le16(6), height: le16(8) };
    // WebP
    if (b[0] === 0x52 && b[8] === 0x57) {
      const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (chunk === "VP8 ") return { width: le16(26) & 0x3fff, height: le16(28) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    }
    // JPEG: walk the markers to a start-of-frame.
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) return null;
        const marker = b[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: u16(i + 7), height: u16(i + 5) };
        i += 2 + u16(i + 2);
      }
    }
  } catch {
    /* unknown */
  }
  return null;
}
