import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Color palette ──
const NAVY = [15, 23, 42];
const DARK = [30, 41, 59];
const GOLD = [196, 164, 75];
const GOLD_LIGHT = [255, 248, 225];
const WHITE = [255, 255, 255];
const GRAY = [100, 116, 139];
const LIGHT_BG = [248, 250, 252];
const GREEN = [34, 197, 94];

const drawGoldLine = (doc, y, margin, pageWidth) => {
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
};

const checkPage = (doc, y, needed = 30) => {
    if (y > doc.internal.pageSize.height - needed - 20) {
        doc.addPage();
        return 25;
    }
    return y;
};

const sectionTitle = (doc, text, y, margin, emoji = '') => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    const label = emoji ? emoji + '  ' + text : text;
    doc.text(label, margin, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 3, margin + 40, y + 3);
    return y + 12;
};

export const generateProjectPDF = (project) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 18;
        const contentWidth = pageWidth - 2 * margin;
        let y = 0;

        // ═══════════════════════════════════════════════
        // PAGE 1 — HEADER
        // ═══════════════════════════════════════════════

        // Full-width navy header banner
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, pageWidth, 52, 'F');

        // Gold accent stripe
        doc.setFillColor(...GOLD);
        doc.rect(0, 52, pageWidth, 3, 'F');

        // Company logo text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(...WHITE);
        doc.text('PVR', margin, 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(28);
        doc.text(' GROUPS', margin + doc.getTextWidth('PVR'), 24);

        // Tagline
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...GOLD);
        doc.text('Building Luxury Living in Vijayawada', margin, 34);

        // Contact info on right
        doc.setFontSize(8);
        doc.setTextColor(180, 190, 210);
        doc.text('www.pvrgroups.in', pageWidth - margin, 20, { align: 'right' });
        doc.text('+91 987654321', pageWidth - margin, 27, { align: 'right' });
        doc.text('Vijayawada, Andhra Pradesh', pageWidth - margin, 34, { align: 'right' });

        // ═══════════════════════════════════════════════
        // PROJECT TITLE SECTION
        // ═══════════════════════════════════════════════
        y = 68;

        // Project name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...NAVY);
        const nameLines = doc.splitTextToSize(project.name || 'Untitled Project', contentWidth - 50);
        doc.text(nameLines, margin, y);
        y += nameLines.length * 9;

        // Status badge
        const statusText = project.status === 'ongoing' ? 'ONGOING' : 'COMPLETED';
        const statusColor = project.status === 'ongoing' ? GREEN : GOLD;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const sw = doc.getTextWidth(statusText) + 12;
        doc.setFillColor(...statusColor);
        doc.roundedRect(margin, y - 1, sw, 14, 3, 3, 'F');
        doc.setTextColor(...WHITE);
        doc.text(statusText, margin + 6, y + 8);

        // Project type badge next to status
        if (project.projectType) {
            doc.setFillColor(...DARK);
            const ptw = doc.getTextWidth(project.projectType) + 12;
            doc.roundedRect(margin + sw + 5, y - 1, ptw, 14, 3, 3, 'F');
            doc.setTextColor(...GOLD);
            doc.text(project.projectType, margin + sw + 11, y + 8);
        }
        y += 20;

        // Location
        if (project.location?.address) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...GRAY);
            doc.text('Location:  ' + project.location.address, margin, y);
            y += 10;
        }

        // ═══════════════════════════════════════════════
        // COMPLETION PROGRESS BAR (ongoing only)
        // ═══════════════════════════════════════════════
        if (project.status === 'ongoing' && project.completionPercentage > 0) {
            y = checkPage(doc, y, 35);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 10;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...NAVY);
            doc.text('Project Progress', margin, y);
            doc.setTextColor(...GREEN);
            doc.text(project.completionPercentage + '%', pageWidth - margin, y, { align: 'right' });
            y += 8;

            // Progress bar background
            const barWidth = contentWidth;
            const barHeight = 8;
            doc.setFillColor(230, 230, 235);
            doc.roundedRect(margin, y, barWidth, barHeight, 3, 3, 'F');

            // Progress bar fill
            const fillWidth = (project.completionPercentage / 100) * barWidth;
            doc.setFillColor(...GREEN);
            doc.roundedRect(margin, y, fillWidth, barHeight, 3, 3, 'F');

            y += 14;

            // Labels
            doc.setFontSize(7);
            doc.setTextColor(...GRAY);
            const labels = ['Foundation', 'Structure', 'Finishing', 'Handover'];
            labels.forEach((l, i) => {
                doc.text(l, margin + (i / 3) * barWidth, y);
            });
            y += 8;

            if (project.possessionDate) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...GRAY);
                doc.text('Expected Possession: ' + project.possessionDate, margin, y);
                y += 8;
            }
        }

        // ═══════════════════════════════════════════════
        // KEY DETAILS TABLE
        // ═══════════════════════════════════════════════
        y = checkPage(doc, y, 50);
        drawGoldLine(doc, y, margin, pageWidth);
        y += 8;
        y = sectionTitle(doc, 'Project Overview', y, margin);

        const details = [];
        if (project.price) details.push(['Price', project.price]);
        if (project.area) details.push(['Area', project.area]);
        if (project.units) details.push(['Units', project.units]);
        if (project.projectType) details.push(['Project Type', project.projectType]);
        if (project.totalFloors) details.push(['Total Floors', project.totalFloors]);
        if (project.totalLandArea) details.push(['Total Land Area', project.totalLandArea]);
        if (project.constructionType) details.push(['Construction Type', project.constructionType]);
        if (project.possessionDate) details.push(['Possession Date', project.possessionDate]);
        if (project.reraNumber) details.push(['RERA Number', project.reraNumber]);
        if (project.status) details.push(['Status', project.status.charAt(0).toUpperCase() + project.status.slice(1)]);
        if (project.configurations && project.configurations.length > 0) {
            if (typeof project.configurations[0] === 'string') {
                details.push(['Configurations', project.configurations.join(', ')]);
            } else {
                details.push(['Configurations', project.configurations.map(c => c.type).join(', ')]);
            }
        }
        if (project.bankApprovals && project.bankApprovals.length > 0) {
            details.push(['Bank Approvals', project.bankApprovals.join(', ')]);
        }

        if (details.length > 0) {
            autoTable(doc, {
                startY: y,
                body: details,
                margin: { left: margin, right: margin },
                theme: 'plain',
                styles: { cellPadding: { top: 5, bottom: 5, left: 8, right: 8 }, fontSize: 10 },
                columnStyles: {
                    0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 55 },
                    1: { textColor: DARK },
                },
                alternateRowStyles: { fillColor: LIGHT_BG },
                didDrawCell: (data) => {
                    // gold left border on each row
                    if (data.column.index === 0) {
                        doc.setFillColor(...GOLD);
                        doc.rect(data.cell.x, data.cell.y, 2, data.cell.height, 'F');
                    }
                },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // ═══════════════════════════════════════════════
        // AVAILABLE CONFIGURATIONS
        // ═══════════════════════════════════════════════
        if (project.configurations && project.configurations.length > 0 && typeof project.configurations[0] === 'object') {
            y = checkPage(doc, y, 40);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'Available Configurations', y, margin);

            const configEntries = project.configurations.map(c => [
                c.type || '-',
                c.price || '-',
                c.area || '-',
                c.bedrooms?.toString() || '-',
                c.bathrooms?.toString() || '-',
                [
                    c.balconies ? `${c.balconies} Balc.` : '',
                    c.parking ? `${c.parking} Pkg.` : ''
                ].filter(Boolean).join(', ') || '-'
            ]);

            autoTable(doc, {
                startY: y,
                head: [['Type', 'Price', 'Area', 'Beds', 'Baths', 'Extras']],
                body: configEntries,
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: NAVY,
                    textColor: WHITE,
                    fontStyle: 'bold',
                    fontSize: 9,
                },
                bodyStyles: { fontSize: 8.5, textColor: DARK },
                alternateRowStyles: { fillColor: LIGHT_BG },
                styles: { cellPadding: 4 },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // ═══════════════════════════════════════════════
        // DESCRIPTION
        // ═══════════════════════════════════════════════
        if (project.description) {
            y = checkPage(doc, y, 40);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'About This Project', y, margin);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 80);
            const descLines = doc.splitTextToSize(project.description, contentWidth);
            descLines.forEach((line) => {
                y = checkPage(doc, y);
                doc.text(line, margin, y);
                y += 5.5;
            });
            y += 5;
        }

        // ═══════════════════════════════════════════════
        // BEST FEATURES
        // ═══════════════════════════════════════════════
        if (project.bestFeatures && project.bestFeatures.length > 0) {
            y = checkPage(doc, y, 40);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'Best Features', y, margin);

            project.bestFeatures.forEach((feature, i) => {
                y = checkPage(doc, y, 18);

                // Feature card with gold accent
                const featureLines = doc.splitTextToSize(feature, contentWidth - 20);
                const cardH = featureLines.length * 5.5 + 8;
                doc.setFillColor(...GOLD_LIGHT);
                doc.roundedRect(margin, y - 4, contentWidth, cardH, 2, 2, 'F');
                doc.setFillColor(...GOLD);
                doc.rect(margin, y - 4, 3, cardH, 'F');

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...DARK);
                doc.text('★', margin + 8, y + 2);
                doc.text(featureLines, margin + 16, y + 2);
                y += cardH + 4;
            });
            y += 3;
        }

        // ═══════════════════════════════════════════════
        // AMENITIES (2-column grid)
        // ═══════════════════════════════════════════════
        if (project.amenities && project.amenities.length > 0) {
            y = checkPage(doc, y, 40);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'Amenities', y, margin);

            const colWidth = (contentWidth - 8) / 2;
            const amenities = project.amenities.map(a => typeof a === 'string' ? a : a.name || '-');

            for (let i = 0; i < amenities.length; i += 2) {
                y = checkPage(doc, y, 14);
                // Left column
                doc.setFillColor(...LIGHT_BG);
                doc.roundedRect(margin, y - 4, colWidth, 12, 2, 2, 'F');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...GREEN);
                doc.text('✓', margin + 4, y + 3);
                doc.setTextColor(...DARK);
                doc.text(amenities[i], margin + 12, y + 3);

                // Right column
                if (i + 1 < amenities.length) {
                    const rightX = margin + colWidth + 8;
                    doc.setFillColor(...LIGHT_BG);
                    doc.roundedRect(rightX, y - 4, colWidth, 12, 2, 2, 'F');
                    doc.setTextColor(...GREEN);
                    doc.text('✓', rightX + 4, y + 3);
                    doc.setTextColor(...DARK);
                    doc.text(amenities[i + 1], rightX + 12, y + 3);
                }
                y += 15;
            }
            y += 3;
        }

        // ═══════════════════════════════════════════════
        // SPECIFICATIONS
        // ═══════════════════════════════════════════════
        const specs = project.specifications;
        const specEntries = specs ? [
            ['Flooring', specs.flooring],
            ['Doors', specs.doors],
            ['Windows', specs.windows],
            ['Kitchen', specs.kitchen],
            ['Bathroom', specs.bathroom],
            ['Electrical', specs.electrical],
            ['Painting', specs.painting],
        ].filter(([, v]) => v) : [];

        if (specEntries.length > 0) {
            y = checkPage(doc, y, 40);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'Specifications', y, margin);

            autoTable(doc, {
                startY: y,
                head: [['Category', 'Details']],
                body: specEntries,
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: NAVY,
                    textColor: WHITE,
                    fontStyle: 'bold',
                    fontSize: 10,
                },
                bodyStyles: { fontSize: 9.5, textColor: DARK },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: NAVY } },
                alternateRowStyles: { fillColor: LIGHT_BG },
                styles: { cellPadding: 5 },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // ═══════════════════════════════════════════════
        // HIGHLIGHTS
        // ═══════════════════════════════════════════════
        if (project.highlights && project.highlights.length > 0) {
            y = checkPage(doc, y, 30);
            drawGoldLine(doc, y, margin, pageWidth);
            y += 8;
            y = sectionTitle(doc, 'Highlights', y, margin);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...DARK);
            project.highlights.forEach((h) => {
                y = checkPage(doc, y);
                doc.setTextColor(...GOLD);
                doc.text('▸', margin + 4, y);
                doc.setTextColor(...DARK);
                doc.text(h, margin + 12, y);
                y += 7;
            });
            y += 3;
        }

        // ═══════════════════════════════════════════════
        // CONTACT SECTION
        // ═══════════════════════════════════════════════
        y = checkPage(doc, y, 55);
        drawGoldLine(doc, y, margin, pageWidth);
        y += 8;

        // Contact card with navy background
        doc.setFillColor(...NAVY);
        doc.roundedRect(margin, y, contentWidth, 45, 4, 4, 'F');

        // Gold accent on left
        doc.setFillColor(...GOLD);
        doc.rect(margin, y, 4, 45, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...GOLD);
        doc.text('Get In Touch', margin + 14, y + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(200, 210, 225);
        doc.text('Phone:  +91 8885420306', margin + 14, y + 24);
        doc.text('WhatsApp:  wa.me/8885420306', margin + 14, y + 32);
        doc.text('Website:  www.pvrgroups.in', margin + 14, y + 40);

        // Right side — CTA
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...GOLD);
        doc.text('Scan or Visit Us Today!', pageWidth - margin - 10, y + 20, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 170, 190);
        doc.text('PVR Groups Pvt. Ltd.', pageWidth - margin - 10, y + 30, { align: 'right' });
        doc.text('Vijayawada, AP, India', pageWidth - margin - 10, y + 37, { align: 'right' });

        // ═══════════════════════════════════════════════
        // FOOTER ON ALL PAGES
        // ═══════════════════════════════════════════════
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pH = doc.internal.pageSize.height;

            // Navy footer bar
            doc.setFillColor(...NAVY);
            doc.rect(0, pH - 18, pageWidth, 18, 'F');

            // Gold accent line above footer
            doc.setFillColor(...GOLD);
            doc.rect(0, pH - 18, pageWidth, 2, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...GOLD);
            doc.text('PVR GROUPS', margin, pH - 6);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(160, 170, 190);
            doc.text('|  Building Luxury Living in Vijayawada', margin + doc.getTextWidth('PVR GROUPS') + 3, pH - 6);

            doc.text('Page ' + i + ' of ' + pageCount, pageWidth - margin, pH - 6, { align: 'right' });

            // Generated date centered
            const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            doc.setFontSize(7);
            doc.setTextColor(130, 140, 160);
            doc.text('Generated on ' + dateStr, pageWidth / 2, pH - 6, { align: 'center' });

            // Thin gold top bar on pages after first
            if (i > 1) {
                doc.setFillColor(...GOLD);
                doc.rect(0, 0, pageWidth, 3, 'F');
            }
        }

        // ═══ Save ═══
        const filename = (project.name || 'project').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '_PVR_Groups.pdf';
        doc.save(filename);
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Failed to generate PDF. Please try again.');
    }
};
