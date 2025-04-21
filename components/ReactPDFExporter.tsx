"use client"

import React, { useState, useEffect, useRef } from "react"
import { useCV } from "@/contexts/CVContext"
import { useToast } from "@/components/ui/use-toast"
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
// Ta bort import från pdf-templates
// import { CVTemplateSelector } from "@/components/pdf-templates"

// Importera vår nya CVTemplateSelector
import { CVTemplateSelector } from "@/app/templates/pdf"

// Temporär ersättningskomponent medan nya mallar utvecklas
// const TempCVDocument = ({ cv, zoomScale }: { cv: any, zoomScale: number }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View style={styles.section}>
//         <Text style={styles.title}>PDF-export tillfälligt otillgänglig</Text>
//         <Text style={styles.text}>Nya PDF-mallar är under utveckling.</Text>
//         <Text style={styles.text}>Vänligen återkom senare.</Text>
//       </View>
//     </Page>
//   </Document>
// );
// 
// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#fff',
//     padding: 30
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//     textAlign: 'center'
//   },
//   text: {
//     fontSize: 12,
//     marginBottom: 10,
//     textAlign: 'center'
//   }
// });

interface ReactPDFExporterProps {
  onInitialClick?: () => Promise<void>;
  onPdfDownloaded?: () => void; // Ny callback som anropas när PDF laddas ner
}

// Exporteringskomponent som kan användas i UI
export function ReactPDFExporter({ onInitialClick, onPdfDownloaded }: ReactPDFExporterProps) {
  const { currentCV, zoomScale } = useCV()
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start with loading state
  const pdfUrlRef = useRef<string | null>(null)
  const { toast } = useToast()
  const [downloadTriggered, setDownloadTriggered] = useState(false)
  
  // Kontrollera behörigheten explicit från början
  useEffect(() => {
    const checkAuthorization = async () => {
      // Om ingen behörighetskontroll behövs, anta att vi är behöriga
      if (!onInitialClick) {
        setIsAuthorized(true)
        return
      }
      
      try {
        setIsChecking(true)
        await onInitialClick()
        setIsAuthorized(true)
      } catch (error) {
        console.log("Behörighetskontroll misslyckades:", error)
        // Notera att vi inte sätter isAuthorized till false här
        // Eftersom PaywallModal hanterar åtkomsten istället
      } finally {
        setIsChecking(false)
      }
    }
    
    checkAuthorization()
  }, [onInitialClick])
  
  // Visa toast när URL ändras i ref
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (pdfUrlRef.current && !isLoading) {
        toast({
          title: "PDF redo att laddas ned",
          description: "Klicka på knappen för att ladda ned din PDF"
        });
        clearInterval(intervalId);
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, [isLoading, toast]);
  
  // Används för att trigga callback efter nedladdning
  useEffect(() => {
    if (downloadTriggered && !isLoading && pdfUrlRef.current && onPdfDownloaded) {
      // Liten fördröjning för att simulera nedladdningstid
      const timeoutId = setTimeout(() => {
        onPdfDownloaded();
        setDownloadTriggered(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [downloadTriggered, isLoading, onPdfDownloaded]);
  
  if (!currentCV) {
    return null
  }
  
  const fileName = `${currentCV.personalInfo.firstName || "CV"}_${currentCV.personalInfo.lastName || ""}_CV.pdf`.replace(/\s/g, "_")
  
  // Om vi redan har ett fel, visa felknappen
  if (hasError) {
    return (
      <Button 
        variant="destructive" 
        className="w-full" 
        onClick={() => setHasError(false)} // Tillåt användaren att försöka igen
      >
        <FileText className="mr-2 h-4 w-4" />
        Fel vid generering - Klicka för att försöka igen
      </Button>
    );
  }
  
  // Om vi fortfarande kontrollerar behörighet, visa laddningsknapp
  if (isChecking) {
    return (
      <Button variant="default" className="w-full" disabled>
        <FileText className="mr-2 h-4 w-4 animate-spin" />
        Kontrollerar behörighet...
      </Button>
    );
  }
  
  return (
    <div>
      <ErrorBoundary
        onError={(error) => {
          console.error("React-PDF Error:", error);
          setHasError(true);
          toast({
            title: "Fel vid generering av PDF",
            description: "Det uppstod ett problem när PDF skulle skapas. Prova att byta mall eller ta bort profilbilden.",
            variant: "destructive",
          });
        }}
      >
        <PDFDownloadLink
          document={<CVTemplateSelector cv={currentCV} zoomScale={zoomScale} />}
          fileName={fileName}
          className="w-full"
        >
          {({ blob, url, loading, error }) => {
            // Spara url-värdet i ref för att undvika state-uppdatering under rendering
            if (url && !loading) {
              // Bara uppdatera ref, inte state
              pdfUrlRef.current = url;
              
              // Uppdatera loading-status efter rendering (säkert)
              if (isLoading) {
                setTimeout(() => {
                  setIsLoading(false);
                }, 0);
              }
            }
            
            // Visa felmeddelande om något gick fel
            if (error) {
              console.error("React-PDF Error:", error);
              
              // Returnera felknapp
              return (
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => setHasError(false)} // Tillåt användaren att försöka igen
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Fel vid generering - Klicka för att försöka igen
                </Button>
              );
            }

            // PDFDownloadLink omsluter knappen och hanterar nedladdningen
            return (
              <Button 
                variant="default" 
                className="w-full rounded-full" 
                disabled={loading || !isAuthorized}
                onClick={() => {
                  if (!loading && onPdfDownloaded) {
                    setDownloadTriggered(true);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Genererar PDF..." : "Ladda ner PDF"}
                {loading && <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </ErrorBoundary>
    </div>
  )
}

// ErrorBoundary-komponent för att fånga och hantera React-PDF-fel
class ErrorBoundary extends React.Component<{ 
  children: React.ReactNode; 
  onError: (error: Error) => void;
}, { 
  hasError: boolean;
}> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void; }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Anropa onError-callback med felinformation
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      // Du kan rendera en fallback UI här
      return null;
    }

    return this.props.children;
  }
} 