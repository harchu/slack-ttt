/*jslint node: true */

/**
 * @brief This function sets up the mongodb utility object.
 *
 * @return object Mongodb utility object containing the following methods:
 *                - insert
 *                - lookup
 *                - upsert,
 *                - update
 */
function initializeDb() {
    'use strict';

    /**
     * @brief This function inserts the given record using the mongoose
     *        document "save" function.
     *
     * @param record document to be saved
     * @param callback function invoked once "save" operation completes:
     *                 function cb(error)
     *
     * @return none
     */
    function insert(record, callback) {
        record.save(callback);
    }

    /**
     * @brief This function looksup a record using the mongoose "findOne"
     *        query function with the given criteria.
     *
     * @param model model to be searched
     * @param criteria criteria for looking up an object
     * @param callback function invoked once "findOne" operation completes:
     *                 function cb(error, document)
     *
     * @return none
     */
    function lookup(model, criteria, callback) {
        model.findOne(criteria, callback);
    }

    /**
     * @brief This function updated the given record using the mongoose
     *        document "save" function.
     *
     * @param record document to be saved
     * @param callback function invoked once "save" operation completes:
     *                 function cb(error)
     *
     * @return none
     */
    function update(record, callback) {
        record.save(callback);
    }

    return Object.freeze({
        insert,
        lookup,
        update
    });
}

// Call the above function to export the mongodb utility object.
module.exports = initializeDb();