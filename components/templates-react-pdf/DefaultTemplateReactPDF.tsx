import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';
import { type CV } from '@/contexts/CVContext';
import { 
  EmailIcon, 
  PhoneIcon, 
  LocationIcon, 
  WebsiteIcon, 
  LinkedInIcon,
  CalendarIcon,
  BriefcaseIcon,
  GraduationIcon,
  StarIcon,
  LanguageIcon,
  ProjectIcon,
  HeartIcon
} from './PDFIcons';

// Standardfärger som matchar CV-verktygets färgschema
// Obs: Du kan vilja anpassa dessa baserat på ditt tema
const COLORS = {
  primaryColor: '#0072CE', // Använd samma primärfärg som i CV-verktyget
  secondaryColor: '#333333',
  headingColor: '#14213D',
  subHeadingColor: '#4A5568',
  textColor: '#2D3748',
  accentColor: '#2563EB',
  borderColor: '#E2E8F0',
  backgroundColor: '#FFFFFF',
  iconColor: '#4A5568',
};

// Registrera typsnitt - använder säkra CDN-länkar för att fungera i alla miljöer
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Skapa stilar
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    padding: 30,
    fontSize: 10,
    color: COLORS.textColor,
    backgroundColor: COLORS.backgroundColor,
  },
  // ----- HEADER STYLES -----
  header: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 15,
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Kan vara 30 för cirkel eller 4 för rundade hörn
    objectFit: 'cover',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryColor,
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    color: COLORS.secondaryColor,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    gap: 5,
  },
  contactIcon: {
    marginRight: 3,
  },
  summary: {
    marginTop: 10,
    fontSize: 10,
    lineHeight: 1.5,
  },
  
  // ----- SECTION STYLES -----
  section: {
    marginTop: 15,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  lastSection: {
    marginTop: 15,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.headingColor,
    marginBottom: 8, 
    textTransform: 'uppercase',
  },
  
  // ----- ITEM STYLES -----
  itemContainer: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.subHeadingColor,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: COLORS.textColor,
  },
  itemSubtitle: {
    fontSize: 10,
    fontWeight: 'medium',
    color: COLORS.subHeadingColor,
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 3,
  },
  
  // ----- SKILL STYLES -----
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillColumn: {
    width: '50%',
  },
  skillItem: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  skillBullet: {
    fontSize: 9,
    marginRight: 6,
  },
  skillText: {
    fontSize: 10,
  },
  
  // ----- LANGUAGE STYLES -----
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  languageName: {
    flex: 1,
    fontSize: 10,
  },
  languageLevel: {
    fontSize: 9,
    fontStyle: 'italic',
    color: COLORS.subHeadingColor,
  },
  
  // ----- LINKS -----
  link: {
    color: COLORS.primaryColor,
    fontSize: 9,
    marginTop: 2,
    textDecoration: 'none',
  },
});

interface DefaultTemplateReactPDFProps {
  cvData: CV;
}

