import { render, screen } from '@testing-library/react';

import { MapImg } from './MapImg';

describe('Map', () => {
    describe('size tests', () => {
        const sizeTests = [
            [167, 201, 403, 201, 7326, 8806], // image width more narrow than container width
            [10, 5, 10, 10, 60, 30], // wide image (2x widder than height)
            [20, 20, 20, 20, 7, 7], // image is smaller than container - it should be scaled up
        ];
        it.each(sizeTests)('should set svg size to [%sx%s] when container is [%sx%s] and image is [%sx%s]', (expectedWidth, expectedHeight, containerWidth, containerHeight, fileWidth, fileHeight) => {
            Object.defineProperties(window.HTMLElement.prototype, {
                offsetWidth: { value: containerWidth },
                offsetHeight: { value: containerHeight },
            });
            render(<MapImg
                fileURL="mock_url"
                fileWidth={fileWidth}
                fileHeight={fileHeight}
                pixelTop={0}
                pixelRight={0}
                pixelBottom={0}
                pixelLeft={0}
            />);
            const svgElement = screen.getByRole('img');
            expect(parseInt(svgElement.getAttribute('width'))).toBe(expectedWidth);
            expect(parseInt(svgElement.getAttribute('height'))).toBe(expectedHeight);
        });
    });
});