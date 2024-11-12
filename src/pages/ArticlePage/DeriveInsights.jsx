// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import "./DeriveInsights.css";
// import Loading from "../../components/Loading";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTelegram } from "@fortawesome/free-brands-svg-icons";
// import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
// import { TbFileUpload } from "react-icons/tb";
// import { Typography, CircularProgress } from "@mui/material";
// import Header from "../../components/Header-New";

// const DeriveInsights = () => {
//   const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
//   const displayIfLoggedIn = isLoggedIn ? null : "none";
//   const { user } = useSelector((state) => state.auth);
//   const token = useSelector((state) => state.auth.access_token);
//   const navigate = useNavigate();
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chatHistory, setChatHistory] = useState(() => {
//     const storedHistory =
//       JSON.parse(sessionStorage.getItem("chatHistory")) || [];
//     return storedHistory;
//   });
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const endOfMessagesRef = useRef(null);

//   const handleBackClick = () => {
//     navigate(-1);
//   };

//   const fetchAllInteractions = async () => {
//     // Fetch all interactions if an API is available
//     // Uncomment and modify below if API fetch is required
//     // const response = await axios.get("API_ENDPOINT", { headers: { Authorization: `Bearer ${token}` } });
//     // const recentInteractions = response.data;
//     // For now, using sessionStorage for previous interactions
//     const previousInteractions =
//       JSON.parse(sessionStorage.getItem("chatHistory")) || [];
//     setChatHistory(previousInteractions);
//   };

//   useEffect(() => {
//     fetchAllInteractions();
//   }, []);

//   const handleAskClick = async () => {
//     if (!query) {
//       alert("Please enter a query");
//       return;
//     }

//     setLoading(true);
//     const newChatEntry = {
//       query,
//       response: "",
//       showDot: true,
//       fileInteraction: !!uploadedFile,
//     };
//     setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

//     const bodyData = JSON.stringify({
//       question: query,
//       user_id: user.user_id,
//       session_id: undefined,
//       source: uploadedFile ? "file" : undefined,
//       article_id: uploadedFile ? uploadedFile.name : undefined,
//     });

//     try {
//       const response = await fetch(
//         "http://13.127.207.184:80/view_article/generateanswer",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: bodyData,
//         }
//       );

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";
//       setQuery("");

//       const readStream = async () => {
//         let done = false;
//         const delay = 100;

//         while (!done) {
//           const { value, done: streamDone } = await reader.read();
//           done = streamDone;

//           if (value) {
//             buffer += decoder.decode(value, { stream: true });

//             while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
//               let start = buffer.indexOf("{");
//               let end = buffer.indexOf("}", start);
//               if (start !== -1 && end !== -1) {
//                 const jsonChunk = buffer.slice(start, end + 1);
//                 buffer = buffer.slice(end + 1);

//                 try {
//                   const parsedData = JSON.parse(jsonChunk);
//                   const answer = parsedData.answer;
//                   const words = answer.split(" ");

//                   for (const word of words) {
//                     await new Promise((resolve) => setTimeout(resolve, delay));

//                     setChatHistory((chatHistory) => {
//                       const updatedChatHistory = [...chatHistory];
//                       const lastEntryIndex = updatedChatHistory.length - 1;

//                       if (lastEntryIndex >= 0) {
//                         updatedChatHistory[lastEntryIndex] = {
//                           ...updatedChatHistory[lastEntryIndex],
//                           response:
//                             (updatedChatHistory[lastEntryIndex].response ||
//                               "") +
//                             " " +
//                             word,
//                           showDot: true,
//                         };
//                       }

//                       return updatedChatHistory;
//                     });

//                     if (endOfMessagesRef.current) {
//                       endOfMessagesRef.current.scrollIntoView({
//                         behavior: "smooth",
//                       });
//                     }
//                   }
//                   setChatHistory((chatHistory) => {
//                     const updatedChatHistory = [...chatHistory];
//                     const lastEntryIndex = updatedChatHistory.length - 1;
//                     if (lastEntryIndex >= 0) {
//                       updatedChatHistory[lastEntryIndex].showDot = false;
//                     }
//                     return updatedChatHistory;
//                   });
//                 } catch (error) {
//                   console.error("Error parsing JSON chunk:", error);
//                 }
//               }
//             }
//           }
//         }
//         setLoading(false);
//         sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
//       };

//       readStream();
//     } catch (error) {
//       console.error("Error fetching or reading stream:", error);
//       setLoading(false);
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadedFile(file);
//     }
//   };

//   useEffect(() => {
//     // Scroll to the bottom whenever chat history is updated
//     if (endOfMessagesRef.current) {
//       endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [chatHistory]);

//   const handlePromptClick = (queryText) => {
//     setQuery(queryText);
//     handleAskClick();
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleAskClick();
//     }
//   };

//   return (
//     <>
//       <div className="container">
//         <div className="header-insights" style={{ width: "100%" }}>
//           <Header style={{ width: "100%" }} />
//         </div>
//         <div className="content">
//           <div
//             className="history-pagination"
//             style={{ display: displayIfLoggedIn }}
//           >
//             <h5>Recent Interactions</h5>
//             <ul>
//               {chatHistory.length > 0 ? (
//                 chatHistory.map((chat, index) => (
//                   <li key={index}>
//                     <a onClick={() => setChatHistory([chat])}>
//                       {chat.query.slice(0, 30)}
//                       {chat.query.length > 30 ? "..." : ""}
//                     </a>
//                   </li>
//                 ))
//               ) : (
//                 <li>No recent interactions available</li>
//               )}
//             </ul>
//           </div>
//           <div className="article-content">
//             {/* Display uploaded file content here */}
//             {uploadedFile ? (
//               <Typography variant="body1">
//                 Uploaded File: {uploadedFile.name}
//               </Typography>
//             ) : (
//               <Typography variant="body1" style={{ color: "gray" }}>
//                 No file uploaded
//               </Typography>
//             )}
//           </div>
//         </div>
//       </div>

//       <div
//         className="chat-query"
//         style={{
//           width: "69%",
//           display: displayIfLoggedIn,
//         }}
//       >
//         <div className="predefined-prompts">
//           <button onClick={() => handlePromptClick("Summarize this file")}>
//             Summarize
//           </button>
//           <button
//             onClick={() =>
//               handlePromptClick("What can we conclude from this file")
//             }
//           >
//             Conclusion
//           </button>
//           <button
//             onClick={() =>
//               handlePromptClick("What are the key highlights of this file")
//             }
//           >
//             Key Highlights
//           </button>
//         </div>
//         <div className="stream-input">
//           <label htmlFor="file-upload" className="custom-file-upload">
//             <TbFileUpload size={25} />
//           </label>
//           <input
//             id="file-upload"
//             type="file"
//             accept=".pdf,.docx,.txt"
//             onChange={handleFileUpload}
//             style={{ display: "none" }}
//           />
//           <input
//             type="text"
//             placeholder="Ask anything..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           {loading ? (
//             <CircularProgress
//               className="button"
//               size={24}
//               style={{ marginLeft: "1.5%" }}
//               color="white"
//             />
//           ) : (
//             <FontAwesomeIcon
//               className="button"
//               onClick={handleAskClick}
//               icon={faTelegram}
//               size={"xl"}
//             />
//           )}
//         </div>
//       </div>

//       <div className="ScrollTop">
//         <button
//           onClick={() => window.scrollTo(0, 0)}
//           id="scrollTopBtn"
//           title="Go to top"
//         >
//           <FontAwesomeIcon icon={faAnglesUp} />
//         </button>
//       </div>
//     </>
//   );
// };

// export default DeriveInsights;
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import "./DeriveInsights.css";
// import Loading from "../../components/Loading";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTelegram, faTimes } from "@fortawesome/free-solid-svg-icons";
// import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
// import { TbFileUpload } from "react-icons/tb";
// import { Typography, CircularProgress } from "@mui/material";
// import Header from "../../components/Header-New";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import "./DeriveInsights.css";
import Loading from "../../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { TbFileUpload } from "react-icons/tb";
import { Typography, CircularProgress } from "@mui/material";
import Header from "../../components/Header-New";

const DeriveInsights = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory =
      JSON.parse(sessionStorage.getItem("chatHistory")) || [];
    return storedHistory;
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const endOfMessagesRef = useRef(null);

  const handleBackClick = () => {
    navigate(-1);
  };

  const fetchAllInteractions = async () => {
    const previousInteractions =
      JSON.parse(sessionStorage.getItem("chatHistory")) || [];
    setChatHistory(previousInteractions);
  };

  useEffect(() => {
    fetchAllInteractions();
  }, []);

  const handleAskClick = async () => {
    if (!query && !uploadedFile) {
      alert("Please enter a query or upload a file");
      return;
    }

    setLoading(true);
    const newChatEntry = {
      query,
      file: uploadedFile,
      response: "",
      showDot: true,
    };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

    const bodyData = JSON.stringify({
      question: query,
      user_id: user.user_id,
      session_id: undefined,
      source: uploadedFile ? "file" : undefined,
      article_id: uploadedFile ? uploadedFile.name : undefined,
    });

    try {
      const response = await fetch(
        "http://13.127.207.184:80/view_article/generateanswer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: bodyData,
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setQuery("");

      const readStream = async () => {
        let done = false;
        const delay = 100;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            buffer += decoder.decode(value, { stream: true });

            while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
              let start = buffer.indexOf("{");
              let end = buffer.indexOf("}", start);
              if (start !== -1 && end !== -1) {
                const jsonChunk = buffer.slice(start, end + 1);
                buffer = buffer.slice(end + 1);

                try {
                  const parsedData = JSON.parse(jsonChunk);
                  const answer = parsedData.answer;
                  const words = answer.split(" ");

                  for (const word of words) {
                    await new Promise((resolve) => setTimeout(resolve, delay));

                    setChatHistory((chatHistory) => {
                      const updatedChatHistory = [...chatHistory];
                      const lastEntryIndex = updatedChatHistory.length - 1;

                      if (lastEntryIndex >= 0) {
                        updatedChatHistory[lastEntryIndex] = {
                          ...updatedChatHistory[lastEntryIndex],
                          response:
                            (updatedChatHistory[lastEntryIndex].response ||
                              "") +
                            " " +
                            word,
                          showDot: true,
                        };
                      }

                      return updatedChatHistory;
                    });

                    if (endOfMessagesRef.current) {
                      endOfMessagesRef.current.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }
                  setChatHistory((chatHistory) => {
                    const updatedChatHistory = [...chatHistory];
                    const lastEntryIndex = updatedChatHistory.length - 1;
                    if (lastEntryIndex >= 0) {
                      updatedChatHistory[lastEntryIndex].showDot = false;
                    }
                    return updatedChatHistory;
                  });
                } catch (error) {
                  console.error("Error parsing JSON chunk:", error);
                }
              }
            }
          }
        }
        setLoading(false);
        sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handlePromptClick = (queryText) => {
    setQuery(queryText);
    handleAskClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskClick();
    }
  };

  return (
    <>
      <div className="container">
        <div className="header-insights" style={{ width: "100%" }}>
          <Header style={{ width: "100%" }} />
        </div>
        <div className="content">
          <div
            className="history-pagination"
            style={{ display: displayIfLoggedIn }}
          >
            <h5>Recent Interactions</h5>
            <ul>
              {chatHistory.length > 0 ? (
                chatHistory.map((chat, index) => (
                  <li key={index}>
                    <a onClick={() => setChatHistory([chat])}>
                      {chat.query.slice(0, 30)}
                      {chat.query.length > 30 ? "..." : ""}
                    </a>
                  </li>
                ))
              ) : (
                <li>No recent interactions available</li>
              )}
            </ul>
          </div>
          <div className="article-content">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-entry ${chat.file ? "file" : ""}`}
              >
                <div className="user-query">{chat.query}</div>
                {chat.file && (
                  <div className="uploaded-file">
                    {chat.file.name}{" "}
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={removeUploadedFile}
                    />
                  </div>
                )}
                <div className="response">{chat.response}</div>
              </div>
            ))}
            <div ref={endOfMessagesRef}></div>
          </div>
        </div>
      </div>

      <div
        className="chat-query"
        style={{
          width: "69%",
          display: displayIfLoggedIn,
        }}
      >
        <div className="predefined-prompts">
          <button onClick={() => handlePromptClick("Summarize this file")}>
            Summarize
          </button>
          <button
            onClick={() =>
              handlePromptClick("What can we conclude from this file")
            }
          >
            Conclusion
          </button>
          <button
            onClick={() =>
              handlePromptClick("What are the key highlights of this file")
            }
          >
            Key Highlights
          </button>
        </div>
        <div className="stream-input">
          <label htmlFor="file-upload" className="custom-file-upload">
            <TbFileUpload size={25} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <div className="query-file-input">
            {uploadedFile && (
              <span className="uploaded-file-indicator">
                {uploadedFile.name}
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={removeUploadedFile}
                  className="cancel-file"
                />
              </span>
            )}
            <input
              type="text"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          {loading ? (
            <CircularProgress
              className="button"
              size={24}
              style={{ marginLeft: "1.5%" }}
              color="white"
            />
          ) : (
            <FontAwesomeIcon
              className="button"
              onClick={handleAskClick}
              icon={faTelegram}
              size={"xl"}
            />
          )}
        </div>
      </div>

      <div className="ScrollTop">
        <button
          onClick={() => window.scrollTo(0, 0)}
          id="scrollTopBtn"
          title="Go to top"
        >
          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </>
  );
};

export default DeriveInsights;
