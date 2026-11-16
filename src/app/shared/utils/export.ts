export interface ExportSection {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Export générique d'un ou plusieurs tableaux vers Excel (.xlsx) ou PDF — utilisé par les pages de
 * listes (paiements, pénalités, réunions...) pour exporter ce qui est actuellement affiché/filtré,
 * éventuellement accompagné d'un second tableau complémentaire (ex: membres n'ayant pas payé).
 * N'appelle jamais XLSX.read/parse (seulement l'écriture) : les vulnérabilités connues du paquet
 * "xlsx" concernent la lecture de fichiers non fiables, pas la génération depuis nos propres données.
 *
 * Import dynamique : "jspdf" embarque html2canvas (~400 Ko) et "xlsx" est volumineux lui aussi —
 * on évite d'alourdir le chunk de chaque page de liste alors que l'export n'est utilisé qu'à la
 * demande, rarement.
 */
export async function exportSectionsToExcel(filename: string, sections: ExportSection[]): Promise<void> {
  const XLSX = await import('xlsx');
  const aoa: (string | number)[][] = [];
  for (const section of sections) {
    if (aoa.length > 0) {
      aoa.push([]);
    }
    aoa.push([section.title]);
    aoa.push(section.headers);
    aoa.push(...section.rows);
  }
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportSectionsToPdf(filename: string, mainTitle: string, sections: ExportSection[]): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(mainTitle, 14, 15);

  let cursorY = 24;
  for (const section of sections) {
    doc.setFontSize(11);
    doc.text(section.title, 14, cursorY);
    autoTable(doc, {
      head: [section.headers],
      body: section.rows,
      startY: cursorY + 3,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [20, 83, 45] },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  doc.save(`${filename}.pdf`);
}
