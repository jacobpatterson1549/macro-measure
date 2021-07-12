export const registerSW = () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
        return window.navigator.serviceWorker.register(swURL);
    }
};