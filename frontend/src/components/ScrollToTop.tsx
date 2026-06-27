import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // Tells us if the user clicked a link or pressed "Back"

  useEffect(() => {
    // "POP" means the user pressed the Back or Forward button on their browser/phone.
    // We ONLY scroll to top if they clicked a brand new link ("PUSH").
    if (navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}