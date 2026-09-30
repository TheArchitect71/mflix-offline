import * as types from "../actionTypes.js"
import {
  searchByQueryAndPage,
  assert,
  beginTicketValidation,
} from "./validationHelpers.js"

export function validatePaging() {
  return async dispatch => {
    dispatch(beginTicketValidation("Paging"))
    try {
      let castPaging0 = await searchByCast()
      let castPaging1 = await searchByCastNextPage()
      let genrePaging0 = await searchByGenre()
      let genrePaging5 = await searchByGenrePage5()
      let textPaging0 = await searchByText()
      let textPaging7 = await searchByTextPage6()
      if (
        [
          castPaging0,
          castPaging1,
          genrePaging0,
          genrePaging5,
          textPaging0,
          textPaging7,
        ].every(elem => elem)
      ) {
        return dispatch(validatePagingSuccess())
      }
    } catch (e) {
      return dispatch(validatePagingError(e))
    }
  }
}

export function validatePagingSuccess() {
  return { type: types.VALIDATE_PAGING_SUCCESS }
}

export function validatePagingError(error) {
  return { type: types.VALIDATE_PAGING_ERROR, error }
}

/**
 * Ticket 6 internal functions
 */

const searchByCast = async () => {
  try {
    let response = await searchByQueryAndPage("cast", "Morgan Freeman", 0)
    let lengthAssertion = assert(20, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 428803
    let writers = movie.writers.length === 4
    let title = movie.title === "March of the Penguins"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error("Did not receive the proper response when paging by cast")
    }
  } catch (e) {
    throw new Error("Did not receive the proper response when paging by cast")
  }
}

const searchByCastNextPage = async () => {
  try {
    let response = await searchByQueryAndPage("cast", "Morgan Freeman", 1)
    let lengthAssertion = assert(20, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 1334555
    let writers = movie.writers.length === 1
    let title = movie.title === "Prom Night in Mississippi"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error("Did not receive the proper response when paging by cast")
    }
  } catch (e) {
    throw new Error("Did not receive the proper response when paging by cast")
  }
}

const searchByGenre = async () => {
  try {
    let response = await searchByQueryAndPage("genre", "Action", 0)
    let lengthAssertion = assert(20, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 416449
    let writers = movie.writers.length === 5
    let title = movie.title.toString() === "300"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error(
        "Did not receive the proper response when paging by genre",
      )
    }
  } catch (e) {
    throw new Error("Did not receive the proper response when paging by genre")
  }
}

const searchByGenrePage5 = async () => {
  try {
    let response = await searchByQueryAndPage("genre", "Action", 5)
    let lengthAssertion = assert(20, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 287978
    let writers = movie.writers.length === 1
    let title = movie.title.toString() === "Daredevil"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error(
        "Did not receive the proper response when paging by genre",
      )
    }
  } catch (e) {
    throw new Error("Did not receive the proper response when paging by genre")
  }
}

const searchByText = async () => {
  try {
    let response = await searchByQueryAndPage("text", "Heist", 0)
    let lengthAssertion = assert(20, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 95861
    let writers = movie.writers.length === 2
    let title = movie.title.toString() === "The Doublecross"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error("Did not receive the proper response when paging by text")
    }
  } catch (e) {
    console.log(e)
    throw new Error("Did not receive the proper response when paging by text")
  }
}

const searchByTextPage6 = async () => {
  try {
    let response = await searchByQueryAndPage("text", "Heist", 5)
    let lengthAssertion = assert(1, response.movies.length)
    let movie = response.movies.pop()
    let imdb = movie.imdb.id === 3139072
    let writers = movie.writers.length === 5
    let title = movie.title.toString() === "Son of Batman"
    if (lengthAssertion && imdb && writers && title) {
      return true
    } else {
      throw new Error("Did not receive the proper response when paging by text")
    }
  } catch (e) {
    throw new Error("Did not receive the proper response when paging by text")
  }
}
