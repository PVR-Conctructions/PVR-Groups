import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProjectPDF = (project) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let y = 20;

        // ===== HEADER =====
        // Gold accent bar
        doc.setFillColor(196, 164, 75);
        doc.rect(0, 0, pageWidth, 8, 'F');

        // Company name
        y = 25;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(20, 30, 70);
        doc.text('PVR Groups', margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 140);
        doc.text('Building Luxury Living in Vijayawada', margin, y + 7);

        // ===== PROJECT TITLE =====
        y = 50;
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(margin - 5, y - 8, pageWidth - 2 * margin + 10, 28, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(20, 30, 70);
        doc.text(project.name || 'Untitled Project', margin, y + 2);

        // Status badge
        const statusText = project.status === 'ongoing' ? 'ONGOING' : 'COMPLETED';
        const statusColor = project.status === 'ongoing' ? [34, 197, 94] : [196, 164, 75];
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const statusWidth = doc.getTextWidth(statusText) + 10;
        doc.setFillColor(...statusColor);
        doc.roundedRect(pageWidth - margin - statusWidth, y - 6, statusWidth, 16, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(statusText, pageWidth - margin - statusWidth + 5, y + 4);

        // Location
        if (project.location?.address) {
            y += 18;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 120);
            doc.text('Location: ' + project.location.address, margin, y);
        }

        // ===== KEY DETAILS TABLE =====
        y += 15;
        const details = [];
        if (project.price) details.push(['Price', project.price]);
        if (project.area) details.push(['Area', project.area]);
        if (project.units) details.push(['Units', project.units]);
        if (project.status) details.push(['Status', project.status.charAt(0).toUpperCase() + project.status.slice(1)]);

        if (details.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(20, 30, 70);
            doc.text('Project Details', margin, y);
            y += 5;

            autoTable(doc, {
                startY: y,
                head: [['Feature', 'Details']],
                body: details,
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: [196, 164, 75],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 10,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [50, 50, 70],
                },
                alternateRowStyles: { fillColor: [248, 248, 252] },
                styles: { cellPadding: 5 },
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // ===== DESCRIPTION =====
        if (project.description) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(20, 30, 70);
            doc.text('About This Project', margin, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(70, 70, 90);
            const lines = doc.splitTextToSize(project.description, pageWidth - 2 * margin);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 10;
        }

        // ===== AMENITIES =====
        if (project.amenities && project.amenities.length > 0) {
            if (y > 240) { doc.addPage(); y = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(20, 30, 70);
            doc.text('Amenities', margin, y);
            y += 5;

            const amenityRows = project.amenities.map(a => [
                typeof a === 'string' ? a : (a.name || '-')
            ]);

            autoTable(doc, {
                startY: y,
                body: amenityRows,
                margin: { left: margin, right: margin },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [50, 50, 70],
                },
                alternateRowStyles: { fillColor: [248, 248, 252] },
                styles: { cellPadding: 4 },
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // ===== HIGHLIGHTS =====
        if (project.highlights && project.highlights.length > 0) {
            if (y > 250) { doc.addPage(); y = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(20, 30, 70);
            doc.text('Highlights', margin, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(70, 70, 90);
            project.highlights.forEach((h) => {
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text('- ' + h, margin + 5, y);
                y += 6;
            });
            y += 5;
        }

        // ===== CONTACT INFO =====
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(20, 30, 70);
        doc.text('Contact Us', margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 90);
        doc.text('Phone: +91 8885420306', margin, y);
        y += 6;
        doc.text('WhatsApp: wa.me/8885420306', margin, y);
        y += 6;
        doc.text('Website: www.pvrgroups.in', margin, y);

        // ===== FOOTER =====
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageH = doc.internal.pageSize.height;

            // Gold bottom bar
            doc.setFillColor(196, 164, 75);
            doc.rect(0, pageH - 15, pageWidth, 15, 'F');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text('PVR Groups | Building Luxury Living in Vijayawada', margin, pageH - 5);
            doc.text('Page ' + i + ' of ' + pageCount, pageWidth - margin - 25, pageH - 5);

            // Generated date
            doc.setTextColor(150, 150, 170);
            const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            doc.text('Generated on ' + dateStr, pageWidth / 2 - 20, pageH - 20);
        }

        // Save
        const filename = (project.name || 'project').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '_PVR_Groups.pdf';
        doc.save(filename);
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Failed to generate PDF. Please try again.');
    }
};
