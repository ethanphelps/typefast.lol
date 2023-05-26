import React from "react"

/**
 * To change color of svgs with css, find any 'stroke' values in the copied svg and remove it. 
 * Then you can change the stroke with css. Also, you will need to change any svg attributes to
 * camel case.
 */

export const Add = (): React.ReactElement => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 12H1M12 1V23V1Z" stroke="" strokeWidth="1.76" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const Search = (): React.ReactElement => {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.19919 1C7.57754 1 5.99231 1.48087 4.64397 2.38181C3.29562 3.28275 2.24471 4.56329 1.62413 6.06149C1.00355 7.5597 0.841181 9.20828 1.15755 10.7988C1.47392 12.3893 2.25481 13.8502 3.40149 14.9969C4.54817 16.1436 6.00912 16.9245 7.59961 17.2408C9.19009 17.5572 10.8387 17.3948 12.3369 16.7742C13.8351 16.1537 15.1156 15.1028 16.0166 13.7544C16.9175 12.4061 17.3984 10.8208 17.3984 9.19918C17.3982 7.02467 16.5343 4.93925 14.9967 3.40164C13.4591 1.86402 11.3737 1.00014 9.19919 1V1Z" stroke="" strokeWidth="1.67021" strokeMiterlimit="10"/>
    <path d="M15.9076 15.9076L24 24" stroke="" strokeWidth="2.36037" strokeMiterlimit="10" strokeLinecap="round"/>
    </svg>
  )
}