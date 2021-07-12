import { canUseServiceWorker, registerServiceWorker, isProductionEnv } from "./utils/Global";

export const registerSW = () => {
    if (canUseServiceWorker() && isProductionEnv()) {
        const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
        return registerServiceWorker(swURL);
    }
};