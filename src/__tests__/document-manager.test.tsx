import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { DocumentManager } from '../components/scanner/document-manager';

describe('DocumentManager with DocumentScrubber', () => {
  const initialPages = [
    { id: 'page-1', pageNumber: 1, uri: 'file:///data/bill1.jpg', title: 'Page 1' },
    { id: 'page-2', pageNumber: 2, uri: 'file:///data/bill2.jpg', title: 'Page 2' },
  ];

  it('renders pages in DocumentScrubber with page counts', () => {
    const { getByLabelText, getByText } = render(
      <DocumentManager initialPages={initialPages} onAnalyze={jest.fn()} />
    );
    expect(getByLabelText('Page 1')).toBeTruthy();
    expect(getByLabelText('Page 2')).toBeTruthy();
    expect(getByText(/2 Pages Photographed/i)).toBeTruthy();
  });

  it('allows selecting active page', () => {
    const { getByLabelText, getByText } = render(
      <DocumentManager initialPages={initialPages} onAnalyze={jest.fn()} />
    );

    const page2Thumb = getByLabelText('Page 2');
    fireEvent.press(page2Thumb);
    expect(getByText(/Viewing Page 2/i)).toBeTruthy();
  });

  it('allows adding a new bill page', () => {
    const { getByLabelText, getByText } = render(
      <DocumentManager initialPages={initialPages} onAnalyze={jest.fn()} />
    );

    const addTile = getByLabelText('Add Document Page');
    fireEvent.press(addTile);
    expect(getByText(/3 Pages Photographed/i)).toBeTruthy();
  });

  it('allows deleting a page', () => {
    const { getByLabelText, getByText, queryByLabelText } = render(
      <DocumentManager initialPages={initialPages} onAnalyze={jest.fn()} />
    );

    const deleteBtn = getByLabelText('Delete Page 2');
    fireEvent.press(deleteBtn);
    expect(getByText(/1 Pages Photographed/i)).toBeTruthy();
    expect(queryByLabelText('Page 2')).toBeNull();
  });


  it('invokes onAnalyze callback with final pages when analyze button is pressed', () => {
    const onAnalyze = jest.fn();
    const { getByText } = render(
      <DocumentManager initialPages={initialPages} onAnalyze={onAnalyze} />
    );

    const analyzeBtn = getByText(/Analyze Medical Bill/i);
    fireEvent.press(analyzeBtn);
    expect(onAnalyze).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 'page-1' }),
      expect.objectContaining({ id: 'page-2' }),
    ]));
  });
});
