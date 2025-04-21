import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

// Registrera typsnitt (använd roboto som är vanligt i react-pdf)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Definiera stilar
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155', // textColor
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    objectFit: 'cover',
  },
  profileImageCircle: {
    borderRadius: 30,
  },
  headerTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e293b', // primaryColor
  },
  title: {
    fontSize: 14,
    marginTop: 2,
    color: '#334155', // secondaryColor
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 8,
    gap: 4,
  },
  summary: {
    marginTop: 10,
    fontSize: 9,
  },
  section: {
    marginTop: 15,
    paddingBottom: 10,
    borderBottom: '1px solid #e2e8f0',
  },
  sectionLast: {
    borderBottom: 'none',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: '#0f172a', // headingColor
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 500,
    color: '#1e293b', // subHeadingColor
  },
  itemSubtitle: {
    fontSize: 9,
    fontWeight: 500,
    color: '#1e293b', // subHeadingColor
    marginTop: 1,
  },
  itemDate: {
    fontSize: 8,
    color: '#64748b',
  },
  itemDescription: {
    fontSize: 9,
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  skillItem: {
    backgroundColor: '#f1f5f9',
    padding: '3 6',
    borderRadius: 3,
    fontSize: 8,
  },
  link: {
    fontSize: 8,
    color: '#0284c7', // accentColor,
    textDecoration: 'none',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

// Hjälpfunktion för att formatera datum
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    // Hantera olika datumformat
    if (dateString.toLowerCase() === 'nuvarande' || dateString.toLowerCase() === 'pågående') {
      return 'Pågående';
    }
    if (dateString.toLowerCase() === 'present') {
      return 'Pågående';
    }
    
    // Försök parsea datum om det är i format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return format(new Date(dateString), 'MMM yyyy', { locale: sv });
    }
    
    // Returnera originalsträngen om inget annat fungerar
    return dateString;
  } catch (e) {
    return dateString;
  }
};

// Komponenttyper
interface StandardTemplateProps {
  cv: any;
  zoomScale?: number;
}

// Standardmall för PDF
export const StandardTemplate = ({ cv }: StandardTemplateProps) => {
  if (!cv) return null;

  const { personalInfo = {}, sections = [] } = cv;
  const { firstName = '', lastName = '', title = '', email = '', phone = '', location = '', website = '', profileImage = null, summary = '' } = personalInfo;

  // Organisera sektioner efter typ
  const educationSection = sections.find((section: any) => section.type === 'education');
  const experienceSection = sections.find((section: any) => section.type === 'experience');
  const projectsSection = sections.find((section: any) => section.type === 'projects');
  const skillsSection = sections.find((section: any) => section.type === 'skills');
  
  // Övriga sektioner
  const otherSections = sections.filter((section: any) => 
    !['education', 'experience', 'projects', 'skills'].includes(section.type)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header med personuppgifter */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {profileImage && profileImage.url && (
              <Image 
                src={profileImage.url} 
                style={[
                  styles.profileImage, 
                  profileImage.isCircle && styles.profileImageCircle
                ]} 
              />
            )}
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.name}>{firstName} {lastName}</Text>
              {title && <Text style={styles.title}>{title}</Text>}
              
              {/* Kontaktuppgifter */}
              <View style={styles.contactInfo}>
                {email && (
                  <View style={styles.contactItem}>
                    <Text>📧</Text>
                    <Text>{email}</Text>
                  </View>
                )}
                {phone && (
                  <View style={styles.contactItem}>
                    <Text>📱</Text>
                    <Text>{phone}</Text>
                  </View>
                )}
                {location && (
                  <View style={styles.contactItem}>
                    <Text>📍</Text>
                    <Text>{location}</Text>
                  </View>
                )}
                {website && (
                  <View style={styles.contactItem}>
                    <Text>🌐</Text>
                    <Text>{website}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Sammanfattning */}
          {summary && (
            <Text style={styles.summary}>{summary}</Text>
          )}
        </View>
        
        {/* Sektioner */}
        {/* Utbildningssektionen */}
        {educationSection && educationSection.items && educationSection.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{educationSection.title || 'Utbildning'}</Text>
            
            {educationSection.items.map((item: any, index: number) => (
              <View key={`edu-${index}`} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{item.institution}</Text>
                    <Text style={styles.itemSubtitle}>{item.degree}{item.field ? ` i ${item.field}` : ''}</Text>
                  </View>
                  
                  <Text style={styles.itemDate}>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                </View>
                
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* Erfarenhetssektionen */}
        {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{experienceSection.title || 'Erfarenhet'}</Text>
            
            {experienceSection.items.map((item: any, index: number) => (
              <View key={`exp-${index}`} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{item.company}</Text>
                    <Text style={styles.itemSubtitle}>
                      {item.position}{item.location ? `, ${item.location}` : ''}
                    </Text>
                  </View>
                  
                  <Text style={styles.itemDate}>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                </View>
                
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* Projektsektionen */}
        {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{projectsSection.title || 'Projekt'}</Text>
            
            {projectsSection.items.map((item: any, index: number) => (
              <View key={`proj-${index}`} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  
                  {(item.startDate || item.endDate) && (
                    <Text style={styles.itemDate}>
                      {item.startDate && item.endDate 
                        ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
                        : formatDate(item.startDate || item.endDate)}
                    </Text>
                  )}
                </View>
                
                {item.url && (
                  <Text style={styles.link}>{item.url}</Text>
                )}
                
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* Kunskapssektionen */}
        {skillsSection && skillsSection.items && skillsSection.items.length > 0 && (
          <View style={[styles.section, otherSections.length === 0 && styles.sectionLast]}>
            <Text style={styles.sectionTitle}>{skillsSection.title || 'Kunskaper'}</Text>
            
            <View style={styles.skillsContainer}>
              {skillsSection.items.map((item: any, index: number) => (
                <View key={`skill-${index}`} style={styles.skillItem}>
                  <Text>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Övriga sektioner */}
        {otherSections.map((section: any, sectionIndex: number) => (
          <View 
            key={`other-${sectionIndex}`} 
            style={[
              styles.section, 
              sectionIndex === otherSections.length - 1 && styles.sectionLast
            ]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items && section.items.map((item: any, index: number) => (
              <View key={`${section.id}-${index}`} style={styles.itemContainer}>
                {Object.entries(item).filter(([key]) => !['id'].includes(key)).map(([key, value]: [string, any]) => {
                  if (key === 'description' && value) {
                    return <Text key={key} style={styles.itemDescription}>{value}</Text>;
                  }
                  if (typeof value === 'string' && value && key !== 'id') {
                    return <Text key={key} style={styles.itemSubtitle}>{value}</Text>;
                  }
                  return null;
                })}
              </View>
            ))}
          </View>
        ))}
        
        {/* Footer med datum */}
        <View fixed style={styles.footer}>
          <Text>CV genererat {format(new Date(), 'PPP', { locale: sv })}</Text>
        </View>
      </Page>
    </Document>
  );
}; 