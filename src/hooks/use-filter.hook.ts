import {useState} from "react";

export function useFilter() {
    const [filterVisible, setFilterVisible] = useState(false);
    const toggleFilter = () => {
        setFilterVisible(!filterVisible)
        console.log("filterVisible", filterVisible)
    };
    return {
        filterVisible,
        setFilterVisible,
        toggleFilter
    }
}
