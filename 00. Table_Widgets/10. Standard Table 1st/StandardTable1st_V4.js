(function () {
  class StandardTableWidget1 extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      /* =========================
        TITLE STYLE
      ========================= */
      this._titleText = "DETAILED TABLE";
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
        measures_1: {
          headerAlignment: "right",
          headerFontSize: "14px",
          headerColor: "#FFFFFF",
          headerBackground: "#16263b",
          valueAlignment: "right",
          valueFontSize: "12px",
          valueColor: "#000000",
          valueBackground: "#F8F9FB",
        },
        measures_2: {
          headerAlignment: "right",
          headerFontSize: "14px",
          headerColor: "#FFFFFF",
          headerBackground: "#16263b",
          valueAlignment: "right",
          valueFontSize: "12px",
          valueColor: "#000000",
          valueBackground: "#F8F9FB",
        },
        measures_3: {
          headerAlignment: "right",
          headerFontSize: "14px",
          headerColor: "#FFFFFF",
          headerBackground: "#16263b",
          valueAlignment: "right",
          valueFontSize: "12px",
          valueColor: "#000000",
          valueBackground: "#F8F9FB",
        },
        measures_4: {
          headerAlignment: "right",
          headerFontSize: "14px",
          headerColor: "#FFFFFF",
          headerBackground: "#16263b",
          valueAlignment: "right",
          valueFontSize: "12px",
          valueColor: "#000000",
          valueBackground: "#F8F9FB",
        },
        measures_5: {
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
        AVERAGE ENAGLING
      ========================= */

      this._enableAveraging = false;

      /* =========================
        DIMENSION FILTER
      ========================= */
      this._dimensionFilters = {};
      this._hiddenDimensions = [];

      /* =========================
        MEASURE FILTER
      ========================= */
      this._measureFilters = [];

      /* =========================
        REMOVE DUPLICATES
      ========================= */
      this._distinctDimension = "";

      /* =========================
        DIMENSION AS MEASURE
      ========================= */
      this._dimensionMeasures = [];

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

            display:flex;
            justify-content:space-between;
            align-items:center;
        }

        #exportExcelBtn{
            padding:5px 12px;
            border:none;
            border-radius:4px;
            cursor:pointer;
            background:white;
            color:#1b2a41;
            font-weight:bold;
        }

        </style>

        <div class="outer">

            <div class="card">

                <div id="title" class="title">
                    <span id="titleText"></span>
                    <button id="exportExcelBtn">Export</button>
                </div>

                <div class="container">
                    <div id="content" class="table-container">
                        Loading...
                    </div>
                </div>

            </div>

        </div>

        `;

      this.shadowRoot
        .getElementById("exportExcelBtn")
        .addEventListener("click", () => {
          this.exportExcel();
        });
    }

    connectedCallback() {
      this.render();

      console.log("connected");

      // const btn = this.shadowRoot.getElementById("exportExcelBtn");

      // btn.onclick = () => {
      //   this.exportExcel();
      // };

      // this.shadowRoot
      //   .getElementById("exportExcelBtn")
      //   ?.addEventListener("click", () => {
      //     this.exportExcel();
      //   });
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
      HIDE DIMENSIONS
    ========================= */
    hideDimensions(dimensionNames) {
      this._hiddenDimensions = String(dimensionNames)
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);

      this.render();
    }
    showAllDimensions() {
      this._hiddenDimensions = [];
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
      ENABLE AVERAGING
    ========================= */
    enableAveraging(enable) {
      this._enableAveraging = Boolean(enable);
      this.render();
    }

    /* =========================
      MEASURE FILTER
    ========================= */
    // setVisibleMeasures(...measureNames) {
    //   this._measureFilters = measureNames.flat();
    //   this.render();
    // }

    setVisibleMeasures(measureNames) {
      this._measureFilters = String(measureNames)
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      this.render();
    }

    clearVisibleMeasures() {
      this._measureFilters = [];
      this.render();
    }

    /* =========================
      REMOVE DUPLICATES
    ========================= */
    setDistinctDimension(dimensionName) {
      this._distinctDimension = dimensionName;
      this.render();
    }

    clearDistinctDimension() {
      this._distinctDimension = "";
      this.render();
    }

    /* =========================
      DIMENSION AS MEASURE
    ========================= */
    setDimensionAsMeasure(...dimensionNames) {
      this._dimensionMeasures = dimensionNames.flat();
      this.render();
    }

    clearDimensionAsMeasure() {
      this._dimensionMeasures = [];
      this.render();
    }

    render() {
      const title = this.shadowRoot.getElementById("title");
      const titleText = this.shadowRoot.getElementById("titleText");

      if (title && titleText) {
        titleText.textContent = this._titleText;

        title.style.background = this._titleBackground;
        title.style.textAlign = this._titleAlign;

        titleText.style.color = this._titleColor;
        titleText.style.fontSize = this._titleFontSize;
        titleText.style.fontWeight = this._titleBold ? "bold" : "normal";
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
        let dimensions =
          this._myDataBinding.metadata.feeds.dimensions.values || [];
        dimensions = dimensions.filter(
          (dim) => !this._hiddenDimensions.includes(dim),
        );

        const measureMetadata =
          this._myDataBinding.metadata.mainStructureMembers || {};

        let measures = this._myDataBinding.metadata.feeds.measures.values || [];

        // Append selected dimensions as measures
        measures = [...measures, ...this._dimensionMeasures];

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

        /* =========================
          REMOVE DUPLICATES BY DIMENSION
        ========================= */
        if (this._distinctDimension) {
          const seen = new Set();

          filteredRows = filteredRows.filter((row) => {
            const value =
              row[this._distinctDimension]?.id ??
              row[this._distinctDimension]?.label ??
              "";

            if (seen.has(value)) {
              return false;
            }

            seen.add(value);
            return true;
          });
        }

        const dimensionMetadata = this._myDataBinding.metadata.dimensions || {};

        this._exportDimensions = dimensions;
        this._exportMeasures = measures;
        this._exportRows = filteredRows;

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
            dimensionMetadata[measure]?.description ||
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
            const value = Number(
              row[measure]?.raw ?? row[measure]?.label ?? row[measure]?.id ?? 0,
            );

            totals[measure] += value;
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
            let value = totals[measure];
            if (this._enableAveraging) {
              value = filteredRows.length
                ? totals[measure] / filteredRows.length
                : 0;
            }
            totalHtml += `
            <td style="text-align:right">
              ${value.toLocaleString(undefined, {
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
            const raw = Number(
              row[measure]?.raw ?? row[measure]?.label ?? row[measure]?.id ?? 0,
            );

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

    exportExcel() {
      if (!this._exportRows) return;

      const dimensions = this._exportDimensions;
      const measures = this._exportMeasures;
      const rows = this._exportRows;

      const measureMetadata =
        this._myDataBinding.metadata.mainStructureMembers || {};

      const dimensionMetadata = this._myDataBinding.metadata.dimensions || {};

      let html = "<table border='1'>";

      html += "<tr>";

      dimensions.forEach((dim) => {
        html += "<th>" + (dimensionMetadata[dim]?.description || dim) + "</th>";
      });

      measures.forEach((measure) => {
        html +=
          "<th>" +
          (measureMetadata[measure]?.label ||
            measureMetadata[measure]?.description ||
            dimensionMetadata[measure]?.description ||
            measure) +
          "</th>";
      });

      html += "</tr>";

      rows.forEach((row) => {
        html += "<tr>";

        dimensions.forEach((dim) => {
          html += "<td>" + (row[dim]?.label ?? row[dim]?.id ?? "") + "</td>";
        });

        measures.forEach((measure) => {
          html +=
            "<td>" +
            Number(
              row[measure]?.raw ?? row[measure]?.label ?? row[measure]?.id ?? 0,
            ) +
            "</td>";
        });

        html += "</tr>";
      });

      html += "</table>";

      const blob = new Blob([html], {
        type: "application/vnd.ms-excel",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Standard_Table.xls";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  customElements.define("com-max-table-standard1", StandardTableWidget1);
})();
