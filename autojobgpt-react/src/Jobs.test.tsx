import { screen } from '@testing-library/react';

import { renderRoute } from './testUtilities';
import { STATUSES } from './api';


test('every status (column title) appears in the kanban board', () => {
  renderRoute('/jobs');
  for (const status of STATUSES) {
    expect(screen.queryByText(new RegExp(status, "i"))).toBeInTheDocument();
  }  
});