// import React, { useState, useEffect, useRef } from 'react';

// // Main App component for the chatbot
// const Chatbot = () => {
//   // State to store the chat history
//   const [messages, setMessages] = useState([]);
//   // State for the current message being typed
//   const [input, setInput] = useState('');
//   // State to indicate if the AI is currently generating a response
//   const [isLoading, setIsLoading] = useState(false);

//   // Reference to the chat window for auto-scrolling
//   const chatWindowRef = useRef(null);

//   // Autoscroll to the bottom of the chat window whenever messages are updated
//   useEffect(() => {
//     if (chatWindowRef.current) {
//       chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
//     }
//   }, [messages]);

//   // Function to handle sending a message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (input.trim() === '') return;
//     console.log("User input:", input.trim());

//     // Add the user's message to the chat history
//     const userMessage = { sender: 'user', text: input };
//     console.log("Adding user message:", userMessage);
//     setMessages(prevMessages => [...prevMessages, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       // Create the chat history payload for the API call
//       const chatHistory = [...messages, userMessage].map(msg => ({
//         role: msg.sender === 'user' ? 'user' : 'model',
//         parts: [{ text: msg.text }],
//       }));

//       // Define the API payload
//       const payload = { contents: chatHistory };
//       const apiKey = "AIzaSyBf5z-UziaT2xF9G_MktZfdaEd2obV9_h0";
//       const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

//       // Make the API call to the Gemini model
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });
//         console.log("API response:", response);
//       // Handle non-ok HTTP responses
//       if (!response.ok) {
//         throw new Error(`API call failed with status: ${response.status}`);
//       }

//       const result = await response.json();

//       // Check for a valid response structure
//       if (result.candidates && result.candidates.length > 0 &&
//           result.candidates[0].content && result.candidates[0].content.parts &&
//           result.candidates[0].content.parts.length > 0) {
//         const aiResponseText = result.candidates[0].content.parts[0].text;
//         const aiMessage = { sender: 'ai', text: aiResponseText };
//         setMessages(prevMessages => [...prevMessages, aiMessage]);
//       } else {
//         throw new Error('Unexpected API response structure or no content.');
//       }
//     } catch (error) {
//       console.error('Error fetching AI response:', error);
//       // Display an error message in the chat
//       setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // JSX for the component's UI
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
//       <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
//         {/* Chat Header */}
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 text-center text-2xl font-bold">
//           AI Chatbot
//         </div>

//         {/* Chat Window */}
//         <div ref={chatWindowRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
//           {messages.length === 0 && (
//             <div className="text-center text-gray-500 italic mt-12">
//               Start the conversation by typing a message below.
//             </div>
//           )}
//           {messages.map((message, index) => (
//             <div
//               key={index}
//               className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-[75%] px-4 py-2 rounded-lg shadow-md ${
//                   message.sender === 'user'
//                     ? 'bg-indigo-500 text-white rounded-br-none'
//                     : 'bg-gray-200 text-gray-800 rounded-bl-none'
//                 }`}
//               >
//                 {message.text}
//               </div>
//             </div>
//           ))}
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="max-w-[75%] px-4 py-2 rounded-lg shadow-md bg-gray-200 text-gray-800 rounded-bl-none italic">
//                 AI is typing...
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Message Input Form */}
//         <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
//               placeholder="Type your message..."
//               disabled={isLoading}
//             />
//             <button
//               type="submit"
//               className={`p-3 rounded-full text-white transition-all duration-200 ${
//                 isLoading
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-indigo-500 hover:bg-indigo-600 transform active:scale-95'
//               }`}
//               disabled={isLoading}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//               </svg>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;


import React, { useState, useEffect, useRef } from 'react';

// Main App component for the chatbot
const chatbot = () => {
  // State to store the chat history
  const [messages, setMessages] = useState([]);
  // State for the current message being typed
  const [input, setInput] = useState('');
  // State to indicate if the AI is currently generating a response
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the chat window for auto-scrolling
  const chatWindowRef = useRef(null);

  // Define the system prompt with information about your project.
  // This is the key to customizing the chatbot's knowledge.
  // You can put all your project's details here.
  const systemPrompt = `You are a helpful chatbot for a company called "InnovateTech Solutions". Your purpose is to provide information and support related to our services and products.
  
  Our main product is "The CloudSync Pro", a secure file synchronization service. It offers 50GB of free storage, end-to-end encryption, and real-time collaboration features.
  
  Our core services include:
  1. **Web Development:** We build modern, responsive websites using React and Tailwind CSS.
  2. **Mobile App Creation:** We develop iOS and Android apps with a focus on user experience.
  3. **Data Analytics:** We provide business intelligence dashboards and reporting.
  
  Our pricing for advanced plans starts at $15/month for 500GB of storage.
  
  When a user asks a question, please use only the information provided above to formulate your response. If you don't have the information, simply state that you don't know and suggest they contact support at support@innovatetech.com.`;

  // Autoscroll to the bottom of the chat window whenever messages are updated
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add the user's message to the chat history
    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Combine the system prompt with the user's message to provide context.
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${input}`;

      const chatHistory = [{
        role: 'user',
        parts: [{ text: fullPrompt }],
      }];
      
      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyBf5z-UziaT2xF9G_MktZfdaEd2obV9_h0"; // Your API key goes here
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        const aiMessage = { sender: 'ai', text: aiResponseText };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        throw new Error('Unexpected API response structure or no content.');
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // JSX for the component's UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 text-center text-2xl font-bold">
          InnovateTech Solutions AI
        </div>

        {/* Chat Window */}
        <div ref={chatWindowRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic mt-12">
              Start the conversation by typing a message below.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg shadow-md ${
                  message.sender === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-2 rounded-lg shadow-md bg-gray-200 text-gray-800 rounded-bl-none italic">
                AI is typing...
              </div>
            </div>
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`p-3 rounded-full text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 transform active:scale-95'
              }`}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default chatbot;
