import { createContext, useState, useEffect } from 'react';

export const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const [tenantId, setTenantId] = useState(localStorage.getItem('tenantId') || '');

    useEffect(() => {
        if (tenantId) {
            localStorage.setItem('tenantId', tenantId);
        } else {
            localStorage.removeItem('tenantId');
        }
    }, [tenantId]);

    return (
        <TenantContext.Provider value={{ tenantId, setTenantId }}>
            {children}
        </TenantContext.Provider>
    );
};
