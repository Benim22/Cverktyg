/**
 * PDF Templates Index
 * Exporterar alla PDF-mallar för användning i applikationen.
 */

import { StandardTemplate } from './standard';

export const CVTemplates = {
  standard: StandardTemplate,
  // Lägg till fler mallar här allt eftersom de skapas
};

// Komponent för att välja rätt mall baserat på ID
export const CVTemplateSelector = ({ cv, zoomScale }: { cv: any; zoomScale: number }) => {
  const templateId = cv.templateId || 'standard';
  const Template = CVTemplates[templateId as keyof typeof CVTemplates] || CVTemplates.standard;
  
  return <Template cv={cv} zoomScale={zoomScale} />;
}; 