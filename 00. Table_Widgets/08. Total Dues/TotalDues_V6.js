(function () {
  class TotalDueTableWidget extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      /* =========================
        TITLE STYLE
      ========================= */
      this._titleText = "OVERDUE ANALYSIS DETAILED REPORT";
      this._titleColor = "#FFFFFF";
      this._titleFontSize = "15px";
      this._titleAlign = "center";
      this._titleBold = true;
      this._titleBackground = "#1b2a41";

      /* =========================
        HEADER STYLE
      ========================= */
      this._headerAlign = "left";
      this._headerColor = "#FFFFFF";
      this._headerFontSize = "12px";
      this._headerBackground = "#1b2a41";

      /* =========================
        ROW STYLE
      ========================= */
      this._rowAlign = "left";
      this._rowColor = "#2D3748";
      this._rowFontSize = "12px";
      this._rowBackground = "#FFFFFF";

      /* =========================
        TOTAL ROW STYLE
      ========================= */
      this._totalPosition = "top";

      /* =========================
        Column STYLE
      ========================= */
      this._columnStyles = {
        measures_0: {
          headerAlignment: "right",
          headerFontSize: "14px",
          headerColor: "#FFFFFF",
          headerBackground: "#16263b",
          valueAlignment: "right",
          valueFontSize: "12px",
          valueColor: "#000000",
          valueBackground: "#F8F9FB",
        },
        // ...continue if you want more defaults
      };

      /* =========================
        DIMENSION FILTER
      ========================= */
      this._dimensionFilters = {};

      /* =========================
        MEASURE FILTER
      ========================= */
      this._measureFilters = [];

      this.shadowRoot.innerHTML = `
        <style>

        .outer{
            width:100%;
            height:100%;
            padding:6px;
            background:#F4F1EB;
            box-sizing:border-box;
        }

        .card{
            width:100%;
            height:calc(100% - 8px);
            background:#FFFFFF;
            border-radius:8px;
            overflow:hidden;
            box-shadow:0 0 10px rgba(0,0,0,.10);
        }


        .container{
            width:100%;
            height:100%;
            display:flex;
            flex-direction:column;
        }

        .table-container{
            height:calc(100% - 42px); /* title height */
            overflow-y:auto;
            overflow-x:auto;
        }

        .table thead th{
            position:sticky;
            top:0;
            z-index:10;
        }

        .table{
            width:100%;
            border-collapse:collapse;
            table-layout:auto;
            font-size:12px;
        }

        .table thead{
            top:0;
            z-index:10;
        }

        .table th{
            background:#1b2a41;
            color:#ffffff;
            padding:10px;
            text-align:left;
            font-weight:bold;
            white-space:nowrap;
        }

        .table td{
            padding:8px 10px;
            border-bottom:1px solid #E5E7EB;
            color:#2D3748;
            white-space:nowrap;
        }

        .table tbody tr:hover{
            background:#F7FAFC;
        }

        .total-row{
            font-weight:bold;
            background:#F8F9FB;
        }

        .title{
            background:#1b2a41;
            color:#ffffff;
            font-size:14px;
            font-weight:bold;
            padding:10px 15px;
            text-transform:uppercase;
            position:sticky;
            top:0;
            z-index:20;
        }

        </style>

        <div class="outer">

            <div class="card">

                <div id="title" class="title">
                    MILESTONE WISE OUTSTANDING
                </div>

                <div class="container">
                    <div id="content" class="table-container">
                        Loading...
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
      TITLE STYLE
    ========================= */
    titleStyle(text, fontSize, color, alignment, bold, background) {
      this._titleText = text;
      this._titleFontSize = fontSize;
      this._titleColor = color;
      this._titleAlign = alignment;
      this._titleBold = bold;
      this._titleBackground = background;
      this.render();
    }

    /* =========================
      HEADER STYLE
    ========================= */
    headerStyle(alignment, fontSize, color, background) {
      this._headerAlign = alignment;
      this._headerFontSize = fontSize;
      this._headerColor = color;
      this._headerBackground = background;
      this.render();
    }

    /* =========================
      ROW STYLE
    ========================= */
    rowsStyle(alignment, fontSize, color, background) {
      this._rowAlign = alignment;
      this._rowFontSize = fontSize;
      this._rowColor = color;
      this._rowBackground = background;
      this.render();
    }

    /* =========================
      COLUMN STYLE
    ========================= */
    columnStyle(
      columnName,
      headerAlignment,
      headerFontSize,
      headerColor,
      headerBackground,
      valueAlignment,
      valueFontSize,
      valueColor,
      valueBackground,
    ) {
      this._columnStyles[columnName] = {
        headerAlignment,
        headerFontSize,
        headerColor,
        headerBackground,
        valueAlignment,
        valueFontSize,
        valueColor,
        valueBackground,
      };

      this.render();
    }

    /* =========================
      DIMENSION FILTER
    ========================= */
    setDimensionFilter(dimensionName, value) {
      this._dimensionFilters[dimensionName] = value;
      this.render();
    }

    clearDimensionFilter() {
      this._dimensionFilters = {};
      this.render();
    }

    /* =========================
      TOTAL ROW POSITION
    ========================= */
    setTotalPosition(position) {
      this._totalPosition =
        String(position).toLowerCase() === "top" ? "top" : "bottom";
      this.render();
    }
    getTotalPosition() {
      return this._totalPosition;
    }

    /* =========================
      MEASURE FILTER
    ========================= */
    setVisibleMeasures(...measureNames) {
      this._measureFilters = measureNames.flat();
      this.render();
    }
    clearVisibleMeasures() {
      this._measureFilters = [];
      this.render();
    }

    render() {
      const title = this.shadowRoot.getElementById("title");

      if (title) {
        title.innerHTML = this._titleText;
        title.style.color = this._titleColor;
        title.style.fontSize = this._titleFontSize;
        title.style.textAlign = this._titleAlign;
        title.style.background = this._titleBackground;
        title.style.fontWeight = this._titleBold ? "bold" : "normal";
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
        const dimensions =
          this._myDataBinding.metadata.feeds.dimensions.values || [];

        // const measures =
        //   this._myDataBinding.metadata.feeds.measures.values || [];

        const measureMetadata =
          this._myDataBinding.metadata.mainStructureMembers || {};

        let measures = this._myDataBinding.metadata.feeds.measures.values || [];

        console.log("Measure IDs:", measures);

        console.log(
          "Measure Details:",
          measures.map((m) => ({
            id: m,
            label: measureMetadata[m]?.label,
            description: measureMetadata[m]?.description,
          })),
        );

        if (this._measureFilters.length > 0) {
          measures = measures.filter((measure) => {
            const label =
              measureMetadata[measure]?.label ||
              measureMetadata[measure]?.description ||
              measure;
            return (
              this._measureFilters.includes(measure) ||
              this._measureFilters.includes(label)
            );
          });
        }

        const rows = this._myDataBinding.data || [];

        let filteredRows = rows;

        Object.entries(this._dimensionFilters).forEach(
          ([dimensionName, filterValue]) => {
            filteredRows = filteredRows.filter((row) => {
              const value =
                row[dimensionName]?.label ?? row[dimensionName]?.id ?? "";

              return String(value) === String(filterValue);
            });
          },
        );

        /* =========================
          REMOVE ROWS WHERE ALL VISIBLE MEASURES ARE 0
        ========================= */
        filteredRows = filteredRows.filter((row) =>
          measures.some((measure) => Number(row[measure]?.raw || 0) !== 0),
        );

        const dimensionMetadata = this._myDataBinding.metadata.dimensions || {};

        if (!filteredRows.length) {
          content.innerHTML = "No Data Found";
          return;
        }

        let html = `
        <table class="table">
        <thead>
        <tr>
        `;

        dimensions.forEach((dim) => {
          const dimText = dimensionMetadata[dim]?.description || dim;
          //======1
          const style = this._columnStyles[dim] || {};

          html += `
          <th style="
            text-align:${style.headerAlignment || this._headerAlign};
            font-size:${style.headerFontSize || this._headerFontSize};
            color:${style.headerColor || this._headerColor};
            background:${style.headerBackground || this._headerBackground};
          ">
          ${dimText}
          </th>`;
        });

        measures.forEach((measure, index) => {
          const measureText =
            measureMetadata[measure]?.label ||
            measureMetadata[measure]?.description ||
            measure;

          const style = this._columnStyles[`measures_${index}`] || {};

          html += `
          <th style="
            text-align:${style.headerAlignment || this._headerAlign};
            font-size:${style.headerFontSize || this._headerFontSize};
            color:${style.headerColor || this._headerColor};
            background:${style.headerBackground || this._headerBackground};
          ">
            ${measureText}
          </th>`;
        });

        html += `
        </tr>
        </thead>
        <tbody>
        `;

        const totals = {};
        measures.forEach((m) => (totals[m] = 0));

        /* =========================
          CALCULATE TOTALS
        ========================= */
        filteredRows.forEach((row) => {
          measures.forEach((measure) => {
            totals[measure] += Number(row[measure]?.raw || 0);
          });
        });

        /* =========================
          TOTAL ROW FUNCTION
        ========================= */
        const createTotalRow = () => {
          let totalHtml = `<tr class="total-row">`;

          if (dimensions.length > 0) {
            totalHtml += `<td>Totals</td>`;

            for (let i = 1; i < dimensions.length; i++) {
              totalHtml += `<td></td>`;
            }
          }

          measures.forEach((measure) => {
            totalHtml += `
              <td style="text-align:right">
                ${totals[measure].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            `;
          });

          totalHtml += `</tr>`;

          return totalHtml;
        };

        /* =========================
          TOTAL AT TOP
        ========================= */
        if (this._totalPosition === "top") {
          html += createTotalRow();
        }

        /* =========================
          DATA ROWS
        ========================= */
        filteredRows.forEach((row) => {
          html += `<tr>`;

          dimensions.forEach((dim) => {
            const value = row[dim]?.label ?? row[dim]?.id ?? "";

            const style = this._columnStyles[dim] || {};

            html += `
              <td style="
                text-align:${style.valueAlignment || this._rowAlign};
                font-size:${style.valueFontSize || this._rowFontSize};
                color:${style.valueColor || this._rowColor};
                background:${style.valueBackground || this._rowBackground};
              ">
                ${value}
              </td>
            `;
          });

          measures.forEach((measure, index) => {
            const raw = Number(row[measure]?.raw || 0);

            const style = this._columnStyles[`measures_${index}`] || {};

            html += `
              <td style="
                text-align:${style.valueAlignment || this._rowAlign};
                font-size:${style.valueFontSize || this._rowFontSize};
                color:${style.valueColor || this._rowColor};
                background:${style.valueBackground || this._rowBackground};
              ">
                ${raw.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            `;
          });

          html += `</tr>`;
        });

        /* =========================
          TOTAL AT BOTTOM
        ========================= */
        if (this._totalPosition === "bottom") {
          html += createTotalRow();
        }

        html += `
          </tbody>
          </table>
        `;

        content.innerHTML = html;
      } catch (e) {
        content.innerHTML = "<pre>Error : " + e.message + "</pre>";
      }
    }
  }

  customElements.define("com-max-table-totaldue", TotalDueTableWidget);
})();
