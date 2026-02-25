import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

const translations = {
    en: {
        home: 'Home', projects: 'Projects', dashboard: 'Dashboard', contact: 'Contact',
        emiCalculator: 'EMI Calculator', virtualTour: 'Virtual Tour', announcements: 'Announcements',
        messages: 'Messages', login: 'Sign In', register: 'Register', logout: 'Logout',
        welcome: 'Welcome to PVR Groups', tagline: 'Building Luxury Living in Vijayawada',
        ourProjects: 'Our Projects', viewAll: 'View All', ongoingProjects: 'Ongoing Projects',
        completedProjects: 'Completed Projects', bookSiteVisit: 'Book Site Visit', contactSales: 'Contact Sales',
        aboutProject: 'About This Project', amenities: 'Amenities', location: 'Location',
        customerReviews: 'Customer Reviews', leaveReview: 'Leave a Review', submitReview: 'Submit Review',
        saveFavorite: 'Save', saved: 'Saved', compare: 'Compare', shareAsPDF: 'Share as PDF',
        paymentHistory: 'Payment History', referEarn: 'Refer & Earn', myFavorites: 'My Favorites',
        siteVisits: 'Site Visits', notifications: 'Notifications', profile: 'Profile',
        recommended: 'Recommended For You', trending: 'Trending Projects',
        price: 'Price', area: 'Area', status: 'Status', units: 'Units',
        downloadBrochure: 'Download Brochure', visitDate: 'Visit Date',
    },
    te: {
        home: 'హోమ్', projects: 'ప్రాజెక్ట్‌లు', dashboard: 'డాష్‌బోర్డ్', contact: 'సంప్రదించండి',
        emiCalculator: 'EMI కాలిక్యులేటర్', virtualTour: 'వర్చువల్ టూర్', announcements: 'ప్రకటనలు',
        messages: 'సందేశాలు', login: 'లాగిన్', register: 'నమోదు', logout: 'లాగ్‌అవుట్',
        welcome: 'PVR గ్రూప్స్‌కు స్వాగతం', tagline: 'విజయవాడలో లగ్జరీ లివింగ్ నిర్మిస్తోంది',
        ourProjects: 'మా ప్రాజెక్ట్‌లు', viewAll: 'అన్నీ చూడండి', ongoingProjects: 'కొనసాగుతున్న ప్రాజెక్ట్‌లు',
        completedProjects: 'పూర్తయిన ప్రాజెక్ట్‌లు', bookSiteVisit: 'సైట్ సందర్శన బుక్ చేయండి', contactSales: 'సేల్స్ సంప్రదించండి',
        aboutProject: 'ఈ ప్రాజెక్ట్ గురించి', amenities: 'సౌకర్యాలు', location: 'స్థానం',
        customerReviews: 'కస్టమర్ రివ్యూలు', leaveReview: 'రివ్యూ ఇవ్వండి', submitReview: 'రివ్యూ సబ్మిట్ చేయండి',
        saveFavorite: 'సేవ్', saved: 'సేవ్ చేసారు', compare: 'పోల్చండి', shareAsPDF: 'PDF లో షేర్ చేయండి',
        paymentHistory: 'చెల్లింపు చరిత్ర', referEarn: 'రెఫర్ & సంపాదించండి', myFavorites: 'నా ఇష్టమైనవి',
        siteVisits: 'సైట్ సందర్శనలు', notifications: 'నోటిఫికేషన్లు', profile: 'ప్రొఫైల్',
        recommended: 'మీ కోసం సిఫార్సు', trending: 'ట్రెండింగ్ ప్రాజెక్ట్‌లు',
        price: 'ధర', area: 'విస్తీర్ణం', status: 'స్థితి', units: 'యూనిట్లు',
        downloadBrochure: 'బ్రోషర్ డౌన్‌లోడ్', visitDate: 'సందర్శన తేదీ',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('pvr_language') || 'en');

    const t = (key) => translations[language]?.[key] || translations.en[key] || key;

    const switchLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('pvr_language', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, t, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
