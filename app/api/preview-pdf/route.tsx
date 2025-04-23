import { NextRequest, NextResponse } from 'next/server';
import { CV_TEMPLATES } from '@/data/templates';
import defaultCV from '@/data';

/**
 * API-rutt för att förhandsgranska PDF-mallar
 * Används för att visa en förhandsgranskning av mallar i mallgalleriet
 */
export async function GET(request: NextRequest) {
  try {
    // Hämta mallens ID från förfrågan
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId') || 'standard';
    
    console.log("Preview API: Försöker generera förhandsgranskning för mall:", templateId);
    
    // Hämta malldetaljer från templates array
    const templateData = CV_TEMPLATES.find(t => t.id === templateId) || CV_TEMPLATES[0];
    if (!templateData) {
      console.error("Preview API: Kunde inte hitta malldata för ID:", templateId);
      return NextResponse.json(
        { error: 'Mall hittades inte' },
        { status: 404 }
      );
    }
    
    console.log("Preview API: Genererar med malldata:", templateData.id, templateData.name);
    
    // Skapa ett demo-CV med standarddata men med det begärda template-ID:t
    const demoCV = { ...defaultCV, templateId };
    
    // Generera HTML baserat på templateData och demoCV
    const htmlContent = generateTemplateHTML(templateData, demoCV);
    
    console.log("Preview API: HTML genererat, returnerar...");
    
    // Istället för att generera PDF, returnera HTML direkt med Content-Type: text/html
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
    
  } catch (error) {
    console.error('Preview API: Error generating preview:', error);
    
    // Returnera ett användarvänligt felmeddelande som HTML
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Förhandsgranskningsfel</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #334155;
              text-align: center;
              padding: 1rem;
            }
            
            .error-container {
              max-width: 600px;
              padding: 2rem;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
              color: #dc2626;
              margin-top: 0;
            }
            
            .error-details {
              margin-top: 1rem;
              padding: 1rem;
              background-color: #f1f5f9;
              border-radius: 0.25rem;
              text-align: left;
              font-family: monospace;
              font-size: 0.875rem;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Kunde inte generera förhandsgranskning</h1>
            <p>Ett fel uppstod när mallen skulle visas. Försök igen senare eller testa en annan mall.</p>
            <div class="error-details">
              <pre>${error instanceof Error ? error.message : 'Okänt fel'}</pre>
            </div>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
      status: 500
    });
  }
}

/**
 * Genererar HTML för mallen baserat på template och CV-data
 */
