import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Annotations.css"
const Annotation = ({ openAnnotate, annotateData, searchTerm,source: passedSource }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const { pmid: pmidFromUrl } = useParams(); // Extract pmid from the URL
  const [expandedPmids, setExpandedPmids] = useState({}); // Track which PMIDs are expanded
  const [expandedTexts, setExpandedTexts] = useState({});
  const { data } = location.state || { data: [] };
  const [source, setSource] = useState(passedSource || []);
  useEffect(() => {
    // Check if the source is available in sessionStorage if not passed as props
    if (!passedSource) {
      const storedSource = sessionStorage.getItem('source');
      if (storedSource) {
        setSource(JSON.parse(storedSource));
      } else {
        console.error("Source not found in sessionStorage or passed as props.");
      }
    } else {
      // Store the passed source in sessionStorage
      sessionStorage.setItem('source', JSON.stringify(passedSource));
    }
  }, [passedSource]);
  useEffect(() => {
    // Reset expandedTexts when openAnnotate changes
    if (openAnnotate) {
      setExpandedTexts({}); // Resets all expanded texts to the collapsed (sliced) state
    }
  }, [openAnnotate]);
  //   const handleNavigate = (article) => {
  //   // const idType = getIdType(article); // Determine whether it's pmid or bioRxiv_id
  //   const type = article.source === "BioRxiv" ? "bioRxiv_id" : article.source === "Public Library of Science (PLOS)" ? "plos_id" : "pmid";// Pass the type explicitly
  //   navigate(`/article/${type}:${article}`, { state: { data: data, searchTerm,annotateData: annotateData } });
  // };
  const handleNavigate = (articleId) => {
    const article = source.find((entry) => entry.idType === articleId);

    if (article) {
      const { source: articleSource } = article;
      const type = 
        articleSource === "BioRxiv"
          ? "bioRxiv_id"
          : articleSource === "Public Library of Science (PLOS)"
          ? "plos_id"
          : "pmid"; // Determine type based on source

      navigate(`/article/${type}:${articleId}`, {
        state: { data, searchTerm, annotateData },
      });
    } else {
      console.error(`Article with ID ${articleId} not found in the source.`);
    }
  };
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  // Function to toggle the expansion for all rows associated with a given PMID
  const toggleExpandPmid = (pmid) => {
    setExpandedPmids((prevState) => {
      const isExpanding = !prevState[pmid]; // Determine if we are expanding or collapsing
      if (!isExpanding) {
        // If we are collapsing, reset the expanded texts for this PMID
        const updatedTexts = { ...expandedTexts };
        Object.keys(updatedTexts).forEach((key) => {
          if (key.startsWith(`${pmid}-`)) {
            delete updatedTexts[key]; // Remove expanded text for this PMID's rows
          }
        });
        setExpandedTexts(updatedTexts); // Update expanded texts
      }
      return {
        ...prevState,
        [pmid]: isExpanding, // Toggle expansion for the specific PMID
      };
    });
  };

  const toggleExpandText = (key) => {
    setExpandedTexts((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle between full text and sliced text for a specific row
    }));
  };
  
  const renderAnnotations = () => {
    let filteredAnnotateData = annotateData;
  
    // Check if the URL path matches the expected pattern (e.g., "/article/pmid:19230162")
    const urlPath = location.pathname;
    const typeMatch = urlPath.match(/^\/article\/(\w+):(\d+)$/);
  
    if (typeMatch) {
      const [_, type, pmidFromUrl] = typeMatch;
  
      // Ensure filteredAnnotateData is always an array
      filteredAnnotateData = annotateData
        .filter(entry => entry.hasOwnProperty(pmidFromUrl))
        .map(entry => ({ [pmidFromUrl]: entry[pmidFromUrl] }));
    }
  
    // If filteredAnnotateData is not an array, default it to an empty array
    if (!Array.isArray(filteredAnnotateData)) {
      filteredAnnotateData = [];
    }
  
    // Render the annotations
    return filteredAnnotateData.map((entry) =>
      Object.entries(entry).flatMap(([pmid, types]) => {
        const rows = [];
        const isExpanded = expandedPmids[pmid];
  
        // Sort types by annotation score in descending order
        const sortedTypes = Object.entries(types).sort(
          ([_, a], [__, b]) => (b.annotation_score || 0) - (a.annotation_score || 0)
        );
  
        const [firstType, firstTypeData] = sortedTypes[0] || [];
        const annotationScore = firstTypeData
          ? `${firstTypeData.annotation_score.toFixed(2)}%`
          : '0%';
  
        const firstTypeValues = Object.entries(firstTypeData || {})
          .filter(([key]) => key !== 'annotation_score')
          .map(([key]) => key)
          .join(', ');
  
        const isFirstTypeExpanded = expandedTexts[`${pmid}-firstType`];
  
        // First row
        rows.push(
          <tr className="search-table-body" key={`${pmid}-first`}>
            <td style={{ paddingLeft: 0 }}>
              <button onClick={() => toggleExpandPmid(pmid)} style={{ paddingLeft: 4 }}>
                {isExpanded ? '▼' : '▶'}
              </button>
              <a
                style={{ color: "#1a82ff", fontWeight: 600, cursor: "pointer" }}
                onClick={() => handleNavigate(pmid)}
              >
                {pmid}
              </a>
            </td>
            <td>{annotationScore}</td>
            <td>{capitalizeFirstLetter(firstType)}</td>
            <td>
              {isFirstTypeExpanded ? firstTypeValues : `${firstTypeValues.slice(0, 20)}`}
              {firstTypeValues.length > 30 && (
                <span
                  style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
                  onClick={() => toggleExpandText(`${pmid}-firstType`)}
                >
                  {isFirstTypeExpanded ? '' : '...'}
                </span>
              )}
            </td>
          </tr>
        );
  
        // Additional rows for other types
        const typeRows = sortedTypes.slice(1).map(([type, values]) => {
          const valueEntries = Object.entries(values)
            .filter(([key]) => key !== 'annotation_score')
            .map(([key]) => key);
  
          const annotationScore = values.annotation_score
            ? `${values.annotation_score.toFixed(2)}%`
            : '0%';
  
          const valueText = valueEntries.join(', ');
          const typeKey = `${pmid}-${type}`;
          const isTypeTextExpanded = expandedTexts[typeKey];
          const displayText = isTypeTextExpanded
            ? valueText
            : valueText.length > 30
            ? `${valueText.slice(0, 20)}`
            : valueText;
  
          return (
            <tr className="search-table-body" key={typeKey}>
              <td style={{ paddingLeft: '30px' }}></td>
              <td>{annotationScore}</td>
              <td>{capitalizeFirstLetter(type)}</td>
              <td>
                {displayText}
                {valueText.length > 30 && !isTypeTextExpanded && (
                  <span
                    onClick={() => toggleExpandText(typeKey)}
                    style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
                  >
                    ...
                  </span>
                )}
              </td>
            </tr>
          );
        });
  
        if (isExpanded) {
          rows.push(...typeRows);
        }
  
        return rows;
      })
    );
  };
  
  

  return (
    <div className="search-tables">
      <div style={{ padding: "1%", background: "#fff", borderRadius: "16px 16px 0 0" }}>
        <p style={{ textAlign: "start" }}>Annotations</p>
      </div>
      <div className="search-Annotate-tables">
        <table>
          <thead>
            <tr className="search-table-head">
              <th style={{ width: '23%',textAlign:"center" }}>ID</th>
              <th style={{ width: '12%',textAlign:"center" }}>Score</th>
              <th style={{ width: '20%',textAlign:"center" }}>Type</th>
              <th style={{ width: '40%',textAlign:"center" }}>Text</th>
            </tr>
          </thead>
          <tbody>
            {renderAnnotations()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Annotation;
