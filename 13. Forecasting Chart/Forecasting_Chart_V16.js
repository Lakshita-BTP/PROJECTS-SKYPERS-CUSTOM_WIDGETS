(function () {
  class PaymentForecastDashboard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      /*==================================================
          TITLE
      ==================================================*/
      this._title = "PAYMENT FORECAST";
      this._titleColor = "#FFFFFF";
      this._headerBackground = "#16263B";
      this._cardBackground = "#FFFFFF";

      /*==================================================
          KPI
      ==================================================*/
      this._totalForecastLabel = "TOTAL FORECAST";
      this._totalForecastColor = "#0F172A";
      this._totalForecastLabelColor = "#667085";

      /*==================================================
          LINE CHART
      ==================================================*/
      this._lineColor = "#2563EB";
      this._markerColor = "#2563EB";
      this._gridColor = "#E5E7EB";
      this._axisColor = "#667085";

      /*==================================================
          FORECAST BARS
      ==================================================*/
      this._barColors = [
        "#2E86DE",
        "#20BF6B",
        "#F7B731",
        "#FA8231",
        "#A55EEA",
        "#EB3B5A",
      ];
      this._labelColor = "#667085";
      this._valueColor = "#111827";

      /*==================================================
          FORMATTING
      ==================================================*/
      this._decimalPlaces = 2;
      this._currencyUnit = "Cr";

      /*==================================================
          EVENTS
      ==================================================*/
      this._selectedYear = "";
      this._selectedBucket = "";
      this._selectedBucketIndex = -1;
      this._selectedValue = 0;

      /*==================================================
          DATA
      ==================================================*/
      this._forecastData = [];
      this._historyData = [];

      /*==================================================
      TOOLTIP
      ==================================================*/
      this._tooltip = null;
      this._hoverPoint = null;
      this._resizeObserver = null;
      this.shadowRoot.innerHTML = `
        <style>

          .chart-layout{
              flex:1;
              display:flex;
              gap:20px;
              min-height:0;
              align-items:stretch;
          }

          .forecast-panel{
              width:38%;
              display:flex;
              flex-direction:column;
          }

          .history-panel{
              flex:1;
              display:flex;
              flex-direction:column;
              min-height:0;
          }

          @media (max-width:900px){
              .chart-layout{
                  flex-direction:column;
              }

              .forecast-panel,
              .history-panel{
                  width:100%;
              }
          }


          :host{
              display:block;
              width:100%;
              height:100%;
              font-family:Arial,sans-serif;
          }
          .outer{
              width:100%;
              height:100%;
              padding:5px;
              box-sizing:border-box;
              background:#F4F6F9;
          }

          .card{
              width:100%;
              height:100%;
              display:flex;
              flex-direction:column;
              background:${this._cardBackground};
              border-radius:12px;
              overflow:hidden;
              box-shadow:0 2px 10px rgba(0,0,0,.10);
          }

          .header{
              height:38px;
              display:flex;
              align-items:center;
              padding:0 16px;
              background:${this._headerBackground};
              color:${this._titleColor};
              font-size:15px;
              font-weight:bold;
              letter-spacing:.5px;
              text-transform:uppercase;
          }

          .content{
              flex:1;
              display:flex;
              flex-direction:column;
              overflow:hidden;
              padding:12px;
              box-sizing:border-box;
          }

          .kpi{
              display:flex;
              flex-direction:column;
              align-items:center;
              justify-content:center;
              margin-bottom:0px;
              padding:6px;
              border-radius:10px;
              background:#F8FAFC;
              border:1px solid #E5E7EB;
          }

          .kpi-label{
              font-size:12px;
              font-weight:600;
              color:${this._totalForecastLabelColor};
              margin-bottom:6px;
          }

          .kpi-value{
              font-size:26px;
              font-weight:700;
              color:${this._totalForecastColor};
          }

          .section-title{
              font-size:13px;
              font-weight:bold;
              color:#344054;
              margin-top:18px;
              margin-bottom:5px;
              text-transform:uppercase;
          }

          .chart-container{
              flex:1;
              min-height:180px;
              position:relative;
          }

          .chart-canvas{
              width:100%;
              height:100%;
              display:block;
          }

          .forecast-container{
              margin-top:0px;
          }

          .bucket{
              margin-bottom:16px;
              cursor:pointer;
          }

          .bucket-header{
              display:flex;
              justify-content:space-between;
              font-size:12px;
              font-weight:bold;
              margin-bottom:6px;
          }

          .bucket-label{
            color:${this._labelColor};
          }

          .bucket-value{
              color:${this._valueColor};
          }

          .bar-bg{
              width:100%;
              height:100%;
              background:#E5E7EB;
              border-radius:10px;
              overflow:hidden;
              transition:
              width .8s ease,
              transform .25s ease,
              box-shadow .25s ease;
          }

          .bar{
              height:100%;
              border-radius:10px;
              transition:width .4s ease;
          }

          .empty{
              height:100%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:14px;
              color:#667085;
          }

        </style>

        <div class="outer">
          <div class="card">
            <div id="header" class="header">
              ${this._title}
            </div>
            <div id="content" class="content">
              <div class="empty">
                Waiting For Data Binding...
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /*==================================================
    CONNECTED
    ==================================================*/

    connectedCallback() {
      this.render();
      this.setupResizeObserver();
    }

    /*==================================================
    RESIZE
    ==================================================*/

    setupResizeObserver() {
      const container = this;

      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }

      this._resizeObserver = new ResizeObserver(() => {
        const canvas = this.shadowRoot.getElementById("historyCanvas");

        if (canvas) {
          this.drawLineChart(canvas);
        }
      });

      this._resizeObserver.observe(container);
    }

    /*==================================================
    DATA BINDINGS
    ==================================================*/
    set myDataBinding(value) {
      this._myDataBinding = value;
      this.render();
    }

    /*==================================================
    TITLE
    ==================================================*/

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

    /*==================================================
    LINE CHART
    ==================================================*/

    setLineColor(value) {
      this._lineColor = value;

      this.render();
    }

    setMarkerColor(value) {
      this._markerColor = value;

      this.render();
    }

    setGridColor(value) {
      this._gridColor = value;

      this.render();
    }

    setAxisColor(value) {
      this._axisColor = value;

      this.render();
    }

    /*==================================================
    TEXT
    ==================================================*/

    setLabelColor(value) {
      this._labelColor = value;

      this.render();
    }

    setValueColor(value) {
      this._valueColor = value;

      this.render();
    }

    /*==================================================
    FORMAT
    ==================================================*/

    setCurrencyUnit(value) {
      this._currencyUnit = value;

      this.render();
    }

    setDecimalPlaces(value) {
      this._decimalPlaces = Number(value) || 2;
      this.render();
    }

    /*==================================================
    BAR COLORS
    ==================================================*/

    setBarColor(index, color) {
      index = Number(index);
      if (index >= 0) {
        this._barColors[index] = color;
        this.render();
      }
    }

    /*==================================================
    EVENT GETTERS
    ==================================================*/

    getSelectedYear() {
      return this._selectedYear;
    }

    getSelectedBucket() {
      return this._selectedBucket;
    }

    getSelectedValue() {
      return this._selectedValue;
    }

    /*==================================================
    EVENTS
    ==================================================*/

    fireYearClick(year, value) {
      this._selectedYear = year;
      this._selectedBucket = "";
      this._selectedValue = value;
      this.dispatchEvent(new Event("onYearClick"));
    }

    fireBucketClick(bucket, value) {
      this._selectedBucket = bucket;
      this._selectedYear = "";
      this._selectedValue = value;
      this.dispatchEvent(new Event("onBucketClick"));
    }

    /*==================================================
    VALUE FORMATTERS
    ==================================================*/

    formatValue(value) {
      value = Number(value) || 0;

      return (
        "₹" +
        value.toLocaleString(undefined, {
          minimumFractionDigits: this._decimalPlaces,
          maximumFractionDigits: this._decimalPlaces,
        }) +
        " " +
        this._currencyUnit
      );
    }

    formatAmount(value) {
      value = Number(value) || 0;

      return (
        "₹" +
        value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      );
    }

    /*==================================================
    LIGHTEN COLOR
    ==================================================*/

    lightenColor(color, percent) {
      let num = parseInt(color.replace("#", ""), 16);
      let r = num >> 16;
      let g = (num >> 8) & 0x00ff;
      let b = num & 0x0000ff;
      r = Math.min(255, r + percent);
      g = Math.min(255, g + percent);
      b = Math.min(255, b + percent);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /*==================================================
    RENDER
    ==================================================*/
    render() {
      const header = this.shadowRoot.getElementById("header");
      const content = this.shadowRoot.getElementById("content");
      if (header) {
        header.innerHTML = this._title;
        header.style.background = this._headerBackground;
        header.style.color = this._titleColor;
      }

      const card = this.shadowRoot.querySelector(".card");
      if (card) {
        card.style.background = this._cardBackground;
      }

      /*------------------------------------------
          VALIDATE DATABINDINGS
      ------------------------------------------*/
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

      console.log(this._myDataBinding.metadata);
      console.log(this._myDataBinding.metadata.feeds);
      console.log(this._myDataBinding.data[0]);

      try {
        const rows = this._myDataBinding.data;

        console.log("Rows");
        console.log(rows);

        console.log("Metadata");
        console.log(this._myDataBinding.metadata);

        console.log("First Row");
        console.log(rows[0]);

        if (!rows || rows.length === 0) {
          content.innerHTML = `
            <div class="empty">
                No Data Found
            </div>
        `;
          return;
        }

        // <-- ADD IT HERE
        const row = rows[0];

        this._historyData = [];
        this._forecastData = [];

        /*------------------------------------------
              HISTORY DATA
          ------------------------------------------*/

        this._historyData = rows.map((row) => ({
          year: row["dimensions_0"].label,
          value: Number(row["measures_0"].raw || 0),
        }));

        console.log("History Data");
        console.table(this._historyData);

        /* Keep latest 5 years */
        this._historyData.sort((a, b) => Number(a.year) - Number(b.year));

        if (this._historyData.length > 5) {
          this._historyData = this._historyData.slice(-5);
        }

        // Read forecast buckets from first row
        const measureKeys = this._myDataBinding.metadata.feeds.measures.values;

        this._forecastData = measureKeys.slice(1).map((key) => ({
          label: this._myDataBinding.metadata.mainStructureMembers[key].label,
          value: Number(row[key]?.raw || 0),
        }));

        /*------------------------------------------
              TOTAL FORECAST
          ------------------------------------------*/
        const totalForecast =
          this._forecastData.reduce((sum, item) => sum + item.value, 0) /
          10000000;

        /*------------------------------------------
              BUILD HTML
          ------------------------------------------*/
        let html = `
          <div class="kpi">
              <div class="kpi-label">
                  ${this._totalForecastLabel}
              </div>
              <div class="kpi-value">
                  ${this.formatValue(totalForecast)}
              </div>
          </div>
          
          <div class="chart-layout">
            <div class="forecast-panel">
              <div class="section-title">
                  Future Payment Forecast
              </div>
              <div class="forecast-container">
        `;

        const maxForecast = Math.max(
          ...this._forecastData.map((d) => d.value),
          1,
        );

        this._forecastData.forEach((bucket, index) => {
          const totalAmount = this._forecastData.reduce(
            (sum, item) => sum + item.value,
            0,
          );

          const share =
            totalAmount === 0 ? 0 : (bucket.value / totalAmount) * 100;
          const percent = (bucket.value / maxForecast) * 100;
          const color = this._barColors[index] || "#2563EB";
          html += `
            <div class="bucket" data-label="${bucket.label}" data-value="${bucket.value}">
              <div class="bucket-header">
                <div class="bucket-label">
                  ${bucket.label}
                </div>

                <div style=" display:flex; gap:10px; align-items:center; ">
                  <div style=" color:#667085; font-size:11px; font-weight:bold; ">
                      ${share.toFixed(1)}%
                  </div>

                  <div class="bucket-value">
                      ${this.formatAmount(bucket.value)}
                  </div>
                </div>
              </div>

              <div class="bar-bg">
                <div class="bar" data-index="${index}" style="
                    width:0%;
                    background:linear-gradient( 90deg, ${color}, ${this.lightenColor(color, 35)} ); ">
                </div>
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>

          <div class="history-panel">
            <div style=" display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; margin-top:7px; ">
              <div style="font-size:13px;font-weight:bold;">
                  Last 5 Years Collection Trend
              </div>
              <div style=" display:flex; align-items:center; gap:6px; font-size:11px; color:#667085; ">
                <div style=" width:18px; height:3px; background:${this._lineColor}; ">
                  </div>
                    Collections
                  </div>
                </div>
                <div class="chart-container" id="chartContainer">
                  <canvas
                      id="historyCanvas"
                      class="chart-canvas">
                  </canvas>
                <div id="chartTooltip" style=" position:absolute; display:none; pointer-events:none;
                            background:#16263B; color:#FFF; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:bold;
                            white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,.20);
                            transform:translate(-50%,-120%);
                            z-index:10; ">
                </div>
              </div>
            </div>
          </div>
        `;

        content.innerHTML = html;

        /*------------------------------------------
          BAR ANIMATION
          ------------------------------------------*/

        requestAnimationFrame(() => {
          const bars = content.querySelectorAll(".bar");
          bars.forEach((bar, index) => {
            const value = this._forecastData[index].value;
            const max = Math.max(...this._forecastData.map((x) => x.value), 1);
            const percent = (value / max) * 100;
            setTimeout(() => {
              bar.style.width = percent + "%";
            }, index * 120);
          });
        });

        /*------------------------------------------
              DRAW CHART
          ------------------------------------------*/
        const canvas = this.shadowRoot.getElementById("historyCanvas");

        if (canvas) {
          this.drawLineChart(canvas);
        }

        /*------------------------------------------
              CLICK EVENTS
          ------------------------------------------*/
        const buckets = content.querySelectorAll(".bucket");
        buckets.forEach((bucket, index) => {
          bucket.style.cursor = "pointer";

          bucket.addEventListener("mouseenter", () => {
            const bar = bucket.querySelector(".bar");
            bar.style.transform = "scaleY(1.15)";
            bar.style.boxShadow = "0 4px 12px rgba(0,0,0,.25)";
          });

          bucket.addEventListener("mouseleave", () => {
            const bar = bucket.querySelector(".bar");
            bar.style.transform = "scaleY(1)";
            bar.style.boxShadow = "none";
          });

          bucket.addEventListener("click", () => {
            content.querySelectorAll(".bucket").forEach((x) => {
              x.style.background = "transparent";
              x.style.borderRadius = "8px";
              x.style.padding = "0";
            });

            bucket.style.background = "#EEF4FF";
            bucket.style.padding = "8px";
            bucket.style.borderRadius = "8px";
            this._selectedBucketIndex = index;
            this.fireBucketClick(
              bucket.dataset.label,
              Number(bucket.dataset.value),
            );
          });
        });
      } catch (error) {
        content.innerHTML = `
            <div class="empty">
                ${error.message}
            </div>
          `;
      }
    }

    /*==================================================
    LINE CHART
    ==================================================*/
    drawLineChart(canvas) {
      if (!canvas || this._historyData.length === 0) {
        return;
      }

      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const paddingLeft = 55;
      const paddingRight = 25;
      const paddingTop = 25;
      const paddingBottom = 40;
      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;
      const values = this._historyData.map((x) => x.value);
      const maxValue = Math.max(...values, 1);
      const minValue = 0;
      const steps = 5;

      /*----------------------------------------
          GRID
      ----------------------------------------*/
      ctx.strokeStyle = this._gridColor;
      ctx.lineWidth = 1;
      ctx.font = "11px Arial";
      ctx.fillStyle = this._axisColor;
      for (let i = 0; i <= steps; i++) {
        const y = paddingTop + chartHeight - (chartHeight / steps) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        const value = ((maxValue / steps) * i) / 10000000;
        ctx.textAlign = "right";
        ctx.fillText(value.toFixed(1), paddingLeft - 8, y + 4);
      }

      /*----------------------------------------
          AXES
      ----------------------------------------*/
      ctx.strokeStyle = this._axisColor;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, paddingTop);
      ctx.lineTo(paddingLeft, height - paddingBottom);
      ctx.lineTo(width - paddingRight, height - paddingBottom);
      ctx.stroke();

      /*----------------------------------------
          CALCULATE POINTS
      ----------------------------------------*/
      const points = [];
      const gap =
        this._historyData.length > 1
          ? chartWidth / (this._historyData.length - 1)
          : chartWidth;
      this._historyData.forEach((item, index) => {
        const x = paddingLeft + gap * index;
        const y =
          paddingTop +
          chartHeight -
          ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
        points.push({
          x,
          y,
          year: item.year,
          value: item.value,
        });
      });

      /*----------------------------------------
          DRAW LINE
      ----------------------------------------*/

      /*----------------------------------------
      DRAW SMOOTH CURVE
      ----------------------------------------*/
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = this._lineColor;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const controlX = (current.x + next.x) / 2;
        ctx.bezierCurveTo(
          controlX,
          current.y,
          controlX,
          next.y,
          next.x,
          next.y,
        );
      }

      ctx.stroke();

      /*----------------------------------------
          AREA FILL
      ----------------------------------------*/
      const gradient = ctx.createLinearGradient(
        0,
        paddingTop,
        0,
        height - paddingBottom,
      );

      gradient.addColorStop(0, "rgba(37,99,235,0.30)");

      gradient.addColorStop(1, "rgba(37,99,235,0.02)");

      ctx.lineTo(points[points.length - 1].x, height - paddingBottom);

      ctx.lineTo(points[0].x, height - paddingBottom);

      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      /*----------------------------------------
        DRAW MARKERS
      ----------------------------------------*/
      ctx.fillStyle = this._markerColor;
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, this._hoverPoint === p ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      /*----------------------------------------
          VALUE LABELS
      ----------------------------------------*/
      ctx.font = "bold 11px Arial";
      ctx.fillStyle = this._valueColor;
      ctx.textAlign = "center";
      points.forEach((p) => {
        const txt = (p.value / 10000000).toFixed(this._decimalPlaces);
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(p.x - 18, p.y - 34, 36, 18, 6);
        ctx.fill();
        ctx.strokeStyle = "#D0D5DD";
        ctx.stroke();
        ctx.fillStyle = this._valueColor;
        ctx.fillText(txt, p.x, p.y - 21);
      });

      /*----------------------------------------
          YEAR LABELS
      ----------------------------------------*/
      ctx.font = "12px Arial";
      ctx.fillStyle = this._axisColor;
      ctx.textAlign = "center";
      points.forEach((p) => {
        ctx.fillText(p.year, p.x, height - 15);
      });

      /*----------------------------------------
          STORE POINTS
      ----------------------------------------*/
      this._chartPoints = points;

      /*----------------------------------------
          CLICK EVENT
      ----------------------------------------*/
      const tooltip = this.shadowRoot.getElementById("chartTooltip");

      canvas.onmousemove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let found = false;
        for (const point of points) {
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 10) {
            found = true;
            canvas.style.cursor = "pointer";
            tooltip.style.display = "block";
            tooltip.style.left = point.x + "px";
            tooltip.style.top = point.y + "px";
            tooltip.innerHTML = `
                      ${point.year}<br>
                      ${this.formatValue(point.value / 10000000)}
                  `;
            this._hoverPoint = point;
            break;
          }
        }

        if (!found) {
          tooltip.style.display = "none";
          canvas.style.cursor = "default";
        }
      };

      canvas.onclick = () => {
        if (this._hoverPoint) {
          this.fireYearClick(this._hoverPoint.year, this._hoverPoint.value);
        }
      };
    }

    /*==================================================
    PDF EXPORT
    ==================================================*/

    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");
      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 900;

      const height =
        this.shadowRoot.host.clientHeight || this.clientHeight || 650;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      /*------------------------------------------
          BACKGROUND
      ------------------------------------------*/
      ctx.fillStyle = "#F4F6F9";
      ctx.fillRect(0, 0, width, height);

      /*------------------------------------------
          CARD
      ------------------------------------------*/
      ctx.shadowColor = "rgba(0,0,0,.12)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);
      ctx.fill();
      ctx.shadowBlur = 0;

      /*------------------------------------------
          HEADER
      ------------------------------------------*/
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 12);

      ctx.clip();
      ctx.fillStyle = this._headerBackground;
      ctx.fillRect(5, 5, width - 10, 40);

      ctx.restore();
      ctx.fillStyle = this._titleColor;
      ctx.font = "bold 16px Arial";
      ctx.fillText(this._title, 20, 35);

      /*------------------------------------------
          VALIDATE DATA
      ------------------------------------------*/
      if (!this._historyData.length || !this._forecastData.length) {
        return canvas.toDataURL("image/png");
      }

      /*------------------------------------------
          TOTAL FORECAST KPI
      ------------------------------------------*/
      const totalForecast =
        this._forecastData.reduce((s, x) => s + x.value, 0) / 10000000;

      const kpiX = 20;
      const kpiY = 50;
      const kpiWidth = width - 40;
      const kpiHeight = 62;

      /* KPI Card */
      ctx.fillStyle = "#F8FAFC";
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(kpiX, kpiY, kpiWidth, kpiHeight, 10);
      ctx.fill();
      ctx.stroke();

      /* Label */
      ctx.fillStyle = "#667085";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";

      ctx.fillText(this._totalForecastLabel, kpiX + kpiWidth / 2, kpiY + 22);

      /* Value */
      ctx.fillStyle = "#111827";
      ctx.font = "bold 26px Arial";

      ctx.fillText(
        this.formatValue(totalForecast),
        kpiX + kpiWidth / 2,
        kpiY + 48,
      );

      ctx.textAlign = "left";

      /*------------------------------------------
        HISTORY CHART
      ------------------------------------------*/
      //====================================================================================
      /*------------------------------------------
          RESPONSIVE TWO COLUMN LAYOUT
      ------------------------------------------*/
      // Margins
      const margin = 20;
      const gap = 20;

      // Starts just below KPI
      const topY = 135;

      // Available space below KPI
      const availableHeight = height - topY - margin;

      // Left (Forecast)
      const leftX = margin;
      const leftWidth = Math.min(Math.max(260, width * 0.36), width * 0.42);

      // Right (History)
      const rightX = leftX + leftWidth + gap;
      const rightWidth = width - rightX - margin;

      /*------------------------------------------
          LEFT : FORECAST
      ------------------------------------------*/
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px Arial";
      ctx.fillText("Future Payment Forecast", leftX, topY);
      let y = topY + 30;
      const maxForecast = Math.max(
        ...this._forecastData.map((x) => x.value),
        1,
      );

      const rowHeight = Math.min(
        42,
        availableHeight / (this._forecastData.length + 1),
      );

      this._forecastData.forEach((bucket, index) => {
        const total = this._forecastData.reduce((s, x) => s + x.value, 0);
        const share = total === 0 ? 0 : (bucket.value / total) * 100;
        const color = this._barColors[index] || "#2563EB";
        ctx.fillStyle = "#667085";
        ctx.font = "12px Arial";
        ctx.fillText(bucket.label, leftX, y);
        ctx.textAlign = "right";
        ctx.fillStyle = "#111827";
        ctx.fillText(this.formatAmount(bucket.value), leftX + leftWidth, y);

        ctx.textAlign = "left";

        const barHeight = 16;
        ctx.fillStyle = "#E5E7EB";
        ctx.beginPath();
        ctx.roundRect(leftX, y, leftWidth, barHeight, 8);
        ctx.fill();

        const grad = ctx.createLinearGradient(leftX, 0, leftX + leftWidth, 0);

        grad.addColorStop(0, color);
        grad.addColorStop(1, this.lightenColor(color, 35));

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(
          leftX,
          y,
          leftWidth * (bucket.value / maxForecast),
          16,
          8,
        );
        ctx.fill();

        ctx.fillStyle = "#667085";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";

        ctx.fillText(share.toFixed(1) + "%", leftX + leftWidth - 70, y);

        ctx.fillStyle = "#111827";
        ctx.font = "bold 12px Arial";

        ctx.fillText(this.formatAmount(bucket.value), leftX + leftWidth, y);

        ctx.textAlign = "left";

        y += rowHeight;
      });

      /*------------------------------------------
          RIGHT : HISTORY CHART
      ------------------------------------------*/
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px Arial";
      ctx.fillText("Last 5 Years Collection Trend", rightX, topY);

      const chartX = rightX;
      const chartY = topY + 25;
      const chartWidth = rightWidth;
      const chartHeight = Math.max(220, availableHeight - 25);

      /*------------------------------------------
          CHART CONTAINER
      ------------------------------------------*/
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(chartX, chartY, chartWidth, chartHeight, 10);

      ctx.fill();
      ctx.stroke();

      const paddingLeft = 55;
      const paddingRight = 25;
      const paddingTop = 25;
      const paddingBottom = 40;

      const graphX = chartX + paddingLeft;
      const graphY = chartY + paddingTop;

      const graphWidth = chartWidth - paddingLeft - paddingRight;

      const graphHeight = chartHeight - paddingTop - paddingBottom;

      /* Grid */
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.font = "11px Arial";
      ctx.fillStyle = "#667085";

      const maxValue = Math.max(...this._historyData.map((x) => x.value), 1);
      const steps = 5;

      for (let i = 0; i <= steps; i++) {
        const yy = graphY + graphHeight - (graphHeight / steps) * i;

        ctx.beginPath();
        ctx.moveTo(graphX, yy);
        ctx.lineTo(graphX + graphWidth, yy);
        ctx.stroke();

        const value = ((maxValue / steps) * i) / 10000000;

        ctx.textAlign = "right";

        ctx.fillText(value.toFixed(1), graphX - 8, yy + 4);
      }

      ctx.strokeStyle = "#667085";
      ctx.beginPath();
      ctx.moveTo(graphX, graphY);
      ctx.lineTo(graphX, graphY + graphHeight);
      ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
      ctx.stroke();

      /* Values */
      const pointGap =
        this._historyData.length > 1
          ? graphWidth / (this._historyData.length - 1)
          : graphWidth;
      const points = [];
      this._historyData.forEach((item, index) => {
        const px = graphX + pointGap * index;
        const py = graphY + graphHeight - (item.value / maxValue) * graphHeight;
        points.push({
          x: px,
          y: py,
          year: item.year,
          value: item.value,
        });
      });

      /* Line */
      if (points.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = this._lineColor;
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const c = points[i];
          const n = points[i + 1];
          const cx = (c.x + n.x) / 2;

          ctx.bezierCurveTo(cx, c.y, cx, n.y, n.x, n.y);
        }

        ctx.stroke();

        const gradient = ctx.createLinearGradient(
          0,
          chartY,
          0,
          chartY + chartHeight,
        );

        gradient.addColorStop(0, "rgba(37,99,235,0.25)");
        gradient.addColorStop(1, "rgba(37,99,235,0.02)");

        ctx.lineTo(points[points.length - 1].x, graphY + graphHeight);
        ctx.lineTo(points[0].x, graphY + graphHeight);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();
      }
      for (let i = 0; i < points.length - 1; i++) {
        const c = points[i];
        const n = points[i + 1];
        const cx = (c.x + n.x) / 2;
        ctx.bezierCurveTo(cx, c.y, cx, n.y, n.x, n.y);
      }
      ctx.stroke();

      /* Area */
      const gradient = ctx.createLinearGradient(
        0,
        chartY,
        0,
        chartY + chartHeight,
      );
      gradient.addColorStop(0, "rgba(37,99,235,0.25)");
      gradient.addColorStop(1, "rgba(37,99,235,0.02)");

      ctx.lineTo(points[points.length - 1].x, graphY + graphHeight);
      ctx.lineTo(points[0].x, graphY + graphHeight);

      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      /* Points */
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);

        ctx.fillStyle = this._markerColor;
        ctx.fill();
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      /* Labels */
      /* Labels */
      ctx.font = "12px Arial";
      ctx.textAlign = "center";

      points.forEach((point) => {
        // Year
        ctx.fillStyle = "#667085";
        ctx.fillText(point.year, point.x, graphY + graphHeight + 25);

        // White rounded box
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(point.x - 18, point.y - 34, 36, 18, 6);
        ctx.fill();

        ctx.strokeStyle = "#D0D5DD";
        ctx.stroke();

        // Value
        ctx.fillStyle = "#111827";
        ctx.font = "bold 11px Arial";

        ctx.fillText(
          (point.value / 10000000).toFixed(this._decimalPlaces),
          point.x,
          point.y - 21,
        );

        ctx.font = "12px Arial";
      });

      ctx.textAlign = "left";

      /*------------------------------------------
          RETURN IMAGE
      ------------------------------------------*/
      return canvas.toDataURL("image/png");
    }

    /*==================================================
    EXPORT
    ==================================================*/

    async getExportData() {
      return await this.serializeCustomWidgetToImage();
    }
  }
  customElements.define("com-max-forecastingchart", PaymentForecastDashboard);
})();
