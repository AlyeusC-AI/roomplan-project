import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView,
  Share,
  Modal,
  FlatList
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { X, Download, Mail, Share as ShareIcon, FileText, ChevronDown } from 'lucide-react-native';
import { getEstimateById, updateEstimateStatus, convertEstimateToInvoice } from '@/lib/api/estimates';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/formatters';
import { showToast } from '@/utils/toast';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { invoicesStore } from '@/lib/state/invoices';

export default function EstimateDetailsScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const [estimate, setEstimate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (!publicId) {
      setError('Estimate ID is missing');
      setLoading(false);
      return;
    }
    
    const loadEstimate = async () => {
      try {
        const result = await getEstimateById(publicId);
        if (result && 'data' in result && result.data) {
          console.log('Estimate structure:', JSON.stringify(result.data, null, 2));
          setEstimate(result.data);
        } else if (result && 'error' in result && result.error) {
          setError(result.error);
          showToast('error', 'Error', `Failed to load estimate: ${result.error}`);
        } else {
          setError('Invalid response from server');
          showToast('error', 'Error', 'Received invalid response from server');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        showToast('error', 'Error', `Failed to load estimate: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadEstimate();
  }, [publicId]);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return { bg: '#e2e8f0', text: '#64748b' };
      case 'sent':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'approved':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'expired':
        return { bg: '#f3f4f6', text: '#4b5563' };
      default:
        return { bg: '#e2e8f0', text: '#64748b' };
    }
  };
  
  // Function to generate HTML for PDF
  const generateEstimateHTML = () => {
    if (!estimate) return '';
    
    const lineItemsHTML = estimate.EstimateItems && estimate.EstimateItems.length > 0
      ? estimate.EstimateItems.map((item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.rate)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.amount)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="padding: 8px; text-align: center; font-style: italic; color: #64748b;">No line items found</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Estimate #${estimate.number}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px;
              color: #1e293b;
            }
            .estimate-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .company-details {
              width: 50%;
            }
            .estimate-details {
              width: 50%;
              text-align: right;
            }
            .estimate-status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
              margin-top: 10px;
              background-color: ${getStatusColor(estimate.status).bg};
              color: ${getStatusColor(estimate.status).text};
            }
            .client-details {
              margin-bottom: 40px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f8fafc;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              color: #0f172a;
              border-bottom: 2px solid #e2e8f0;
            }
            .amount-table {
              width: 40%;
              margin-left: auto;
              margin-top: 30px;
            }
            .amount-row td {
              padding: 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            .total-row td {
              padding: 12px 8px;
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              border-top: 2px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="estimate-header">
            <div class="company-details">
              <h1 style="color: #0284c7; margin: 0;">ServiceGeek</h1>
              <p>Professional Service Management</p>
            </div>
            <div class="estimate-details">
              <h2 style="margin: 0;">Estimate #${estimate.number}</h2>
              <div class="estimate-status">${estimate.status}</div>
              <p>Date: ${formatDate(estimate.estimateDate)}</p>
              <p>Valid Until: ${formatDate(estimate.expiryDate)}</p>
            </div>
          </div>

          <div class="client-details">
            <h3>For:</h3>
            <p><strong>${estimate.clientName}</strong></p>
            ${estimate.clientEmail ? `<p>${estimate.clientEmail}</p>` : ''}
            <p>Project: ${estimate.projectName}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHTML}
            </tbody>
          </table>

          <table class="amount-table">
            <tbody>
              <tr class="total-row">
                <td>Total</td>
                <td style="text-align: right;">${formatCurrency(estimate.amount)}</td>
              </tr>
            </tbody>
          </table>
          
          ${estimate.notes ? `
          <div style="margin-top: 40px;">
            <h3>Notes</h3>
            <p>${estimate.notes}</p>
          </div>
          ` : ''}
        </body>
      </html>
    `;
  };

  // Download estimate as PDF
  const handleDownloadEstimate = async () => {
    if (!estimate) return;
    
    setIsDownloading(true);
    try {
      // Generate HTML and create a PDF
      const html = generateEstimateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      // Define the PDF filename
      const pdfName = `Estimate_${estimate.number.replace(/\s+/g, '_')}.pdf`;
      const pdfUri = FileSystem.documentDirectory + pdfName;
      
      // Move the temporary file to a more permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });
      
      // Share the PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
        showToast('success', 'Success', 'Estimate downloaded successfully');
      } else {
        showToast('error', 'Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast('error', 'Error', `Failed to download estimate: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Send estimate via email
  const handleSendEstimate = async () => {
    if (!estimate || !publicId) return;
    
    setIsSending(true);
    try {
      // Call email API
      const response = await fetch(`/api/v1/estimates/${publicId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('success', 'Success', 'Estimate sent successfully');
        
        // Update status to "sent" if it was a draft
        if (estimate.status === 'draft') {
          const statusResult = await updateEstimateStatus(publicId, 'sent');
          if (statusResult && statusResult.data) {
            setEstimate(statusResult.data);
          }
        }
      } else {
        throw new Error(result.message || 'Failed to send estimate');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast('error', 'Error', `Failed to send estimate: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  // Convert to invoice
  const handleConvertToInvoice = async () => {
    if (!estimate || !publicId) return;
    
    setIsConverting(true);
    try {
      // Call convert API
      const result = await convertEstimateToInvoice(publicId);
      
      if (result.data && result.data.invoiceId) {
        showToast('success', 'Success', 'Estimate converted to invoice successfully');
        
        // Navigate to the newly created invoice
        router.push(`/invoices/${result.data.invoiceId}`);
      } else {
        throw new Error(result.error || 'Failed to convert estimate to invoice');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast('error', 'Error', `Failed to convert estimate: ${errorMessage}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Share estimate
  const handleShareEstimate = async () => {
    if (!estimate) return;
    
    try {
      // Generate shareable content
      const message = `Estimate #${estimate.number} for ${estimate.clientName}\nAmount: ${formatCurrency(estimate.amount)}\nValid Until: ${formatDate(estimate.expiryDate)}`;
      
      // Use native share dialog
      await Share.share({
        message,
        title: `Estimate #${estimate.number}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast('error', 'Error', `Failed to share estimate: ${errorMessage}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!estimate || !publicId || estimate.status === newStatus) {
      setShowStatusPicker(false);
      return;
    }
    
    setIsChangingStatus(true);
    try {
      const result = await updateEstimateStatus(publicId, newStatus as any);
      if (result && result.data) {
        setEstimate(result.data);
        showToast('success', 'Success', `Estimate status updated to ${newStatus}`);
      } else if (result && result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast('error', 'Error', `Failed to update status: ${errorMessage}`);
    } finally {
      setIsChangingStatus(false);
      setShowStatusPicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          headerShown: true,
          title: estimate ? `Estimate #${estimate.number}` : 'Estimate Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <X size={24} color="#0f172a" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading estimate...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : estimate ? (
        <>
          <ScrollView style={styles.content}>
            <View style={styles.header}>
              <View style={styles.estimateInfo}>
                <Text style={styles.estimateNumber}>Estimate #{estimate.number}</Text>
                <TouchableOpacity 
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(estimate.status).bg }
                  ]}
                  onPress={() => setShowStatusPicker(true)}
                >
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(estimate.status).text }
                    ]}>
                      {estimate.status.toUpperCase()}
                    </Text>
                    <ChevronDown size={12} color={getStatusColor(estimate.status).text} />
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.clientName}>{estimate.clientName}</Text>
              <Text style={styles.projectName}>Project: {estimate.projectName}</Text>
              <Text style={styles.dateText}>
                Created: {formatDate(estimate.estimateDate)}
              </Text>
              <Text style={styles.dateText}>
                Valid Until: {formatDate(estimate.expiryDate)}
              </Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <Text style={styles.amount}>{formatCurrency(estimate.amount)}</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              {estimate.EstimateItems && estimate.EstimateItems.length > 0 ? (
                estimate.EstimateItems.map((item: any, index: number) => (
                  <View key={index} style={styles.lineItem}>
                    <Text style={styles.lineItemDescription}>{item.description}</Text>
                    <View style={styles.lineItemDetails}>
                      <Text style={styles.lineItemQuantity}>
                        {item.quantity} × {formatCurrency(item.rate)}
                      </Text>
                      <Text style={styles.lineItemAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No line items found</Text>
              )}
            </View>
            
            {estimate.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notes}>{estimate.notes}</Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadEstimate}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#0284c7" />
              ) : (
                <Download size={20} color="#0284c7" />
              )}
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSendEstimate}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#0284c7" />
              ) : (
                <Mail size={20} color="#0284c7" />
              )}
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareEstimate}
            >
              <ShareIcon size={20} color="#0284c7" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            
            {['sent', 'approved'].includes(estimate.status.toLowerCase()) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleConvertToInvoice}
                disabled={isConverting}
              >
                {isConverting ? (
                  <ActivityIndicator size="small" color="#0284c7" />
                ) : (
                  <>
                    <FileText size={20} color="#0284c7" />
                    <Text style={styles.actionText}>Convert to Invoice</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : null}
      
      {/* Status Picker Modal */}
      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.statusPickerContainer}>
            <View style={styles.statusPickerHeader}>
              <Text style={styles.statusPickerTitle}>Change Status</Text>
              <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {isChangingStatus ? (
              <View style={styles.loadingStatus}>
                <ActivityIndicator size="small" color="#0284c7" />
                <Text style={styles.loadingStatusText}>Updating status...</Text>
              </View>
            ) : (
              <FlatList
                data={['draft', 'sent', 'approved', 'rejected', 'cancelled', 'expired']}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      estimate.status === item && styles.selectedStatusOption
                    ]}
                    onPress={() => handleStatusChange(item)}
                  >
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: getStatusColor(item).bg }
                    ]} />
                    <Text style={[
                      styles.statusOptionText,
                      estimate.status === item && styles.selectedStatusOptionText
                    ]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  estimateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  estimateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  lineItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  lineItemDescription: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 4,
  },
  lineItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineItemQuantity: {
    fontSize: 14,
    color: '#64748b',
  },
  lineItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#0284c7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPickerContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedStatusOption: {
    backgroundColor: '#f0f9ff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  selectedStatusOptionText: {
    fontWeight: '600',
    color: '#0284c7',
  },
  loadingStatus: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingStatusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
}); 