(function () {
  class BrokerageDetails extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      /* =========================
         HEADER
      ========================= */
      this._title = "BROKERAGE DETAILS";
      this._titleColor = "#FFFFFF";
      this._titleFontSize = "14px";

      /* =========================
         KPI COLORS
      ========================= */
      this._valueColor = "#F97316";
      this._labelColor = "#6B7280";

      /* =========================
         DATA VALUES
      ========================= */
      this._paid = 193.19;
      this._due = 190.53;

      /* =========================
         BOTTOM SECTION
      ========================= */
      this._bottomLabel = "INTEREST BALANCE";
      this._bottomValue = 10.65;
      this._bottomValueColor = "#111827";

      this._headerBg = "#15263A";

      this.render();
    }

    connectedCallback() {
      this.render();
    }

    /* =========================
       METHODS
    ========================= */

    setTitle(value) {
      this._title = value;
      this.render();
    }

    setTitleStyle(color, fontSize) {
      this._titleColor = color;
      this._titleFontSize = fontSize;
      this.render();
    }

    setValueStyle(color) {
      this._valueColor = color;
      this.render();
    }

    setLabelStyle(color) {
      this._labelColor = color;
      this.render();
    }

    setValues(paid, due) {
      this._paid = Number(paid);
      this._due = Number(due);
      this.render();
    }

    setInterestBalance(value) {
      this._bottomValue = Number(value);
      this.render();
    }

    setBottomSection(label, value, valueColor) {
      this._bottomLabel = label;
      this._bottomValue = Number(value);
      this._bottomValueColor = valueColor;
      this.render();
    }

    /* =========================
       FORMAT
    ========================= */
    formatCr(value) {
      value = Number(value || 0);
      return "₹" + value.toFixed(2) + " Cr";
    }

    /* =========================
       Events
    ========================= */
    fireBrokeragePaidSelect() {
      this.dispatchEvent(
        new CustomEvent("onBrokeragePaidSelect", {
          detail: {
            paid: this._paid,
          },
        }),
      );
    }

    fireBrokerageDueSelect() {
      this.dispatchEvent(
        new CustomEvent("onBrokerageDueSelect", {
          detail: {
            due: this._due,
          },
        }),
      );
    }

    fireInterestBalanceSelect() {
      this.dispatchEvent(
        new CustomEvent("onInterestBalanceSelect", {
          detail: {
            interestBalance: this._bottomValue,
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
          background:white;
          border-radius:8px;
          overflow:hidden;
          box-shadow:0 0 10px rgba(0,0,0,.10);
          display:flex;
          flex-direction:column;
      }

      .header{
        background:${this._headerBg};
        color:${this._titleColor};
        padding:12px 14px;
        font-size:${this._titleFontSize};
        font-weight:700;
        letter-spacing:0.5px;
      }

      .body{
        flex:1;
        display:flex;
        flex-direction:column;
        padding:14px;
        gap:14px;
      }

      .top{
        display:flex;
        justify-content:space-between;
        align-items:center;
      }

      .kpi{
        width:48%;
        text-align:center;
      }

      .value{
        font-size:18px;
        font-weight:800;
        color:${this._valueColor};
      }

      .label{
        font-size:11px;
        font-weight:700;
        color:${this._labelColor};
        margin-top:4px;
        letter-spacing:0.5px;
      }

      .divider{
        width:1px;
        background:#E5E7EB;
        height:50px;
      }

      .bottom{
        background:#F8F8F8;
        padding:12px;
        border-radius:8px;
        display:flex;
        justify-content:space-between;
        align-items:center;
      }

      .bottom-label{
        font-size:11px;
        font-weight:700;
        color:${this._labelColor};
        text-transform:uppercase;
      }

      .bottom-value{
        font-size:16px;
        font-weight:800;
        color:${this._bottomValueColor};
      }

      </style>

      <div class="outer">
          <div class="card">

            <div class="header">
              ${this._title}
            </div>

            <div class="body">

              <div class="top">

                <div class="kpi brokerage-paid">
                  <div class="value">${this.formatCr(this._paid)}</div>
                  <div class="label">BROKERAGE PAID</div>
                </div>

                <div class="divider"></div>

                <div class="kpi brokerage-due">
                  <div class="value">${this.formatCr(this._due)}</div>
                  <div class="label">BROKERAGE DUE</div>
                </div>

              </div>

              <div class="bottom interest-balance">

                <div class="bottom-label">
                  ${this._bottomLabel}
                </div>

                <div class="bottom-value">
                  ${this.formatCr(this._bottomValue)}
                </div>

              </div>

            </div>

          </div>
      </div>
      `;

      const paidSection = this.shadowRoot.querySelector(".brokerage-paid");

      if (paidSection) {
        paidSection.style.cursor = "pointer";

        paidSection.addEventListener("click", () => {
          this.fireBrokeragePaidSelect();
        });
      }

      const dueSection = this.shadowRoot.querySelector(".brokerage-due");

      if (dueSection) {
        dueSection.style.cursor = "pointer";

        dueSection.addEventListener("click", () => {
          this.fireBrokerageDueSelect();
        });
      }

      const interestSection =
        this.shadowRoot.querySelector(".interest-balance");

      if (interestSection) {
        interestSection.style.cursor = "pointer";

        interestSection.addEventListener("click", () => {
          this.fireInterestBalanceSelect();
        });
      }
    }

    /* =========================
      PDF EXPORT
    ========================= */
    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");
      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 700;
      const height =
        this.shadowRoot.host.clientHeight || this.clientHeight || 300;

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

      ctx.fillStyle = this._headerBg;
      ctx.fillRect(4, 4, width - 8, headerHeight);

      ctx.restore();

      ctx.fillStyle = this._titleColor;
      ctx.font = `bold ${parseInt(this._titleFontSize || "14")}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      ctx.fillText(this._title, 18, 4 + headerHeight / 2);

      /* -------------------------
        BODY
      ------------------------- */
      const bodyTop = headerHeight + 18;
      const bodyHeight = height - bodyTop - 15;
      const centerY = bodyTop + bodyHeight * 0.35;
      const leftCenter = width * 0.25;
      const rightCenter = width * 0.75;

      /* -------------------------
        LEFT KPI
      ------------------------- */
      ctx.textAlign = "center";
      ctx.fillStyle = this._valueColor;
      ctx.font = "bold 18px Arial";
      ctx.fillText(this.formatCr(this._paid), leftCenter, centerY - 20);
      ctx.fillStyle = this._labelColor;
      ctx.font = "bold 11px Arial";
      ctx.fillText("BROKERAGE PAID", leftCenter, centerY);

      /* -------------------------
        DIVIDER
      ------------------------- */
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, centerY - 45);
      ctx.lineTo(width / 2, centerY + 5);
      ctx.stroke();

      /* -------------------------
        RIGHT KPI
      ------------------------- */
      ctx.fillStyle = this._valueColor;
      ctx.font = "bold 18px Arial";
      ctx.fillText(this.formatCr(this._due), rightCenter, centerY - 20);
      ctx.fillStyle = this._labelColor;
      ctx.font = "bold 11px Arial";
      ctx.fillText("BROKERAGE DUE", rightCenter, centerY);

      /* -------------------------
        BOTTOM CARD
      ------------------------- */
      const bottomX = 18;
      const bottomWidth = width - 36;
      const bottomHeight = 52;
      const bottomY = height - bottomHeight - 18;
      ctx.fillStyle = "#F8F8F8";

      ctx.beginPath();
      ctx.roundRect(bottomX, bottomY, bottomWidth, bottomHeight, 8);
      ctx.fill();

      /* Bottom Label */
      ctx.textAlign = "left";
      ctx.fillStyle = this._labelColor;
      ctx.font = "bold 13px Arial";
      ctx.fillText(this._bottomLabel, bottomX + 12, bottomY + 30);

      /* Bottom Value */
      ctx.textAlign = "right";
      ctx.fillStyle = this._bottomValueColor;
      ctx.font = "bold 16px Arial";

      ctx.fillText(
        this.formatCr(this._bottomValue),
        bottomX + bottomWidth - 12,
        bottomY + 30,
      );
      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  customElements.define("com-max-brokeragedetails", BrokerageDetails);
})();
