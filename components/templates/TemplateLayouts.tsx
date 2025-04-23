"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { motion } from "framer-motion"
import { AtSign, Calendar, Globe, MapPin, Phone, Award, Briefcase, FolderKanban, Star, Mail, DollarSign, Zap, Hash, Check } from "lucide-react"

interface TemplateLayoutProps {
  cv: CV;
  profileImageStyle?: React.CSSProperties;
  profileImageClass?: string;
  transparentBgStyle?: React.CSSProperties;
  onSectionClick?: (sectionId: string, index: number) => void;
  activeSectionId?: string | null;
}

// Standard layout - Traditionell layout
export function StandardLayout({ 
  cv, 
  profileImageStyle, 
  profileImageClass, 
  transparentBgStyle,
  onSectionClick,
  activeSectionId
}: TemplateLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  // Profilbildstil - använd props om de finns, annars skapa egen
  const imageStyle = profileImageStyle || (profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '4px',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 2}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("primaryColor")}`
      : 'none',
    background: profileImage.isTransparent ? 'transparent' : undefined,
  } : {})

  // Funktion för att kontrollera om en sektion är aktiv
  const isSectionActive = (sectionId: string) => {
    return activeSectionId === sectionId;
  };

  return (
    <div className="h-full p-4 sm:p-8 overflow-visible" style={{ height: 'auto', minHeight: '100%' }}>
      {/* Header med personuppgifter */}
      <div className="border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex items-start gap-2 sm:gap-4 cv-header-content">
          {profileImage && profileImage.url && (
            <div className="shrink-0">
              <div 
                className="relative"
                style={profileImage.isTransparent ? transparentBgStyle : {}}
              >
                <img 
                  src={profileImage.url} 
                  alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                  className={`h-12 w-12 sm:h-16 sm:w-16 object-cover ${profileImageClass || ''}`}
                  style={imageStyle}
                />
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <h1 
              className="text-2xl sm:text-3xl font-bold cv-name"
              style={{ color: getColorValue("primaryColor") }}
            >
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p 
              className="mt-1 text-base sm:text-xl cv-job-title"
              style={{ color: getColorValue("secondaryColor") }}
            >
              {personalInfo.title}
            </p>
          </div>
        </div>

        <div 
          className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm cv-contact-info"
          style={{ color: getColorValue("textColor") }}
        >
          {personalInfo.email && (
            <div className="flex items-center gap-1 personal-info-icon">
              <AtSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1 personal-info-icon">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1 personal-info-icon">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1 personal-info-icon">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{personalInfo.website}</span>
            </div>
          )}
        </div>

        {personalInfo.summary && (
          <p 
            className="mt-3 sm:mt-4 text-xs sm:text-sm whitespace-pre-wrap"
            style={{ color: getColorValue("textColor") }}
          >
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* Sektioner */}
      <div className="cv-sections">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`mt-4 sm:mt-6 border-b border-gray-200 pb-4 sm:pb-6 last:border-0 cv-section relative group ${isSectionActive(section.id) ? 'ring-1 ring-primary/40 bg-primary/5 rounded-sm' : ''}`}
            onClick={() => onSectionClick && onSectionClick(section.id, index)}
            style={{ 
              cursor: onSectionClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease' 
            }}
          >
            {/* Visa hover-effekt endast om onSectionClick finns */}
            {onSectionClick && (
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm"></div>
            )}
            
            <h2 
              className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold cv-section-title"
              style={{ color: getColorValue("headingColor") }}
            >
              {section.title}
            </h2>

            {/* Olika rendering beroende på sektionstyp */}
            {section.type === "education" && (
              <div className="space-y-3 sm:space-y-4">
                {(section.items as Education[]).map((item) => (
                  <div key={item.id} className="cv-education-item">
                    <div className="flex flex-col sm:flex-row sm:justify-between cv-education-header">
                      <h3 
                        className="font-medium text-sm sm:text-base"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.institution}
                      </h3>
                      <div 
                        className="flex items-center gap-1 text-xs sm:text-sm cv-daterange"
                        style={{ color: getColorValue("textColor") }}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>
                          {item.startDate} - {item.endDate}
                        </span>
                      </div>
                    </div>
                    <p 
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.degree} i {item.field}
                    </p>
                    {item.description && (
                      <p 
                        className="mt-1 text-xs sm:text-sm whitespace-pre-wrap"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "experience" && (
              <div className="space-y-3 sm:space-y-4">
                {(section.items as Experience[]).map((item) => (
                  <div key={item.id} className="cv-experience-item">
                    <div className="flex flex-col sm:flex-row sm:justify-between cv-experience-header">
                      <h3 
                        className="font-medium text-sm sm:text-base"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.company}
                      </h3>
                      <div 
                        className="flex items-center gap-1 text-xs sm:text-sm cv-daterange whitespace-nowrap"
                        style={{ color: getColorValue("textColor") }}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>
                          {item.startDate} - {item.endDate}
                        </span>
                      </div>
                    </div>
                    <p 
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.position}
                      {item.location && `, ${item.location}`}
                    </p>
                    {item.description && (
                      <p 
                        className="mt-1 text-xs sm:text-sm whitespace-pre-wrap"
                        style={{ color: getColorValue("textColor"), wordBreak: "break-word" }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div className="space-y-3 sm:space-y-4">
                {(section.items as Project[]).map((item) => (
                  <div key={item.id} className="cv-project-item">
                    <div className="flex flex-col sm:flex-row sm:justify-between cv-experience-header">
                      <h3 
                        className="font-medium text-sm sm:text-base"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.name}
                      </h3>
                      {(item.startDate || item.endDate) && (
                        <div 
                          className="flex items-center gap-1 text-xs sm:text-sm cv-daterange whitespace-nowrap"
                          style={{ color: getColorValue("textColor") }}
                        >
                          <Calendar className="h-3 w-3" />
                          <span>
                            {item.startDate && item.endDate 
                              ? `${item.startDate} - ${item.endDate}`
                              : item.startDate || item.endDate}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline block truncate max-w-full"
                        style={{ color: getColorValue("accentColor") }}
                      >
                        {item.url}
                      </a>
                    )}
                    {item.description && (
                      <p 
                        className="mt-1 text-xs sm:text-sm whitespace-pre-wrap"
                        style={{ color: getColorValue("textColor"), wordBreak: "break-word" }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 cv-skills-grid">
                {(section.items as Skill[]).map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-2 rounded-md border border-gray-200 p-2"
                  >
                    <div 
                      className="flex items-center"
                      style={{ color: getColorValue("accentColor") }}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3"
                          fill={i < item.level ? getColorValue("accentColor") : "none"}
                        />
                      ))}
                    </div>
                    <span 
                      className="ml-1 sm:ml-2 text-xs sm:text-sm truncate"
                      style={{ color: getColorValue("textColor") }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Modern layout - Tvåkolumnslayout med sidebar
export function ModernLayout({ cv, profileImageStyle, profileImageClass, transparentBgStyle }: TemplateLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage

  // Använd props om de finns, annars skapa egen stil
  const imageStyle = profileImageStyle || (profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '4px',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 2}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("primaryColor")}`
      : 'none',
    background: profileImage.isTransparent ? 'transparent' : undefined,
  } : {})
  
  // Dela upp sektioner i vänster och höger kolumn
  const educationSection = sections.find(s => s.type === "education")
  const experienceSection = sections.find(s => s.type === "experience")
  const skillsSection = sections.find(s => s.type === "skills")
  const projectsSection = sections.find(s => s.type === "projects")
  
  const leftSections = sections.filter(
    s => s.type !== "skills" && s.type !== "projects"
  )
  
  const rightSections = sections.filter(
    s => s.type === "skills" || s.type === "projects"
  )

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Vänster kolumn - Kontaktuppgifter och färdigheter */}
      <div 
        className="md:w-1/3 p-8"
        style={{ backgroundColor: getColorValue("secondaryColor"), color: "white" }}
      >
        <div className="flex flex-col items-center text-center mb-8">
          {profileImage && profileImage.url && (
            <div className="mb-4">
              <div 
                className="relative"
                style={profileImage.isTransparent ? transparentBgStyle : {}}
              >
                <img 
                  src={profileImage.url} 
                  alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                  className={`h-32 w-32 object-cover mx-auto ${profileImageClass || ''}`}
                  style={imageStyle}
                />
              </div>
            </div>
          )}
          
          <h1 className="text-2xl font-bold mt-2">
            {personalInfo.firstName} <br/> {personalInfo.lastName}
          </h1>
          <p className="text-sm mt-1 opacity-90">
            {personalInfo.title}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-white/20 pb-1">
              Kontakt
            </h2>
            <div className="space-y-2 text-sm">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 shrink-0" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>

          {skillsSection && (
            <div>
              <h2 className="text-lg font-semibold mb-3 border-b border-white/20 pb-1">
                {skillsSection.title}
              </h2>
              <div className="space-y-2">
                {(skillsSection.items as Skill[]).map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span>{skill.level}/5</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${(skill.level / 5) * 100}%`,
                          backgroundColor: getColorValue("accentColor")
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Höger kolumn - Profil och erfarenhet */}
      <div className="md:w-2/3 p-8 bg-white">
        {personalInfo.summary && (
          <div className="mb-6">
            <h2 
              className="text-xl font-semibold mb-3 border-b pb-1"
              style={{ borderColor: getColorValue("primaryColor"), color: getColorValue("headingColor") }}
            >
              Profil
            </h2>
            <p 
              className="text-sm"
              style={{ color: getColorValue("textColor") }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {experienceSection && (
          <div className="mb-6">
            <h2 
              className="text-xl font-semibold mb-3 border-b pb-1"
              style={{ borderColor: getColorValue("primaryColor"), color: getColorValue("headingColor") }}
            >
              {experienceSection.title}
            </h2>
            <div className="space-y-4">
              {(experienceSection.items as Experience[]).map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-center">
                    <h3 
                      className="font-medium"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.position}
                    </h3>
                    <div 
                      className="text-xs px-2 py-0.5 rounded-full" 
                      style={{ 
                        backgroundColor: getColorValue("primaryColor"), 
                        color: "white"
                      }}
                    >
                      {item.startDate} - {item.endDate}
                    </div>
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: getColorValue("textColor") }}
                  >
                    {item.company}{item.location && `, ${item.location}`}
                  </p>
                  {item.description && (
                    <p 
                      className="mt-1 text-sm whitespace-pre-line"
                      style={{ color: getColorValue("textColor") }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Minimalistisk layout - Super avskalad, luftig layout
export function MinimalistLayout({ cv }: TemplateLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  const profileImageStyle = profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '0',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 1}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("primaryColor")}`
      : 'none',
    objectFit: 'cover',
    width: '120px',
    height: '120px',
  } as React.CSSProperties : {}
  
  return (
    <div className="flex h-full flex-col p-12 text-left">
      {/* Header med namn och titel - minimal och central */}
      <div className="mb-12 text-center">
        <h1 
          className="text-4xl font-light tracking-widest uppercase"
          style={{ color: getColorValue("primaryColor") }}
        >
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.title && (
          <p 
            className="mt-2 text-lg font-light"
            style={{ color: getColorValue("secondaryColor") }}
          >
            {personalInfo.title}
          </p>
        )}
      </div>
      
      {/* Huvudinnehåll i en enda kolumn med minimala dekorationer */}
      <div className="flex flex-grow flex-col space-y-8">
        {/* Kontaktuppgifter på en diskret rad */}
        <div className="flex justify-center space-x-6 text-xs">
          {personalInfo.email && (
            <span style={{ color: getColorValue("textColor") }}>
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span style={{ color: getColorValue("textColor") }}>
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span style={{ color: getColorValue("textColor") }}>
              {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span style={{ color: getColorValue("textColor") }}>
              {personalInfo.website}
            </span>
          )}
        </div>
        
        {/* Sammanfattning */}
        {personalInfo.summary && (
          <div className="mx-auto max-w-2xl py-4 text-center">
            <p 
              className="text-sm font-light italic"
              style={{ color: getColorValue("textColor") }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}
        
        {/* Tunna horisontella avdelare */}
        <div 
          className="h-px w-full" 
          style={{ backgroundColor: getColorValue("textColor") + '33' }}
        ></div>
        
        {/* Sektioner */}
        {sections.map((section) => (
          <div key={section.id} className="w-full space-y-4">
            <h2 
              className="font-light uppercase tracking-widest text-center"
              style={{ color: getColorValue("headingColor") }}
            >
              {section.title}
            </h2>
            
            {section.type === "education" && (
              <div className="space-y-6">
                {(section.items as Education[]).map((item) => (
                  <div key={item.id} className="text-center">
                    <p 
                      className="text-sm font-medium uppercase"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.degree} {item.field && `i ${item.field}`}
                    </p>
                    <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                      {item.institution}
                    </p>
                    <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                      {item.startDate} — {item.endDate}
                    </p>
                    {item.description && (
                      <p 
                        className="mt-2 text-xs font-light"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {section.type === "experience" && (
              <div className="space-y-6">
                {(section.items as Experience[]).map((item) => (
                  <div key={item.id} className="text-center">
                    <p 
                      className="text-sm font-medium uppercase"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.position}
                    </p>
                    <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                      {item.company}{item.location && `, ${item.location}`}
                    </p>
                    <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                      {item.startDate} — {item.endDate}
                    </p>
                    {item.description && (
                      <p 
                        className="mt-2 text-xs font-light"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {section.type === "projects" && (
              <div className="space-y-6">
                {(section.items as Project[]).map((item) => (
                  <div key={item.id} className="text-center">
                    <p 
                      className="text-sm font-medium uppercase"
                      style={{ color: getColorValue("subHeadingColor") }}
                    >
                      {item.name}
                    </p>
                    {(item.startDate || item.endDate) && (
                      <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                        {item.startDate && item.endDate 
                          ? `${item.startDate} — ${item.endDate}`
                          : item.startDate || item.endDate}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-light"
                        style={{ color: getColorValue("accentColor") }}
                      >
                        {item.url}
                      </a>
                    )}
                    {item.description && (
                      <p 
                        className="mt-2 text-xs font-light"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {section.type === "skills" && (
              <div className="flex flex-wrap justify-center gap-2">
                {(section.items as Skill[]).map((item) => (
                  <span 
                    key={item.id}
                    className="inline-block border px-3 py-1 text-xs"
                    style={{ 
                      borderColor: getColorValue("textColor") + '33',
                      color: getColorValue("textColor")
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Kreativ layout - färgglad och assymetrisk med unikt utseende
export function CreativeLayout({ cv }: TemplateLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  const profileImageStyle = profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '12px',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 4}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("accentColor")}`
      : 'none',
    objectFit: 'cover',
    width: '140px',
    height: '140px',
    transform: 'rotate(-3deg)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  } as React.CSSProperties : {}
  
  // Ikoner för färdigheter baserat på namn
  const getSkillIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('design') || lowercaseName.includes('ux') || lowercaseName.includes('ui')) {
      return <Zap className="h-3 w-3" />;
    } else if (lowercaseName.includes('program') || lowercaseName.includes('kod') || lowercaseName.includes('code')) {
      return <Hash className="h-3 w-3" />;
    } else if (lowercaseName.includes('språk') || lowercaseName.includes('language')) {
      return <Globe className="h-3 w-3" />;
    } else if (lowercaseName.includes('business') || lowercaseName.includes('sales') || lowercaseName.includes('mark')) {
      return <DollarSign className="h-3 w-3" />;
    }
    return <Star className="h-3 w-3" />;
  };
  
  return (
    <div 
      className="relative h-full overflow-hidden" 
      style={{ backgroundColor: getColorValue("backgroundColor") }}
    >
      {/* Dekorativ diagonal splash i bakgrunden */}
      <div 
        className="absolute -right-20 -top-20 h-96 w-96 rotate-12 rounded-full opacity-20" 
        style={{ backgroundColor: getColorValue("primaryColor") }}
      ></div>
      
      {/* Header - sidsatt och dynamisk */}
      <div className="relative p-8">
        <div className="flex items-start justify-between">
          <div className="max-w-md">
            <h1 
              className="text-4xl font-black tracking-tight"
              style={{ color: getColorValue("primaryColor") }}
            >
              {personalInfo.firstName} <br />
              <span style={{ color: getColorValue("secondaryColor") }}>
                {personalInfo.lastName}
              </span>
            </h1>
            <div 
              className="mt-2 h-1 w-12" 
              style={{ backgroundColor: getColorValue("accentColor") }}
            ></div>
            <p 
              className="mt-3 text-xl font-semibold tracking-tight"
              style={{ color: getColorValue("headingColor") }}
            >
              {personalInfo.title}
            </p>
            
            <div className="mt-6 space-y-2">
              {personalInfo.email && (
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full" 
                    style={{ backgroundColor: getColorValue("accentColor") + '20' }}
                  >
                    <Mail className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                  </div>
                  <span style={{ color: getColorValue("textColor") }}>{personalInfo.email}</span>
                </div>
              )}
              
              {personalInfo.phone && (
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full" 
                    style={{ backgroundColor: getColorValue("accentColor") + '20' }}
                  >
                    <Phone className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                  </div>
                  <span style={{ color: getColorValue("textColor") }}>{personalInfo.phone}</span>
                </div>
              )}
              
              {personalInfo.location && (
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full" 
                    style={{ backgroundColor: getColorValue("accentColor") + '20' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                  </div>
                  <span style={{ color: getColorValue("textColor") }}>{personalInfo.location}</span>
                </div>
              )}
              
              {personalInfo.website && (
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full" 
                    style={{ backgroundColor: getColorValue("accentColor") + '20' }}
                  >
                    <Globe className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                  </div>
                  <span style={{ color: getColorValue("textColor") }}>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
          
          {profileImage && profileImage.url && (
            <div className="relative">
              <img 
                src={profileImage.url} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                style={profileImageStyle}
              />
              {/* Dekorativa element runt bilden */}
              <div 
                className="absolute -right-2 -top-2 h-8 w-8 rounded-full" 
                style={{ backgroundColor: getColorValue("accentColor") }}
              ></div>
              <div 
                className="absolute -bottom-1 -left-1 h-6 w-6 rounded-full" 
                style={{ backgroundColor: getColorValue("secondaryColor") }}
              ></div>
            </div>
          )}
        </div>
        
        {/* Sammanfattning i färgglad stiliserad container */}
        {personalInfo.summary && (
          <div 
            className="mt-8 rounded-lg p-4" 
            style={{ backgroundColor: getColorValue("primaryColor") + '10' }}
          >
            <div className="flex">
              <div 
                className="mr-4 h-full w-1 rounded-full" 
                style={{ backgroundColor: getColorValue("accentColor") }}
              ></div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: getColorValue("textColor") }}
              >
                {personalInfo.summary}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Huvudinnehåll i anpassat layout */}
      <div className="px-8 py-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-8">
            {/* Erfarenheter i vänster kolumn */}
            {sections.filter(s => s.type === "experience").map(section => (
              <div key={section.id} className="space-y-4">
                <h2 
                  className="inline-block rounded-md px-4 py-1 text-xl font-bold"
                  style={{ 
                    backgroundColor: getColorValue("primaryColor") + '15',
                    color: getColorValue("headingColor") 
                  }}
                >
                  {section.title}
                </h2>
                
                <div className="space-y-6">
                  {(section.items as Experience[]).map((item, index) => (
                    <div key={item.id} className="relative pl-8">
                      {/* Tidslinjedekor */}
                      <div 
                        className="absolute left-0 top-0 h-full w-1 rounded-full" 
                        style={{ backgroundColor: getColorValue("accentColor") + '30' }}
                      ></div>
                      <div 
                        className="absolute left-0 top-0 h-3 w-3 translate-x-[-4px] translate-y-1 rounded-full" 
                        style={{ backgroundColor: getColorValue("accentColor") }}
                      ></div>
                      
                      <div>
                        <h3 
                          className="text-md font-bold"
                          style={{ color: getColorValue("subHeadingColor") }}
                        >
                          {item.position}
                        </h3>
                        <div className="flex justify-between text-sm">
                          <p className="font-semibold" style={{ color: getColorValue("secondaryColor") }}>
                            {item.company}
                          </p>
                          <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                            {item.startDate} — {item.endDate}
                          </p>
                        </div>
                        {item.location && (
                          <p className="text-xs italic" style={{ color: getColorValue("textColor") }}>
                            {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p 
                            className="mt-2 text-xs font-light"
                            style={{ color: getColorValue("textColor") }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Projekt i vänster kolumn */}
            {sections.filter(s => s.type === "projects").map(section => (
              <div key={section.id} className="space-y-4">
                <h2 
                  className="inline-block rounded-md px-4 py-1 text-xl font-bold"
                  style={{ 
                    backgroundColor: getColorValue("primaryColor") + '15',
                    color: getColorValue("headingColor") 
                  }}
                >
                  {section.title}
                </h2>
                
                <div className="space-y-4">
                  {(section.items as Project[]).map((item) => (
                    <div 
                      key={item.id} 
                      className="rounded-lg p-3"
                      style={{ backgroundColor: getColorValue("backgroundColor") }}
                    >
                      <h3 
                        className="font-bold"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.name}
                      </h3>
                      {(item.startDate || item.endDate) && (
                        <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                          {item.startDate && item.endDate 
                            ? `${item.startDate} — ${item.endDate}`
                            : item.startDate || item.endDate}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: getColorValue("accentColor") }}
                        >
                          {item.url}
                        </a>
                      )}
                      {item.description && (
                        <p 
                          className="mt-2 text-xs whitespace-pre-line"
                          style={{ color: getColorValue("textColor") }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-8">
            {/* Utbildning i höger kolumn */}
            {sections.filter(s => s.type === "education").map(section => (
              <div key={section.id} className="space-y-4">
                <h2 
                  className="inline-block rounded-md px-4 py-1 text-xl font-bold"
                  style={{ 
                    backgroundColor: getColorValue("primaryColor") + '15',
                    color: getColorValue("headingColor") 
                  }}
                >
                  {section.title}
                </h2>
                
                <div className="space-y-4">
                  {(section.items as Education[]).map((item) => (
                    <div 
                      key={item.id} 
                      className="rounded-lg border-l-4 p-3"
                      style={{ 
                        backgroundColor: getColorValue("backgroundColor"),
                        borderLeftColor: getColorValue("accentColor") 
                      }}
                    >
                      <h3 
                        className="font-bold"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.degree} {item.field && `i ${item.field}`}
                      </h3>
                      <p className="text-sm" style={{ color: getColorValue("secondaryColor") }}>
                        {item.institution}
                      </p>
                      <p className="text-xs" style={{ color: getColorValue("textColor") }}>
                        {item.startDate} — {item.endDate}
                      </p>
                      {item.description && (
                        <p 
                          className="mt-2 text-xs whitespace-pre-line"
                          style={{ color: getColorValue("textColor") }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Färdigheter i höger kolumn */}
            {sections.filter(s => s.type === "skills").map(section => (
              <div key={section.id} className="space-y-4">
                <h2 
                  className="inline-block rounded-md px-4 py-1 text-xl font-bold"
                  style={{ 
                    backgroundColor: getColorValue("primaryColor") + '15',
                    color: getColorValue("headingColor") 
                  }}
                >
                  {section.title}
                </h2>
                
                <div className="grid grid-cols-2 gap-2">
                  {(section.items as Skill[]).map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center rounded-full px-3 py-2"
                      style={{ backgroundColor: getColorValue("backgroundColor") }}
                    >
                      <div 
                        className="mr-2 flex h-6 w-6 items-center justify-center rounded-full" 
                        style={{ backgroundColor: getColorValue("accentColor") + '20' }}
                      >
                        {getSkillIcon(item.name)}
                      </div>
                      <div>
                        <p 
                          className="text-xs font-semibold"
                          style={{ color: getColorValue("subHeadingColor") }}
                        >
                          {item.name}
                        </p>
                        <div className="mt-1 flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i}
                              className="mr-1 h-1 w-3 rounded-full"
                              style={{ 
                                backgroundColor: i < item.level 
                                  ? getColorValue("accentColor") 
                                  : getColorValue("textColor") + '20'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Professionell layout - elegant och traditionell med tydligt fokus
export function ProfessionalLayout({ cv }: TemplateLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  const profileImageStyle = profileImage ? {
    borderRadius: profileImage.isCircle ? '50%' : '0',
    border: profileImage.showFrame 
      ? `${profileImage.frameWidth || 2}px ${profileImage.frameStyle || 'solid'} ${profileImage.frameColor || getColorValue("primaryColor")}`
      : 'none',
    objectFit: 'cover',
    width: '130px',
    height: '130px',
  } as React.CSSProperties : {}

  return (
    <div className="flex h-full flex-col">
      {/* Header med professionell och tydlig design */}
      <div 
        className="relative w-full p-8 pb-12 pt-10 text-white"
        style={{ backgroundColor: getColorValue("primaryColor") }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="mt-1 text-xl font-medium opacity-90">
              {personalInfo.title}
            </p>
          </div>
          
          {profileImage && profileImage.url && (
            <div className="border-2 border-white">
              <img 
                src={profileImage.url} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                style={profileImageStyle}
              />
            </div>
          )}
        </div>
        
        {/* Kontaktuppgifter i tydlig rad */}
        <div className="mt-6 flex flex-wrap justify-start gap-6 text-sm opacity-90">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{personalInfo.website}</span>
            </div>
          )}
        </div>
        
        {/* Dekorativ båge längst ner */}
        <div 
          className="absolute -bottom-6 left-1/2 h-12 w-12 -translate-x-1/2 rotate-45 transform"
          style={{ backgroundColor: getColorValue("primaryColor") }}
        ></div>
      </div>
      
      {/* Huvudinnehåll med två kolumner */}
      <div className="grid flex-grow grid-cols-3 gap-0">
        {/* Vänster kolumn med mindre innehåll */}
        <div className="col-span-1 p-6 pt-12">
          {/* Profil/sammanfattning */}
          {personalInfo.summary && (
            <div className="mb-8">
              <h2 
                className="mb-3 border-b-2 pb-1 text-lg font-bold uppercase tracking-wide"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderBottomColor: getColorValue("accentColor")
                }}
              >
                Profil
              </h2>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: getColorValue("textColor") }}
              >
                {personalInfo.summary}
              </p>
            </div>
          )}
          
          {/* Färdigheter som ofta finns i sidospalt */}
          {sections.filter(s => s.type === "skills").map(section => (
            <div key={section.id} className="mb-8">
              <h2 
                className="mb-4 border-b-2 pb-1 text-lg font-bold uppercase tracking-wide"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderBottomColor: getColorValue("accentColor")
                }}
              >
                {section.title}
              </h2>
              
              <div className="space-y-3">
                {(section.items as Skill[]).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p 
                        className="text-sm font-medium"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.name}
                      </p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${(item.level / 5) * 100}%`,
                          backgroundColor: getColorValue("accentColor") 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Höger kolumn med mer innehåll */}
        <div 
          className="col-span-2 border-l p-6 pt-12"
          style={{ borderLeftColor: getColorValue("textColor") + '20' }}
        >
          {/* Erfarenhet sektion med tydlig struktur */}
          {sections.filter(s => s.type === "experience").map(section => (
            <div key={section.id} className="mb-8">
              <h2 
                className="mb-4 border-b-2 pb-1 text-lg font-bold uppercase tracking-wide"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderBottomColor: getColorValue("accentColor")
                }}
              >
                {section.title}
              </h2>
              
              <div className="space-y-5">
                {(section.items as Experience[]).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between">
                      <h3 
                        className="text-md font-bold"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.position}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: getColorValue("accentColor") }}
                      >
                        {item.startDate} — {item.endDate}
                      </p>
                    </div>
                    
                    <p 
                      className="text-sm font-medium"
                      style={{ color: getColorValue("secondaryColor") }}
                    >
                      {item.company}
                      {item.location && (
                        <span className="ml-1 font-normal opacity-80">
                          ({item.location})
                        </span>
                      )}
                    </p>
                    
                    {item.description && (
                      <p 
                        className="mt-2 text-sm whitespace-pre-line"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Utbildning sektion */}
          {sections.filter(s => s.type === "education").map(section => (
            <div key={section.id} className="mb-8">
              <h2 
                className="mb-4 border-b-2 pb-1 text-lg font-bold uppercase tracking-wide"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderBottomColor: getColorValue("accentColor")
                }}
              >
                {section.title}
              </h2>
              
              <div className="space-y-5">
                {(section.items as Education[]).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between">
                      <h3 
                        className="text-md font-bold"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.degree} {item.field && `i ${item.field}`}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: getColorValue("accentColor") }}
                      >
                        {item.startDate} — {item.endDate}
                      </p>
                    </div>
                    
                    <p 
                      className="text-sm font-medium"
                      style={{ color: getColorValue("secondaryColor") }}
                    >
                      {item.institution}
                    </p>
                    
                    {item.description && (
                      <p 
                        className="mt-2 text-sm whitespace-pre-line"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Projekt sektion */}
          {sections.filter(s => s.type === "projects").map(section => (
            <div key={section.id} className="mb-8">
              <h2 
                className="mb-4 border-b-2 pb-1 text-lg font-bold uppercase tracking-wide"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderBottomColor: getColorValue("accentColor")
                }}
              >
                {section.title}
              </h2>
              
              <div className="space-y-5">
                {(section.items as Project[]).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between">
                      <h3 
                        className="text-md font-bold"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.name}
                      </h3>
                      {(item.startDate || item.endDate) && (
                        <p 
                          className="text-sm"
                          style={{ color: getColorValue("accentColor") }}
                        >
                          {item.startDate && item.endDate 
                            ? `${item.startDate} — ${item.endDate}`
                            : item.startDate || item.endDate}
                        </p>
                      )}
                    </div>
                    
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm font-medium hover:underline"
                        style={{ color: getColorValue("secondaryColor") }}
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        {item.url}
                      </a>
                    )}
                    
                    {item.description && (
                      <p 
                        className="mt-2 text-sm whitespace-pre-line"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 