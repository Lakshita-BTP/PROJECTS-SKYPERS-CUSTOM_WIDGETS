(function () {
  class ProgressBarWidget extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this._titleText = "COMPANY WISE SALES ORDER VALUE";
      this._titleColor = "#FFFFFF";
      this._titleFontSize = "15px";

      this.shadowRoot.innerHTML = `
        <style>

        .outer{
            width:100%;
            height:100%;
            padding:5px;
            box-sizing:border-box;
        }

        .card{
            width:100%;
            height:100%;

            background:#ffffff;
            border-radius:12px;

            box-shadow:0 0 11px rgba(0,0,0,0.10);

            overflow:hidden;

            display:flex;
            flex-direction:column;

            font-family:Arial,sans-serif;
        }

        .container{
            flex:1;
            padding:15px;
            overflow-y:auto;
            box-sizing:border-box;
        }

        .title{
            background:#1b2a41;
            color:${this._titleColor};
            font-size:${this._titleFontSize};
            font-weight:bold;
            padding:10px 15px;
            text-transform:uppercase;

            display:flex;
            justify-content:space-between;
            align-items:center;
            border-radius:12px 12px 0 0;
        }

        .row{
            display:flex;
            align-items:center;
            margin-bottom:15px;
        }

        .label{
            width:130px;
            font-size:12px;
            font-weight:bold;
            color:#6b7d99;
            line-height:14px;
            word-break:break-word;
        }

        .bar-container{
            flex:1;
            height:28px;
            background:#e7e3df;
            border-radius:4px;
            overflow:hidden;
            margin-right:10px;
        }

        .bar{
            height:100%;
            display:flex;
            align-items:center;
            padding-left:10px;
            color:white;
            font-size:12px;
            font-weight:bold;
            border-radius:4px;
            box-sizing:border-box;
        }

        .value{
            width:70px;
            text-align:right;
            font-size:13px;
            color:#1b2a41;
            font-weight:bold;
        }

        </style>

        <div class="outer">

            <div class="card">

                <div id="title" class="title">
                    ${this._titleText}
                </div>

                <div id="content" class="container">
                    Waiting for Data Binding...
                </div>

            </div>

        </div>
        `;
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(dataBinding) {
      this._myDataBinding = dataBinding;
      this.render();
    }

    setTitle(text) {
      this._titleText = text;
      this.render();
    }

    setTitleColor(color) {
      this._titleColor = color;
      this.render();
    }

    setTitleFontSize(fontSize) {
      this._titleFontSize = fontSize;
      this.render();
    }

    setTitleStyle(text, color, fontSize) {
      this._titleText = text;
      this._titleColor = color;
      this._titleFontSize = fontSize;
      this.render();
    }

    render() {
      const title = this.shadowRoot.getElementById("title");
      if (title) {
        title.innerHTML = this._titleText;
        title.style.color = this._titleColor;
        title.style.fontSize = this._titleFontSize;
      }

      const content = this.shadowRoot.getElementById("content");

      if (!this._myDataBinding) {
        content.innerHTML = "No Data Binding Assigned";
        return;
      }

      if (this._myDataBinding.state !== "success") {
        content.innerHTML = "Loading Data...";
        return;
      }

      try {
        const dimension =
          this._myDataBinding.metadata.feeds.dimensions.values[0];

        const billingMeasure =
          this._myDataBinding.metadata.feeds.measures.values[0];
        const collectedMeasure =
          this._myDataBinding.metadata.feeds.measures.values[1];

        const data = this._myDataBinding.data.map((row) => ({
          name: row[dimension].label,
          billing: Number(row[billingMeasure].raw || 0),
          collected: Number(row[collectedMeasure].raw || 0),
        }));

        if (data.length === 0) {
          content.innerHTML = "No Data Found";
          return;
        }

        //const totalValue = data.reduce((sum, item) => sum + item.value, 0);

        const colors = ["#344f6d", "#f08a3c", "#d4b06a", "#9fb2c6", "#5b7c99"];

        let html = "";

        data.forEach((item, index) => {
          const percent =
            item.billing > 0
              ? ((item.collected / item.billing) * 100).toFixed(1)
              : 0;

          //const percent =
          //  totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;

          const valueCr = item.billing;

          html += `
            <div class="row">

              <div class="label">
                ${item.name}
              </div>

              <div class="bar-container">
                <div
                  class="bar"
                  style="
                    width:${percent}%;
                    background:${colors[index % colors.length]};
                  ">
                  ${percent}%
                </div>
              </div>

              <div class="value">
                ${valueCr.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })} Cr
              </div>

            </div>
          `;
        });

        content.innerHTML = html;
      } catch (e) {
        content.innerHTML = "<pre>Error: " + e.message + "</pre>";
      }
    }

    /* =========================
      PDF EXPORT
    ========================= */

    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");

      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 900;

      if (
        !this._myDataBinding ||
        this._myDataBinding.state !== "success" ||
        !this._myDataBinding.data ||
        this._myDataBinding.data.length === 0
      ) {
        canvas.width = width;
        canvas.height = 400;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, 400);

        ctx.fillStyle = "#667085";
        ctx.font = "16px Arial";

        ctx.fillText("No Data Available", 30, 80);

        return canvas.toDataURL("image/png");
      }

      const dimension = this._myDataBinding.metadata.feeds.dimensions.values[0];

      const billingMeasure =
        this._myDataBinding.metadata.feeds.measures.values[0];
      const collectedMeasure =
        this._myDataBinding.metadata.feeds.measures.values[1];

      const data = this._myDataBinding.data.map((row) => ({
        name: row[dimension].label,
        billing: Number(row[billingMeasure].raw || 0),
        collected: Number(row[collectedMeasure].raw || 0),
      }));

      const totalValue = data.reduce((s, x) => s + x.value, 0);

      const colors = ["#344f6d", "#f08a3c", "#d4b06a", "#9fb2c6", "#5b7c99"];

      const canvasHeight = Math.max(
        this.shadowRoot.host.clientHeight || this.clientHeight || 150,
        150,
      );

      canvas.width = width;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");

      /* -------------------------
        BACKGROUND
      ------------------------- */

      ctx.fillStyle = "#F4F1EB";
      ctx.fillRect(0, 0, width, canvasHeight);

      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 11;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, canvasHeight - 10, 12);

      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, canvasHeight - 10, 12);
      ctx.clip();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      /* -------------------------
        TITLE BAR
      ------------------------- */
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, canvasHeight - 10, 12);
      ctx.clip();

      ctx.fillStyle = "#1b2a41";
      ctx.fillRect(5, 5, width - 10, 45);
      ctx.restore();

      ctx.fillStyle = this._titleColor || "#FFFFFF";
      ctx.font = `bold ${parseInt(this._titleFontSize)}px Arial`;

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText((this._titleText || "").toUpperCase(), 20, 27);

      /* -------------------------
        ROWS
      ------------------------- */
      const rowHeight = 45;
      const topY = 65;
      const availableHeight = canvasHeight - topY - 10;
      const visibleRows = Math.max(1, Math.floor(availableHeight / rowHeight));

      let y = topY;

      data.slice(0, visibleRows).forEach((item, index) => {
        const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

        /* label */

        ctx.fillStyle = "#6b7d99";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // let label = item.name;
        // while (ctx.measureText(label).width > 120 && label.length > 0) {
        //   label = label.slice(0, -1);
        // }
        // if (label !== item.name) {
        //   label += "...";
        // }
        // ctx.fillText(label, 20, y + 14);

        const maxWidth = 120;

        ctx.fillStyle = "#6b7d99";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const words = item.name.split(" ");
        let line1 = "";
        let line2 = "";

        for (const word of words) {
          const testLine = line1.length === 0 ? word : line1 + " " + word;

          if (ctx.measureText(testLine).width <= maxWidth) {
            line1 = testLine;
          } else {
            line2 = line2.length === 0 ? word : line2 + " " + word;
          }
        }
        ctx.fillText(line1, 20, y + 2);
        if (line2) {
          ctx.fillText(line2, 20, y + 16);
        }

        /* progress background */

        const barX = 150;

        const barWidth = width - 250;

        ctx.fillStyle = "#e7e3df";

        ctx.beginPath();
        ctx.roundRect(barX, y, barWidth, 28, 4);
        ctx.fill();

        /* progress */

        const fillWidth = (barWidth * percent) / 100;

        ctx.fillStyle = colors[index % colors.length];

        ctx.beginPath();
        ctx.roundRect(barX, y, fillWidth, 28, 4);
        ctx.fill();

        /* percent */

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";

        ctx.fillText(percent.toFixed(1) + "%", barX + 10, y + 14);

        /* value */

        ctx.fillStyle = "#1b2a41";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
          item.value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) + " Cr",

          width - 20,

          y + 14,
        );

        y += rowHeight;
      });

      /* -------------------------
        SCROLL BAR
      ------------------------- */

      if (data.length > visibleRows) {
        const trackHeight = availableHeight;

        const trackX = width - 8;

        const trackY = topY;

        ctx.fillStyle = "#E5E7EB";

        ctx.beginPath();

        ctx.roundRect(trackX, trackY, 4, trackHeight, 2);

        ctx.fill();

        const thumbHeight = Math.max(
          30,
          (visibleRows / data.length) * trackHeight,
        );

        ctx.fillStyle = "#A0AEC0";

        ctx.beginPath();

        ctx.roundRect(trackX, trackY, 4, thumbHeight, 2);

        ctx.fill();
      }

      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  customElements.define("com-max-billing", ProgressBarWidget);
})();
