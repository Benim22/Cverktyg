import AdminChatbot from "@/components/AdminChatbot";
import { Shield, Users, Info } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Administratörsverktyg</h1>
          </div>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Hantera användare genom att använda naturligt språk. Systemet kommer att tolka dina instruktioner och utföra rätt åtgärder åt dig.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column - Chatbot */}
          <div className="md:col-span-2">
            <AdminChatbot />
          </div>
          
          {/* Side Column - Instructions */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-gray-800">Instruktioner</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 text-sm">Lägga till användare</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    "Lägg till en ny användare med namnet [namn] och email [email]"
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 text-sm">Tips</h3>
                  <ul className="mt-1 space-y-1 text-sm text-gray-700 list-disc pl-4">
                    <li>Var tydlig med både namn och e-postadress</li>
                    <li>Systemet skickar automatiskt ett verifieringsmail</li>
                    <li>Användaren sätter sitt eget lösenord via mailet</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <p>Endast behöriga administratörer kan använda detta verktyg</p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-gray-800">Användarstatistik</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Totalt antal</p>
                  <p className="text-xl font-bold text-gray-800">142</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Aktiva</p>
                  <p className="text-xl font-bold text-emerald-600">128</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Administratörsverktyg &copy; {new Date().getFullYear()} - Alla rättigheter förbehållna</p>
        </div>
      </div>
    </div>
  );
} 