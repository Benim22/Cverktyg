"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { AtSign, Calendar, Globe, MapPin, Phone, Mail, Award, Briefcase, Hash } from "lucide-react"

interface ExecutiveLayoutProps {
  cv: CV;
  profileImageStyle?: React.CSSProperties;
  profileImageClass?: string;
  transparentBgStyle?: React.CSSProperties;
}

export function ExecutiveLayout({ cv, profileImageStyle = {} }: ExecutiveLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  // Extrahera sektioner efter typ
  const educationSection = sections.find(s => s.type === "education")
  const experienceSection = sections.find(s => s.type === "experience")
  const projectsSection = sections.find(s => s.type === "projects")
  const skillsSection = sections.find(s => s.type === "skills")

  return (
    <div className="flex flex-col h-full">
      {/* Header med dekoration */}
      <div 
        className="pt-6 px-8"
        style={{ backgroundColor: getColorValue("primaryColor") }}
      >
        <div className="flex items-center justify-between">
          {/* Namn och titel */}
          <div className="text-white mb-4">
            <h1 
              className="text-4xl font-bold mb-1 cv-name"
              style={{ 
                fontFamily: "var(--heading-font)",
                letterSpacing: "0.05em"
              }}
            >
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="text-lg opacity-90 cv-job-title">
              {personalInfo.title}
            </p>
          </div>
          
          {/* Profilbild */}
          {profileImage && profileImage.url && (
            <div className="shrink-0">
              <img 
                src={profileImage.url} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="h-24 w-24 object-cover"
                style={profileImageStyle}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Dekorativ linje */}
      <div className="h-2" style={{ backgroundColor: getColorValue("accentColor") }}></div>
      
      {/* Innehållssektion */}
      <div className="flex-1 grid grid-cols-3 gap-0">
        {/* Vänster kolumn - Kontaktinformation och färdigheter */}
        <div className="py-6 px-6" style={{ backgroundColor: getColorValue("backgroundColor") }}>
          {/* Kontaktinformation */}
          <div className="mb-8">
            <h2 
              className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
              style={{ 
                color: getColorValue("headingColor"),
                borderColor: getColorValue("accentColor") 
              }}
            >
              Kontakt
            </h2>
            
            <div 
              className="space-y-3 text-sm"
              style={{ color: getColorValue("textColor") }}
            >
              {personalInfo.email && (
                <div className="flex items-center gap-2 personal-info-icon">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2 personal-info-icon">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2 personal-info-icon">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-2 personal-info-icon">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Färdigheter */}
          {skillsSection && skillsSection.items && skillsSection.items.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderColor: getColorValue("accentColor")
                }}
              >
                {skillsSection.title}
              </h2>
              
              <div className="space-y-3">
                {(skillsSection.items as Skill[]).map((skill) => (
                  <div key={skill.id} className="cv-skill-item">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {skill.name}
                      </span>
                      {skill.level && (
                        <div 
                          className="w-1/2 h-1.5 rounded-full overflow-hidden bg-gray-200"
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${skill.level}%`,
                              backgroundColor: getColorValue("accentColor")
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Utbildning */}
          {educationSection && educationSection.items && educationSection.items.length > 0 && (
            <div>
              <h2 
                className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderColor: getColorValue("accentColor") 
                }}
              >
                {educationSection.title}
              </h2>
              
              <div className="space-y-4">
                {(educationSection.items as Education[]).map((item) => (
                  <div key={item.id} className="cv-education-item">
                    <div className="flex flex-col">
                      <h3 
                        className="text-sm font-medium"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.institution}
                      </h3>
                      <p className="text-xs italic mb-1">
                        {item.degree} {item.field && `i ${item.field}`}
                      </p>
                      <div 
                        className="flex items-center gap-1 text-xs cv-daterange mb-2"
                        style={{ color: getColorValue("textColor") }}
                      >
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>
                          {item.startDate} - {item.endDate}
                        </span>
                      </div>
                      {item.description && (
                        <p 
                          className="text-xs"
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
          )}
        </div>
        
        {/* Höger kolumn (2 kolumner bred) - Sammanfattning, erfarenhet och projekt */}
        <div className="col-span-2 bg-white p-6">
          {/* Sammanfattning */}
          {personalInfo.summary && (
            <div className="mb-8">
              <h2 
                className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderColor: getColorValue("accentColor") 
                }}
              >
                Profil
              </h2>
              <p 
                className="text-sm whitespace-pre-wrap"
                style={{ color: getColorValue("textColor"), lineHeight: 1.6 }}
              >
                {personalInfo.summary}
              </p>
            </div>
          )}
          
          {/* Erfarenhet */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderColor: getColorValue("accentColor") 
                }}
              >
                {experienceSection.title}
              </h2>
              
              <div className="space-y-6">
                {(experienceSection.items as Experience[]).map((item) => (
                  <div key={item.id} className="cv-experience-item">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-baseline">
                        <h3 
                          className="text-base font-semibold"
                          style={{ color: getColorValue("primaryColor") }}
                        >
                          {item.position}
                        </h3>
                        <div 
                          className="flex items-center gap-1 text-xs cv-daterange whitespace-nowrap"
                          style={{ color: getColorValue("textColor") }}
                        >
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>
                            {item.startDate} - {item.endDate}
                          </span>
                        </div>
                      </div>
                      <p 
                        className="text-sm font-medium mb-2"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.company}
                        {item.location && ` • ${item.location}`}
                      </p>
                      {item.description && (
                        <p 
                          className="text-sm whitespace-pre-wrap"
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
          )}
          
          {/* Projekt */}
          {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
            <div>
              <h2 
                className="text-sm uppercase tracking-wider mb-4 pb-2 border-b"
                style={{ 
                  color: getColorValue("headingColor"),
                  borderColor: getColorValue("accentColor") 
                }}
              >
                {projectsSection.title}
              </h2>
              
              <div className="space-y-5">
                {(projectsSection.items as Project[]).map((item) => (
                  <div key={item.id} className="cv-project-item">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-baseline">
                        <h3 
                          className="text-base font-semibold"
                          style={{ color: getColorValue("primaryColor") }}
                        >
                          {item.name}
                        </h3>
                        {(item.startDate || item.endDate) && (
                          <div 
                            className="flex items-center gap-1 text-xs cv-daterange whitespace-nowrap"
                            style={{ color: getColorValue("textColor") }}
                          >
                            <Calendar className="h-3 w-3 text-gray-400" />
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
                          className="text-xs font-medium underline block mb-1"
                          style={{ color: getColorValue("accentColor") }}
                        >
                          {item.url}
                        </a>
                      )}
                      {item.description && (
                        <p 
                          className="text-sm whitespace-pre-wrap"
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
          )}
        </div>
      </div>
    </div>
  )
} 