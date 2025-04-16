import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link, Image, Svg, Path } from '@react-pdf/renderer';
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

// Registrera en anpassad font (valfritt)
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

// Skapa stilar
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    opacity: 0.1,
    transform: 'rotate(-45deg)',
    fontSize: 60,
    fontWeight: 'bold',
    top: '40%',
    width: '100%',
    textAlign: 'center',
    zIndex: 9999, // Säkerställ att vattenstämpeln visas överst
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.headingColor,
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    color: COLORS.subHeadingColor,
  },
  summary: {
    fontSize: 10,
    marginTop: 10,
    color: COLORS.textColor,
    lineHeight: 1.5,
  },
  
  // ----- CONTACT STYLES -----
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
  link: {
    fontSize: 9,
    color: COLORS.accentColor,
    textDecoration: 'none',
  },
  
  // ----- SECTION STYLES -----
  section: {
    marginBottom: 15,
  },
  lastSection: {
    marginBottom: 0, // Sista sektionen utan margin under
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.headingColor,
    marginBottom: 8,
    borderBottom: `1pt solid ${COLORS.borderColor}`,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // ----- ITEM STYLES (Experience/Education/Projects) -----
  itemContainer: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.secondaryColor,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: COLORS.textColor,
  },
  itemSubtitle: {
    fontSize: 10,
    color: COLORS.accentColor,
    marginTop: 2,
  },
  itemDescription: {
    fontSize: 9,
    color: COLORS.textColor,
    marginTop: 4,
    lineHeight: 1.5,
  },
  
  // ----- SKILLS STYLES -----
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillColumn: {
    width: '50%',
    paddingRight: 10,
    marginBottom: 4,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillBullet: {
    fontSize: 9,
    marginRight: 5,
    color: COLORS.accentColor,
  },
  skillText: {
    fontSize: 9,
    color: COLORS.textColor,
  },
  
  // ----- LANGUAGE STYLES -----
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textColor,
  },
  languageLevel: {
    fontSize: 9,
    color: COLORS.subHeadingColor,
  },
});

interface WatermarkedTemplateReactPDFProps {
  cvData: CV;
}

// Dokument-komponent
const WatermarkedTemplateReactPDF: React.FC<WatermarkedTemplateReactPDFProps> = ({ cvData }) => {
  const { personalInfo, experience = [], education = [], skills = [], languages = [], projects = [], hobbies = [] } = cvData;
  
  // Funktionshelper för att skapa datumtext
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate) return '';
    return `${startDate} - ${endDate || 'Nuvarande'}`;
  };

  return (
    <Document title={`${personalInfo.firstName} ${personalInfo.lastName} CV - FÖRHANDSGRANSKNING`}>
      <Page size="A4" style={styles.page}>
        {/* Vattenstämpel - visas på alla sidor */}
        <Text style={styles.watermark}>FÖRHANDSVISNING</Text>
        
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

export default WatermarkedTemplateReactPDF; 