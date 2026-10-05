'use strict';

//import the functions to test!
const convert = require('./app');

// describe allows us to group several tests together
describe("Test the functions in the app file", function () {

    it("should return a string of the correct length", function () {
        expect(convert.invertCase('a').length).toEqual(1);
    });

    /* TODO place your "it" tests below */

    it("should change letter cases", function () {
        expect(convert.invertCase("Computer")).toEqual("cOMPUTER");
    });

    it("should check if a string is a palindrome", function () {
        expect(convert.isPalindrome("racecar")).toEqual(true);
    });

    it("should check a palindrome with spaces", function () {
        expect(convert.isPalindrome("A man, a plan, a canal, Panama!")).toEqual(true);
    });

    it("should check a non-palindrome", function () {
        expect(convert.isPalindrome("hello")).toEqual(false);
    });

    it("should count vowels", function () {
        expect(convert.countVowels("Computer")).toEqual(3);
    });

    it("should capitalize a word", function () {
        expect(convert.capitalize("comPutER")).toEqual("Computer");
    });

    it("should keep numbers and symbols", function () {
        expect(convert.invertCase("Hi 2!")).toEqual("hI 2!");
    });

    it("should count upper and lowercase vowels", function () {
        expect(convert.countVowels("AEIOUaeiou")).toEqual(10);
    });

    it("should check an empty string", function () {
        expect(convert.capitalize("")).toEqual("");
    });

});