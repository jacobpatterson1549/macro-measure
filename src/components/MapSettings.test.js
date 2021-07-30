import { render, screen} from '@testing-library/react';

import { MapSettings } from './MapSettings';

import { View } from '../utils/View';

describe('MapSettings', () => {
    it('should view map list when clicked', () => {
        const setView = jest.fn();
        render(<MapSettings setView={setView} />);
        screen.getByRole('button').click();
        expect(setView).toBeCalledWith(View.Map_List);
    });
});