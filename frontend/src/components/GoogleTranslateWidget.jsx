import React, { useEffect } from 'react';

const GoogleTranslateWidget = () => {
    useEffect(() => {
        // Check if the script is already loaded to avoid duplicate scripts.
        if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
            return;
        }

        // Define the callback function that will be called once the script is loaded.
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        };

        // Create a script element and append it to the document.
        const script = document.createElement('script');
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        // Cleanup function to remove the script and the global callback function when the component unmounts.
        return () => {
            const existingScript = document.querySelector('script[src*="translate.google.com"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
            delete window.googleTranslateElementInit;
        };
    }, []);

    return <div id="google_translate_element" style={{ marginLeft: '1rem' }}></div>;
};

export default GoogleTranslateWidget;