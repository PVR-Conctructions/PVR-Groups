import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../hooks/useApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDollarSign, FiDownload, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/payments').then(res => {
            setPayments(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const statusConfig = {
        paid: { label: 'Paid', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: FiCheckCircle },
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', icon: FiClock },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: FiAlertCircle },
        refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400', icon: FiDollarSign },
    };

    const downloadInvoice = (payment) => {
        const doc = new jsPDF();
        const pw = doc.internal.pageSize.width;
        const m = 20;

        // Header
        doc.setFillColor(196, 164, 75);
        doc.rect(0, 0, pw, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(20, 30, 70);
        doc.text('PVR Groups', m, 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 140);
        doc.text('Building Luxury Living in Vijayawada', m, 32);

        // Invoice title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(196, 164, 75);
        doc.text('INVOICE', pw - m - 35, 25);

        // Invoice number and date
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 100);
        doc.text(`Invoice: ${payment.invoiceNumber}`, pw - m - 60, 35);
        doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`, pw - m - 60, 42);

        // Line
        doc.setDrawColor(196, 164, 75);
        doc.setLineWidth(0.5);
        doc.line(m, 48, pw - m, 48);

        // Customer
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(20, 30, 70);
        doc.text('Bill To:', m, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(70, 70, 90);
        doc.text(payment.userId?.name || 'Customer', m, 68);
        doc.text(payment.userId?.email || '', m, 75);

        // Payment table
        autoTable(doc, {
            startY: 90,
            head: [['Description', 'Project', 'Method', 'Status', 'Amount']],
            body: [[
                payment.description || 'Payment',
                payment.projectId?.name || 'N/A',
                payment.method,
                payment.status.toUpperCase(),
                'Rs.' + payment.amount.toLocaleString('en-IN'),
            ]],
            margin: { left: m, right: m },
            headStyles: { fillColor: [196, 164, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fontSize: 10 },
            styles: { cellPadding: 6 },
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(20, 30, 70);
        doc.text('Total: Rs.' + payment.amount.toLocaleString('en-IN'), pw - m - 55, finalY);

        // Footer
        const pageH = doc.internal.pageSize.height;
        doc.setFillColor(196, 164, 75);
        doc.rect(0, pageH - 15, pw, 15, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('PVR Groups | Building Luxury Living in Vijayawada', m, pageH - 5);

        doc.save(`Invoice_${payment.invoiceNumber}.pdf`);
    };

    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                        Payment <span className="text-gold-gradient">History</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View and download your payment records</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border">
                        <FiDollarSign size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No payment records found</p>
                        <p className="text-gray-400 text-sm mt-2">Your payment history will appear here</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/30">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Project</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Method</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p, i) => {
                                        const sc = statusConfig[p.status] || statusConfig.pending;
                                        return (
                                            <motion.tr
                                                key={p._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-border/20 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{p.projectId?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gold-400">₹{p.amount?.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{p.method}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                                                        <sc.icon size={12} /> {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => downloadInvoice(p)}
                                                        className="p-2 rounded-lg text-gold-400 hover:bg-gold-400/10 transition-colors"
                                                        title="Download Invoice"
                                                    >
                                                        <FiDownload size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PaymentHistory;
