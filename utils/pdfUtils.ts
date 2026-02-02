
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
            backgroundColor: '#f8fafc',
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    // Remove fixed height and overflow restrictions to capture all content
                    clonedElement.style.height = 'auto';
                    clonedElement.style.maxHeight = 'none';
                    clonedElement.style.overflow = 'visible';

                    // Also find the scrollable body of the grid
                    const scrollableBody = clonedElement.querySelector('.overflow-y-auto');
                    if (scrollableBody) {
                        (scrollableBody as HTMLElement).style.height = 'auto';
                        (scrollableBody as HTMLElement).style.maxHeight = 'none';
                        (scrollableBody as HTMLElement).style.overflow = 'visible';
                    }
                }
            }
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
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions to fit width
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content is taller than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
