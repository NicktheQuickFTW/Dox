import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  PDFViewer 
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 700 },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 1.5,
  },
  coverPage: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
    textAlign: 'center',
    color: '#C8102E', // Big 12 Red
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#003DA5', // Big 12 Blue
  },
  metadata: {
    fontSize: 10,
    color: '#666',
    marginTop: 30,
    textAlign: 'center',
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    color: '#C8102E',
  },
  tocEntry: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tocText: {
    flex: 1,
  },
  tocPage: {
    width: 30,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    color: '#003DA5',
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 5,
  },
  policyNumber: {
    fontSize: 10,
    color: '#666',
    marginBottom: 10,
  },
  policyContent: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#666',
    borderBottom: '1pt solid #ccc',
    paddingBottom: 5,
  },
  index: {
    fontSize: 10,
    marginBottom: 5,
  },
  indexLetter: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 10,
    color: '#003DA5',
  },
});

interface ManualPDFProps {
  title: string;
  policies: any[];
  policiesByCategory: Record<string, any[]>;
  metadata: any;
  include_toc: boolean;
  include_index: boolean;
  template?: string;
}

const ManualPDF: React.FC<ManualPDFProps> = ({
  title,
  policies,
  policiesByCategory,
  metadata,
  include_toc,
  include_index,
}) => {
  // Create page references for TOC
  const pageRefs: Record<string, number> = {};
  let currentPage = 1;

  // Cover page
  currentPage++;

  // TOC pages (estimate)
  if (include_toc) {
    currentPage += Math.ceil(Object.keys(policiesByCategory).length / 15);
  }

  // Calculate page numbers for each section
  Object.entries(policiesByCategory).forEach(([category, categoryPolicies]) => {
    pageRefs[category] = currentPage;
    // Estimate pages needed for this section
    currentPage += Math.ceil(categoryPolicies.length / 3);
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.coverPage}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Big 12 Conference</Text>
        <Text style={styles.subtitle}>Administrative Manual</Text>
        <View style={styles.metadata}>
          <Text>Generated: {new Date(metadata.generated_at).toLocaleDateString()}</Text>
          <Text>Total Policies: {metadata.total_policies}</Text>
          <Text>Sport: {metadata.sport}</Text>
        </View>
      </Page>

      {/* Table of Contents */}
      {include_toc && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          {Object.entries(policiesByCategory).map(([category, categoryPolicies]) => (
            <View key={category} style={styles.tocEntry}>
              <Text style={styles.tocText}>
                {category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} ({categoryPolicies.length})
              </Text>
              <Text style={styles.tocPage}>{pageRefs[category]}</Text>
            </View>
          ))}
        </Page>
      )}

      {/* Policy Content */}
      {Object.entries(policiesByCategory).map(([category, categoryPolicies]) => (
        <Page key={category} size="LETTER" style={styles.page}>
          <Text style={styles.header} fixed>
            {title} - {category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Text>
          
          <Text style={styles.sectionTitle}>
            {category.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>

          {categoryPolicies.map((policy) => (
            <View key={policy.id} wrap={false}>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.policyNumber}>Policy {policy.policy_number}</Text>
              <Text style={styles.policyContent}>{policy.content_text}</Text>
            </View>
          ))}

          <Text style={styles.pageNumber} fixed render={({ pageNumber }) => pageNumber} />
        </Page>
      ))}

      {/* Index */}
      {include_index && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.tocTitle}>Index</Text>
          {Object.entries(
            policies
              .sort((a, b) => a.title.localeCompare(b.title))
              .reduce((acc, policy) => {
                const firstLetter = policy.title[0].toUpperCase();
                if (!acc[firstLetter]) acc[firstLetter] = [];
                acc[firstLetter].push(policy);
                return acc;
              }, {} as Record<string, any[]>)
          ).map(([letter, letterPolicies]) => (
            <View key={letter}>
              <Text style={styles.indexLetter}>{letter}</Text>
              {letterPolicies.map((policy) => (
                <Text key={policy.id} style={styles.index}>
                  {policy.title} - {policy.policy_number}
                </Text>
              ))}
            </View>
          ))}
        </Page>
      )}
    </Document>
  );
};

export async function generatePDF(props: ManualPDFProps): Promise<Buffer> {
  const document = React.createElement(ManualPDF, props);
  return await renderToBuffer(document);
}