import { useSearchParams, useNavigate } from "react-router-dom";
import SearchResults from "../components/searchResults";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <SearchResults 
      searchQuery={query} 
      onClose={handleClose}
    />
  );
};

export default Search;
