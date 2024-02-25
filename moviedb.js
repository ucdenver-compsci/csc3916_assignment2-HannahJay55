/**
 * Created by shawnmccarthy on 1/22/17.
 */
'use strict;';
//Include crypto to generate the movie id
var crypto = require('crypto');
module.exports = function () {
    return {
        movieList: [],
        /*
         * Save the user inside the "db".
         */
        save: function (movie) {
            movie.id = crypto.randomBytes(20).toString('hex'); // fast enough for our purpose
            this.movieList.push(movie);
            return movie;
        },
        /*
         * Retrieve a movie with a given id or return all the movies if the id is undefined.
         */
        find: function (id) {
            if (id) {
                return this.movieList.find(function (element) {
                    return element.id === id;
                });
            }
            else {
                return this.movieList;
            }
        },
        findOne: function (title) {
            if (title) {
                return this.movieList.find(function (element) {
                    return element.title === title;
                });
            }
            else {
                return this.movieList;
            }
        },
        /*
         * Delete a movie with the given id.
         */
        remove: function (id) {
            var found = 0;
            this.movieList = this.movieList.filter(function (element) {
                if (element.id === id) {
                    found = 1;
                }
                else {
                    return element.id !== id;
                }
            });
            return found;
        },
        /*
         * Update a movie with the given id
         */
        update: function (id, movie) {
            var movieIndex = this.movieList.findIndex(function (element) {
                return element.id === id;
            });
            if (movieIndex !== -1) {
                this.movieList[movieIndex].title = movie.title;
                this.movieList[movieIndex].director = movie.director;
                this.movieList[movieIndex].runtime = movie.runtime;
                return 1;
            }
            else {
                return 0;
            }
        }
    };
};