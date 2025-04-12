import { CV } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_CV: CV = {
  id: "preview",
  title: "Exempelresumé",
  personalInfo: {
    firstName: "Anna",
    lastName: "Andersson",
    email: "anna.andersson@exempel.se",
    phone: "073-123 45 67",
    address: "Storgatan 10",
    city: "Stockholm",
    country: "Sverige",
    postalCode: "12345",
    title: "Systemutvecklare",
    website: "www.annaandersson.se",
    summary: "Erfaren systemutvecklare med fokus på modern webbutveckling och användarvänliga lösningar. Jag har stor passion för att skapa eleganta och effektiva applikationer med de senaste teknikerna.",
  },
  sections: [
    {
      id: uuidv4(),
      type: "experience",
      title: "Arbetslivserfarenhet",
      items: [
        {
          id: uuidv4(),
          title: "Senior Frontend-utvecklare",
          organization: "Tech Innovation AB",
          location: "Stockholm",
          startDate: "2020-01",
          endDate: "",
          current: true,
          description: "Utvecklar moderna webbapplikationer med React, TypeScript och Next.js. Leder ett mindre team och ansvarar för arkitektur och implementering av nya funktioner."
        },
        {
          id: uuidv4(),
          title: "Webbutvecklare",
          organization: "Digital Byrå Sverige",
          location: "Göteborg",
          startDate: "2017-03",
          endDate: "2019-12",
          current: false,
          description: "Arbetade med utveckling av företagshemsidor och e-handelsplattformar. Använde HTML, CSS, JavaScript och PHP."
        }
      ]
    },
    {
      id: uuidv4(),
      type: "education",
      title: "Utbildning",
      items: [
        {
          id: uuidv4(),
          degree: "Masterexamen, Datavetenskap",
          institution: "Kungliga Tekniska Högskolan",
          location: "Stockholm",
          startDate: "2015-08",
          endDate: "2017-06",
          current: false,
          description: "Inriktning mot mjukvaruutveckling och artificiell intelligens."
        },
        {
          id: uuidv4(),
          degree: "Kandidatexamen, Systemvetenskap",
          institution: "Stockholms Universitet",
          location: "Stockholm",
          startDate: "2012-08",
          endDate: "2015-06",
          current: false,
          description: "Grundläggande kurser i programmering, databaser och systemdesign."
        }
      ]
    },
    {
      id: uuidv4(),
      type: "skills",
      title: "Kompetenser",
      items: [
        {
          id: uuidv4(),
          name: "JavaScript/TypeScript",
          level: 90
        },
        {
          id: uuidv4(),
          name: "React",
          level: 85
        },
        {
          id: uuidv4(),
          name: "HTML/CSS",
          level: 90
        },
        {
          id: uuidv4(),
          name: "Node.js",
          level: 75
        },
        {
          id: uuidv4(),
          name: "Git",
          level: 80
        }
      ]
    },
    {
      id: uuidv4(),
      type: "languages",
      title: "Språk",
      items: [
        {
          id: uuidv4(),
          language: "Svenska",
          proficiency: "Modersmål"
        },
        {
          id: uuidv4(),
          language: "Engelska",
          proficiency: "Flytande"
        },
        {
          id: uuidv4(),
          language: "Tyska",
          proficiency: "Grundläggande"
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateId: "standard"
}; 