// Dokument-komponent
const DefaultTemplateReactPDF: React.FC<DefaultTemplateReactPDFProps> = ({ cvData }) => {
  const { personalInfo, experience = [], education = [], skills = [], languages = [], projects = [], hobbies = [] } = cvData;
  
  // Funktionshelper för att skapa datumtext
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return '';
    return `${startDate} - ${endDate || 'Nuvarande'}`;
  };

  return (
    <Document title={`${personalInfo.firstName} ${personalInfo.lastName} CV`}>
      <Page size="A4" style={styles.page}>
        {/* ----- HEADER MED PERSONUPPGIFTER ----- */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {personalInfo.profileImage?.url && (
              <Image 
                src={personalInfo.profileImage.url} 
                style={styles.profileImage} 
              />
            )}
            
            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {personalInfo.firstName} {personalInfo.lastName}
              </Text>
              {personalInfo.title && (
                <Text style={styles.title}>{personalInfo.title}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.contactInfo}>
            {personalInfo.email && (
              <View style={styles.contactItem}>
                <EmailIcon size={10} color={COLORS.iconColor} />
                <Text>{personalInfo.email}</Text>
              </View>
            )}
            {personalInfo.phone && (
              <View style={styles.contactItem}>
                <PhoneIcon size={10} color={COLORS.iconColor} />
                <Text>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo.location && (
              <View style={styles.contactItem}>
                <LocationIcon size={10} color={COLORS.iconColor} />
                <Text>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.website && (
              <View style={styles.contactItem}>
                <WebsiteIcon size={10} color={COLORS.iconColor} />
                <Link src={personalInfo.website} style={styles.link}>
                  {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
                </Link>
              </View>
            )}
            {personalInfo.linkedin && (
              <View style={styles.contactItem}>
                <LinkedInIcon size={10} color={COLORS.iconColor} />
                <Link src={personalInfo.linkedin} style={styles.link}>
                  LinkedIn
                </Link>
              </View>
            )}
          </View>
          
          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}
        </View>

        {/* ----- ARBETSLIVSERFARENHET ----- */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <BriefcaseIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Arbetslivserfarenhet</Text>
            </Text>
            {experience.map((exp, index) => (
              <View key={index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.company}</Text>
                  <View style={styles.dateContainer}>
                    <CalendarIcon size={8} color={COLORS.textColor} />
                    <Text style={{ marginLeft: 3 }}>{formatDateRange(exp.startDate, exp.endDate)}</Text>
                  </View>
                </View>
                <Text style={styles.itemSubtitle}>
                  {exp.position}
                  {exp.location && `, ${exp.location}`}
                </Text>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ----- UTBILDNING ----- */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <GraduationIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Utbildning</Text>
            </Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.school}</Text>
                  <View style={styles.dateContainer}>
                    <CalendarIcon size={8} color={COLORS.textColor} />
                    <Text style={{ marginLeft: 3 }}>{formatDateRange(edu.startDate, edu.endDate)}</Text>
                  </View>
                </View>
                <Text style={styles.itemSubtitle}>
                  {edu.degree}
                  {edu.field && ` i ${edu.field}`}
                </Text>
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ----- FÄRDIGHETER ----- */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <StarIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Färdigheter</Text>
            </Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillColumn}>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillBullet}>•</Text>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ----- SPRÅK ----- */}
        {languages && languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <LanguageIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Språk</Text>
            </Text>
            {languages.map((lang, index) => (
              <View key={index} style={styles.languageItem}>
                <Text style={styles.languageName}>{lang.language}</Text>
                <Text style={styles.languageLevel}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* ----- PROJEKT ----- */}
        {projects && projects.length > 0 && (
          <View style={[
            hobbies && hobbies.length > 0 ? styles.section : styles.lastSection
          ]}>
            <Text style={styles.sectionTitle}>
              <ProjectIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Projekt</Text>
            </Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{project.title}</Text>
                {project.description && (
                  <Text style={styles.itemDescription}>{project.description}</Text>
                )}
                {project.link && (
                  <Link src={project.link} style={styles.link}>
                    {project.link}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* ----- HOBBIES ----- */}
        {hobbies && hobbies.length > 0 && (
          <View style={styles.lastSection}>
            <Text style={styles.sectionTitle}>
              <HeartIcon size={12} color={COLORS.headingColor} />
              <Text style={{ marginLeft: 5 }}>Hobbies</Text>
            </Text>
            <View style={styles.skillsContainer}>
              {hobbies.map((hobby, index) => (
                <View key={index} style={styles.skillColumn}>
                  <View style={styles.skillItem}>
                    <Text style={styles.skillBullet}>•</Text>
                    <Text style={styles.skillText}>{hobby}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Version och sidfot */}
        <Text 
          style={{ 
            position: 'absolute', 
            bottom: 30, 
            left: 0, 
            right: 0, 
            textAlign: 'center',
            fontSize: 7,
            color: '#888'
          }}
        >
          Skapad med CV Verktyg • www.cvverktyg.se
        </Text>
      </Page>
    </Document>
  );
};

export default DefaultTemplateReactPDF; 