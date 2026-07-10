(function () {
  class SalesChannelMix extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this._title = "SALES CHANNEL MIX";

      this._rows = [];

      this._barColors = [];

      this._trackColor = "#E7E5E4";

      this._unitText = "units";

      this._selectedRow = null;
      this._selectedIndex = -1;

      this.shadowRoot.innerHTML = `

        <style>

        *{
            box-sizing:border-box;
            font-family:Arial,sans-serif;
        }

        .outer{
            width:100%;
            height:100%;
            padding:4px;
        }

        .card{
            width:100%;
            height:100%;
            background:white;
            border-radius:8px;
            overflow:hidden;
            box-shadow:0 0 10px rgba(0,0,0,.10);
            display:flex;
            flex-direction:column;
        }

        .header{
            background:#16263B;
            color:white;
            padding:12px 16px;
            font-size:13px;
            font-weight:bold;
            letter-spacing:1px;
        }

        .body{
            flex:1;
            overflow-y:auto;
            padding:12px 16px;
        }

        .row{
            margin-bottom:16px;
            cursor:pointer;
            padding:8px;
            border-radius:6px;
            transition:background-color .2s ease;
        }

        .row:hover{
            background:#F8FAFC;
        }

        .row:active{
            transform:scale(0.99);
        }

        .row-header{
            display:flex;
            justify-content:space-between;
            margin-bottom:4px;
        }

        .name{
            font-size:12px;
            font-weight:600;
            color:#16263B;
        }

        .percent{
            font-size:12px;
            font-weight:bold;
            color:#F97316;
        }

        .track{
            width:100%;
            height:8px;
            background:#E7E5E4;
            border-radius:20px;
            overflow:hidden;
        }

        .bar{
            height:100%;
            border-radius:20px;
            background:#F97316;
        }

        .footer{
            margin-top:4px;
            font-size:10px;
            color:#7D8CA3;
        }

        .name,
        .percent,
        .track,
        .footer{
            cursor:pointer;
        }

        </style>

        <div class="outer">

            <div class="card">

                <div id="header" class="header"></div>

                <div id="body" class="body"></div>

            </div>

        </div>
        `;
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot.getElementById("header").innerHTML = this._title;

      const body = this.shadowRoot.getElementById("body");

      let html = "";

      this._rows.forEach((row, index) => {
        html += `

            <div
                class="row"
                data-index="${index}">

                <div class="row-header">

                    <div class="name">
                        ${row.name}
                    </div>

                    <div class="percent">
                        ${Number(row.percent).toFixed(2)}%
                    </div>

                </div>

                <div
                    class="track"
                    style="
                        background:${this._trackColor};
                    ">

                    <div
                        class="bar"
                        style="
                            width:${row.percent}%;
                            background:${this._barColors[index] || "#F97316"};
                        ">
                    </div>

                </div>

                <div class="footer">
                    ${Number(row.units).toLocaleString()}
                    ${this._unitText} -
                    ₹${Number(row.amount).toLocaleString()}
                    Cr
                </div>

            </div>
            `;
      });

      body.innerHTML = html;

      body.querySelectorAll(".row").forEach((row) => {
        row.addEventListener("click", () => {
          const index = Number(row.dataset.index);
          this.fireRowClick(index);
        });
      });
    }

    // ==========================
    // METHODS
    // ==========================
    setTitle(value) {
      this._title = value;
      this.render();
    }
    clearRows() {
      this._rows = [];
      this.render();
    }
    setRow(value) {
      const parts = value.split("|");
      const index = Number(parts[0]);
      this._rows[index] = {
        name: parts[1],
        percent: Number(parts[2]),
        units: Number(parts[3].replace(/,/g, "")),
        amount: Number(parts[4]),
      };
      this.render();
    }

    setBarColor(value) {
      const parts = value.split("|");
      const index = Number(parts[0]);
      this._barColors[index] = parts[1];
      this.render();
    }

    setTrackColor(value) {
      this._trackColor = value;

      this.render();
    }

    setUnitText(value) {
      this._unitText = value;

      this.render();
    }

    fireRowClick(index) {
      this._selectedIndex = index;
      this._selectedRow = this._rows[index];

      this.dispatchEvent(
        new CustomEvent("onRowClick", {
          detail: this._selectedRow,
        }),
      );
    }

    getSelectedRow() {
      return JSON.stringify(this._selectedRow);
    }

    getSelectedName() {
      return this._selectedRow ? this._selectedRow.name : "";
    }

    getSelectedPercent() {
      return this._selectedRow ? this._selectedRow.percent : 0;
    }

    getSelectedUnits() {
      return this._selectedRow ? this._selectedRow.units : 0;
    }

    getSelectedAmount() {
      return this._selectedRow ? this._selectedRow.amount : 0;
    }

    getSelectedIndex() {
      return this._selectedIndex;
    }

    /* =========================
      PDF EXPORT
    ========================= */
    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");
      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 900;
      const height =
        this.shadowRoot.host.clientHeight || this.clientHeight || 500;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      /* -------------------------
        BACKGROUND
      ------------------------- */
      ctx.fillStyle = "#F4F1EB";
      ctx.fillRect(0, 0, width, height);
      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "#FFFFFF";

      ctx.beginPath();
      ctx.roundRect(4, 4, width - 8, height - 8, 8);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      /* -------------------------
        HEADER
      ------------------------- */
      const headerHeight = 42;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(4, 4, width - 8, height - 8, 8);
      ctx.clip();

      ctx.fillStyle = "#16263B";
      ctx.fillRect(4, 4, width - 8, headerHeight);

      ctx.restore();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText(
        this._title || "SALES CHANNEL MIX",
        18,
        4 + headerHeight / 2,
      );

      /* -------------------------
        NO DATA
      ------------------------- */
      if (!this._rows || this._rows.length === 0) {
        return canvas.toDataURL("image/png");
      }

      /* -------------------------
        ROWS AREA
      ------------------------- */
      const startY = headerHeight + 8;
      const bodyHeight = height - startY - 20;
      const totalRows = this._rows.length;
      const visibleRows = this._rows;

      const rowSpacing = bodyHeight / Math.max(visibleRows.length, 1);

      visibleRows.forEach((row, index) => {
        const y = startY + index * rowSpacing + 15;

        /* Name */
        ctx.fillStyle = "#16263B";
        ctx.font = "600 12px Arial";
        ctx.textAlign = "left";

        ctx.fillText(row.name, 18, y);

        /* Percentage */
        const percentText = Number(row.percent).toFixed(2) + "%";

        ctx.fillStyle = "#F97316";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "right";

        ctx.fillText(percentText, width - 18, y);

        /* Track */
        const trackY = y + 10;
        const trackX = 18;
        const trackWidth = width - 36;
        const trackHeight = 8;

        ctx.fillStyle = this._trackColor;

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, trackWidth, trackHeight, 20);
        ctx.fill();

        /* Bar */
        const barWidth =
          (Math.max(0, Math.min(100, row.percent)) / 100) * trackWidth;
        ctx.fillStyle = this._barColors[index] || "#F97316";

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, barWidth, trackHeight, 20);
        ctx.fill();

        /* Footer */

        ctx.fillStyle = "#7D8CA3";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";

        const footerText = `${Number(row.units).toLocaleString()} ${this._unitText} - ₹${Number(row.amount).toLocaleString()} Cr`;

        ctx.fillText(footerText, 15, trackY + 25);
      });

      /* -------------------------
        SCROLLBAR
      ------------------------- */
      // if (this._rows.length > availableRows) {
      //   const trackWidth = width - 40;
      //   const trackY = height - 16;
      //   ctx.fillStyle = "#E5E7EB";

      //   ctx.beginPath();
      //   ctx.roundRect(20, trackY, trackWidth, 6, 3);
      //   ctx.fill();

      //   const thumbWidth = Math.max(
      //     40,
      //     (availableRows / this._rows.length) * trackWidth,
      //   );
      //   ctx.fillStyle = "#A0AEC0";

      //   ctx.beginPath();
      //   ctx.roundRect(20, trackY, thumbWidth, 6, 3);
      //   ctx.fill();
      // }
      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  if (!customElements.get("com-max-saleschannelmix")) {
    customElements.define("com-max-saleschannelmix", SalesChannelMix);
  }
})();
