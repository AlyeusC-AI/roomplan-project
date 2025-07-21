import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Text,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { toast } from "sonner-native";
import { Download } from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Colors } from "@/constants/Colors";

export default function CertificatePage() {
  const { id, type, isRep } = useLocalSearchParams<{
    id: string;
    type: string;
    isRep: string;
  }>();
  const fadeAnim = new Animated.Value(0);
  const webViewRef = useRef<WebView>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleExportPDF = async () => {
    try {
      if (!webViewRef.current) return;
      // setIsExporting(true);

      // Get the complete HTML content with styles from the WebView
      webViewRef.current.injectJavaScript(`
        (function() {
          // Get all stylesheets
          const styles = Array.from(document.styleSheets)
            .map(sheet => {
              try {
                return Array.from(sheet.cssRules)
                  .map(rule => rule.cssText)
                  .join('\\n');
              } catch (e) {
                return '';
              }
            })
            .join('\\n');

          // Get inline styles
          const inlineStyles = Array.from(document.getElementsByTagName('style'))
            .map(style => style.textContent)
            .join('\\n');

          // Create a clone of the document to modify
          const docClone = document.cloneNode(true);
          
          // Remove buttons and interactive elements
          const elementsToRemove = docClone.querySelectorAll('button, [role="button"], .print-hide, .no-print');
          elementsToRemove.forEach(el => el.remove());

          // Get the cleaned HTML content
          const html = docClone.documentElement.outerHTML;

          // Combine everything
          const completeHtml = \`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  \${styles}
                  \${inlineStyles}
                  @media print {
                    body {
                      margin: 0;
                      padding: 0;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                    }
                    button, [role="button"], .print-hide, .no-print {
                      display: none !important;
                    }
                          .certificate-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1rem;
          }
          .signature-section {
            page-break-before: always;
            break-before: page;
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
                    /* Add page break handling */
                    .page-break {
            page-break-before: always;
            padding-top: 2rem;
            break-before: page;
                    }
                    /* Ensure content fits within page bounds */
                    @page {
                      size: letter;
                      margin: 0.5in;
                    }
                    /* Prevent orphaned content */
                    p, h1, h2, h3, h4, h5, h6 {
                      orphans: 3;
                      widows: 3;
                    }
                    /* Ensure images don't break across pages */
                    img {
                      page-break-inside: avoid;
                      break-inside: avoid;
                    }
                  }
                </style>
              </head>
              <body>
                \${html}
              </body>
            </html>
          \`;

          window.ReactNativeWebView.postMessage(completeHtml);
        })();
      `);
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export certificate");
      setIsExporting(false);
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = event.nativeEvent.data;

      // Try to parse as JSON first
      try {
        const message = JSON.parse(data);
        console.log("🚀 ~ handleWebViewMessage ~ message:", message);

        if (message.type === "EXPORT_PDF") {
          handleExportPDF();
          return;
        }
      } catch (e) {
        // If JSON parsing fails, treat it as HTML content
        const html = data;

        // Generate PDF from the HTML content
        const { uri } = await Print.printToFileAsync({
          html,
          width: 612, // Letter size width in points
          height: 792, // Letter size height in points
          base64: false,
        });

        // Share the PDF
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Save Certificate",
            UTI: "com.adobe.pdf",
          });
        } else {
          toast.error("Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export certificate");
    } finally {
      setIsExporting(false);
    }
  };

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const url = `https://www.restoregeek.app/certificate?isRep=true&id=${id}${type ? `&type=${type}` : ""}`;

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 bg-background"
    >
      <Stack.Screen
        options={{
          title: "Certificate",
        }}
      />
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState={true}
        onMessage={handleWebViewMessage}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          toast.error("Failed to load certificate");
          console.error("WebView error:", nativeEvent);
        }}
      />
    </Animated.View>
  );
}
