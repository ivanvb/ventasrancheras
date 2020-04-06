import React from "react";

const LoadingStateContext = React.createContext();
const LoadingDispatchContext = React.createContext();

const initialState = {
    sellerLoaded: false,
    deliveryLoaded: false,
    packageLoaded: false,
};

function loadingReducer(state, action) {
    switch (action.type) {
        case "loadSeller": {
            return { sellerLoaded: true };
        }
        case "deloadSeller": {
            return { sellerLoaded: false };
        }
        case "loadDelivery": {
            return { deliveryLoaded: true };
        }
        case "deloadDelivery": {
            return { deliveryLoaded: false };
        }
        case "loadPackage": {
            return { packageLoaded: true };
        }
        case "deloadPackage": {
            return { packageLoaded: false };
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

function LoadingProvider({ children }) {
    const [state, dispatch] = React.useReducer(loadingReducer, initialState);
    return (
        <LoadingStateContext.Provider value={state}>
            <LoadingDispatchContext.Provider value={dispatch}>
                {children}
            </LoadingDispatchContext.Provider>
        </LoadingStateContext.Provider>
    );
}

function useLoadingState() {
    const context = React.useContext(LoadingStateContext);
    if (context === undefined) {
        throw new Error("useLoadingState must be used within a LoadingProvider");
    }
    return context;
}

function useLoadingDispatch() {
    const context = React.useContext(LoadingDispatchContext);
    if (context === undefined) {
        throw new Error("useLoadingDispatch must be used within a LoadingProvider");
    }
    return context;
}

export { LoadingProvider, useLoadingState, useLoadingDispatch };
