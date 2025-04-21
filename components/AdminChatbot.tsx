"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessage {
  id: string;
  role: "admin" | "bot";
  text: string;
  status?: "success" | "error" | "info";
}

export default function AdminChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
    
    // Välkomstmeddelande
    const welcomeMessage = {
      id: "welcome",
      role: "bot",
      text: "Hej! Jag hjälper dig att lägga till användare. Skriv exempelvis \"Lägg till användare Anna Andersson med e-post anna@example.com\"",
      status: "info"
    };
    
    // Sätt ett timeout för att visa välkomstmeddelandet med en liten fördröjning
    // Detta ger en "mänskligare" känsla
    const timer = setTimeout(() => {
      setMessages([welcomeMessage]);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create a unique ID for each message
    const messageId = Date.now().toString();
    
    setMessages((msgs) => [
      ...msgs,
      { id: messageId, role: "admin", text: input.trim() }
    ]);
    
    setInput("");
    setLoading(true);

    try {
      // Logga till konsollen för felsökning
      console.log("Skickar meddelande till API:", input.trim());
      
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() })
      });
      
      // Logga svaret för felsökning
      console.log("API svarstatus:", res.status, res.statusText);
      
      // Försök parsa JSON oavsett statuskod för att få eventuellt felmeddelande
      let data;
      const responseText = await res.text();
      console.log("Råsvar från API:", responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Kunde inte tolka API-svar som JSON:", responseText, parseError);
        
        // Visa ett felmeddelande om vi inte kunde tolka svaret
        const errorText = "⚠️ Fel! Servern returnerade ett ogiltigt svar.";
        
        toast({
          title: "Något gick fel",
          description: errorText,
          variant: "destructive",
        });
        
        setMessages((msgs) => [
          ...msgs,
          { 
            id: Date.now().toString(), 
            role: "bot", 
            text: errorText,
            status: "error"
          }
        ]);
        return;
      }
      
      // Kontrollera om det är ett fel eller framgångsmeddelande
      const isError = !res.ok || !!data.error;
      const messageText = data.message || data.error || "⚠️ Okänt fel.";
      const details = data.details ? `\n\nDetaljer: ${JSON.stringify(data.details, null, 2)}` : "";
      
      // Visa toast baserat på svar
      toast({
        title: isError ? "Något gick fel" : "Användare tillagd",
        description: messageText,
        variant: isError ? "destructive" : "default",
      });
      
      setMessages((msgs) => [
        ...msgs,
        { 
          id: Date.now().toString(), 
          role: "bot", 
          text: messageText + (process.env.NODE_ENV === "development" ? details : ""),
          status: isError ? "error" : "success"
        }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage = "⚠️ Ett oväntat fel inträffade vid kommunikation med servern. Försök igen.";
      
      toast({
        title: "Fel",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessages((msgs) => [
        ...msgs,
        { 
          id: Date.now().toString(), 
          role: "bot", 
          text: errorMessage,
          status: "error"
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Cleaner function to get icon based on message status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto rounded-xl shadow-lg border border-gray-200 bg-white flex flex-col h-[600px] transition-all duration-300 hover:shadow-xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
        <h2 className="font-medium">Användarhantering</h2>
        <p className="text-sm opacity-80">Använd naturligt språk för att lägga till användare</p>
      </div>
      
      {/* Chat messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.4, 
                type: "spring", 
                stiffness: 100, 
                damping: 15 
              }}
              className={`p-3 rounded-lg shadow-sm ${
                msg.role === "admin"
                  ? "bg-blue-100 ml-8 rounded-tr-none border-blue-200 border"
                  : msg.status === "error" 
                    ? "bg-red-50 mr-8 rounded-tl-none border-red-200 border" 
                    : msg.status === "success"
                      ? "bg-emerald-50 mr-8 rounded-tl-none border-emerald-200 border"
                      : "bg-white mr-8 rounded-tl-none border-gray-200 border"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${
                  msg.role === "admin" 
                    ? "bg-blue-500" 
                    : msg.status === "error"
                      ? "bg-red-500"
                      : msg.status === "success"
                        ? "bg-emerald-500"
                        : "bg-gray-500"
                }`}>
                  {msg.role === "admin" ? "A" : "B"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${
                      msg.role === "admin" 
                        ? "text-blue-800" 
                        : msg.status === "error"
                          ? "text-red-800"
                          : msg.status === "success"
                            ? "text-emerald-800"
                            : "text-gray-800"
                    }`}>
                      {msg.role === "admin" ? "Admin" : "Chatbot"}
                    </p>
                    {getStatusIcon(msg.status)}
                  </div>
                  <p className="text-gray-700 mt-1 text-sm break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 rounded-lg shadow-sm mr-8 bg-white rounded-tl-none border-gray-200 border"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 text-white text-xs flex-shrink-0">
                B
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Chatbot</p>
                <div className="flex space-x-2 pt-2">
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      transition: { 
                        repeat: Infinity, 
                        duration: 1, 
                        ease: "easeInOut",
                        repeatDelay: 0.2
                      }
                    }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      transition: { 
                        repeat: Infinity, 
                        duration: 1, 
                        ease: "easeInOut",
                        delay: 0.15,
                        repeatDelay: 0.2
                      }
                    }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      transition: { 
                        repeat: Infinity, 
                        duration: 1, 
                        ease: "easeInOut",
                        delay: 0.3,
                        repeatDelay: 0.2
                      }
                    }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Input form */}
      <form
        className="p-3 border-t border-gray-100 bg-white rounded-b-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) sendMessage();
        }}
      >
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 shadow-inner"
        >
          <input
            ref={inputRef}
            className="flex-1 p-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            placeholder="Skriv ett kommando..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className={`p-2 rounded-lg ${
              loading || !input.trim()
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            }`}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </motion.div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Lägg till användare enkelt genom att beskriva med vanligt språk
        </div>
      </form>
    </motion.div>
  );
} 