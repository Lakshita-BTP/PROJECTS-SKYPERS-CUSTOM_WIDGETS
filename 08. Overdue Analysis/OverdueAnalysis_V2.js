(function () {
  class OverdueAnalysis extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      /* =========================
         TITLE
      ========================= */
      this._title = "OVERDUE ANALYSIS";
      this._titleColor = "#FFFFFF";

      this._headerBackground = "#1B2A41";
      this._cardBackground = "#FFFFFF";

      /* =========================
         KPI TEXTS
      ========================= */
      this._totalDueText = "TOTAL DUE";
      this._unclearedText = "UNCLEARED VALUE";
      this._gt30Text = ">30 DAYS";
      this._gt60Text = ">60 DAYS";

      /* =========================
         KPI TEXT COLORS
      ========================= */
      this._totalDueTextColor = "#667085";
      this._unclearedTextColor = "#667085";
      this._gt30TextColor = "#667085";
      this._gt60TextColor = "#667085";

      /* =========================
         KPI VALUE COLORS
      ========================= */
      this._totalDueValueColor = "#0F172A";
      this._unclearedValueColor = "#0F172A";
      this._gt30ValueColor = "#0F172A";
      this._gt60ValueColor = "#0F172A";

      /* =========================
         VALUES
      ========================= */
      this._unclearedValue = 0;

      /* =========================
         LABELS
      ========================= */
      this._labelColor = "#667085";
      this._barLabels = {};

      /* =========================
         BAR COLORS
      ========================= */
      this._barColors = ["#2EBE69", "#C5A04A", "#E26A00", "#D84335", "#9E1B1B"];

      /* =========================
         FORMATTING
      ========================= */
      this._decimalPlaces = 2;
      this._currencyUnit = "Cr";

      /* =========================
        EVENTS
      ========================= */
      this._selectedLabel = "";
      this._selectedValue = 0;

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
          background:${this._cardBackground};
          border-radius:12px;
          box-shadow:0 0 11px rgba(0,0,0,0.10);
          overflow:hidden;
          display:flex;
          flex-direction:column;
          font-family:Arial,sans-serif;
      }

      .title{
          background:${this._headerBackground};
          color:${this._titleColor};
          font-size:15px;
          font-weight:bold;
          padding:12px 15px;
          text-transform:uppercase;
          letter-spacing:0.5px;
      }

      .container{
          flex:1;
          overflow-y:auto;
          padding:15px;
          box-sizing:border-box;
      }

      .kpi-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
          margin-bottom:6px;
      }

      .kpi-card{
          display:flex;
          flex-direction:column;
          justify-content:center;
          gap:0;
          background:#F8FAFC;
          border:1px solid #E5E7EB;
          border-radius:10px;
          padding:4px 8px;
          text-align:center;
      }

      .kpi-value{
          font-size:18px;
          font-weight:700;
          line-height:1;
          margin:0;
          padding:0;
      }

      .kpi-label{
          font-size:11px;
          font-weight:600;
          line-height:1;
          margin:0;
          padding:0;
          text-transform:uppercase;
      }

      .row{
          margin-bottom:18px;
      }

      .row:first-of-type{
          margin-top: 50px;
      }

      .label-row{
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:6px;
      }

      .label{
          font-size:12px;
          font-weight:700;
          text-transform:uppercase;
          color:${this._labelColor};
      }

      .value{
          font-size:13px;
          font-weight:700;
          color:#0F172A;
      }

      .bar-container{
          width:100%;
          height:18px;
          background:#E5E7EB;
          border-radius:10px;
          overflow:hidden;
      }

      .bar{
          height:100%;
          border-radius:10px;
          transition:width .3s ease;
      }

      .empty{
          display:flex;
          align-items:center;
          justify-content:center;
          height:100%;
          color:#667085;
          font-size:14px;
      }
          

      </style>

      <div class="outer">

        <div class="card">

          <div id="title" class="title">
            ${this._title}
          </div>

          <div id="content" class="container">

            <div class="empty">
              Waiting For Data Binding...
            </div>

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

    /* =========================
    TITLE
    ========================= */

    setTitle(value) {
      this._title = value;
      this.render();
    }

    setTitleColor(value) {
      this._titleColor = value;
      this.render();
    }

    setHeaderBackground(value) {
      this._headerBackground = value;
      this.render();
    }

    setCardBackground(value) {
      this._cardBackground = value;
      this.render();
    }

    /* =========================
    TOTAL DUE
    ========================= */

    setTotalDueText(value) {
      this._totalDueText = value;
      this.render();
    }

    setTotalDueTextColor(value) {
      this._totalDueTextColor = value;
      this.render();
    }

    setTotalDueValueColor(value) {
      this._totalDueValueColor = value;
      this.render();
    }

    /* =========================
    UNCLEARED
    ========================= */

    setUnclearedText(value) {
      this._unclearedText = value;
      this.render();
    }

    setUnclearedTextColor(value) {
      this._unclearedTextColor = value;
      this.render();
    }

    setUnclearedValueColor(value) {
      this._unclearedValueColor = value;
      this.render();
    }

    setUnclearedValue(value) {
      this._unclearedValue = Number(value) || 0;
      this.render();
    }

    /* =========================
    GT30
    ========================= */

    setGT30Text(value) {
      this._gt30Text = value;
      this.render();
    }

    setGT30TextColor(value) {
      this._gt30TextColor = value;
      this.render();
    }

    setGT30ValueColor(value) {
      this._gt30ValueColor = value;
      this.render();
    }

    /* =========================
    GT60
    ========================= */

    setGT60Text(value) {
      this._gt60Text = value;
      this.render();
    }

    setGT60TextColor(value) {
      this._gt60TextColor = value;
      this.render();
    }

    setGT60ValueColor(value) {
      this._gt60ValueColor = value;
      this.render();
    }

    /* =========================
    LABELS
    ========================= */

    setLabelColor(value) {
      this._labelColor = value;
      this.render();
    }

    setBarLabel(index, value) {
      this._barLabels[index] = value;
      this.render();
    }

    /* =========================
    BAR COLORS
    ========================= */

    setBarColor(index, color) {
      index = Number(index);

      if (index >= 0) {
        this._barColors[index] = color;
        this.render();
      }
    }

    /* =========================
    FORMATTING
    ========================= */
    setDecimalPlaces(value) {
      this._decimalPlaces = Number(value);
      this.render();
    }

    setCurrencyUnit(value) {
      this._currencyUnit = value;
      this.render();
    }

    /* =========================
    EVENTS
    ========================= */
    getSelectedLabel() {
      return this._selectedLabel;
    }
    getSelectedValue() {
      return this._selectedValue;
    }

    fireTotalDueClick(value) {
      this._selectedLabel = this._totalDueText;
      this._selectedValue = value;

      this.dispatchEvent(new Event("onTotalDueClick"));
    }

    fireUnclearedClick(value) {
      this._selectedLabel = this._unclearedText;
      this._selectedValue = value;

      this.dispatchEvent(new Event("onUnclearedClick"));
    }

    fireGT30Click(value) {
      this._selectedLabel = this._gt30Text;
      this._selectedValue = value;

      this.dispatchEvent(new Event("onGT30Click"));
    }

    fireGT60Click(value) {
      this._selectedLabel = this._gt60Text;
      this._selectedValue = value;

      this.dispatchEvent(new Event("onGT60Click"));
    }

    fireBarClick(label, value) {
      this._selectedLabel = label;
      this._selectedValue = value;

      this.dispatchEvent(new Event("onBarClick"));
    } ///////=========EVENTS METHODS END HERE======================

    formatValue(value) {
      value = Number(value) || 0;

      if (this._currencyUnit === "Cr") {
        return (
          "₹" +
          value.toLocaleString(undefined, {
            minimumFractionDigits: this._decimalPlaces,
            maximumFractionDigits: this._decimalPlaces,
          }) +
          " Cr"
        );
      }

      if (this._currencyUnit === "Lakh") {
        return (
          "₹" +
          value.toLocaleString(undefined, {
            minimumFractionDigits: this._decimalPlaces,
            maximumFractionDigits: this._decimalPlaces,
          }) +
          " Lakh"
        );
      }

      return (
        "₹" +
        value.toLocaleString(undefined, {
          minimumFractionDigits: this._decimalPlaces,
          maximumFractionDigits: this._decimalPlaces,
        })
      );
    }

    render() {
      const title = this.shadowRoot.getElementById("title");
      const content = this.shadowRoot.getElementById("content");

      if (title) {
        title.innerHTML = this._title;
        title.style.color = this._titleColor;
        title.style.background = this._headerBackground;
      }

      const card = this.shadowRoot.querySelector(".card");
      if (card) {
        card.style.background = this._cardBackground;
      }

      if (!this._myDataBinding) {
        content.innerHTML = `
            <div class="empty">
              No Data Binding Assigned
            </div>
          `;

        return;
      }

      if (this._myDataBinding.state !== "success") {
        content.innerHTML = `
            <div class="empty">
              Loading Data...
            </div>
          `;

        return;
      }

      try {
        const measureKeys = this._myDataBinding.metadata.feeds.measures.values;

        const row = this._myDataBinding.data[0];

        if (
          !this._myDataBinding.data ||
          this._myDataBinding.data.length === 0
        ) {
          content.innerHTML = "No Data Found";
          return;
        }

        const data = measureKeys.map((key) => ({
          name: this._myDataBinding.metadata.mainStructureMembers[key].label,

          value: Number(row[key]?.raw || 0),
        }));

        if (data.length === 0) {
          content.innerHTML = `
            <div class="empty">
              No Data Found
            </div>
          `;

          return;
        }

        /* ===================================
        CALCULATIONS
        =================================== */

        const totalDue = data.reduce((sum, item) => sum + item.value, 0);

        let gt30 = 0;
        let gt60 = 0;

        data.forEach((item) => {
          const label = item.name.toLowerCase().replace(/\s+/g, "");

          if (
            label.includes("31") ||
            label.includes("61") ||
            label.includes("90")
          ) {
            gt30 += item.value;
          }

          if (label.includes("61") || label.includes("90")) {
            gt60 += item.value;
          }
        });

        const maxValue = Math.max(...data.map((x) => x.value), 1);

        /* ===================================
        KPI SECTION
        =================================== */

        let html = `
            <div class="kpi-grid">
              <div
                  class="kpi-card totaldue-card"
                  data-value="${totalDue / 10000000}">
                <div
                  class="kpi-value"
                  style="color:${this._totalDueValueColor};">
                  ${this.formatValue(totalDue / 10000000)}
                </div>

                <div
                  class="kpi-label"
                  style="color:${this._totalDueTextColor};">
                  ${this._totalDueText}
                </div>
              </div>

              <div
                  class="kpi-card uncleared-card"
                  data-value="${this._unclearedValue}">
                <div
                  class="kpi-value"
                  style="color:${this._unclearedValueColor};">
                  ${this.formatValue(this._unclearedValue)}
                </div>

                <div
                  class="kpi-label"
                  style="color:${this._unclearedTextColor};">
                  ${this._unclearedText}
                </div>
              </div>
            </div>

            <div class="kpi-grid">
              <div
                  class="kpi-card gt30-card"
                  data-value="${gt30 / 10000000}">
                <div
                  class="kpi-value"
                  style="color:${this._gt30ValueColor};">
                  ${this.formatValue(gt30 / 10000000)}
                </div>

                <div
                  class="kpi-label"
                  style="color:${this._gt30TextColor};">
                  ${this._gt30Text}
                </div>
              </div>

              <div
                  class="kpi-card gt60-card"
                  data-value="${gt60 / 10000000}">
                <div
                  class="kpi-value"
                  style="color:${this._gt60ValueColor};">
                  ${this.formatValue(gt60 / 10000000)}
                </div>

                <div
                  class="kpi-label"
                  style="color:${this._gt60TextColor};">
                  ${this._gt60Text}
                </div>
              </div>
            </div>
          `;

        /* ===================================
        BARS
        =================================== */

        data.forEach((item, index) => {
          const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const label = this._barLabels[index] ?? item.name;
          const color = this._barColors[index] || "#344f6d";

          html += `
            <div
                class="row overdue-row"
                data-label="${label}"
                data-value="${item.value}">
              <div class="label-row">
                <div
                  class="label"
                  style="color:${this._labelColor};">
                  ${label}
                </div>

                <div class="value">
                  ${this.formatValue(item.value)}
                </div>
              </div>

              <div class="bar-container">
                <div
                  class="bar"
                  style="
                    width:${percent}%;
                    background:${color};
                  ">
                </div>
              </div>
            </div>
          `;
        });

        content.innerHTML = html;

        // <-- Add all click events here

        //========Total Due
        const totalDueCard = content.querySelector(".totaldue-card");
        if (totalDueCard) {
          totalDueCard.style.cursor = "pointer";

          totalDueCard.addEventListener("click", () => {
            this.fireTotalDueClick(Number(totalDueCard.dataset.value));
          });
        }

        //========Uncleared
        const unclearedCard = content.querySelector(".uncleared-card");
        if (unclearedCard) {
          unclearedCard.style.cursor = "pointer";

          unclearedCard.addEventListener("click", () => {
            this.fireUnclearedClick(Number(unclearedCard.dataset.value));
          });
        }

        //========GT 30
        const gt30Card = content.querySelector(".gt30-card");
        if (gt30Card) {
          gt30Card.style.cursor = "pointer";

          gt30Card.addEventListener("click", () => {
            this.fireGT30Click(Number(gt30Card.dataset.value));
          });
        }

        //========GT 60
        const gt60Card = content.querySelector(".gt60-card");
        if (gt60Card) {
          gt60Card.style.cursor = "pointer";

          gt60Card.addEventListener("click", () => {
            this.fireGT60Click(Number(gt60Card.dataset.value));
          });
        }

        //=============BARS
        const rows = content.querySelectorAll(".overdue-row");
        rows.forEach((row) => {
          row.style.cursor = "pointer";
          row.addEventListener("click", () => {
            this.fireBarClick(row.dataset.label, Number(row.dataset.value));
          });
        });


        
      } catch (e) {
        content.innerHTML = `
          <div class="empty">
            Error: ${e.message}
          </div>
          `;
      }
    }

    /* =========================
      PDF EXPORT
      ========================= */

    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");

      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 800;

      const height =
        this.shadowRoot.host.clientHeight || this.clientHeight || 600;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      /* -------------------------
      BACKGROUND
      ------------------------- */

      ctx.fillStyle = "#f4f1eb";
      ctx.fillRect(0, 0, width, height);

      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 11;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      /* -------------------------
      HEADER
      ------------------------- */

      const headerHeight = 50;

      ctx.fillStyle = this._headerBackground;
      // ctx.fillRect(5, 5, width - 10, headerHeight);
      // Rounded header Begin
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);
      ctx.clip();
      ctx.fillStyle = this._headerBackground;
      ctx.fillRect(5, 5, width - 10, headerHeight);
      ctx.restore();
      // Rounded header End

      ctx.fillStyle = this._titleColor;
      ctx.font = "bold 15px Arial";
      ctx.fillText(this._title, 20, 35);

      /* -------------------------
      VALIDATE DATA
      ------------------------- */

      if (
        !this._myDataBinding ||
        this._myDataBinding.state !== "success" ||
        !this._myDataBinding.data ||
        this._myDataBinding.data.length === 0
      ) {
        return canvas.toDataURL("image/png");
      }

      /* -------------------------
      DATA
      ------------------------- */

      const measureKeys = this._myDataBinding.metadata.feeds.measures.values;

      const row = this._myDataBinding.data[0];

      const data = measureKeys.map((key) => ({
        name: this._myDataBinding.metadata.mainStructureMembers[key].label,
        value: Number(row[key]?.raw || 0),
      }));

      const totalDue = data.reduce((sum, item) => sum + item.value, 0);

      let gt30 = 0;
      let gt60 = 0;

      data.forEach((item) => {
        const txt = item.name.toLowerCase().replace(/\s+/g, "");

        if (txt.includes("31") || txt.includes("61") || txt.includes("90")) {
          gt30 += item.value;
        }

        if (txt.includes("61") || txt.includes("90")) {
          gt60 += item.value;
        }
      });

      const maxValue = Math.max(...data.map((d) => d.value), 1);

      /* -------------------------
      KPI CARDS
      ------------------------- */

      const sidePadding = 15;
      const cardGap = 10;
      const cardWidth = (width - sidePadding * 2 - cardGap) / 2;

      const cardHeight = 60;
      const startY = 70;

      const drawCard = (x, y, value, label, valueColor, labelColor) => {
        // Shadow
        ctx.shadowColor = "rgba(0,0,0,0.10)";
        ctx.shadowBlur = 11;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = "#F8FAFC";
        ctx.strokeStyle = "#E5E7EB";

        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 10);
        ctx.fill();
        ctx.stroke();

        // Reset shadow so text is not blurred
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.textAlign = "center";

        ctx.fillStyle = valueColor;
        ctx.font = "bold 16px Arial";
        ctx.fillText(value, x + cardWidth / 2, y + 25);

        ctx.fillStyle = labelColor;
        ctx.font = "11px Arial";
        ctx.fillText(label, x + cardWidth / 2, y + 45);

        ctx.textAlign = "left";
      };

      drawCard(
        sidePadding,
        startY,
        this.formatValue(totalDue / 10000000),
        this._totalDueText,
        this._totalDueValueColor,
        this._totalDueTextColor,
      );

      drawCard(
        sidePadding + cardWidth + cardGap,
        startY,
        this.formatValue(this._unclearedValue),
        this._unclearedText,
        this._unclearedValueColor,
        this._unclearedTextColor,
      );

      drawCard(
        sidePadding,
        startY + cardHeight + cardGap,
        this.formatValue(gt30 / 10000000),
        this._gt30Text,
        this._gt30ValueColor,
        this._gt30TextColor,
      );

      drawCard(
        sidePadding + cardWidth + cardGap,
        startY + cardHeight + cardGap,
        this.formatValue(gt60 / 10000000),
        this._gt60Text,
        this._gt60ValueColor,
        this._gt60TextColor,
      );

      /* -------------------------
      BARS
      ------------------------- */

      const bottomPadding = 25;
      let y = startY + cardHeight * 2 + 45;

      const availableHeight = height - y - bottomPadding;
      const rowHeight = data.length > 0 ? availableHeight / data.length : 0;

      data.forEach((item, index) => {
        const label = this._barLabels[index] ?? item.name;
        const color = this._barColors[index] || "#344F6D";
        const percent = (item.value / maxValue) * 100;

        const rowStartY = y;

        ctx.fillStyle = this._labelColor;
        ctx.font = "bold 12px Arial";
        ctx.fillText(label, 15, rowStartY);

        ctx.fillStyle = "#111827";
        ctx.textAlign = "right";
        ctx.fillText(this.formatValue(item.value), width - 15, rowStartY);
        ctx.textAlign = "left";

        const barHeight = Math.max(12, height * 0.02);
        const textGap = Math.max(8, height * 0.01);

        const barY = rowStartY + textGap;

        ctx.fillStyle = "#E5E7EB";
        ctx.beginPath();
        ctx.roundRect(15, barY, width - 30, barHeight, barHeight / 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(
          15,
          barY,
          ((width - 30) * percent) / 100,
          barHeight,
          barHeight / 2,
        );
        ctx.fill();

        y = rowStartY + rowHeight;
      });
      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  customElements.define("com-max-overdueanalysis", OverdueAnalysis);
})();
