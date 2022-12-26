import "./LoadingIndicator.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";





export function LoadingIndicator() {
    return (
        <div className="LoadingIndicator">
            <FontAwesomeIcon icon={faSolid.faSpinner} spin={true} />
        </div>
    );
}
