if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
        const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
        navigator.serviceWorker.register(swURL);
    });
}