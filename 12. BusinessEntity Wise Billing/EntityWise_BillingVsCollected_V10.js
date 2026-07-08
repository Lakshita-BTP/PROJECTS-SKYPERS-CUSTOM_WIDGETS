(function () {
  class ProgressBarWidget extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      /* =========================
        Selected Row
      ========================= */
      this._selectedBusinessEntity = "";
      this._selectedBilling = 0;
      this._selectedCollected = 0;
      this._selectedPercentage = 0;
      this._selectedRowIndex = -1;

      this._titleText = "BUSINESS ENTITY BILLING VS COLLECTED";
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
            justify-content:flex-start;
            align-items:center;
            border-radius:12px 12px 0 0;
        }

        .title-text{
            color:inherit;
        }

        .title-unit{
            color:#e2c17f;
            margin-left:6px;
            text-transform:none;
        }

        .row{
            display:flex;
            align-items:center;
            margin-bottom:15px;
            cursor:pointer;
            transition:background .2s;
        }

        .row:hover{
            background:#f7f9fc;
            border-radius:6px;
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
            margin-right:14px;
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
            width:90px;              /* little wider */
            text-align:right;
            font-size:13px;
            color:#1b2a41;
            font-weight:bold;
            white-space:nowrap;      /* 944 / 946 stays on one line */
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:flex-end;
            line-height:14px;
            flex-shrink:0;
        }

        </style>

        <div class="outer">

            <div class="card">

                <div id="title" class="title">
                    <span class="title-text">${this._titleText}</span>
                    <span class="title-unit">₹ Crore</span>
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

    getSelectedBusinessEntity() {
      return this._selectedBusinessEntity;
    }

    getSelectedBilling() {
      return this._selectedBilling;
    }

    getSelectedCollected() {
      return this._selectedCollected;
    }

    getSelectedPercentage() {
      return this._selectedPercentage;
    }

    getSelectedRowIndex() {
      return this._selectedRowIndex;
    }

    fireRowClick(rowData, index) {
      const percent =
        rowData.billing > 0 ? (rowData.collected / rowData.billing) * 100 : 0;

      this._selectedBusinessEntity = rowData.name;
      this._selectedBilling = rowData.billing;
      this._selectedCollected = rowData.collected;
      this._selectedPercentage = percent;
      this._selectedRowIndex = index;

      this.dispatchEvent(
        new CustomEvent("onRowClick", {
          detail: {
            businessEntity: rowData.name,
            billing: rowData.billing,
            collected: rowData.collected,
            percentage: percent,
            rowIndex: index,
          },
        }),
      );
    }

    render() {
      const title = this.shadowRoot.getElementById("title");
      if (title) {
        title.innerHTML = `
            <span class="title-text">${this._titleText}</span>
            <span class="title-unit">₹ Crore</span>
        `;
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

        console.log(this._myDataBinding.metadata.feeds.measures.values);
        console.log(this._myDataBinding.data[0]);

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

          const valueText = `
              <span>
                ${item.billing.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })} /
                ${item.collected.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
          `;

          html += `
            <div class="row" data-index="${index}">

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
                ${valueText}
              </div>

            </div>
          `;
        });

        content.innerHTML = html;

        const rows = this.shadowRoot.querySelectorAll(".row");

        rows.forEach((row) => {
          row.addEventListener("click", () => {
            const index = Number(row.dataset.index);

            this.fireRowClick(data[index], index);
          });
        });
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

      const height =
        this.shadowRoot.host.clientHeight || this.clientHeight || 500;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      /*--------------------------------------------------
        NO DATA
      ---------------------------------------------------*/

      if (
        !this._myDataBinding ||
        this._myDataBinding.state !== "success" ||
        !this._myDataBinding.data ||
        this._myDataBinding.data.length === 0
      ) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#6b7d99";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No Data Available", width / 2, height / 2);

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

      const colors = ["#344f6d", "#f08a3c", "#d4b06a", "#9fb2c6", "#5b7c99"];

      /*--------------------------------------------------
        BACKGROUND
      ---------------------------------------------------*/

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.save();

      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 11;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "#FFFFFF";

      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);
      ctx.fill();

      ctx.restore();

      /*--------------------------------------------------
        CLIP CARD
      ---------------------------------------------------*/
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);
      ctx.clip();

      /*--------------------------------------------------
        HEADER
      ---------------------------------------------------*/
      const headerHeight = 42;
      ctx.fillStyle = "#1b2a41";
      ctx.fillRect(5, 5, width - 10, headerHeight);

      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      ctx.font = `bold ${parseInt(this._titleFontSize)}px Arial`;
      const title = (this._titleText || "").toUpperCase();

      ctx.fillStyle = this._titleColor || "#FFFFFF";
      ctx.fillText(title, 20, 5 + headerHeight / 2);

      const titleWidth = ctx.measureText(title).width;
      ctx.fillStyle = "#e2c17f";
      ctx.fillText("₹ Crore", 26 + titleWidth, 5 + headerHeight / 2);

      /*--------------------------------------------------
        CONTENT SETTINGS
      ---------------------------------------------------*/
      const startY = 62;
      const rowGap = 15;
      const barHeight = 28;
      const labelWidth = 130;
      const valueWidth = 90;
      const leftPadding = 20;
      const rightPadding = 20;
      const gap = 14;
      const barX = leftPadding + labelWidth;
      const barWidth =
        width - leftPadding - rightPadding - labelWidth - valueWidth - gap;

      let y = startY;

      /*--------------------------------------------------
        DRAW ROWS
      ---------------------------------------------------*/
      const rowHeight = Math.max(43, barHeight + rowGap);
      const visibleRows = Math.floor((height - startY - 10) / rowHeight);

      const rowsToDraw = data.slice(0, visibleRows);

      rowsToDraw.forEach((item, index) => {
        const percent =
          item.billing > 0 ? (item.collected / item.billing) * 100 : 0;

        /*------------------------------------
          LABEL
        ------------------------------------*/

        ctx.fillStyle = "#6b7d99";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const words = item.name.split(" ");

        let lines = [];
        let line = "";

        words.forEach((word) => {
          const test = line.length === 0 ? word : line + " " + word;

          if (ctx.measureText(test).width <= labelWidth - 5) {
            line = test;
          } else {
            lines.push(line);
            line = word;
          }
        });

        if (line.length) lines.push(line);

        lines = lines.slice(0, 2);

        lines.forEach((text, i) => {
          ctx.fillText(text, leftPadding, y + i * 14);
        });

        /*------------------------------------
          BAR BACKGROUND
        ------------------------------------*/

        ctx.fillStyle = "#e7e3df";

        ctx.beginPath();
        ctx.roundRect(barX, y, barWidth, barHeight, 4);
        ctx.fill();

        /*------------------------------------
          BAR FILL
        ------------------------------------*/

        const fillWidth = Math.max(
          0,
          Math.min(barWidth, (barWidth * percent) / 100),
        );

        ctx.fillStyle = colors[index % colors.length];

        ctx.beginPath();
        ctx.roundRect(barX, y, fillWidth, barHeight, 4);
        ctx.fill();

        /*------------------------------------
          PERCENT TEXT
        ------------------------------------*/

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(percent.toFixed(1) + "%", barX + 10, y + barHeight / 2);

        /*------------------------------------
          VALUE COLUMN
        ------------------------------------*/

        ctx.fillStyle = "#1b2a41";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        const valueText =
          item.billing.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) +
          " / " +
          item.collected.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });

        ctx.fillText(valueText, width - rightPadding, y + barHeight / 2);

        y += rowHeight;
      });

      /*--------------------------------------------------
        DRAW SCROLLBAR (same look as UI)
      ---------------------------------------------------*/

      if (data.length > visibleRows) {
        const contentHeight = height - startY - 15;

        const trackX = width - 10;
        const trackY = startY;

        // Track
        ctx.fillStyle = "#E5E7EB";

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, 4, contentHeight, 2);
        ctx.fill();

        // Thumb
        const thumbHeight = Math.max(
          30,
          (visibleRows / data.length) * contentHeight,
        );

        ctx.fillStyle = "#A0AEC0";

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, 4, thumbHeight, 2);
        ctx.fill();
      }

      /*--------------------------------------------------
        END CLIP
      ---------------------------------------------------*/
      ctx.restore();
      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  customElements.define("com-max-billing", ProgressBarWidget);
})();
