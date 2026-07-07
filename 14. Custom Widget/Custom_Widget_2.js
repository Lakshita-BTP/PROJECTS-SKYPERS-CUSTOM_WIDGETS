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

      this.render();
    }

    connectedCallback() {
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
        padding:12px 18px;
        font-size:13px;
        font-weight:700;
        letter-spacing:1px;
      }

      .body{
        flex:1;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:18px;
      }

      .main-value{
        font-size:50px;
        font-weight:780;
        color:#1F3552;
        line-height:1;
        text-align:center;

        margin-top:-75px;
      }

      .crore-value{
        font-size:26px;
        font-weight:800;
        color:#F97316;
        margin-top:-10px;
        text-align:center;
      }

      .sub-title{
        margin-top:80px;
        font-size:11px;
        font-weight:700;
        color:#8C99AB;
        letter-spacing:2px;
        text-transform:uppercase;
        text-align:center;
      }

      .avg-box{
        width:100%;
        margin-top:18px;
        background:#ECE8E8;
        border-radius:6px;
        padding:10px 12px;
        text-align:center;
      }

      .avg-label{
        font-size:12px;
        color:#7D8CA3;
        margin-bottom:2px;
      }

      .avg-value{
        font-size:18px;
        font-weight:800;
        color:#16263B;
      }

      .avg-unit{
        font-size:12px;
        font-weight:600;
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

            <div class="crore-value tusp-section">
              ${this._croreValue}
            </div>

            <div class="sub-title">
              ${this._subTitle}
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
      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 800;
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

      ctx.fillText(this._title, 18, 4 + headerHeight / 2);

      /* -------------------------
        BODY
      ------------------------- */
      const bodyTop = headerHeight + 18;
      const centerX = width / 2;

      /* -------------------------
        MAIN VALUE
      ------------------------- */
      ctx.textAlign = "center";
      ctx.fillStyle = "#1F3552";
      ctx.font = "800 54px Arial";

      ctx.fillText(
        "₹" + this.formatNumber(this._mainValue),
        centerX,
        bodyTop + 70 - 30,
      );

      /* -------------------------
        CRORE VALUE
      ------------------------- */
      ctx.fillStyle = "#F97316";
      ctx.font = "800 26px Arial";
      ctx.fillText(this._croreValue, centerX, bodyTop + 110 - 30);

      /* -------------------------
        SUB TITLE
      ------------------------- */
      ctx.fillStyle = "#8C99AB";
      ctx.font = "bold 11px Arial";
      ctx.fillText(this._subTitle, centerX, bodyTop + 145 - 30);

      /* -------------------------
        AVG BOX
      ------------------------- */
      const boxWidth = width - 24;
      const boxHeight = 70;
      const boxX = 12;
      const boxY = height - boxHeight - 25;

      ctx.fillStyle = "#ECE8E8";
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
      ctx.fill();

      /* Avg Label */
      ctx.fillStyle = "#7D8CA3";
      ctx.font = "12px Arial";
      ctx.fillText("Avg Sales Price", centerX, boxY + 24);

      /* Avg Value */
      const avgValue = this.formatNumber(this._avgSalesPrice);
      ctx.font = "bold 18px Arial";
      const valueWidth = ctx.measureText(avgValue).width;
      ctx.fillStyle = "#16263B";
      ctx.fillText(
        avgValue,
        centerX - ctx.measureText(this._avgUnit).width / 2,
        boxY + 50,
      );

      /* Avg Unit */
      ctx.fillStyle = "#7D8CA3";
      ctx.font = "600 12px Arial";
      ctx.fillText(this._avgUnit, centerX + valueWidth / 2 + 15, boxY + 50);
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
