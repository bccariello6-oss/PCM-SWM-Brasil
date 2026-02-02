
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, fileName: string = 'programacao-semanal.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found.`);
        return;
    }

    try {
        // Hide buttons during export
        const actionsPanel = element.querySelector('.flex.justify-between.items-center');
        if (actionsPanel) (actionsPanel as HTMLElement).style.display = 'none';

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#f8fafc' // slate-50 mismatch
        });

        // Restore buttons
        if (actionsPanel) (actionsPanel as HTMLElement).style.display = 'flex';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
