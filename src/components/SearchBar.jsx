//SearchBar.jsx

import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import './SearchBar.css';
// import data from '../data.json'  // Import the data


function SearchBar() {
    const [search, setSearch] = useState(''); // Manages the search input value
    const [results, setResults] = useState([]); // Stores search results
    const [selectedItem, setSelectedItem] = useState(-1); // Tracks the currently selected result
    const [displaySearch, setDisplaySearch] = useState(''); // Manages what is shown in the search input
    const [loading, setLoading] = useState(false); // Indicates if results are being fetched
    const [noResults, setNoResults] = useState(false); // Shows if there are no results
    const resultsRef = useRef([]);
    // Debounce the fetchResults function to prevent multiple requests
    const debouncedFetchResults = useRef(
        debounce((query) => {
            fetchResults(query);
        }, 500)
    ).current;

    // Handles changes in the search input field
    const handleChange = (e) => {
        const value = e.target.value;
        setSearch(value); // Update the search term
        setDisplaySearch(value); // Update the displayed search term
        setSelectedItem(-1); // Reset the selected item

        if (value) {
            debouncedFetchResults(value); // Call the debounced function if there's input
        } else {
            setResults([]); // Clear results if there's no input
            setNoResults(false); // Reset the no results
        }
    };

    // Clears the search input and resets state
    const handleClose = () => {
        setSearch(''); // Clear the search term
        setDisplaySearch(''); // Clear the displayed search term
        setResults([]); // Clear search results
        setSelectedItem(-1); // Reset the selected item
        setNoResults(false); // Reset the no results
    }

    const handleKeyDown = (e) => {
        // Check if there are any results to navigate through
        if (results.length > 0) {
            // Move up in the list if the 'ArrowUp' key is pressed and an item is selected
            if (e.key === 'ArrowUp' && selectedItem > 0) {
                setSelectedItem((prev) => prev - 1);
            }
            // Move down in the list if the 'ArrowDown' key is pressed and not on the last item
            else if (e.key === 'ArrowDown' && selectedItem < results.length - 1) {
                setSelectedItem((prev) => prev + 1);
            }
            // Open the link of the selected item if the 'Enter' key is pressed and an item is selected
            else if (e.key === 'Enter' && selectedItem >= 0) {
                window.open(results[selectedItem].show.url);
            }
        }
    };

    const fetchResults = (searchTerm) => {
        // Check if the search term is not empty
        if (searchTerm !== '') {
            // Show a loading spinner
            setLoading(true);

            // Fetch search results from the API
            fetch(`https://api.tvmaze.com/search/shows?q=${searchTerm}`)
                .then((res) => res.json()) // Convert the response to JSON
                .then((data) => {
                    // Update state with search results
                    setResults(data);
                    // Hide the loading spinner
                    setLoading(false);
                    // Update the noResults state based on whether data is empty
                    setNoResults(data.length === 0);
                })
                .catch(() => {
                    // Hide the loading spinner if there's an error
                    setLoading(false);
                });
        } else {
            // If the search term is empty, clear results and set noResults to false
            setResults([]);
            setNoResults(false);
        }
    };


    // Getting data from data.json file

    // const fetchResults = (searchTerm) => {
    //     if (searchTerm !== '') {
    //         setLoading(true);

    //         const filteredResults = data.filter(item =>
    //             item.name.toLowerCase().includes(searchTerm.toLowerCase())
    //         );

    //         setResults(filteredResults);
    //         setLoading(false);
    //         setNoResults(filteredResults.length === 0);
    //     } else {
    //         setResults([]);
    //         setNoResults(false);
    //     }
    // };



    useEffect(() => {
        // Check if there is a valid selected item and if it has a show property
        if (selectedItem >= 0 && results[selectedItem] && results[selectedItem].show) {
            // Update the displaySearch state with the name of the selected show
            setDisplaySearch(results[selectedItem].show.name);

            // Scroll the selected item into view smoothly
            if (resultsRef.current[selectedItem]) {
                resultsRef.current[selectedItem].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [selectedItem, results]);


    const highlightText = (text, searchTerm) => {
        // If there's no search term, return the text as is
        if (!searchTerm) return text;

        // Split the text into parts, separating the search term
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));

        // Map over the parts to highlight the search term
        return parts.map((part, index) =>
            part.toLowerCase() === searchTerm.toLowerCase() ? (
                // If the part matches the search term, make it bold
                <strong key={index} style={{ fontWeight: 'bold' }}>{part}</strong>
            ) : (
                // Otherwise, just return the part as normal text
                <span key={index}>{part}</span>
            )
        );
    };
    return (
        <section className='search_section'>
            <div className="search_input_div">
                <input
                    type="text"
                    className="search_input"
                    placeholder='What are you looking for?'
                    autoComplete='off'
                    onChange={handleChange}
                    value={displaySearch}
                    onKeyDown={handleKeyDown}
                />
                <div className="search_icon">
                    {search === "" ? <SearchIcon /> : <CloseIcon onClick={handleClose} />}
                </div>
            </div>
            <div className="search_result">
                {loading && <div className="loading"><CircularProgress /></div>}
                {!loading && noResults && <div className="no_results">No results found</div>}

                {results.map((result, index) => (
                    result && result.show && (
                        <a
                            key={index}
                            href={result.show.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={selectedItem === index ? 'search_suggestion_line active' : 'search_suggestion_line'}
                            ref={el => resultsRef.current[index] = el}
                        >
                            {highlightText(result.show.name, search)}
                        </a>
                    )
                ))}

                {/* Getting data from data.json file */}
                {/* {results.map((result, index) => (
                    <div
                        key={index}
                        className={selectedItem === index ? 'search_suggestion_line active' : 'search_suggestion_line'}
                        ref={el => resultsRef.current[index] = el}
                    >
                        {highlightText(result.name, search)}
                    </div>
                ))} */}

            </div>
        </section>
    );
}

export default SearchBar;

