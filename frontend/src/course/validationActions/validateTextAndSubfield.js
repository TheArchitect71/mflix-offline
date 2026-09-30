import * as types from "../actionTypes.js"
import request from "../request.js"
import { assert, beginTicketValidation } from "./validationHelpers.js"

export function validateTextAndSubfield() {
  return async dispatch => {
    dispatch(beginTicketValidation("TextAndSubfield"))
    try {
      let castSearch = await searchKC()
      let textSearch = await searchSS()
      let genreSearch = await searchTalkshow()
      if ([castSearch, textSearch, genreSearch].every(elem => elem)) {
        return dispatch(validateTextAndSubfieldSuccess())
      }
    } catch (e) {
      return dispatch(validateTextAndSubfieldError(e))
    }
  }
}

export function validateTextAndSubfieldSuccess() {
  return { type: types.VALIDATE_TEXT_AND_SUBFIELD_SUCCESS }
}

export function validateTextAndSubfieldError(error) {
  return { type: types.VALIDATE_TEXT_AND_SUBFIELD_ERROR, error }
}

/**
 * Ticket 3 internal functions
 */

const searchByCast = () => {
  const kevinConnolly = encodeURIComponent("Kevin Connolly")
  return request(`/api/v1/movies/search?cast=${kevinConnolly}`, {
    method: "GET",
    mode: "cors",
  })
    .then(res => res)
    .catch(error => error)
}

const searchByText = () => {
  const shawshank = encodeURI("shawshank")
  return request(`/api/v1/movies/search?text=${shawshank}`, {
    method: "GET",
    mode: "cors",
  })
    .then(res => res)
    .catch(error => error)
}

const searchByGenre = () => {
  const talkshow = encodeURI("Talk-Show")
  return request(`/api/v1/movies/search?genre=${talkshow}`, {
    method: "GET",
    mode: "cors",
  })
    .then(res => res)
    .catch(error => error)
}

const searchKC = async () => {
  try {
    let response = await searchByCast()
    let lengthAssertion = assert(2, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 112368
    let writers = movie.writers.length === 2
    let title = movie.title === "Angus"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error(
        "Did not receive the proper response when searching by cast",
      )
    }
  } catch (e) {
    throw new Error(
      "Did not receive the proper response when searching by cast",
    )
  }
}

const searchSS = async () => {
  try {
    let response = await searchByText()
    let lengthAssertion = assert(2, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 111161
    let writers = movie.writers.length === 2
    let title = movie.title === "The Shawshank Redemption"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error(
        "Did not receive the proper response when searching by text",
      )
    }
  } catch (e) {
    throw new Error(
      "Did not receive the proper response when searching by text",
    )
  }
}

const searchTalkshow = async () => {
  try {
    let response = await searchByGenre()
    console.log(response.movies.length)
    let lengthAssertion = assert(1, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 116835
    let writers = movie.writers.length === 3
    let title = movie.title === "The Late Shift"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error(
        "Did not receive the proper response when searching by genre",
      )
    }
  } catch (e) {
    throw new Error(
      "Did not receive the proper response when searching by genre",
    )
  }
}
