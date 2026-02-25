import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const stats = [
    { value: 25, suffix: '+', label: 'Years Experience' },
    { value: 150, suffix: '+', label: 'Projects Completed' },
    { value: 5000, suffix: '+', label: 'Happy Families' },
    { value: 10, suffix: 'M+', label: 'Sq.Ft Delivered' },
];

const AchievementCounter = () => {
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

    return (
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="text-3xl md:text-4xl font-heading font-bold text-gold-400 mb-2">
                        {inView ? <CountUp end={stat.value} duration={2.5} separator="," /> : '0'}
                        <span>{stat.suffix}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default AchievementCounter;