function generateTemplateHTML(template: any, cv: any) {
  try {
    // Kontrollera och tillhandahåll standardvärden om CV-data saknas
    if (!cv) {
      cv = { ...defaultCV };
    }
    
    // Säkerställ att personalInfo finns
    const personalInfo = cv.personalInfo || {
      firstName: "Förnamn",
      lastName: "Efternamn",
      title: "Yrke/Titel",
      email: "email@exempel.se",
      phone: "073-123 45 67",
      location: "Stockholm, Sverige",
      website: "",
      summary: "Kort presentationstext om dig och dina professionella erfarenheter."
    };
    
    // Säkerställ att sections finns och är en array
    const sections = Array.isArray(cv.sections) ? cv.sections : [];
    
    // CSS och färgschema
    const {
      primaryColor = "#0F172A",
      secondaryColor = "#38BDF8",
      textColor = "#64748B",
      headingColor = "#1E293B",
      backgroundColor = "#F8FAFC"
    } = template.colorScheme || {};
    
    const fontSettings = template.fontSettings || {};
    const headingFont = fontSettings.headingFont || "Inter, sans-serif";
    const bodyFont = fontSettings.bodyFont || "Inter, sans-serif";
    
    // Skapa CSS för typsnitt och färger
    const styles = `
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --text-color: ${textColor};
        --heading-color: ${headingColor};
        --background-color: ${backgroundColor};
        --heading-font: ${headingFont};
        --body-font: ${bodyFont};
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: var(--body-font);
        color: var(--text-color);
        background-color: var(--background-color);
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--heading-font);
        color: var(--heading-color);
        margin-top: 0;
      }
      
      .page {
        width: 210mm;
        max-width: 100%;
        min-height: 100vh;
        padding: 20mm;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .header {
        margin-bottom: 10mm;
      }
      
      .header h1 {
        font-size: 24pt;
        color: var(--primary-color);
        margin-bottom: 2mm;
      }
      
      .header h2 {
        font-size: 16pt;
        color: var(--secondary-color);
        margin-bottom: 5mm;
      }
      
      .contact-info {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5mm;
        font-size: 10pt;
      }
      
      .contact-info div {
        margin-right: 10mm;
        margin-bottom: 2mm;
      }
      
      .section {
        margin-bottom: 10mm;
      }
      
      .section-title {
        font-size: 14pt;
        padding-bottom: 2mm;
        margin-bottom: 5mm;
        border-bottom: 1pt solid var(--primary-color);
      }
      
      .section-item {
        margin-bottom: 5mm;
      }
      
      .section-item-title {
        font-weight: bold;
        font-size: 12pt;
        margin-bottom: 1mm;
      }
      
      .section-item-subtitle {
        font-style: italic;
        font-size: 11pt;
        color: var(--secondary-color);
        margin-bottom: 1mm;
      }
      
      .section-item-dates {
        font-size: 10pt;
        margin-bottom: 2mm;
      }
      
      .section-item-description {
        font-size: 10pt;
        margin-bottom: 2mm;
      }
      
      .skills-list {
        display: flex;
        flex-wrap: wrap;
      }
      
      .skill-item {
        width: 45%;
        margin-right: 5%;
        margin-bottom: 3mm;
      }
      
      .skill-name {
        font-weight: bold;
        font-size: 11pt;
        margin-bottom: 1mm;
      }
      
      .skill-bar {
        height: 5px;
        background-color: #eee;
        margin-bottom: 2mm;
      }
      
      .skill-level {
        height: 100%;
        background-color: var(--primary-color);
      }
      
      /* Responsiva stilar för mobilvisning */
      @media screen and (max-width: 768px) {
        .page {
          padding: 10mm;
        }
        
        .skill-item {
          width: 100%;
          margin-right: 0;
        }
        
        .contact-info {
          flex-direction: column;
        }
      }
      
      /* Mall-specifik styling */
      ${template.id === 'tech' ? `
        .page {
          background-color: #f8fafc;
          border-left: 5px solid var(--primary-color);
        }
        
        .section-title {
          font-family: 'JetBrains Mono', monospace;
          background-color: var(--primary-color);
          color: white;
          padding: 3mm;
          border-radius: 2mm;
          border-bottom: none;
        }
        
        .skill-bar {
          height: 8px;
          border-radius: 4px;
        }
        
        .skill-level {
          border-radius: 4px;
        }
      ` : ''}
      
      ${template.id === 'elegant' ? `
        .page {
          background-color: #ffffff;
          border-top: 10px solid var(--primary-color);
        }
        
        .header h1 {
          font-family: 'Playfair Display', serif;
          margin-top: 5mm;
        }
        
        .section-title {
          font-family: 'Playfair Display', serif;
          color: var(--primary-color);
          border-bottom: 1px solid var(--secondary-color);
          padding-bottom: 3mm;
        }
        
        .contact-info div {
          border-right: 1px solid var(--secondary-color);
          padding-right: 8mm;
          margin-right: 8mm;
        }
        
        .contact-info div:last-child {
          border-right: none;
        }
      ` : ''}
    `;
    
    // Generera personinfo-sektion
    const personInfoHTML = `
      <div class="header">
        <h1>${personalInfo.firstName || 'Förnamn'} ${personalInfo.lastName || 'Efternamn'}</h1>
        <h2>${personalInfo.title || 'Yrke/Titel'}</h2>
        <div class="contact-info">
          ${personalInfo.email ? `<div>Email: ${personalInfo.email}</div>` : ''}
          ${personalInfo.phone ? `<div>Tel: ${personalInfo.phone}</div>` : ''}
          ${personalInfo.location ? `<div>Plats: ${personalInfo.location}</div>` : ''}
          ${personalInfo.website ? `<div>Web: ${personalInfo.website}</div>` : ''}
        </div>
        ${personalInfo.summary ? `<p>${personalInfo.summary}</p>` : ''}
      </div>
    `;
    
    // Generera sektioner baserat på type
    let sectionsHTML = '';
    
    if (sections && Array.isArray(sections)) {
      sections.forEach((section: any) => {
        let sectionItemsHTML = '';
        const sectionItems = Array.isArray(section.items) ? section.items : [];
        
        if (section.type === 'experience') {
          sectionItems.forEach((item: any) => {
            sectionItemsHTML += `
              <div class="section-item">
                <div class="section-item-title">${item.position || 'Position'}</div>
                <div class="section-item-subtitle">${item.company || ''}, ${item.location || ''}</div>
                <div class="section-item-dates">${formatDate(item.startDate || '')} - ${item.endDate ? formatDate(item.endDate) : 'Nuvarande'}</div>
                <div class="section-item-description">${item.description || ''}</div>
              </div>
            `;
          });
        } else if (section.type === 'education') {
          sectionItems.forEach((item: any) => {
            sectionItemsHTML += `
              <div class="section-item">
                <div class="section-item-title">${item.degree || ''}, ${item.field || ''}</div>
                <div class="section-item-subtitle">${item.institution || ''}</div>
                <div class="section-item-dates">${formatDate(item.startDate || '')} - ${formatDate(item.endDate || '')}</div>
                <div class="section-item-description">${item.description || ''}</div>
              </div>
            `;
          });
        } else if (section.type === 'skills') {
          sectionItemsHTML = '<div class="skills-list">';
          sectionItems.forEach((item: any) => {
            const skillLevel = ((item.level || 0) / 5) * 100;
            sectionItemsHTML += `
              <div class="skill-item">
                <div class="skill-name">${item.name || 'Kompetens'}</div>
                <div class="skill-bar">
                  <div class="skill-level" style="width: ${skillLevel}%"></div>
                </div>
              </div>
            `;
          });
          sectionItemsHTML += '</div>';
        }
        
        sectionsHTML += `
          <div class="section">
            <h3 class="section-title">${section.title || 'Sektion'}</h3>
            ${sectionItemsHTML}
          </div>
        `;
      });
    }
    
    // Om det inte finns några sektioner, skapa exempelsektioner
    if (sectionsHTML === '') {
      sectionsHTML = `
        <div class="section">
          <h3 class="section-title">Arbetslivserfarenhet</h3>
          <div class="section-item">
            <div class="section-item-title">Exempelposition</div>
            <div class="section-item-subtitle">Exempelföretag, Stockholm</div>
            <div class="section-item-dates">Jan 2020 - Nuvarande</div>
            <div class="section-item-description">Detta är ett exempel på en arbetslivserfarenhet. Här kan du beskriva dina arbetsuppgifter och prestationer.</div>
          </div>
        </div>
        <div class="section">
          <h3 class="section-title">Utbildning</h3>
          <div class="section-item">
            <div class="section-item-title">Examenexempel, Ämnesområde</div>
            <div class="section-item-subtitle">Universitet/Högskola</div>
            <div class="section-item-dates">Sep 2015 - Jun 2019</div>
            <div class="section-item-description">Detta är ett exempel på en utbildningsbeskrivning. Här kan du beskriva vad du studerade och eventuella utmärkelser.</div>
          </div>
        </div>
      `;
    }
    
    // Skapa komplett HTML med korrekt template name
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CV Preview - ${template.name || 'CV Mall'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
          <style>
            ${styles}
          </style>
        </head>
        <body>
          <div class="page">
            ${personInfoHTML}
            ${sectionsHTML}
          </div>
        </body>
      </html>
    `;
  } catch (error) {
    console.error("Fel vid generering av template HTML:", error);
    
    // Returnera en enkel felsida
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fel vid förhandsgranskning</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #334155;
            }
            
            .error-container {
              max-width: 500px;
              padding: 2rem;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              text-align: center;
            }
            
            h1 {
              color: #ef4444;
              margin-top: 0;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Något gick fel</h1>
            <p>Ett tekniskt problem uppstod vid generering av förhandsgranskningen.</p>
            <p><strong>Felmeddelande:</strong> ${error instanceof Error ? error.message : 'Okänt fel'}</p>
          </div>
        </body>
      </html>
    `;
  }
}

/**
 * Hjälpfunktion för att formatera datum
 */
function formatDate(dateString: string) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    // Om datumet är på formatet "2023-01" (år-månad)
    const parts = dateString.split('-');
    if (parts.length === 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      const month = parseInt(parts[1], 10);
      if (!isNaN(month) && month >= 1 && month <= 12) {
        return `${monthNames[month - 1]} ${parts[0]}`;
      }
    }
    return dateString;
  }
  
  return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
} 