import type { AdminViewServerProps } from 'payload'

import { CSV_COLUMNS } from '@/lib/admin/csv'

import { ImportForm } from './ImportForm'
import { ToolView } from './ToolView'

export default function ImportExportView(props: AdminViewServerProps) {
  return (
    <ToolView props={props} title="Excel import / export" intro="Download all products as a spreadsheet, change prices or stock in Excel, then upload it back. Rows are matched by SKU.">
      <div className="py-form">
        <fieldset>
          <legend>1. Download</legend>
          {/* A file download from the API, not a page navigation. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn--style-primary btn--size-medium" href="/api/tools/products-export" data-testid="export-csv">
            Download products (.csv)
          </a>
          <p className="py-muted">Opens in Excel or Google Sheets. Keep the first row (column names) as it is.</p>
        </fieldset>
        <fieldset>
          <legend>2. Upload changes</legend>
          <ImportForm />
        </fieldset>
        <details className="py-help">
          <summary>Column guide</summary>
          <p>
            Columns: <code>{CSV_COLUMNS.join(', ')}</code>
          </p>
          <ul>
            <li>Leave a cell empty to keep the current value.</li>
            <li>
              <code>categories</code>: names separated by <code>|</code>, e.g. <code>Brake Pads|Service Parts</code>
            </li>
            <li>
              <code>fitments</code>: <code>Make|Model|FromYear|ToYear|Engine</code>, several separated by <code>;</code>, e.g. <code>Toyota|Corolla|2014|2022|1.8L; Toyota|Yaris|2019||</code>
            </li>
            <li>
              <code>status</code>: <code>published</code> or <code>draft</code>. New rows need sku, title, brand, categories and price.
            </li>
          </ul>
        </details>
      </div>
    </ToolView>
  )
}
