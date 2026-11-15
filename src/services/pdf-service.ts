import { generateDisputeLetterHtml, DisputePayload, DisputeTrack } from './dispute-generator';

export interface GeneratePdfOptions {
  track: DisputeTrack;
  payload: DisputePayload;
}

export async function exportDisputePdf({ track, payload }: GeneratePdfOptions): Promise<string> {
  const html = generateDisputeLetterHtml(track, payload);

  let printToFileAsync: (options: { html: string }) => Promise<{ uri: string }>;
  try {
    const ExpoPrint = require('expo-print');
    printToFileAsync = ExpoPrint.printToFileAsync;
  } catch {
    printToFileAsync = async () => ({ uri: 'file:///simulated/dispute-notice.pdf' });
  }

  const { uri } = await printToFileAsync({ html });

  try {
    const ExpoSharing = require('expo-sharing');
    if (ExpoSharing && typeof ExpoSharing.isAvailableAsync === 'function') {
      const isAvailable = await ExpoSharing.isAvailableAsync();
      if (isAvailable && typeof ExpoSharing.shareAsync === 'function') {
        await ExpoSharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Legal Dispute Notice',
          UTI: 'com.adobe.pdf',
        });
      }
    }
  } catch {
    // Sharing not available in simulated or node environment
  }

  return uri;
}
