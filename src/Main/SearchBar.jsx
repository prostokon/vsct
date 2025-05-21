import React, { useState, useEffect } from "react";
// Удалите следующую строку:
// import "./Main.css";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearClick = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Поиск..."
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <button className="search-clear" onClick={handleClearClick}>
          &times;
        </button>
      )}
    </div>
  );
};

export default SearchBar;
