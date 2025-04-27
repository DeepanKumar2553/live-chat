import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ALLOWED_MOBILE_ROUTES = ['/app', '/app/welcome'];

export const useResponsiveRoute = () => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 576);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return {
        isAllowedRoute: ALLOWED_MOBILE_ROUTES.includes(location.pathname),
        isMobile
    };
};