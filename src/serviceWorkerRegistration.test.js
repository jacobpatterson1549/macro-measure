import { registerSW } from './serviceWorkerRegistration';

import { canUseServiceWorker, registerServiceWorker, isProductionEnv } from './utils/Global';

jest.mock('./utils/Global', () => ({
    canUseServiceWorker: jest.fn(),
    registerServiceWorker: jest.fn(),
    isProductionEnv: jest.fn(),
}));

describe('register', () => {
    it('should NOT register service worker when NOT in navigator', () => {
        canUseServiceWorker.mockReturnValue(false);
        isProductionEnv.mockReturnValue(true);
        expect(registerServiceWorker).not.toBeCalled();
    });
    it('should NOT register service worker when NOT in production', () => {
        canUseServiceWorker.mockReturnValue(true);
        isProductionEnv.mockReturnValue(false);
        registerSW()
        expect(registerServiceWorker).not.toBeCalled();
    });
    it('should register service worker when in production', () => {
        canUseServiceWorker.mockReturnValue(true);
        isProductionEnv.mockReturnValue(true);
        registerSW();
        expect(registerServiceWorker).toBeCalled();
    });
});