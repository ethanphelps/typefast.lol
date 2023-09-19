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

export const NextExercise = (): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 5L19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const RedoExercise = (): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1 4V10H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8823 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.909 20.7742 14.0064C21.2072 12.1037 21.0101 10.112 20.2126 8.33109C19.4152 6.55024 18.0605 5.07679 16.3528 4.13276C14.6451 3.18873 12.6769 2.82526 10.7447 3.09711C8.81245 3.36896 7.02091 4.26142 5.64 5.63999L1 9.99999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const PracticeMissedSlowWords = (): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const SaveToDifficultExercises = (): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const AddItem = (): React.ReactElement => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}