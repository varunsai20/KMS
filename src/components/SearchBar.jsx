import React, { useState, useEffect } from "react";
import "./SearchBar.css";
import Button from "./Buttons";
import Search from "../assets/images/Search.svg";
import { Autocomplete,InputAdornment, TextField } from "@mui/material";
import terms from "../assets/Data/final_cleaned_terms_only.json";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSearchResults, clearSearchResults } from "../redux/actions/actions";
const SearchBar = ({ renderInputContainer, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch=useDispatch();
  useEffect(() => {
    if (location.pathname === "/search") {
      // Check if searchTerm is present in sessionStorage
      const storedSearchTerm = sessionStorage.getItem("SearchTerm");
      if (storedSearchTerm) {
        setSearchTerm(storedSearchTerm);
        handleInputChange(null, storedSearchTerm); // Populate suggestions based on the stored term
      }
    } else {
      // Clear session storage when not on the search page
      sessionStorage.removeItem("SearchTerm");
    }
  }, [location.pathname]);
  
  useEffect(() => {
    localStorage.removeItem("filters");
  }, []);

  const handleInputChange = (event, value) => {
    if (value.length >= 3) {
      const results = terms.filter((term) =>
        term.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]); // Clear suggestions if less than 3 characters
    }
    console.log(value)
    // Keep updating the searchTerm as the user types
    setSearchTerm(value);
    sessionStorage.setItem("SearchTerm", value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };
  const handleClear = () => {
    setSearchTerm(''); // Clear the input field
    setFilteredResults([]);
  };
  const handleButtonClick = () => {
    dispatch(clearSearchResults());
    sessionStorage.removeItem("ResultData")
    if (searchTerm) {
      let searchQuery=sessionStorage.getItem("SearchTerm")
      console.log("searchTerm :",searchQuery)
      setLoading(true);
      // sessionStorage.setItem("SearchTerm", searchTerm); // Save search term to sessionStorage
      const timeoutId = setTimeout(() => {
        setLoading(false);
        navigate("/search", { state: { data: [], searchTerm } });
      }, 60000); // 30 seconds

      axios
        .post("http://13.127.207.184:80/query", { query: searchQuery })
        .then((response) => {
          // sessionStorage.setItem("SearchTerm", searchTerm); // Update sessionStorage after the response
          const data = response.data; // Assuming the API response contains a 'results' array
          setResults(data);
          dispatch(setSearchResults(data));
          clearTimeout(timeoutId);
          setLoading(false);
          navigate("/search", { state: { data, searchTerm } });
          
        })
        .catch((error) => {
          console.log(error);
          clearTimeout(timeoutId);
          setLoading(false);
          navigate("/search", { state: { data: [], searchTerm } });
          console.error("Error fetching data from the API", error);
        });
    }
  };

  const handleOptionSelect = (event, value) => {
    if (value) {
      console.log(value)
      setSearchTerm(value); // Set selected option as the search term
      sessionStorage.setItem("SearchTerm", value);
      handleButtonClick(); // Trigger the search after selection
    }
  };
  return (
    <>
      {renderInputContainer ? (
  <div className="input-container" style={{ outline: "none" }}>
    <img
      src={Search}
      alt="search-icon"
      className="search-icon"
    />
    <Autocomplete
        freeSolo
        open
        Open
        options={filteredResults} // Show filtered suggestions
        onInputChange={handleInputChange} // Update input value dynamically as the user types
        onChange={handleOptionSelect}
        inputValue={searchTerm} // Reflect the search term (typed or selected)
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Type to Search"
            variant="outlined"
            fullWidth
             onKeyDown={handleKeyDown} // Handle Enter key press inside the text field
                  id="LandingHeader-custom-textfield"
            style={{marginLeft:"3%"}}
            sx={{
              // Customize input styles using sx prop
              "& .MuiOutlinedInput-root": {
                borderRadius: "54px",
                background: "#fff",
                fontFamily: "Axiforma !important",
                fontSize: "16px !important",
                fontWeight: "500 !important",
                marginLeft:"3%",
                // Remove outline and shadow on focus or hover
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "transparent",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent",
                },
              },
              // Remove input outline on hover and focus
              "& .MuiOutlinedInput-input": {
                padding: "8px 100px 8px 40px", // Customize padding
                outline: "none",
              },
            }}
            InputProps={{
              ...params.InputProps,
              className: 'custom-input',
              style: { padding: '8px 100px 8px 40px', borderRadius:"54px", background: "#fff",fontFamily: "Axiforma !important",
                  fontSize: "16px !important",
                  fontWeight: "500 !important" },
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <span
                      onClick={handleClear}
                      style={{ fontWeight: 600, cursor: "pointer" }}
                    >
                      <svg
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "block",
                          cursor: "pointer",
                        }}
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                      </svg>
                    </span>
                  )}
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { left: '30px' },
            }}
          />
          
        )}
        className="autocomplete"
      />

    <Button
      className="search-button"
      onClick={handleButtonClick}
      loading={loading}
      text="Search"
    />
  </div>
) : (
  <div className={`Search-Bar ${className}`}>
    
    <div className="input-container">
      <img src={Search} alt="search-icon" className="search-icon" />
      <Autocomplete
        freeSolo
        options={filteredResults} // Show filtered suggestions
        onInputChange={handleInputChange} // Update input value dynamically as the user types
        onChange={handleOptionSelect}
        inputValue={searchTerm} // Reflect the search term (typed or selected)
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Type to Search"
            variant="outlined"
            fullWidth
            onKeyDown={handleKeyDown} // Handle Enter key press inside the text field
                  id="LandingHeader-custom-textfield"
            sx={{
              // Customize input styles using sx prop
              "& .MuiOutlinedInput-root": {
                borderRadius: "54px",
                background: "#fff",
                fontFamily: "Axiforma !important",
                fontSize: "16px !important",
                fontWeight: "500 !important",
                // Remove outline and shadow on focus or hover
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "transparent",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent",
                },
              },
              // Remove input outline on hover and focus
              "& .MuiOutlinedInput-input": {
                padding: "8px 100px 8px 40px", // Customize padding
                outline: "none",
              },
            }}
            InputProps={{
              
              ...params.InputProps,
              className: 'custom-input',
                    style: { padding: '8px 100px 8px 40px', borderRadius:"54px", background: "#fff",fontFamily: "Axiforma !important",
                        fontSize: "16px !important",
                        fontWeight: "500 !important" },
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <span
                      onClick={handleClear}
                      style={{ fontWeight: 600, cursor: "pointer" }}
                    >
                      <svg
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "block",
                          cursor: "pointer",
                        }}
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                      </svg>
                    </span>
                  )}
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { left: '30px' },
            }}
          />
        )}
        className="autocomplete"
      />

      <Button
        className="search-button"
        onClick={handleButtonClick}
        loading={loading}
        text="Search"
      />
    </div>
  </div>
)}

    </>
  );
};

export default SearchBar;
