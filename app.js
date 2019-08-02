// npm install packagename --save
var express = require("express");
var mysql = require("mysql");
var bodyParser  = require("body-parser");
var app = express();
var crypto = require("crypto");
var fs = require('fs');
var math = require('mathjs');
const { exec } = require('child_process');
var blast = require('blastjs');
//var cytoscape = require('cytoscape');
//var browserify = require('browserify');
//var sifjs = require('sif.js');
var nodemailer =require("nodemailer");
var js2xmlparser =require ("js2xmlparser");



//ON cloud 9 check on every restart
//mysql-ctl start
//export PATH=$PATH:$HOME/workspace/blast/bin
//echo $PATH


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

var connection = mysql.createConnection({
    host : "localhost",
    user : "", //fromfile
    database : "PERMEMDB_1_4",
    password: ""  //fromfile
    //multipleStatements: true
});

app.get("/", function(req, res){
        res.redirect("/permemdb");
    });

app.get("/permemdb", function(req, res){
    var q = "SELECT count(*) AS sel FROM PROTEIN";
    connection.query(q, function(err, results){
        if(err) throw err;
        var sel = results[0].sel; 
		var q2 ="SELECT COUNT(DISTINCT organism_id) AS sel2 FROM PROTEIN";
        //var q2 = "SELECT count(*) AS sel2 FROM ORGANISM";
        connection.query(q2, function(err, results){
            if(err) throw err;
            var sel2 = results[0].sel2; 
            res.render("index", {count: sel, organisms:sel2});
        });
    });
});



app.get("/permemdb/blast", function(req, res){
    res.render("blast");
});


//NEXT CREATE BLAST DATABASE
//!!!Run once on every update of the database 
// var type = 'prot'; //prot
// var fileIn = './blast/permemdb.fasta';
// var outPath = './blast';
// var name = 'permemdb';
// blast.makeDB(type, fileIn, outPath, name, function(err){
//   if(err){
//     console.error(err);   
//   } else {
//     console.log('database created at', outPath);
//   }
// });

app.post("/permemdb/blast", function(req, res){
    var id = crypto.randomBytes(16).toString("hex");
    var textareaData = req.body.fasta;

    var path = "blastresults/"+id+".fasta";
    //var dbPath = './example';
    var dbPath = "./blast/permemdb";   //<---Upload that!!!!
    var query = textareaData;

    var outputBlast = "";
    fs.open(path, 'w', function(err, fd) { //write file with data from textarea
        if (err) throw 'error opening file: ' + err;
        fs.writeFile(fd, textareaData, function(err) {
            if(err) console.log(err);
            exec("grep -c '^>' "+path, (error, stdout, stderr) => { //count how many fasta are in the input
              if (error) {
                //console.error(`exec error: ${error}`);
                var errormsg= "You did not submit any FASTA sequences. Please resubmit with sequences in fasta format";
                res.render("error", {errormsg:errormsg});
              }
              var count = `${stdout}`; 
              if(math.floor(count) > 0 && math.floor(count) < 10){
                  blast.blastP(dbPath, query, function (err, output) {
                  if(!err){
                    outputBlast = output;
                    res.render("blastres",{outputBlast:outputBlast});
                   }
                });
  
              }
              else {
                errormsg= "You submitted more than 10 sequences. For large scale queries please contact us.";
                res.render("error", {errormsg:errormsg});
              }
            });
            fs.close(fd, function() {
                console.log('file written');
            });
        });
    });
        
});


app.get("/permemdb/manual", function(req, res){
    //var q = "SELECT PROTEIN.ac AS ac, RAFTPROT.confidence AS confidence "+
     //       "FROM PROTEIN "+
      //      "LEFT JOIN RAFTPROT ON PROTEIN.ac = RAFTPROT.uni_ac "+
       //     "WHERE ac='fdhfhdh'" ;
       //     connection.query(q, function(err, results){
       // if(err) throw err;
      //  console.log(results);
      //   res.render("manual", {results:results});
   // });
        res.render("manual");
});

app.get("/permemdb/contact", function(req, res){
    res.render("contact", {msg:"Send an email regarding the annotation of data in the database"});
});

