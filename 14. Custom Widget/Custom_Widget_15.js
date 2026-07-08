(function () {
  class CustomWidget extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      /* =========================
         HEADER
      ========================= */
      this._title = "TUSP VALUE WITHOUT TAX";

      /* =========================
         MAIN VALUES
      ========================= */
      this._mainValue = "₹12,244";
      this._croreValue = ".81 Crore";

      /* =========================
         SUB TITLE
      ========================= */
      this._subTitle = "TOTAL UNIT SALE PRICE (W/O TAX)";

      /* =========================
         AVG SALES PRICE
      ========================= */
      this._avgSalesPrice = "₹19,134.73";
      this._avgUnit = "per sq ft";

      this._myDataBinding = null;

      this.render();
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(dataBinding) {
      this._myDataBinding = dataBinding;
      this.render();
    }

    /* =========================
       METHODS
    ========================= */

    setTitle(title) {
      this._title = title;
      this.render();
    }

    setTuspValue(mainValue, croreValue) {
      this._mainValue = mainValue;
      this._croreValue = croreValue;
      this.render();
    }

    setAvgSalesPrice(value, unit) {
      this._avgSalesPrice = value;
      this._avgUnit = unit;
      this.render();
    }

    formatNumber(value) {
      const num = parseFloat(
        String(value).replace(/₹/g, "").replace(/,/g, "").trim(),
      );

      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    }

    /* =========================
        EVENTS
      ========================= */

    fireTuspSelect() {
      this.dispatchEvent(
        new CustomEvent("onTuspSelect", {
          detail: {
            mainValue: this._mainValue,
            croreValue: this._croreValue,
          },
        }),
      );
    }

    fireAvgSalesPriceSelect() {
      this.dispatchEvent(
        new CustomEvent("onAvgSalesPriceSelect", {
          detail: {
            avgSalesPrice: this._avgSalesPrice,
            unit: this._avgUnit,
          },
        }),
      );
    }

    render() {
      // =========================
      // DATA BINDING
      // =========================

      let bucket0_30 = 0;
      let bucket31_60 = 0;
      let bucket61_90 = 0;
      let bucket90Plus = 0;

      if (this._myDataBinding && this._myDataBinding.state === "success") {
        const dimensionKey =
          this._myDataBinding.metadata.feeds.dimensions.values[0];

        const measureKey =
          this._myDataBinding.metadata.feeds.measures.values[0];

        const rows = this._myDataBinding.data;

        const today = new Date();

        rows.forEach((row) => {
          const orderDate = new Date(row[dimensionKey].id);

          const value = Number(row[measureKey].raw || 0);

          const age = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

          if (age <= 30) bucket0_30 += value;
          else if (age <= 60) bucket31_60 += value;
          else if (age <= 90) bucket61_90 += value;
          else bucket90Plus += value;
        });

        this._bucket0_30 = bucket0_30;
        this._bucket31_60 = bucket31_60;
        this._bucket61_90 = bucket61_90;
        this._bucket90Plus = bucket90Plus;

      }

      // =========================
      // DATA BINDING
      // =========================
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
          background:#FFFFFF;
          border-radius:8px;
          overflow:hidden;
          box-shadow:0 0 10px rgba(0,0,0,.10);

          display:flex;
          flex-direction:column;
      }

      .header{
        background:#16263B;
        color:#FFFFFF;
        padding:2%;
        font-size:clamp(10px,1.5vw,13px);
        font-weight:700;
        letter-spacing:1px;
      }

      .body{
          flex:1;
          display:flex;
          flex-direction:column;
          justify-content:space-evenly;
          padding:1.5%;
          overflow:hidden;
      }

      .main-value{
        font-size:clamp(24px,6vw,50px);
        font-weight:800;
        color:#1F3552;
        line-height:1;
        margin-top:0;
        text-align:center;
      }

      .sub-title{
        margin-top:1%;
        font-size:clamp(8px,1.2vw,11px);
        font-weight:700;
        color:#8C99AB;
        letter-spacing:1px;
        text-transform:uppercase;
        text-align:center;
      }

      .avg-box{
        width:100%;
        margin-top:1%;
        background:#ECE8E8;
        border-radius:6px;
        padding:2%;  
        text-align:center;
      }

      .avg-label{
        font-size:clamp(9px,1.3vw,12px);
        color:#7D8CA3;
        margin-bottom:2px;
      }

      .avg-value{
        font-size:clamp(12px,2vw,18px);
        font-weight:800;
        color:#16263B;
      }

      .avg-unit{
        font-size:clamp(8px,1.2vw,12px);
        font-weight:600;
        color:#7D8CA3;
      }

      .bucket-container{
          width:100%;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:1%;
          margin:1% 0;
      }

      .bucket{
          background:#F7F7F7;
          border:1px solid #E4E7EC;
          border-radius:6px;
          padding:4%;
          text-align:center;
          min-height:0;

          display:flex;
          flex-direction:column;
          justify-content:center;
      }

      .bucket-value{
          font-size:clamp(10px,2vw,16px);
          font-weight:700;
          color:#16263B;
          line-height:1.1;
      }

      .bucket-label{
          font-size:clamp(8px,1vw,10px);
          margin-top:2px;
          color:#7D8CA3;
      }

      </style>

      <div class="outer">

        <div class="card">

          <div class="header">
            ${this._title}
          </div>

          <div class="body">

            <div class="main-value tusp-section">
              ₹${this.formatNumber(this._mainValue)}
            </div>

            <div class="sub-title">
              ${this._subTitle}
            </div>

            <div class="bucket-container">
              <div class="bucket">
                  <div class="bucket-value">
                      ${this.formatNumber(bucket0_30)}
                  </div>
                  <div class="bucket-label">0-30</div>
              </div>
              <div class="bucket">
                  <div class="bucket-value">
                      ${this.formatNumber(bucket31_60)}
                  </div>
                  <div class="bucket-label">31-60</div>
              </div>
              <div class="bucket">
                  <div class="bucket-value">
                      ${this.formatNumber(bucket61_90)}
                  </div>
                  <div class="bucket-label">61-90</div>
              </div>
              <div class="bucket">
                  <div class="bucket-value">
                      ${this.formatNumber(bucket90Plus)}
                  </div>
                  <div class="bucket-label">Above 90</div>
              </div>
            </div>

            <div class="avg-box avg-section">

              <div class="avg-label">
                Avg Sales Price
              </div>

              <div>
                <span class="avg-value">
                  ${this.formatNumber(this._avgSalesPrice)}
                </span>

                <span class="avg-unit">
                  ${this._avgUnit}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
      `;

      const tuspSections = this.shadowRoot.querySelectorAll(".tusp-section");

      tuspSections.forEach((el) => {
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          this.fireTuspSelect();
        });
      });

      const avgSection = this.shadowRoot.querySelector(".avg-section");

      if (avgSection) {
        avgSection.style.cursor = "pointer";

        avgSection.addEventListener("click", () => {
          this.fireAvgSalesPriceSelect();
        });
      }
    }

    /* =========================
      PDF EXPORT
    ========================= */
    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");

      const width = this.clientWidth || 800;
      const height = this.clientHeight || 500;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      /*----------------------------------
          Sizes (Responsive)
      -----------------------------------*/
      const headerH = height * 0.12;
      const outerPad = width * 0.02;
      const bodyTop = headerH + height * 0.02;
      const titleFont = Math.max(10, width * 0.028);
      const mainFont = Math.max(24, Math.min(width * 0.11, height * 0.14));
      const subFont = Math.max(8, width * 0.022);
      const bucketValueFont = Math.max(10, width * 0.03);
      const bucketLabelFont = Math.max(8, width * 0.018);
      const avgLabelFont = Math.max(9, width * 0.022);
      const avgValueFont = Math.max(12, width * 0.04);

      /*----------------------------------
          Background
      -----------------------------------*/
      ctx.fillStyle = "#F5F5F5";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#FFFFFF";

      ctx.beginPath();
      ctx.roundRect( outerPad, outerPad, width - outerPad * 2, height - outerPad * 2, 8, );
      ctx.fill();

      /*----------------------------------
          Header
      -----------------------------------*/
      ctx.fillStyle = "#16263B";
      ctx.beginPath();
      ctx.roundRect(outerPad, outerPad, width - outerPad * 2, headerH, 8);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${titleFont}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText(this._title, outerPad + 12, outerPad + headerH / 2);

      /*----------------------------------
          Main Value
      -----------------------------------*/
      let y = bodyTop + height * 0.08;

      ctx.fillStyle = "#1F3552";
      ctx.font = `bold ${mainFont}px Arial`;
      ctx.textAlign = "center";

      ctx.fillText("₹" + this.formatNumber(this._mainValue), width / 2, y);

      /*----------------------------------
          Subtitle
      -----------------------------------*/
      y += height * 0.09;

      ctx.fillStyle = "#8C99AB";
      ctx.font = `bold ${subFont}px Arial`;

      ctx.fillText(this._subTitle, width / 2, y);

      /*----------------------------------
          Buckets
      -----------------------------------*/
      const gap = width * 0.015;
      const boxW = (width - outerPad * 2 - gap) / 2;
      const boxH = height * 0.13;
      const startY = y + height * 0.04;
      const buckets = [
        [this.formatNumber(bucket0_30), "0-30"],
        [this.formatNumber(bucket31_60), "31-60"],
        [this.formatNumber(bucket61_90), "61-90"],
        [this.formatNumber(bucket90Plus), "Above 90"],
      ];

      buckets.forEach((b, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = outerPad + col * (boxW + gap);
        const yy = startY + row * (boxH + gap);
        ctx.fillStyle = "#F7F7F7";
        ctx.beginPath();
        ctx.roundRect(x, yy, boxW, boxH, 6);
        ctx.fill();

        ctx.fillStyle = "#16263B";
        ctx.font = `bold ${bucketValueFont}px Arial`;

        ctx.fillText(b[0], x + boxW / 2, yy + boxH * 0.45);

        ctx.fillStyle = "#7D8CA3";
        ctx.font = `${bucketLabelFont}px Arial`;

        ctx.fillText(b[1], x + boxW / 2, yy + boxH * 0.78);
      });

      /*----------------------------------
          Avg Box
      -----------------------------------*/
      const avgY = startY + boxH * 2 + gap * 3;
      const avgH = height * 0.18;
      ctx.fillStyle = "#ECE8E8";
      ctx.beginPath();
      ctx.roundRect(outerPad, avgY, width - outerPad * 2, avgH, 6);
      ctx.fill();

      ctx.fillStyle = "#7D8CA3";
      ctx.font = `${avgLabelFont}px Arial`;

      ctx.fillText("Avg Sales Price", width / 2, avgY + avgH * 0.35);

      ctx.fillStyle = "#16263B";
      ctx.font = `bold ${avgValueFont}px Arial`;

      ctx.fillText(
        this.formatNumber(this._avgSalesPrice) + " " + this._avgUnit,
        width / 2,
        avgY + avgH * 0.72,
      );

      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  if (!customElements.get("com-max-custom")) {
    customElements.define("com-max-custom", CustomWidget);
  }
})();
