import React, {useEffect, useState} from "react";
import { DynamicParams, RouteContext } from '../context';

interface RouteProps {
  path: string;
  children: React.ReactElement;
}

/**
 * Component for enabling SPA routing
 * @param path a string representing the value of path required to render the children of this component 
 * @param children a ReactElement that is the children of a given instance of Route that will be rendered
 * if path and window.location.pathname match
children * @returns 
 */
const Route = ({path, children}: RouteProps): React.ReactElement | null => {
  // state to track URL to force re-render when it changes
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // listen for route changes
  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener('popstate', onLocationChange)
    // clean up even listener
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    }
  }, [])

  // if url matches path, then render this route
  return matchRoutes({path, children});
}

/** 
 * checks if url matches provided path
 * matches dynamic route params and passes them to the RouteContext if the url matches the full path
*/
const matchRoutes = ({path, children}: RouteProps): React.ReactElement | null => {
  if(path.includes(':')) {
    const routeParts = path.split('/').slice(1);
    const urlParts = window.location.pathname.split('/').slice(1);
    
    if(routeParts.length != urlParts.length) {
      return null;
    } else {
      // check that dynamic route matches
      const dynamicParams: DynamicParams = {}
      for(let i = 0; i < routeParts.length; i++) {
        if(routeParts[i][0] == ":") {
          // collect dynamic parameter values to send to children via RouteContext
          dynamicParams[routeParts[i].slice(1)] = urlParts[i];
          continue; 
        } else if(routeParts[i] != urlParts[i]) {
          return null;
        }
      }
      // url matches route if execution gets here
      return (
        <RouteContext.Provider value={ {params: dynamicParams} }>
          {children}
        </RouteContext.Provider>
      );
    }

  } else {
    return window.location.pathname === path ? children : null;
  }
}

export default Route;