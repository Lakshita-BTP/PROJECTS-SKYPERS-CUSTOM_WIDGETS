(function () {
  class MilestonTableWidget extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this.shadowRoot.innerHTML = `
        <style>

        .container{
            width:100%;
            height:100%;
            overflow:auto;
            box-sizing:border-box;
        }

        .table{
            width:100%;
            border-collapse:collapse;
            table-layout:auto;
            font-size:12px;
        }

        .table thead{
            position:sticky;
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

        </style>

        <div id="content" class="container">
            Loading...
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
        const dimensions =
          this._myDataBinding.metadata.feeds.dimensions.values || [];

        const measures =
          this._myDataBinding.metadata.feeds.measures.values || [];

        const measureMetadata =
          this._myDataBinding.metadata.mainStructureMembers || {};

        const rows = this._myDataBinding.data || [];

        const dimensionMetadata = this._myDataBinding.metadata.dimensions || {};

        if (!rows.length) {
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

          html += `<th>${dimText}</th>`;
        });

        measures.forEach((measure) => {
          const measureText =
            measureMetadata[measure]?.label ||
            measureMetadata[measure]?.description ||
            measure;

          html += `<th>${measureText}</th>`;
        });

        html += `
        </tr>
        </thead>
        <tbody>
        `;

        const totals = {};

        measures.forEach((m) => (totals[m] = 0));

        rows.forEach((row, index) => {
          html += `<tr>`;

          dimensions.forEach((dim) => {
            const value = row[dim]?.label ?? row[dim]?.id ?? "";

            html += `<td>${value}</td>`;
          });

          measures.forEach((measure) => {
            const raw = Number(row[measure]?.raw || 0);

            totals[measure] += raw;

            html += `
                <td style="text-align:right">
                    ${raw.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                `;
          });

          html += `</tr>`;
        });

        html += `<tr class="total-row">`;

        if (dimensions.length > 0) {
          html += `<td>Totals</td>`;

          for (let i = 1; i < dimensions.length; i++) {
            html += `<td></td>`;
          }
        }

        measures.forEach((measure) => {
          html += `
            <td style="text-align:right">
                ${totals[measure].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </td>
            `;
        });

        html += `
        </tr>
        </tbody>
        </table>
        `;

        content.innerHTML = html;
      } catch (e) {
        content.innerHTML = "<pre>Error : " + e.message + "</pre>";
      }
    }

    /* =========================
      PDF EXPORT
    ========================= */
  }

  customElements.define("com-max-table-milestone", MilestonTableWidget);
})();
