const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "1234567890";
const VOWELS_LOWER = "aeiou";
const VOWELS_UPPER = "AEIOU";

/**
 * Each function below may have a few small bugs...
 * 
 * 
 * This function inverts the case of each letter in the given String.
 * For example, "Computer" becomes "cOMPUTER".
 */
function invertCase(text) {
  let tempString = '';
  for(let i = 0; i < text.length; i++){
    let char = text[i];
    if (LOWER_CASE.indexOf(char) != -1) {
      let upper = UPPER_CASE[LOWER_CASE.indexOf(char)];
      tempString += upper;
    }
    else if (UPPER_CASE.indexOf(char) != -1) {
      let lower = LOWER_CASE[UPPER_CASE.indexOf(char)];
      tempString += lower;
    }
    else {
      tempString += char;
    }
  }
  return tempString;;
}

/**
 * This function checks whether the given String is a palindrome
 * (reads the same forwards and backwards), ignoring case,
 * spaces, and punctuation.
 * For example, "racecar" is a palindrome.
 */
function isPalindrome(text) {
  let cleanedString = '';
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (LOWER_CASE.indexOf(char) != -1) {
      cleanedString += char;
    }
    else if (UPPER_CASE.indexOf(char) != -1) {
      let lower = LOWER_CASE[ UPPER_CASE.indexOf(char) ];
      cleanedString += lower;
    } 
    else if (DIGITS.indexOf(char) != -1) {
      cleanedString += char;
    }
    //otherwise it's punctuation/space, skip it
  }

  let reversedString = '';
  for (let i = cleanedString.length-1; i >= 0; i--) {
    reversedString += cleanedString[i];
  }

  if (cleanedString === reversedString) {
    return true;
  }
  else {
    return false;
  }
}

/**
 * This function counts the number of vowels (a, e, i, o, u)
 * in the given String, case-insensitive.
 * For example, "Computer" has 3 vowels.
 */
function countVowels(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (VOWELS_UPPER.indexOf(char) != -1) {
      count += 1;
    }
    else if (VOWELS_LOWER.indexOf(char) != -1) {
      count += 1;
    }
  }
  return count;
}

/**
 * This function capitalizes the first letter of the given String
 * and converts all other letters to lowercase.
 * For example, "comPutER" becomes "Computer".
 */
function capitalize(text) {
  if (text.length === 0) {
    return text;
  }

  let tempString = '';
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (i === 0) {
      //first letter: make it uppercase
      if (LOWER_CASE.indexOf(char) != -1) {
        let upper = UPPER_CASE[ LOWER_CASE.indexOf(char)];
        tempString += upper;
      }
      else {
        tempString += char;
      }
    }
    else {
      //every other letter: make it lowercase
      if (UPPER_CASE.indexOf(char) != -1) {
        let lower = LOWER_CASE[ UPPER_CASE.indexOf(char)];
        tempString += lower;
      }
      else {
        tempString += char;
      }
    }
  }
  return tempString;
}

//Make functions available to tester.
//This syntax will not work in the browser
exports.invertCase = invertCase;
exports.isPalindrome = isPalindrome;
exports.countVowels = countVowels;
exports.capitalize = capitalize;