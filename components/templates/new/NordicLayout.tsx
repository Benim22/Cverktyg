"use client"

import { useCV } from "@/contexts/CVContext"
import type { CV, Education, Experience, Project, Skill } from "@/types/cv"
import { Calendar, Mail, Phone, MapPin, Globe, Check } from "lucide-react"

interface NordicLayoutProps {
  cv: CV;
  profileImageStyle?: React.CSSProperties;
  profileImageClass?: string;
  transparentBgStyle?: React.CSSProperties;
}

export function NordicLayout({ cv, profileImageStyle = {} }: NordicLayoutProps) {
  const { getColorValue } = useCV()
  const { personalInfo, sections } = cv
  const profileImage = personalInfo?.profileImage
  
  // Extrahera sektioner efter typ
  const educationSection = sections.find(s => s.type === "education")
  const experienceSection = sections.find(s => s.type === "experience")
  const projectsSection = sections.find(s => s.type === "projects") 
  const skillsSection = sections.find(s => s.type === "skills")

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header sektion med namn och kontakt */}
      <header 
        className="p-8 pb-6"
        style={{ backgroundColor: getColorValue("backgroundColor") }}
      >
        <div className="flex flex-col items-center text-center mb-6">
          {/* Profilbild */}
          {profileImage && profileImage.url && (
            <div className="mb-4">
              <img 
                src={profileImage.url} 
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="h-24 w-24 object-cover"
                style={{
                  ...profileImageStyle,
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
          
          <h1 
            className="text-3xl font-bold tracking-tight cv-name"
            style={{ 
              color: getColorValue("headingColor"),
              fontFamily: "var(--heading-font)"
            }}
          >
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          
          <p 
            className="text-base mt-1 cv-job-title"
            style={{ color: getColorValue("primaryColor") }}
          >
            {personalInfo.title}
          </p>
        </div>
        
        {/* Kontaktinformation */}
        <div 
          className="flex flex-wrap justify-center gap-4 text-sm"
          style={{ color: getColorValue("textColor") }}
        >
          {personalInfo.email && (
            <div className="flex items-center gap-1 personal-info-icon">
              <Mail className="h-4 w-4" style={{ color: getColorValue("primaryColor") }} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1 personal-info-icon">
              <Phone className="h-4 w-4" style={{ color: getColorValue("primaryColor") }} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1 personal-info-icon">
              <MapPin className="h-4 w-4" style={{ color: getColorValue("primaryColor") }} />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1 personal-info-icon">
              <Globe className="h-4 w-4" style={{ color: getColorValue("primaryColor") }} />
              <span>{personalInfo.website}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Dekorativ linje */}
      <div 
        className="h-0.5" 
        style={{ backgroundColor: getColorValue("accentColor") }}
      ></div>
      
      {/* Huvudinnehåll */}
      <main className="flex-1 p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Vänster kolumn */}
        <div className="md:col-span-7 space-y-8">
          {/* Profil/Sammanfattning */}
          {personalInfo.summary && (
            <section>
              <h2 
                className="text-xs uppercase tracking-widest mb-3 font-bold"
                style={{ color: getColorValue("primaryColor") }}
              >
                Profil
              </h2>
              <p 
                className="text-sm whitespace-pre-wrap"
                style={{ 
                  color: getColorValue("textColor"),
                  lineHeight: 1.7
                }}
              >
                {personalInfo.summary}
              </p>
            </section>
          )}
          
          {/* Erfarenhet */}
          {experienceSection && experienceSection.items && experienceSection.items.length > 0 && (
            <section>
              <h2 
                className="text-xs uppercase tracking-widest mb-4 font-bold"
                style={{ color: getColorValue("primaryColor") }}
              >
                {experienceSection.title}
              </h2>
              
              <div className="space-y-6">
                {(experienceSection.items as Experience[]).map((item) => (
                  <div key={item.id} className="cv-experience-item">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="text-base font-semibold"
                            style={{ color: getColorValue("headingColor") }}
                          >
                            {item.position}
                          </h3>
                          <p 
                            className="text-sm"
                            style={{ color: getColorValue("textColor") }}
                          >
                            {item.company}
                            {item.location && `, ${item.location}`}
                          </p>
                        </div>
                        <div 
                          className="text-xs font-medium"
                          style={{ color: getColorValue("subHeadingColor") }}
                        >
                          {item.startDate} — {item.endDate}
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
                ))}
              </div>
            </section>
          )}
          
          {/* Projekt */}
          {projectsSection && projectsSection.items && projectsSection.items.length > 0 && (
            <section>
              <h2 
                className="text-xs uppercase tracking-widest mb-4 font-bold"
                style={{ color: getColorValue("primaryColor") }}
              >
                {projectsSection.title}
              </h2>
              
              <div className="space-y-5">
                {(projectsSection.items as Project[]).map((item) => (
                  <div key={item.id} className="cv-project-item">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="text-base font-semibold"
                            style={{ color: getColorValue("headingColor") }}
                          >
                            {item.name}
                          </h3>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline"
                              style={{ color: getColorValue("accentColor") }}
                            >
                              {item.url}
                            </a>
                          )}
                        </div>
                        {(item.startDate || item.endDate) && (
                          <div 
                            className="text-xs font-medium"
                            style={{ color: getColorValue("subHeadingColor") }}
                          >
                            {item.startDate && item.endDate 
                              ? `${item.startDate} — ${item.endDate}`
                              : item.startDate || item.endDate}
                          </div>
                        )}
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
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Höger kolumn */}
        <div className="md:col-span-5 space-y-8">
          {/* Utbildning */}
          {educationSection && educationSection.items && educationSection.items.length > 0 && (
            <section>
              <h2 
                className="text-xs uppercase tracking-widest mb-4 font-bold"
                style={{ color: getColorValue("primaryColor") }}
              >
                {educationSection.title}
              </h2>
              
              <div className="space-y-4">
                {(educationSection.items as Education[]).map((item) => (
                  <div key={item.id} className="cv-education-item">
                    <div className="flex flex-col">
                      <h3 
                        className="text-base font-semibold"
                        style={{ color: getColorValue("headingColor") }}
                      >
                        {item.institution}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: getColorValue("textColor") }}
                      >
                        {item.degree} {item.field && `i ${item.field}`}
                      </p>
                      <div 
                        className="text-xs font-medium mt-1"
                        style={{ color: getColorValue("subHeadingColor") }}
                      >
                        {item.startDate} — {item.endDate}
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
                ))}
              </div>
            </section>
          )}
          
          {/* Färdigheter */}
          {skillsSection && skillsSection.items && skillsSection.items.length > 0 && (
            <section>
              <h2 
                className="text-xs uppercase tracking-widest mb-4 font-bold"
                style={{ color: getColorValue("primaryColor") }}
              >
                {skillsSection.title}
              </h2>
              
              <div className="grid grid-cols-1 gap-2">
                {(skillsSection.items as Skill[]).map((skill) => (
                  <div key={skill.id} className="cv-skill-item">
                    <div className="flex items-center gap-2">
                      <Check 
                        className="h-3 w-3 flex-shrink-0" 
                        style={{ color: getColorValue("accentColor") }}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span 
                          className="text-sm"
                          style={{ color: getColorValue("textColor") }}
                        >
                          {skill.name}
                        </span>
                        
                        {skill.level && (
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <div
                                key={dot}
                                className="h-1.5 w-1.5 rounded-full mx-0.5"
                                style={{
                                  backgroundColor: dot <= Math.round(skill.level / 20) 
                                    ? getColorValue("accentColor") 
                                    : '#e5e7eb'
                                }}
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
} 