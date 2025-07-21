import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getSettings } from '../api/settingsService';

/**
 * This component dynamically injects the Facebook Pixel script into the document head
 * if a valid Pixel ID is found in the application settings.
 */
const FacebookPixel = () => {
    const [pixelId, setPixelId] = useState(null);

    useEffect(() => {
        const fetchPixelId = async () => {
            try {
                const settings = await getSettings();
                if (settings && settings.facebookPixelId) {
                    setPixelId(settings.facebookPixelId);
                }
            } catch (error) {
                console.error('Could not load Facebook Pixel settings', error);
            }
        };

        fetchPixelId();
    }, []);

    // Only render the script if a pixelId has been successfully fetched.
    if (!pixelId) {
        return null;
    }

    return (
        <Helmet>
            <script>
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${pixelId}');
                    fbq('track', 'PageView');
                `}
            </script>
            <noscript>
                {`
                <img height="1" width="1" style="display:none"
                     src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
                `}
            </noscript>
        </Helmet>
    );
};

export default FacebookPixel;
