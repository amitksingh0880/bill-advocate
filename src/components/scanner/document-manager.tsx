import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { 
  DocumentScrubber, 
  DocumentPage,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Separator,
  Text,
} from '@amitsingh0880/cnnative-ui';
import { t } from '../../i18n';

export interface DocumentManagerProps {
  initialPages?: DocumentPage[];
  onAnalyze: (pages: DocumentPage[]) => void;
  onCancel?: () => void;
}

export function DocumentManager({ 
  initialPages = [], 
  onAnalyze, 
  onCancel 
}: DocumentManagerProps) {
  const [pages, setPages] = useState<DocumentPage[]>(initialPages);
  const [activePageId, setActivePageId] = useState<string>(
    initialPages.length > 0 ? initialPages[0].id : ''
  );

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  const handleAddPage = () => {
    const newPageNum = pages.length + 1;
    const newPage: DocumentPage = {
      id: `page-${Date.now()}-${newPageNum}`,
      pageNumber: newPageNum,
      uri: `file:///simulated/bill-page-${newPageNum}.jpg`,
      title: `Page ${newPageNum}`,
    };
    const updated = [...pages, newPage];
    setPages(updated);
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (pageId: string) => {
    const updated = pages
      .filter((p) => p.id !== pageId)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1, title: `Page ${idx + 1}` }));
    setPages(updated);
    if (activePageId === pageId) {
      setActivePageId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
  };

  const handleProceed = () => {
    onAnalyze(pages);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <View style={styles.headerRow}>
          <Badge variant="secondary">
            {`${pages.length} Pages Photographed`}
          </Badge>
          <Badge variant="outline">
            {activePage ? `Viewing Page ${activePage.pageNumber}` : 'No Pages'}
          </Badge>
        </View>
        <CardTitle>{t('common.scanBill')}</CardTitle>
        <CardDescription>
          Multi-page bill scanner with automatic alignment and clarity scrubber.
        </CardDescription>
      </CardHeader>

      <CardContent style={styles.content}>
        {/* DocumentScrubber from @amitsingh0880/cnnative-ui */}
        <DocumentScrubber
          pages={pages}
          activePageId={activePageId}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          cardWidth={72}
          cardHeight={92}
        />

        <Separator style={styles.separator} />

        {/* Large Preview of Currently Active Page */}
        <View style={styles.previewBox}>
          {activePage ? (
            <View style={styles.previewContent}>
              <Text className="font-semibold text-slate-800 mb-1">
                {activePage.title || `Page ${activePage.pageNumber}`}
              </Text>
              <Text className="text-xs text-slate-500 text-center">
                Review this page for blurriness or glare before proceeding to audit.
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400">
              No page selected. Tap the '+' tile above to capture a page.
            </Text>
          )}
        </View>
      </CardContent>

      <CardFooter style={styles.footer}>
        {onCancel && (
          <Button variant="outline" onPress={onCancel} style={styles.actionBtn}>
            {t('common.cancel')}
          </Button>
        )}
        <Button 
          variant="default" 
          disabled={pages.length === 0} 
          onPress={handleProceed}
          style={styles.actionBtn}
        >
          Analyze Medical Bill
        </Button>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    gap: 12,
  },
  separator: {
    marginVertical: 4,
  },
  previewBox: {
    minHeight: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewContent: {
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    minWidth: 120,
  },
});
