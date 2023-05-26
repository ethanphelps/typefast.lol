import React, { createContext } from "react";

export type DynamicParams = { [key: string]: string };
interface RouteContextObject {
    params: DynamicParams;
}
// for providing route data such as dynamic parameters to deeply nested child components
export const RouteContext = createContext<RouteContextObject>({
    params: {}
})