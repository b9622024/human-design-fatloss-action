"use client";

type DimensionRow = { label: string; value: number };

type Props = {
  payload: Record<string, unknown>;
  dimensions: DimensionRow[];
  humanDesignSummary?: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = [...text];
  let line = "";
  let cursorY = y;
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = char;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
  return cursorY;
}

async function svgElementToImage(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const text = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("BodyGraph SVG 轉換失敗"));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function DownloadResults({ payload, dimensions, humanDesignSummary }: Props) {
  function downloadJson() {
    const json = JSON.stringify(payload, null, 2);
    downloadBlob(new Blob([json], { type: "application/json;charset=utf-8" }), "human-design-fatloss-result.json");
  }

  async function downloadPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f5f1e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#17172d";
    ctx.font = "700 62px sans-serif";
    ctx.fillText("人類圖減脂行動測驗", 100, 120);
    ctx.font = "400 30px sans-serif";
    ctx.fillStyle = "#706c67";
    ctx.fillText("Human Design × 行為測驗結果", 100, 172);

    let y = 250;
    if (humanDesignSummary) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(80, 210, 1240, 920);
      ctx.fillStyle = "#17172d";
      ctx.font = "700 32px sans-serif";
      ctx.fillText("Human Design", 120, 270);
      ctx.font = "500 26px sans-serif";
      ctx.fillStyle = "#5f5a54";
      wrapText(ctx, humanDesignSummary, 120, 315, 1160, 38);

      const svg = document.querySelector("[data-result-bodygraph] svg") as SVGSVGElement | null;
      if (svg) {
        try {
          const image = await svgElementToImage(svg);
          const ratio = image.width / image.height || 900 / 760;
          const targetHeight = 720;
          const targetWidth = Math.min(1160, targetHeight * ratio);
          ctx.drawImage(image, 700 - targetWidth / 2, 370, targetWidth, targetHeight);
        } catch {
          ctx.fillStyle = "#9f2e25";
          ctx.font = "400 24px sans-serif";
          ctx.fillText("BodyGraph 圖像轉換失敗，其他結果仍可下載。", 120, 420);
        }
      }
      y = 1190;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(80, y - 40, 1240, 590);
    ctx.fillStyle = "#17172d";
    ctx.font = "700 32px sans-serif";
    ctx.fillText("六大行為維度", 120, y + 20);

    let rowY = y + 90;
    for (const row of dimensions) {
      ctx.fillStyle = "#17172d";
      ctx.font = "600 25px sans-serif";
      ctx.fillText(row.label, 120, rowY + 26);
      ctx.fillStyle = "#e8e3da";
      ctx.fillRect(360, rowY, 760, 34);
      ctx.fillStyle = "#77716a";
      ctx.fillRect(360, rowY, 760 * (row.value / 100), 34);
      ctx.fillStyle = "#17172d";
      ctx.font = "700 24px sans-serif";
      ctx.fillText(`${row.value}`, 1160, rowY + 27);
      rowY += 72;
    }

    ctx.fillStyle = "#706c67";
    ctx.font = "400 22px sans-serif";
    ctx.fillText("此圖為測驗結果摘要，完整原始資料請下載 JSON。", 100, 1840);

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "human-design-fatloss-result.png");
    }, "image/png");
  }

  const buttonStyle = {
    padding: "14px 18px",
    borderRadius: 999,
    border: "1px solid #17172d",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  } as const;

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
      <button type="button" onClick={downloadPng} style={{ ...buttonStyle, background: "#17172d", color: "white" }}>
        下載 PNG 結果圖
      </button>
      <button type="button" onClick={downloadJson} style={{ ...buttonStyle, background: "white", color: "#17172d" }}>
        下載 JSON 完整資料
      </button>
    </div>
  );
}
