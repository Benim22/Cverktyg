"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { Calendar, Mail, Phone, MapPin, Globe, Star, Zap } from "lucide-react"

interface CreativeProLayoutProps {
  cv: CV;
  profileImageStyle?: React.CSSProperties;
  profileImageClass?: string;
  transparentBgStyle?: React.CSSProperties;
}

export function CreativeProLayout({ cv, profileImageStyle = {} }: CreativeProLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  // Extrahera sektioner efter typ
  const educationSection = sections.find(s => s.type === "education")
  const experienceSection = sections.find(s => s.type === "experience")
  const projectsSection = sections.find(s => s.type === "projects")
  const skillsSection = sections.find(s => s.type === "skills")

  return (
    <div className="flex h-full">
      {/* Vänster sidopanel */}
      <div 
        className="w-1/3 p-6"
        style={{ backgroundColor: getColorValue("primaryColor") }}
      >
        {/* Profilbild */}
        {profileImage && profileImage.url && (
          <div className="flex justify-center mb-6">
            <div
              className="rounded-full p-1"
              style={{ 
                backgroundColor: getColorValue("accentColor"),
                padding: "3px"
              }}
            >
              <img 
                src={profileImage.url} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="h-32 w-32 object-cover rounded-full"
                style={profileImageStyle}
              />
            </div>
          </div>
        )}
        
        {/* Namn och titel */}
        <div className="text-center mb-6">
          <h1 
            className="text-2xl font-bold mb-1 cv-name"
            style={{ 
              color: "white",
              fontFamily: "var(--heading-font)",
              letterSpacing: "0.025em"
            }}
          >
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <p 
            className="text-sm cv-job-title"
            style={{ color: getColorValue("accentColor") }}
          >
            {personalInfo.title}
          </p>
        </div>
        
        {/* Kontaktinformation */}
        <div 
          className="mb-8 space-y-3 text-white text-opacity-90"
        >
          <h2 
            className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-white border-opacity-20"
          >
            Kontakt
          </h2>
          
          <div className="space-y-3">
            {personalInfo.email && (
              <div className="flex items-center gap-2 personal-info-icon">
                <Mail className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                <span className="text-sm">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2 personal-info-icon">
                <Phone className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                <span className="text-sm">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2 personal-info-icon">
                <MapPin className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                <span className="text-sm">{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2 personal-info-icon">
                <Globe className="h-4 w-4" style={{ color: getColorValue("accentColor") }} />
                <span className="text-sm">{personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Utbildning */}
        {educationSection && educationSection.items && educationSection.items.length > 0 && (
          <div className="mb-8">
            <h2 
              className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-white border-opacity-20 text-white"
            >
              {educationSection.title}
            </h2>
            
            <div className="space-y-3">
              {(educationSection.items as Education[]).map((item) => (
                <div key={item.id} className="cv-education-item">
                  <h3 
                    className="text-sm font-semibold"
                    style={{ color: "white" }}
                  >
                    {item.institution}
                  </h3>
                  <p 
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {item.degree} {item.field && `i ${item.field}`}
                  </p>
                  <div 
                    className="text-xs italic mt-1"
                    style={{ color: getColorValue("accentColor") }}
                  >
                    {item.startDate} - {item.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Färdigheter */}
        {skillsSection && skillsSection.items && skillsSection.items.length > 0 && (
          <div>
            <h2 
              className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-white border-opacity-20 text-white"
            >
              {skillsSection.title}
            </h2>
            
            <div className="grid grid-cols-1 gap-2">
              {(skillsSection.items as Skill[]).map((skill) => (
                <div key={skill.id} className="cv-skill-item">
                  <div className="flex items-center">
                    <Zap 
                      className="h-3 w-3 mr-2 flex-shrink-0" 
                      style={{ color: getColorValue("accentColor") }} 
                    />
                    <span 
                      className="text-sm flex-1"
                      style={{ color: "white" }}
                    >
                      {skill.name}
                    </span>
                    
                    {skill.level && (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 ml-0.5"
                            fill={i < Math.round(skill.level / 20) ? getColorValue("accentColor") : "transparent"}
                            stroke={getColorValue("accentColor")}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Höger huvudinnehållssektion */}
      <div 
        className="w-2/3 p-6 bg-white"
        style={{ backgroundColor: getColorValue("backgroundColor") }}
      >
        {/* Profil/Sammanfattning */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 
              className="text-lg font-bold mb-4 relative"
              style={{ 
                color: getColorValue("headingColor"),
                borderLeftWidth: "3px",
                borderLeftColor: getColorValue("accentColor"),
                paddingLeft: "10px",
              }}
            >
              Profil
            </h2>
            <p 
              className="text-sm whitespace-pre-wrap"
              style={{ 
                color: getColorValue("textColor"),
                lineHeight: 1.6
              }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}
        
        {/* Erfarenhet */}
        {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
          <div className="mb-8">
            <h2 
              className="text-lg font-bold mb-4 relative"
              style={{ 
                color: getColorValue("headingColor"),
                borderLeftWidth: "3px",
                borderLeftColor: getColorValue("accentColor"),
                paddingLeft: "10px",
              }}
            >
              {experienceSection.title}
            </h2>
            
            <div className="space-y-6">
              {(experienceSection.items as Experience[]).map((item, index) => (
                <div key={item.id} className="cv-experience-item relative">
                  {/* Vertikalt tidslinje-element om inte sista posten */}
                  {index < (experienceSection.items as Experience[]).length - 1 && (
                    <div 
                      className="absolute left-2 top-6 bottom-0 w-0.5" 
                      style={{ 
                        backgroundColor: getColorValue("accentColor"),
                        opacity: 0.3
                      }}
                    ></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Tidslinje-prick */}
                    <div 
                      className="h-4 w-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getColorValue("accentColor") }}
                    ></div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <h3 
                          className="text-base font-semibold"
                          style={{ color: getColorValue("primaryColor") }}
                        >
                          {item.position}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p 
                            className="text-sm font-medium"
                            style={{ color: getColorValue("subHeadingColor") }}
                          >
                            {item.company}
                            {item.location && `, ${item.location}`}
                          </p>
                          <div 
                            className="text-xs"
                            style={{ color: getColorValue("textColor") }}
                          >
                            {item.startDate} - {item.endDate}
                          </div>
                        </div>
                        {item.description && (
                          <p 
                            className="mt-2 text-sm whitespace-pre-wrap"
                            style={{ color: getColorValue("textColor") }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projekt */}
        {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
          <div>
            <h2 
              className="text-lg font-bold mb-4 relative"
              style={{ 
                color: getColorValue("headingColor"),
                borderLeftWidth: "3px",
                borderLeftColor: getColorValue("accentColor"),
                paddingLeft: "10px",
              }}
            >
              {projectsSection.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(projectsSection.items as Project[]).map((item) => (
                <div 
                  key={item.id} 
                  className="cv-project-item p-3 rounded-md"
                  style={{ 
                    backgroundColor: getColorValue("backgroundColor"),
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: `1px solid ${getColorValue("primaryColor")}`,
                    borderOpacity: 0.1
                  }}
                >
                  <h3 
                    className="text-base font-semibold"
                    style={{ color: getColorValue("primaryColor") }}
                  >
                    {item.name}
                  </h3>
                  
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1 inline-block"
                      style={{ color: getColorValue("accentColor") }}
                    >
                      {item.url}
                    </a>
                  )}
                  
                  {(item.startDate || item.endDate) && (
                    <div 
                      className="text-xs font-medium mt-1"
                      style={{ color: getColorValue("textColor") }}
                    >
                      {item.startDate && item.endDate 
                        ? `${item.startDate} - ${item.endDate}`
                        : item.startDate || item.endDate}
                    </div>
                  )}
                  
                  {item.description && (
                    <p 
                      className="mt-2 text-xs whitespace-pre-wrap"
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