app.post("/permemdb/send", function(req,res){
    //console.log(req.body);
    var output =`
    <p>You have a new Contact request</p>
    <h3>Contact Details</h3>
    <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;
    
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        //https://community.nodemailer.com/using-gmail/
        //Enable less secure apps - https://www.google.com/settings/security/lesssecureapps
        //Disable Captcha temporarily so you can connect the new device/server - https://accounts.google.com/b/0/displayunlockcaptcha
        service: 'gmail',
        auth: {
            user: '', // generated ethereal user //fromfile
            pass: ''  // generated ethereal password //fromfile
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Nodemailer Contact" <nastoudatabases@gmail.com>', // sender address
        to: '', // list of receivers
        subject: 'PerMemDB request', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
    res.render('contact',{msg:"Your e-mail has been sent"});
});


app.get("/permemdb/download", function(req, res){
	var q1 = "SELECT ORGANISM.name AS org_name, ORGANISM.ncbi_tax_id AS ncbi_tax_id "+
    "FROM ORGANISM ";
    connection.query(q1, function(err, results1){
        if(err) throw err;
        //console.log(results);
		var q2 = "SELECT SUBLOCS.subloc_id AS subloc_id, SUBLOCS.alias AS alias FROM SUBLOCS";
		connection.query(q2, function(err, results2){
			res.render("download", {results1:results1, results2:results2});
		});
    });
    //res.attachment('permemdb.fasta');
    //res.render("download");
});

//browse by organism
app.get("/permemdb/browse", function(req, res){
    var q = "SELECT PROTEIN.organism_id AS prorg_id, ORGANISM.name AS org_name, ORGANISM.ncbi_tax_id AS ncbi_tax_id, "+
    "COUNT(ORGANISM.organism_id) AS org_count "+
    "FROM PROTEIN "+ 
    "LEFT JOIN ORGANISM ON ORGANISM.organism_id = PROTEIN.organism_id "+
    "GROUP BY PROTEIN.organism_id";
	//add second query for subloc
    connection.query(q, function(err, results){
        if(err) throw err;
        //console.log(results);
         res.render("browse", {results:results});
    });
});

app.post("/permemdb/browse", function(req, res){
    var q1 =  req.body.selectpicker2;
        var q = "SELECT PROTEIN.protein_id AS protein_id, ORGANISM.name AS name, PROTEIN.genename AS genename, ORGANISM.ncbi_tax_id AS ncbi_tax_id, PROTEIN.protein_names AS protein_names, "+
        "PROTEIN.ac AS ac, PROTEIN.status AS status, PROTEIN.source_id AS source_id, SOURCE.source_type as source_type "+
        "FROM PROTEIN "+
        "LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
        "LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
        "WHERE ORGANISM.organism_id = " + q1;
        connection.query(q, function(err,  results){
            if(err) throw err;
            //console.log(results);
            //res.render("browse", {results:results});
                res.render("results", {results:results});
        }); 
    //res.redirect("results");
});
//browse by pfam domain
app.get("/permemdb/browse_pfam", function(req, res){
    var q = "SELECT PFAM.pfam_ac AS pfam_ac, PFAM.pfam_desc AS pfam_desc FROM PFAM";
    connection.query(q, function(err, results){
        if(err) throw err;
        //console.log(results);
         res.render("browse_pfam", {results:results});
    });
});

app.post("/permemdb/browse_pfam", function(req, res){
    var q1 =  req.body.selectpicker1;
        var q = "SELECT PROTEIN.protein_id AS protein_id, ORGANISM.name AS name, PROTEIN.genename AS genename, ORGANISM.ncbi_tax_id AS ncbi_tax_id, PROTEIN.protein_names AS protein_names, "+
				"PROTEIN.ac AS ac, PROTEIN.status AS status, PROTEIN.source_id AS source_id, SOURCE.source_type as source_type, PFAM.pfam_ac as pfam_ac "+
				"FROM PROTEIN "+
				"LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
				"LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
				"LEFT JOIN PFAM_REFERENCES ON PROTEIN.protein_id=PFAM_REFERENCES.protein_id "+
				"LEFT JOIN PFAM ON PFAM.pfam_ac=PFAM_REFERENCES.datab_id "+
				"WHERE PFAM.pfam_ac = '" + q1 + "'";
        connection.query(q, function(err,  results){
            if(err) throw err;
            //console.log(results);
            //res.render("browse", {results:results});
                res.render("results_pfam", {results:results});
        }); 
    //res.redirect("results");
});

//browse by reactome pathway
app.get("/permemdb/browse_path", function(req, res){
    var q = "SELECT REACTOME.reactome_id AS reactome_id, REACTOME.pathway_description AS pathway_description FROM REACTOME";
    connection.query(q, function(err, results){
        if(err) throw err;
        //console.log(results);
         res.render("browse_path", {results:results});
    });
});

app.post("/permemdb/browse_path", function(req, res){
    var q1 =  req.body.selectpicker1;
        var q = "SELECT PROTEIN.protein_id AS protein_id, ORGANISM.name AS name, PROTEIN.genename AS genename, ORGANISM.ncbi_tax_id AS ncbi_tax_id, PROTEIN.protein_names AS protein_names, "+
				"PROTEIN.ac AS ac, PROTEIN.status AS status, PROTEIN.source_id AS source_id, SOURCE.source_type as source_type, REACTOME.reactome_id AS reactome_id "+
				"FROM PROTEIN "+
				"LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
				"LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
				"LEFT JOIN REACTOME_REFERENCES ON PROTEIN.protein_id=REACTOME_REFERENCES.protein_id "+
				"LEFT JOIN REACTOME ON REACTOME.reactome_id=REACTOME_REFERENCES.datab_id "+
				"WHERE REACTOME.reactome_id = '" + q1 + "'";
        connection.query(q, function(err,  results){
            if(err) throw err;
            //console.log(results);
            //res.render("browse", {results:results});
                res.render("results_path", {results:results});
        }); 
    //res.redirect("results");
});

//browse by subcellular location
app.get("/permemdb/browse_subloc", function(req, res){
    var q = "SELECT SUBLOCS.subloc_id AS subloc_id, SUBLOCS.alias AS alias FROM SUBLOCS";
    connection.query(q, function(err, results){
        if(err) throw err;
        //console.log(results);
         res.render("browse_subloc", {results:results});
    });
});

app.post("/permemdb/browse_subloc", function(req, res){
    var q1 =  req.body.selectpicker1;
        var q = "SELECT PROTEIN.protein_id AS protein_id, ORGANISM.name AS name, PROTEIN.genename AS genename, ORGANISM.ncbi_tax_id AS ncbi_tax_id, PROTEIN.protein_names AS protein_names, "+
				"PROTEIN.ac AS ac, PROTEIN.status AS status, PROTEIN.source_id AS source_id, SOURCE.source_type as source_type, SUBLOCS.alias AS subloc "+
				"FROM PROTEIN "+
				"LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
				"LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
				"LEFT JOIN PROTEIN_TO_SUBLOC ON PROTEIN.protein_id=PROTEIN_TO_SUBLOC.protein_id "+
				"LEFT JOIN SUBLOCS ON SUBLOCS.subloc_id=PROTEIN_TO_SUBLOC.subloc_id "+
				"WHERE SUBLOCS.subloc_id = '" + q1 + "'";
        connection.query(q, function(err,  results){
            if(err) throw err;
            //console.log(results);
            //res.render("browse", {results:results});
                res.render("results_subloc", {results:results});
        }); 
    //res.redirect("results");
});

app.get("/permemdb/search", function(req, res){
	var q1 = "SELECT ORGANISM.name AS org_name, ORGANISM.ncbi_tax_id AS ncbi_tax_id "+
    "FROM ORGANISM ";
    //"LEFT JOIN ORGANISM ON ORGANISM.organism_id = PROTEIN.organism_id ";
	//kanto opws sto show, me nested queries pou 8a kaneis render me diafora
	//"LEFT JOIN PROTEIN_TO_SUBLOC ON PROTEIN.protein_id=PROTEIN_TO_SUBLOC.protein_id "+
	//"LEFT JOIN SUBLOCS ON SUBLOCS.subloc_id=PROTEIN_TO_SUBLOC.subloc_id "+
	//"LEFT JOIN REACTOME_REFERENCES ON PROTEIN.protein_id=REACTOME_REFERENCES.protein_id "+
	//"LEFT JOIN REACTOME ON REACTOME.reactome_id=REACTOME_REFERENCES.datab_id "+
	//"LEFT JOIN PFAM_REFERENCES ON PROTEIN.protein_id=PFAM_REFERENCES.protein_id "+
	//"LEFT JOIN PFAM ON PFAM.pfam_ac=PFAM_REFERENCES.datab_id ;";
	//var prorg_id = "";
	//var org_name = "";
	//var ncbi_tax_id = "";
	//var subloc_id = "";
	//var alias = "";
	//var reactome_id = "";
	//var pathway_description = "";
	//var pfam_ac = "";
	//var pfam_desc = "";
	//console.log(q);
    connection.query(q1, function(err, results1){
        if(err) throw err;
		//prorg_id = results[0].prorg_id;
		//org_name = results[0].org_name;
		//ncbi_tax_id = results[0].ncbi_tax_id;
        //console.log(results);
		var q2 = "SELECT SUBLOCS.subloc_id AS subloc_id, SUBLOCS.alias AS alias FROM SUBLOCS";
		connection.query(q2, function(err, results2){
			if(err) throw err;
			//subloc_id = results[0].subloc_id;
			//alias = results[0].alias;
			
			var q3 = "SELECT REACTOME.reactome_id AS reactome_id, REACTOME.pathway_description AS pathway_description FROM REACTOME";
			connection.query(q3, function(err, results3){
				if(err) throw err;
				//reactome_id = results[0].reactome_id;
				//pathway_description = results[0].pathway_description;
				
				var q4 = "SELECT PFAM.pfam_ac AS pfam_ac, PFAM.pfam_desc AS pfam_desc FROM PFAM";
				connection.query(q4, function(err, results4){
					if(err) throw err;
					//pfam_ac = results[0].pfam_ac;
					//pfam_desc = results[0].pfam_desc;
					res.render("search", {
											//prorg_id:prorg_id,
											//org_name:org_name,
											//ncbi_tax_id:ncbi_tax_id,
											//subloc_id:subloc_id,
											//alias:alias,
											//reactome_id:reactome_id,
											//pathway_description:pathway_description,
											//pfam_ac:pfam_ac,
											//pfam_desc:pfam_desc,
											results1:results1,
											results2:results2,
											results3:results3,
											results4:results4
											
					});
				});
			});
		});
    });
});

app.post("/permemdb/search", function(req, res){
    var q1 = req.body.name;
    var q2 = req.body.organism;
    var q3 = req.body.gene;
    var q4 = req.body.ac;
    var q5 = Boolean(req.body.reviewed);
    var q6 = Boolean(req.body.unreviewed);
    var q7 = Boolean(req.body.peripheral);
    var q8 = Boolean(req.body.mbppred);
    var q9 = Boolean(req.body.tmint);
    var q10 = req.body.combine;
	var q11 = req.body.pfam;
	var q12 = req.body.pathway;
	var q13 = req.body.subloc;
	var q14 = Boolean(req.body.structure);
    //console.log(q10+" "+q11);
    //console.log(q1+" "+q2+" "+q3+" "+q4+" "+q5+" "+q6+" "+q7+" "+q8+" "+q9);
	//console.log(q11+" "+q12+" "+q13+" "+q14+" ");
	//console.log("hi, this is" + q2);
    if(q1!="" || q2!="" || q3!="" || q4!="" || q5==true || q6==true || q7==true || q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
        var q = "SELECT PROTEIN.protein_id AS protein_id, ORGANISM.name AS name, PROTEIN.genename AS genename, ORGANISM.ncbi_tax_id AS ncbi_tax_id, PROTEIN.protein_names AS protein_names, "+
        "PROTEIN.ac AS ac, PROTEIN.status AS status, PROTEIN.source_id AS source_id, SOURCE.source_type as source_type "+
        "FROM PROTEIN "+
        "LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
        "LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
		"LEFT JOIN PFAM_REFERENCES ON PROTEIN.protein_id=PFAM_REFERENCES.protein_id "+
		"LEFT JOIN PFAM ON PFAM.pfam_ac=PFAM_REFERENCES.datab_id "+
		"LEFT JOIN REACTOME_REFERENCES ON PROTEIN.protein_id=REACTOME_REFERENCES.protein_id "+
		"LEFT JOIN REACTOME ON REACTOME.reactome_id=REACTOME_REFERENCES.datab_id "+
		"LEFT JOIN PROTEIN_TO_SUBLOC ON PROTEIN.protein_id=PROTEIN_TO_SUBLOC.protein_id "+
		"LEFT JOIN SUBLOCS ON SUBLOCS.subloc_id=PROTEIN_TO_SUBLOC.subloc_id "+
		"LEFT JOIN REFERENCEST ON PROTEIN.protein_id=REFERENCEST.protein_id "+
        "WHERE ";
        var stror= " OR ";
        var strand = " AND ";
        if(q1!=""){
            q1 = q1.replace(/'/g, "''");
            var str1="(protein_names LIKE '%"+ q1 +"%') ";
            q=q.concat(str1);
            if(q2!="" || q3!="" || q4!="" || q5==true || q6==true || q7==true || q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q2!=""){
            q2 = q2.replace(/'/g, "''");
            var str2="(ncbi_tax_id = '"+ q2 +"') ";
            q=q.concat(str2);
            if(q3!="" || q4!="" || q5==true || q6==true || q7==true || q8==true || q9==true  || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q3!=""){
            q3 = q3.replace(/'/g, "''");
            var str3="(genename LIKE '%"+ q3 +"%') ";
            q=q.concat(str3);
            if(q4!="" || q5==true || q6==true || q7==true || q8==true || q9==true  || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q4!=""){
			q4 = q4.replace(/'/g, "''");
            var str4="(ac LIKE '%"+ q4 +"%') ";
            q=q.concat(str4);
            if(q5==true || q6==true || q7==true || q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q5==true){
            var str5="(status = 'reviewed' ) ";
            q=q.concat(str5);
            if(q6==true || q7==true || q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q6==true){
            var str6="(status = 'unreviewed' ) ";
            q=q.concat(str6);
            if(q7==true || q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q7==true){
            var str7="(PROTEIN.source_id = 1 OR PROTEIN.source_id = 4 OR PROTEIN.source_id = 5 OR PROTEIN.source_id = 7) ";
            q=q.concat(str7);
            if(q8==true || q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q8==true){
            var str8="(PROTEIN.source_id = 2 OR PROTEIN.source_id = 4 OR PROTEIN.source_id = 6 OR PROTEIN.source_id = 7) ";
            q=q.concat(str8);
            if(q9==true || q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
        if(q9==true){
            var str9="(PROTEIN.source_id = 3 OR PROTEIN.source_id = 5 OR PROTEIN.source_id = 6 OR PROTEIN.source_id = 7) ";
            q=q.concat(str9);
			if(q11!="" || q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
		if(q11!=""){
            q11 = q11.replace(/'/g, "''");
            var str11="(PFAM.pfam_ac = '"+ q11 +"') ";
            q=q.concat(str11);
            if(q12!=""|| q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
		if(q12!=""){
            q12 = q12.replace(/'/g, "''");
            var str12="(REACTOME.reactome_id = '"+ q12 +"') ";
            q=q.concat(str12);
            if(q13!="" || q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }
		if(q13!=""){
            q13 = q13.replace(/'/g, "''");
            var str13="(SUBLOCS.subloc_id ='"+ q13 + "') ";
            q=q.concat(str13);
            if(q14==true){
                if (q10=="or") {q=q.concat(stror);}
                if (q10=="and") {q=q.concat(strand);}
            }
        }			
        if(q14==true){
            var str14="(REFERENCEST.ref_id=9) ";
            q=q.concat(str14);
        }		
		q=q.concat(" GROUP BY PROTEIN.protein_id ;");
		console.log(q);
        connection.query(q, function(err,  results){
            if(err) throw err;
            //console.log(results);
            //res.render("browse", {results:results});
            if(results=="") {
                var errormsg= "No results match your query. Please try again!";
                res.render("alert", {errormsg:errormsg});
            } else {
                res.render("results", {results:results});
            }
        }); 
    }
    else{
        var errormsg= "You did not fill any of the requested fields. Please try again!";
        res.render("error", {errormsg:errormsg});
    } 
    //res.redirect("results");
});

app.get("/permemdb/results", function(req, res){
    //res.render("this is the results page");
    res.render("results");
    //res.render("browse", {results:results});
});

app.get("/permemdb/:id", function(req,res){
//    //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
////!!Create a javascript object 
//     var obj = {
//         protein_id: String,
//         genename: String,
//         protein_names: String,
//         ncbi_tax_id: String,
//         organism_name: String,
//         ac: String,
//         status: String,
//         sequence: String,
//         seq_length: String,
//         fragment: String,
//         pr_function: String,
//         tissue_specificity: String,
//         subcellular_location: String,
//         source_type: String,
//         confidence: String,
//     	 crossreferences:[],
//     	 MBDs:[],
//     	 tminteractors:[]
//     };
//     var textfile = "";
//    //var siffile ="";
//    //!!--End of Code Snippet--!!//    
    //req.body.cy = {};
    //var sel = req.params.id;
      var q1 =  "SELECT PROTEIN.protein_id AS protein_id, PROTEIN.genename AS genename, PROTEIN.protein_names AS protein_names, "+
                "ORGANISM.ncbi_tax_id AS ncbi_tax_id, ORGANISM.name AS name, "+
                "PROTEIN.ac AS ac, PROTEIN.status AS status, "+
                "PROTEIN.sequence AS sequence, PROTEIN.seq_length AS seq_length, PROTEIN.fragment AS fragment, "+
                "PROTEIN.function AS function, PROTEIN.tissue_specificity AS tissue_specificity, "+
                "PROTEIN.subcellular_location AS subcellular_location, "+
                "SOURCE.source_type as source_type "+
                //"REFERENCEST.datab_id AS datab_id, DBLINKS.weblink AS weblink, DBLINKS.abbreviation AS abbreviation "+
                "FROM PROTEIN "+ 
                "LEFT JOIN ORGANISM ON PROTEIN.organism_id=ORGANISM.organism_id "+
                "LEFT JOIN SOURCE ON PROTEIN.source_id=SOURCE.source_id "+
                //"LEFT JOIN REFERENCEST ON PROTEIN.protein_id=REFERENCEST.protein_id "+
                //"LEFT JOIN DBLINKS ON REFERENCEST.ref_id=DBLINKS.datab_id "+
                "WHERE PROTEIN.protein_id = ? ";
                //http://raftprot.org/uniprot/# + protein_details.confidence
            var protein_id = "";
            var genename = "";
            var protein_names = "";
            var ncbi_tax_id = "";
            var name = "";
            var ac = "";
            var status = "";
            var sequence = "";
            var seq_length = "";
            var fragment = "";
            var pr_function = "";
            var tissue_specificity = "";
            var subcellular_location = "";
            var source_type = "";
            var confidence = "";
			var compartmentlink="";
            var domains = [];
            var domain_starts = [];
            var domain_ends = [];
            var domain_scores = [];
            var acs = [];
            var datab_id = [];
            var weblink = [];
            var abbreviation = [];
            var targets = [];
            var sources = [];
            var intTypes = [];
            var node_ids = [];
            var tm_interactor_acs = [];
         connection.query(q1, req.params.id, function(err, results, fields){
            if(err) throw err;
            protein_id = results[0].protein_id;
            genename = results[0].genename;
            protein_names = results[0].protein_names;
            ncbi_tax_id = results[0].ncbi_tax_id;
            name = results[0].name;
            ac = results[0].ac;
            status = results[0].status;
            sequence = results[0].sequence;
            seq_length = results[0].seq_length;
            fragment = results[0].fragment;
            pr_function = results[0].function;
            tissue_specificity = results[0].tissue_specificity;
            subcellular_location = results[0].subcellular_location;
            source_type = results[0].source_type;
             //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
             
            //obj.protein_id = protein_id;
            //if(genename!=""){
            //obj.genename = genename;
            //} else {
            //obj.genename = "No information available";
            //}
            //obj.protein_names = protein_names;
            //obj.ncbi_tax_id = ncbi_tax_id;
            //obj.organism_name = name;
            //obj.ac = ac;
            //obj.status = status;
            //obj.sequence = sequence;
            //obj.seq_length = seq_length;
            //if(fragment!=""){
            //obj.fragment = fragment;
            //} else {
            //obj.fragment = "No";
            //}
            //if(pr_function!=""){
            //obj.pr_function = pr_function;
            //} else {
            //obj.pr_function = "No information available";
            //}
            //if(tissue_specificity!=""){
            //obj.tissue_specificity = tissue_specificity;
            //} else {
            //obj.tissue_specificity = "No information available";
            //}
            //if(subcellular_location!=""){
            //obj.subcellular_location = subcellular_location;
            //} else {
            //obj.subcellular_location = "No information available";
            //}
            //obj.source_type = source_type;
            //textfile = textfile.concat("ID: "+protein_id+"\r\n"+"Protein Names: "+ protein_names+"\r\n"+"NCBI Taxonomy ID: "+ncbi_tax_id+"\r\n");
            //if(genename!=""){
            //    textfile = textfile.concat("Gene Name: "+genename+"\r\n");
            //} else {
            //    textfile = textfile.concat("Gene Name: No information available\r\n");
            //}
            //textfile = textfile.concat("Organism name: "+name+"\r\n"+"UniProt AC: "+ ac+"\r\n"+"Status: "+ status+"\r\n"+"Sequence: "+ sequence+"\r\n");
            //textfile = textfile.concat("Length: "+seq_length+"\r\n");
            //if(fragment!=""){
            //   textfile = textfile.concat("Fragment: "+fragment+"\r\n");
            //} else {
            //   textfile = textfile.concat("Fragment: No\r\n");
            //}
            //if(pr_function!=""){
            //   textfile = textfile.concat(pr_function+"\r\n");
            //} else {
            //   textfile = textfile.concat("Function: No information available\r\n");
            //}
            //if(tissue_specificity!=""){
            //   textfile = textfile.concat(tissue_specificity+"\r\n");
            //} else {
            //   textfile = textfile.concat("Tissue Specificity: No information available\r\n");
            //}
            //if(subcellular_location!=""){
            //   textfile = textfile.concat(subcellular_location+"\r\n");
            //} else {
            //   textfile = textfile.concat("Subcellular Location: No information available\r\n");
            //}
            //textfile = textfile.concat("Source Type: "+ source_type+"\r\n"+"Cross References:\r\n");
            ///!!--End of Code Snippet--!!//
            
            
            var q2 =    "SELECT PROTEIN.protein_id AS protein_id, PROTEIN.ac AS ac, "+
                        "REFERENCEST.datab_id AS datab_id, DBLINKS.weblink AS weblink, DBLINKS.abbreviation AS abbreviation "+
                        "FROM PROTEIN "+ 
                        "LEFT JOIN REFERENCEST ON PROTEIN.protein_id=REFERENCEST.protein_id "+
                        "LEFT JOIN DBLINKS ON REFERENCEST.ref_id=DBLINKS.datab_id "+
                        "WHERE PROTEIN.protein_id = ? ";
                        
            var nodes = {}, links = {};
            var _getNode = function(id){
                if(!nodes[id]) nodes[id] = {id:id};
                return nodes[id];
            };
            
            var _parse = function(line, i){
                line = (line.split('\t').length > 1) ? line.split('\t') : line.split(' ');
                if(line.length < 3){
                    console.warn('SIFJS cannot parse line ' + i + ' "' + line + '"');
                    return;
                }
                
            var source = _getNode(line[0]), intType = line[1], j, length;
                for (j = 2, length = line.length; j < length; j++) {
                    var target = _getNode(line[j]);
                    if(source < target){
                        links[source.id + target.id + intType] = {target: target.id, source: source.id, intType: intType};
                    } else {
                        links[target.id + source.id + intType] = {target: target.id, source: source.id, intType: intType};
                    }
                }        
            };
            
            var _toArr = function(obj){
                var arr = [];
                for (var key in obj) arr.push(obj[key]);
                return arr;
            };  
               
            function SIFJS() {};
                                
            SIFJS.parse = function(data){
                
                var lines = data.split('\n'), i, length;
                for (i = 0, length = lines.length; i < length; i++) _parse(lines[i], i);
                
                return {nodes:_toArr(nodes), links:_toArr(links)};
            };
            
             var input = ac; //create a file for each ac
            var data = "";
            
            var path2 = './dbdata/sif_files/'+input+'.sif'; //check if that works, of not change to public folder
            if (fs.existsSync(path2)) {
                data = fs.readFileSync(path2, 'utf8');
            
                var interactions = {};
                interactions = SIFJS.parse(data);
                var nodes2 = interactions.nodes;
                var edges = interactions.links;
            } else{
                //console.log ("no sif file for you");
                nodes2 = [];
                edges = [];
            }
                connection.query(q2, req.params.id, function(err, results, fields){
                    if(err) throw err;
                    for(var i in results){
                        acs[i]=results[i].ac;
                        datab_id[i]=results[i].datab_id;
                        weblink[i]=results[i].weblink;
                        abbreviation[i]=results[i].abbreviation;
                        ////!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                        // if(datab_id[i]!=null){
                        // obj.crossreferences.push({
                        //                     		database: abbreviation[i],
                        //                     		link:  weblink[i]+datab_id[i]
                        //                  	
                        //                     	});
                        // textfile = textfile.concat("\t"+weblink[i]+datab_id[i]+"\r\n"); //abbreviation[i]+ ": "+
                        // }
                        // else{
                        //     obj.crossreferences.push({
                        //         link:"No information available"
                        //     });
                        //    textfile = textfile.concat("\tNo information available\r\n");
                        // }
                        ////!!--End of Code Snippet--!!//
                    }
                    if (fs.existsSync(path2)) {
                        for(var k=0; k<nodes2.length; k++){
                            node_ids.push(nodes2[k].id);
                            //console.log(node_ids); 
                        }
                        targets = [];
                        sources = [];
                        intTypes = [];
                        for(var j=0; j<edges.length; j++){
                            targets.push(edges[j].target);
                            sources.push(edges[j].source);
                            intTypes.push(edges[j].intType);
                        }
                    //edges=[];
                       // console.log(acs+" "+datab_id +" " +weblink+" "+abbreviation);
                       //console.log(weblink.length);
                    //res.render("show", {weblink: weblink});
                    }
                    else{
                        node_ids =[];
                        //console.log(node_ids); 
                        targets =[];
                        sources =[];
                        intTypes =[];
                    }
                    var q3 = "SELECT PROTEIN.ac AS ac, RAFTPROT.confidence AS confidence "+
                             "FROM PROTEIN "+
                             "LEFT JOIN RAFTPROT ON PROTEIN.ac = RAFTPROT.uni_ac "+
                             "WHERE ac= ? ";
                             connection.query(q3, ac, function(err, results){
                                if(err) throw err;
                                confidence=results[0].confidence;
                                ////!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                //if(confidence!=null){
                                //    obj.confidence=confidence;
                                //    textfile = textfile.concat("RaftProt Confidence: "+confidence+"\r\n");
                                //} else {
                                //    obj.confidence="No information available";
                                //    textfile = textfile.concat("RaftProt Confidence: No information available\r\n");
                                //}

                                        //!!--End of Code Snippet--!!//
                                //console.log(confidence);
                                var q4 =    "SELECT PROTEIN.protein_id AS protein_id,  MBPPRED_MAP.domain AS domain,  "+
                                            "MBPPRED_MAP.domain_start AS domain_start, MBPPRED_MAP.domain_end AS domain_end, MBPPRED_MAP.domain_score AS domain_score "+
                                        	"FROM PROTEIN "+
                                        	"LEFT JOIN MBPPRED_MAP ON MBPPRED_MAP.protein_id = PROTEIN.protein_id "+
                                        	"WHERE PROTEIN.protein_id = ? ";
                                connection.query(q4, req.params.id, function(err, results, fields){
                                    if(err) throw err;
                                    //textfile = textfile.concat("MBPpred info: \r\n");
                                    for(var i in results){
                                    domains[i]=results[i].domain;
                                    domain_starts[i]=results[i].domain_start;
                                    domain_ends[i]=results[i].domain_end;
                                    domain_scores[i]=results[i].domain_score;
                                    ////!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                    // if (source_type=="MBPpred" || source_type=="UniProtKB_MBPpred" || source_type=="MBPpred_TMint" || source_type=="UniProtKB_MBPpred_TMint"){
                                    //     obj.MBDs.push({
                                    //                         		domain: domains[i]+": "+domain_starts[i]+"-"+domain_ends[i],
                                    //                         		score:domain_scores[i]
                                    //                      	
                                    //                         	});
                                    //     textfile = textfile.concat("\t"+domains[i]+": "+domain_starts[i]+"-"+domain_ends[i]+" (score: "+domain_scores[i]+")\r\n"); //abbreviation[i]+ ": "+
                                    // }
                                    // else{
                                    //    obj.MBDs.push({
                                    //        domain:"No information available"
                                    //                         	});
                                    //     textfile = textfile.concat("\tNo information available\r\n"); //abbreviation[i]+ ": "+
                                    // 
                                    // }
                                  //textfile = textfile.concat("\r\n");

                                   // //!!--End of Code Snippet--!!//
                                }
                                        var q5 =    "SELECT PROTEIN.ac AS ac,  TM_TO_TMINT.tm_interactor_ac AS tm_interactor_ac "+
                                                	"FROM PROTEIN "+
                                                	"LEFT JOIN TM_TO_TMINT ON TM_TO_TMINT.uniprot_ac = PROTEIN.ac "+
                                                	"WHERE PROTEIN.ac= ? ";
                                        connection.query(q5, ac, function(err, results, fields){
                                            if(err) throw err;
                                            //textfile = textfile.concat("Transmembrane Interactor(s): \r\n");
                                            for(var i in results){
                                             tm_interactor_acs[i]=results[i].tm_interactor_ac;

                                            ////!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                            //  if (source_type=="TM_interactors" || source_type=="UniProtKB_TMint" || source_type=="MBPpred_TMint" || source_type=="UniProtKB_MBPpred_TMint"){
                                            //      obj.tminteractors.push({
                                            //                          		UniProt_AC:  tm_interactor_acs[i]
                                            //
                                            //                      	
                                            //                          	});
                                            //      textfile = textfile.concat("\t"+tm_interactor_acs[i]+"\r\n"); 
                                            //  }
                                            //  else{
                                            //    obj.tminteractors.push({
                                            //        transmembrane_interactors:"No information available"
                                            //                         	});
                                            //     textfile = textfile.concat("\tNo information available\r\n"); //abbreviation[i]+ ": "+
                                            // 
                                            // }
                                            ////!!--End of Code Snippet--!!//
                                        }
										    var q6 = "SELECT PROTEIN.ac AS ac, COMPARTMENTS.weblink AS compartmentlink "+
												 "FROM PROTEIN "+
												 "LEFT JOIN COMPARTMENTS ON PROTEIN.ac = COMPARTMENTS.uni_ac "+
												 "WHERE ac= ? ";
												 connection.query(q6, ac, function(err, results){
													if(err) throw err;
													compartmentlink=results[0].compartmentlink;
													////!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
													//if(compartmentlink!=null){
													//	obj.compartmentlink=compartmentlink;
													//	textfile = textfile.concat("COMPARTMENTS: "+compartmentlink+"\r\n");
													//} else {
													//	obj.compartmentlink="No information available";
													//	textfile = textfile.concat("COMPARTMENTS: No information available\r\n");
													//}
												 //textfile = textfile.concat("//\r\n"); //!!--Run Code Snippet
														res.render("show", {//protein variables from q1
																			protein_id: protein_id, 
																			genename:genename,
																			protein_names:protein_names,
																			ncbi_tax_id:ncbi_tax_id,
																			name:name,
																			status:status,
																			sequence:sequence,
																			seq_length:seq_length,
																			fragment:fragment,
																			pr_function:pr_function,
																			tissue_specificity:tissue_specificity,
																			subcellular_location:subcellular_location,
																			source_type:source_type,
																			ac:ac, 
																			
																			//raftprot confidence
																			confidence:confidence,
																			
																			//sources variables from q2
																			weblink: weblink,
																			abbreviation:abbreviation,
																			datab_id:datab_id,
																			
																			//network variables from sif files
																			node_ids:node_ids, 
																			targets:targets, 
																			sources:sources, 
																			intTypes:intTypes,
																			
																			//domains from q4
																			domains:domains,
																			domain_starts:domain_starts,
																			domain_ends:domain_ends,
																			domain_scores:domain_scores,
																			
																			//tmints from q5
																			tm_interactor_acs:tm_interactor_acs,
																			
																			//compartmentlink
																			compartmentlink:compartmentlink
																		});
														///!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
														///!!Convert it from an object to string with stringify
														//var json = JSON.stringify(obj,null,4);
														//
														///!! use fs to write the file to disk
														//fs.writeFile("./assets/"+protein_id+'.json', json, 'utf8', function(err2){
														//		 if(err2) throw err2;
														//	 });     
														////fs.writeFile(protein_id+'.sif', siffile, 'utf8', function(err2){
														// //        if(err2) throw err2;
														// //    });
														///!!to create the amyco.txt with files in correct order
														///!! cat $(find ./ -name "*.txt" | sort -V) > amyco.txt 
														//fs.writeFile("./assets/"+protein_id+'.txt', textfile, 'utf8', function(err2){
														//		 if(err2) throw err2;
														//	 }); 
														////!!to create the amyco.json cat *.json > amyco.json && replace  }{ with },\n{
														////!!and add [ at the start of file and ] at EOF
														/// var xml = js2xmlparser.parse("protein", obj);
														//
														/// fs.writeFile("./assets/"+protein_id+'.xml', xml, 'utf8', function(err2){
														///		 if(err2) throw err2;
														////!!to create the amyco.xml cat *.xml > amyco.xml && replace  <?xml version='1.0'?> with ''
														////!!and add <root> at start and  </root> end of file
														////!!--End of Code Snippet--!!//
														//	});
											}); //q6
                                        }); //q5
                                    }); //q4
                        }); //q3
                });  //q2
        }); //q1
}); //app.get



//app.listen(process.env.PORT, process.env.IP, function(){
 //   console.log("Server has Started");
//});

//connection.end();


//Code for okeanos!!!
 app.listen(8088, function(){
     console.log("Server running on 8088!");
 });
