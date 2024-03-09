import { useLocation } from "react-router-dom";
import List from "../List/list";

function Search({ marked }) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    console.log(queryParams);
    return <List marked={marked} word={queryParams.get("word")} />;
}

export default Search;
