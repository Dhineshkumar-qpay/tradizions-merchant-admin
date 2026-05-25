import React, { createContext, useContext, useReducer } from 'react';

const BusinessStateContext = createContext();
const BusinessDispatchContext = createContext();

const initialState = {
    businessList: [],
    loading: false,
    error: null,
};

function businessReducer(state, action) {
    switch (action.type) {
        case 'SET_BUSINESS_LIST':
            return { ...state, businessList: action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: true };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

export function BusinessProvider({ children }) {
    const [state, dispatch] = useReducer(businessReducer, initialState);

    return (
        <BusinessStateContext.Provider value={state}>
            <BusinessDispatchContext.Provider value={dispatch}>
                {children}
            </BusinessDispatchContext.Provider>
        </BusinessStateContext.Provider>
    );
}

export function useBusinessState() {
    const context = useContext(BusinessStateContext);
    if (context === undefined) {
        throw new Error('useBusinessState must be used within a BusinessProvider');
    }
    return context;
}

export function useBusinessDispatch() {
    const context = useContext(BusinessDispatchContext);
    if (context === undefined) {
        throw new Error('useBusinessDispatch must be used within a BusinessProvider');
    }
    return context;
}
