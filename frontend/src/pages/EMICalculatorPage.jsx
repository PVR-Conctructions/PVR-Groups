import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import { FiDollarSign } from 'react-icons/fi';

const EMICalculatorPage = () => {
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);

    const monthlyRate = interestRate / 100 / 12;
    const months = tenure * 12;
    const emi = monthlyRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : loanAmount / months;
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />

            <HeroBanner
                title={<>EMI <span className="text-gold-gradient">Calculator</span></>}
                subtitle="Plan your home loan with our easy-to-use EMI calculator"
            />

            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-border">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Inputs */}
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount</label>
                                        <span className="text-sm font-semibold text-gold-400">{formatCurrency(loanAmount)}</span>
                                    </div>
                                    <input type="range" min="500000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full accent-gold-400" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹5L</span><span>₹5Cr</span></div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate</label>
                                        <span className="text-sm font-semibold text-gold-400">{interestRate}%</span>
                                    </div>
                                    <input type="range" min="5" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full accent-gold-400" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5%</span><span>20%</span></div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Tenure</label>
                                        <span className="text-sm font-semibold text-gold-400">{tenure} Years</span>
                                    </div>
                                    <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-gold-400" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1 yr</span><span>30 yrs</span></div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                                        <FiDollarSign size={28} className="text-gold-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Your Monthly EMI</p>
                                    <p className="text-4xl font-heading font-bold text-gold-400">{formatCurrency(emi)}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(loanAmount)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-border/50">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Interest</span>
                                        <span className="text-sm font-semibold text-red-500">{formatCurrency(totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-gold-400/10 border border-gold-400/20">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Payment</span>
                                        <span className="text-sm font-bold text-gold-400">{formatCurrency(totalPayment)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default EMICalculatorPage;
