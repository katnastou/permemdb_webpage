var mysql = require("mysql");

var connection = mysql.createConnection({
    host : "localhost",
    user : "", //fromfile
    password: "",  //fromfile
    database : "PERMEMDB_1_4"
});
/*WARNING!!!*/
// used this only once to load data in the database --> have to use on every update
//load data infile does not work due to security issues --> USE LOAD DATA LOCAL INFILE

var q1 = 'LOAD DATA LOCAL INFILE ? INTO TABLE SOURCE';
var pathToFile1 = "./dbdata/source.tab";
connection.query(q1, pathToFile1, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q2 = 'LOAD DATA LOCAL INFILE ? INTO TABLE DBLINKS';
var pathToFile2 = "./dbdata/dblinks.tab";
connection.query(q2, pathToFile2, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q3 = 'LOAD DATA LOCAL INFILE ? INTO TABLE ORGANISM';
var pathToFile3 = "./dbdata/organisms.tab";
connection.query(q3, pathToFile3, function(error, result){
    if(error) throw error;
    console.log(result);
});


var q4 = 'LOAD DATA LOCAL INFILE ? INTO TABLE PROTEIN';
var pathToFile4 = "./dbdata/new_allindexed.tab";
connection.query(q4, pathToFile4, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q5 = 'LOAD DATA LOCAL INFILE ? INTO TABLE INTERACTOR';
var pathToFile5 = "./dbdata/finalinteractors_indexed.tab";
connection.query(q5, pathToFile5, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q6 = 'LOAD DATA LOCAL INFILE ? INTO TABLE REFERENCEST';
var pathToFile6 = "./dbdata/references_indexed.tab";
connection.query(q6, pathToFile6, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q7 = 'LOAD DATA LOCAL INFILE ? INTO TABLE RAFTPROT';
var pathToFile7 = "./dbdata/raftprot_mysql_table.data";
connection.query(q7, pathToFile7, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q8 = 'LOAD DATA LOCAL INFILE ? INTO TABLE TM_TO_TMINT';
var pathToFile8 = "./dbdata/mapping_tm_to_tmint_indexed.tab";
connection.query(q8, pathToFile8, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q9 = 'LOAD DATA LOCAL INFILE ? INTO TABLE MBPPRED_MAP';
var pathToFile9 = "./dbdata/mappings_all_new_indexed.pertab";
connection.query(q9, pathToFile9, function(error, result){
    if(error) throw error;
    console.log(result);
});


var q10 = 'LOAD DATA LOCAL INFILE ? INTO TABLE COMPARTMENTS';
var pathToFile10 = "./dbdata/compartments.tab";
connection.query(q10, pathToFile10, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q11 = 'LOAD DATA LOCAL INFILE ? INTO TABLE PFAM';
var pathToFile11 = "./dbdata/pfam_id_to_ac.tab";
connection.query(q11, pathToFile11, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q12 = 'LOAD DATA LOCAL INFILE ? INTO TABLE SUBLOCS';
var pathToFile12 = "./dbdata/locations-all.tab";
connection.query(q12, pathToFile12, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q13 = 'LOAD DATA LOCAL INFILE ? INTO TABLE PROTEIN_TO_SUBLOC';
var pathToFile13 = "./dbdata/proteins_to_locations.tab";
connection.query(q13, pathToFile13, function(error, result){
    if(error) throw error;
    console.log(result);
});
*/
var q14 = 'LOAD DATA LOCAL INFILE ? INTO TABLE REACTOME';
var pathToFile14 = "./dbdata/reactome_pathways_in_permemdb.tab";
connection.query(q14, pathToFile14, function(error, result){
    if(error) throw error;
    console.log(result);
});

var q15 = 'LOAD DATA LOCAL INFILE ? INTO TABLE PFAM_REFERENCES';
var pathToFile15 = "./dbdata/pfam_to_proteins_id.tab";
connection.query(q15, pathToFile15, function(error, result){
    if(error) throw error;
    console.log(result);
});
var q16 = 'LOAD DATA LOCAL INFILE ? INTO TABLE REACTOME_REFERENCES';
var pathToFile16 = "./dbdata/reactome_to_proteins_id.tab";
connection.query(q16, pathToFile16, function(error, result){
    if(error) throw error;
    console.log(result);
});

//LOAD DATA LOCAL INFILE "./dbdata/mappings_all_new_indexed.pertab" INTO TABLE MBPPRED_MAP;

connection.end();
