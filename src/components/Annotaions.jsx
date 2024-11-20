import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Annotations.css";
const Annotation = ({
  openAnnotate,
  annotateData,
  searchTerm,
  source: passedSource,
  annotateHeight,
}) => {
  console.log(annotateData);
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
      const storedSource = sessionStorage.getItem("source");
      if (storedSource) {
        setSource(JSON.parse(storedSource));
      } else {
        console.error("Source not found in sessionStorage or passed as props.");
      }
    } else {
      // Store the passed source in sessionStorage
      sessionStorage.setItem("source", JSON.stringify(passedSource));
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

      navigate(`/article/content/${type}:${articleId}`, {
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
    const annotationEntries =
      annotateData && typeof annotateData === "object"
        ? Object.entries(annotateData)
        : [];

    return annotationEntries.flatMap(([pmid, categories]) => {
      const rows = [];
      const isExpanded = expandedPmids[pmid] || false; // Initially set expanded state to false if not set

      const sortedCategories = Object.entries(categories).sort(
        ([, a], [, b]) => (b.annotation_score || 0) - (a.annotation_score || 0)
      );

      sortedCategories.forEach(([category, values], index) => {
        if (category === "annotation_score") return;
        const categoryKey = `${pmid}-${category}`;
        const isTextExpanded = expandedTexts[categoryKey];

        const annotationScore = values.annotation_score
          ? `${values.annotation_score.toFixed(2)}%`
          : "N/A";

        const categoryTexts = Object.entries(values)
          .filter(([key]) => key !== "annotation_score")
          .map(([key]) => key)
          .join(", ");

        const displayText = isTextExpanded
          ? categoryTexts
          : categoryTexts.slice(0, 30);

        // Only display the first row initially if `isExpanded` is false
        if (index === 0 || isExpanded) {
          rows.push(
            <tr className="search-table-body" key={categoryKey}>
              <td
                style={{
                  paddingLeft: index === 0 ? 0 : 30,
                }}
              >
                {index === 0 && (
                  <button onClick={() => toggleExpandPmid(pmid)}>
                    {isExpanded ? "▼" : "▶"}
                  </button>
                )}
                {index === 0 && (
                  <a
                    style={{
                      color: "#1a82ff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={() => handleNavigate(pmid)}
                  >
                    {pmid}
                  </a>
                )}
              </td>
              <td>{annotationScore}</td>
              <td>{capitalizeFirstLetter(category)}</td>
              <td>
                {displayText}
                {categoryTexts.length > 30 && (
                  <span
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                    onClick={() => toggleExpandText(categoryKey)}
                  >
                    {isTextExpanded ? "" : "..."}
                  </span>
                )}
              </td>
            </tr>
          );
        }
      });

      return rows;
    });
  };

  return (
    <div
      className="search-tables"
      style={{ height: `${annotateHeight}vh`, overflowY: "auto" }}
    >
      <div
        style={{
          // background: "rgba(251, 251, 253, 1)",
          background:
            "linear-gradient(90deg,rgba(254, 118, 117, 0.7) -21.07%,rgba(204, 129, 185, 0.7) 37.85%,rgba(26, 168, 210, 0.7) 97.5%,rgba(76, 210, 217, 0.7) 151.24%)",
          borderRadius: "16px 16px 0 0",
          padding: "5px",
        }}
      >
        <p style={{ textAlign: "start" }}>Annotations</p>
      </div>
      <div className="search-Annotate-tables">
        <table>
          <thead>
            <tr className="search-table-head">
              <th style={{ width: "23%", textAlign: "center" }}>ID</th>
              <th style={{ width: "12%", textAlign: "center" }}>Score</th>
              <th style={{ width: "20%", textAlign: "center" }}>Type</th>
              <th style={{ width: "40%", textAlign: "center" }}>Text</th>
            </tr>
          </thead>
          <tbody>{renderAnnotations()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Annotation;
