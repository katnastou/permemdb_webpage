var mysql = require("mysql");
var js2xmlparser =require ("js2xmlparser");
var fs = require('fs');
//var system = require('system');
//var args = system.args;
    var connection = mysql.createConnection({
        host : "localhost",
        user : "", //fromfile
        database : "PERMEMDB_1_4",
        password: "" //fromfile
    });
//!!!!!!!!!!!!!
//TEMPORARY FIX
//!!!!!!!!!!!!!!!!
//HAVE TO FIND A WAY TO DO BETTER MEMORY USE, THIS MAKES NO SENSE
// for all except the last one
// the urls to navigate to 231770
//var starts =[1,2000,4000,6000,8000,10000,12000,14000,16000,18000,20000,22000,24000,26000,28000,30000];
//var starts =[32000,34000,36000,38000,40000,42000,44000,46000,48000,50000,52000,54000,56000,58000,60000];
//var starts =[62000,64000,66000,68000,70000,72000,74000,76000,78000,80000,82000,84000,86000,88000,90000];
//var starts =[92000,94000,96000,98000,100000,102000,104000,106000,108000,110000,112000,114000,116000,118000,120000];
//var starts =[122000,124000,126000,128000,130000,132000,134000,136000,138000,140000,142000,144000,146000,148000,150000];
//var starts =[152000,154000,156000,158000,160000,162000,164000,166000,168000,170000];
//var starts =[172000,174000,176000,178000,180000,182000,184000,186000,188000,190000,192000,194000];
//var starts =[196000,198000,200000,202000,204000,206000,208000,210000,212000,214000,216000,218000,220000];
//var starts =[222000,224000,226000,228000]; //231770

function create_files(start){
    var suffixes =[];
    //var end=start+1999; 
    var end=Number(231770); //--> for the last one
     for(var j=start;j<=end;j++){
         suffixes.push(j);
     }   
    // console.log(suffixes);
suffixes.forEach(function(id) {

    //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
    //!!Create a javascript object 
     var obj = {
         protein_id: String,
         genename: String,
         protein_names: String,
         ncbi_tax_id: String,
         organism_name: String,
         ac: String,
         status: String,
         sequence: String,
         seq_length: String,
         fragment: String,
         pr_function: String,
         tissue_specificity: String,
         subcellular_location: String,
         source_type: String,
         confidence: String,
		 compartmentlink: String,
     	 crossreferences:[],
     	 MBDs:[],
     	 tminteractors:[]
     };
     var textfile = "";
    //var siffile ="";
    //!!--End of Code Snippet--!!//    
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
			var compartmentlink = "";
            var domains = [];
            var domain_starts = [];
            var domain_ends = [];
            var domain_scores = [];
            var acs = [];
            var datab_id = [];
            var weblink = [];
            var abbreviation = [];
            var tm_interactor_acs = [];
         connection.query(q1, id, function(err, results, fields){
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
             
             obj.protein_id = protein_id;
             if(genename!=""){
             obj.genename = genename;
             } else {
             obj.genename = "No information available";
             }
             obj.protein_names = protein_names;
             obj.ncbi_tax_id = ncbi_tax_id;
             obj.organism_name = name;
             obj.ac = ac;
             obj.status = status;
             obj.sequence = sequence;
             obj.seq_length = seq_length;
             if(fragment!=""){
             obj.fragment = fragment;
             } else {
             obj.fragment = "No";
             }
             if(pr_function!=""){
             obj.pr_function = pr_function;
             } else {
             obj.pr_function = "No information available";
             }
             if(tissue_specificity!=""){
             obj.tissue_specificity = tissue_specificity;
             } else {
             obj.tissue_specificity = "No information available";
             }
             if(subcellular_location!=""){
             obj.subcellular_location = subcellular_location;
             } else {
             obj.subcellular_location = "No information available";
             }
             obj.source_type = source_type;
             textfile = textfile.concat("ID: "+protein_id+"\r\n"+"Protein Names: "+ protein_names+"\r\n"+"NCBI Taxonomy ID: "+ncbi_tax_id+"\r\n");
             if(genename!=""){
                 textfile = textfile.concat("Gene Name: "+genename+"\r\n");
             } else {
                 textfile = textfile.concat("Gene Name: No information available\r\n");
             }
             textfile = textfile.concat("Organism name: "+name+"\r\n"+"UniProt AC: "+ ac+"\r\n"+"Status: "+ status+"\r\n"+"Sequence: "+ sequence+"\r\n");
             textfile = textfile.concat("Length: "+seq_length+"\r\n");
             if(fragment!=""){
                textfile = textfile.concat("Fragment: "+fragment+"\r\n");
             } else {
                textfile = textfile.concat("Fragment: No\r\n");
             }
             if(pr_function!=""){
                textfile = textfile.concat(pr_function+"\r\n");
             } else {
                textfile = textfile.concat("Function: No information available\r\n");
             }
             if(tissue_specificity!=""){
                textfile = textfile.concat(tissue_specificity+"\r\n");
             } else {
                textfile = textfile.concat("Tissue Specificity: No information available\r\n");
             }
             if(subcellular_location!=""){
                textfile = textfile.concat(subcellular_location+"\r\n");
             } else {
                textfile = textfile.concat("Subcellular Location: No information available\r\n");
             }
             textfile = textfile.concat("Source Type: "+ source_type+"\r\n"+"Cross References:\r\n");
            //!!--End of Code Snippet--!!//
            
            
            var q2 =    "SELECT PROTEIN.protein_id AS protein_id, PROTEIN.ac AS ac, "+
                        "REFERENCEST.datab_id AS datab_id, DBLINKS.weblink AS weblink, DBLINKS.abbreviation AS abbreviation "+
                        "FROM PROTEIN "+ 
                        "LEFT JOIN REFERENCEST ON PROTEIN.protein_id=REFERENCEST.protein_id "+
                        "LEFT JOIN DBLINKS ON REFERENCEST.ref_id=DBLINKS.datab_id "+
                        "WHERE PROTEIN.protein_id = ? ";
                        
            
                connection.query(q2, id, function(err, results, fields){
                    if(err) throw err;
                    for(var i in results){
                        acs[i]=results[i].ac;
                        datab_id[i]=results[i].datab_id;
                        weblink[i]=results[i].weblink;
                        abbreviation[i]=results[i].abbreviation;
                        //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                         if(datab_id[i]!=null){
                         obj.crossreferences.push({
                                             		database: abbreviation[i],
                                             		link:  weblink[i]+datab_id[i]
                                          	
                                             	});
                         textfile = textfile.concat("\t"+weblink[i]+datab_id[i]+"\r\n"); //abbreviation[i]+ ": "+
                         }
                         else{
                             obj.crossreferences.push({
                                 link:"No information available"
                             });
                            textfile = textfile.concat("\tNo information available\r\n");
                         }
                        //!!--End of Code Snippet--!!//
                    }
                    
                    var q3 = "SELECT PROTEIN.ac AS ac, RAFTPROT.confidence AS confidence "+
                             "FROM PROTEIN "+
                             "LEFT JOIN RAFTPROT ON PROTEIN.ac = RAFTPROT.uni_ac "+
                             "WHERE ac= ? ";
                             connection.query(q3, ac, function(err, results){
                                if(err) throw err;
                                confidence=results[0].confidence;
                                //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                if(confidence!=null){
                                    obj.confidence=confidence;
                                    textfile = textfile.concat("RaftProt Confidence: "+confidence+"\r\n");
                                } else {
                                    obj.confidence="No information available";
                                    textfile = textfile.concat("RaftProt Confidence: No information available\r\n");
                                }
    
                                        //!!--End of Code Snippet--!!//
                                //console.log(confidence);
                                var q4 =    "SELECT PROTEIN.protein_id AS protein_id,  MBPPRED_MAP.domain AS domain,  "+
                                            "MBPPRED_MAP.domain_start AS domain_start, MBPPRED_MAP.domain_end AS domain_end, MBPPRED_MAP.domain_score AS domain_score "+
                                        	"FROM PROTEIN "+
                                        	"LEFT JOIN MBPPRED_MAP ON MBPPRED_MAP.protein_id = PROTEIN.protein_id "+
                                        	"WHERE PROTEIN.protein_id = ? ";
                                connection.query(q4, id, function(err, results, fields){
                                    if(err) throw err;
                                    textfile = textfile.concat("MBPpred info: \r\n");
                                    for(var i in results){
                                    domains[i]=results[i].domain;
                                    domain_starts[i]=results[i].domain_start;
                                    domain_ends[i]=results[i].domain_end;
                                    domain_scores[i]=results[i].domain_score;
                                    //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                     if (source_type=="MBPpred" || source_type=="UniProtKB_MBPpred" || source_type=="MBPpred_TMint" || source_type=="UniProtKB_MBPpred_TMint"){
                                         obj.MBDs.push({
                                                             		domain: domains[i]+": "+domain_starts[i]+"-"+domain_ends[i],
                                                             		score:domain_scores[i]
                                                          	
                                                             	});
                                         textfile = textfile.concat("\t"+domains[i]+": "+domain_starts[i]+"-"+domain_ends[i]+" (score: "+domain_scores[i]+")\r\n"); //abbreviation[i]+ ": "+
                                     }
                                     else{
                                        obj.MBDs.push({
                                            domain:"No information available"
                                                             	});
                                         textfile = textfile.concat("\tNo information available\r\n"); //abbreviation[i]+ ": "+
                                     
                                     }
                                  //textfile = textfile.concat("\r\n");
    
                                    //!!--End of Code Snippet--!!//
                                }
                                        var q5 =    "SELECT PROTEIN.ac AS ac,  TM_TO_TMINT.tm_interactor_ac AS tm_interactor_ac "+
                                                	"FROM PROTEIN "+
                                                	"LEFT JOIN TM_TO_TMINT ON TM_TO_TMINT.uniprot_ac = PROTEIN.ac "+
                                                	"WHERE PROTEIN.ac= ? ";
                                        connection.query(q5, ac, function(err, results, fields){
                                            if(err) throw err;
                                            textfile = textfile.concat("Transmembrane Interactor(s): \r\n");
                                            for(var i in results){
                                             tm_interactor_acs[i]=results[i].tm_interactor_ac;
    
                                            //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                              if (source_type=="TM_interactors" || source_type=="UniProtKB_TMint" || source_type=="MBPpred_TMint" || source_type=="UniProtKB_MBPpred_TMint"){
                                                  obj.tminteractors.push({
                                                                      		UniProt_AC:  tm_interactor_acs[i]
                                            
                                                                  	
                                                                      	});
                                                  textfile = textfile.concat("\t"+tm_interactor_acs[i]+"\r\n"); 
                                              }
                                              else{
                                                obj.tminteractors.push({
                                                    transmembrane_interactors:"No information available"
                                                                     	});
                                                 textfile = textfile.concat("\tNo information available\r\n"); //abbreviation[i]+ ": "+
                                             
                                             }
                                            //!!--End of Code Snippet--!!//
                                        }
										var q6 = "SELECT PROTEIN.ac AS ac, COMPARTMENTS.weblink AS compartmentlink "+
												 "FROM PROTEIN "+
												 "LEFT JOIN COMPARTMENTS ON PROTEIN.ac = COMPARTMENTS.uni_ac "+
												 "WHERE ac= ? ";
												 connection.query(q6, ac, function(err, results){
													if(err) throw err;
													compartmentlink=results[0].compartmentlink;
													//!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
													if(compartmentlink!=null){
														obj.compartmentlink=compartmentlink;
														textfile = textfile.concat("COMPARTMENTS: "+compartmentlink+"\r\n");
													} else {
														obj.compartmentlink="No information available";
														textfile = textfile.concat("COMPARTMENTS: No information available\r\n");
													}
                                         textfile = textfile.concat("//\r\n"); //!!--Run Code Snippet
                                                
                                                //!!--Run Code Snippet once to create database files for all entries, then conatenate and comment out--!!//
                                                //!!Convert it from an object to string with stringify
                                                 var json = JSON.stringify(obj,null,4);
                                                
                                                //!! use fs to write the file to disk
                                                 fs.writeFile("./public/assets/"+protein_id+'.json', json, 'utf8', function(err2){
                                                         if(err2) throw err2;
                                                     });     
                                                 //fs.writeFile(protein_id+'.sif', siffile, 'utf8', function(err2){
                                                  //        if(err2) throw err2;
                                                  //    });
                                                //!!to create the amyco.txt with files in correct order
                                                //!! cat $(find ./ -name "*.txt" | sort -V) > permemdb.txt
                                                //!! for a in *.txt ; do cat $a >> permemdb.txt ; done
                                                // find ./assets/ -name "permemdb*" -type f -printf "%s\t%p\n"
 
                                                 fs.writeFile("./public/assets/"+protein_id+'.txt', textfile, 'utf8', function(err2){
                                                         if(err2) throw err2;
                                                     }); 
                                                 //!!to create the amyco.json cat *.json > amyco.json && replace  }{ with },\n{
                                                 //!!and add [ at the start of file and ] at EOF
                                                 // for a in *.json ; do cat $a>>permemdb.json2 ; done
                                                 // mv permemdb.json2 permemdb.json
                                                 // sed -i $'s/}{/},\\\n{/g' permemdb.json
                                                 //ex -sc '1i|[' -cx permemdb.json //add before first line
                                                 //sed -i permemdb.json -e  "\$a]" //add after last line
                                                 var xml = js2xmlparser.parse("protein", obj);
                                                
                                                 fs.writeFile("./public/assets/"+protein_id+'.xml', xml, 'utf8', function(err2){
                                                         if(err2) throw err2;
                                                   //for a in *.xml ; do cat $a>>permemdb.xml2 ; done
                                                   // mv permemdb.xml2 permemdb.xml
                                                  //NO //cp 1.xml 1_copy.xml
                                                  //NO //sed -i 's/<?xml version=\'1.0\'?>//' 1_copy.xml
                                                   //sed -i -r 's/<(\?xml version.+?)>//' permemdb.xml     //removes all xml version lines
                                                   
                                                   //sed -i '1d' permemdb.xml //removes first line
                                                   //ex -sc '1i|<root>' -cx permemdb.xml //add before first line
                                                   //sed -i permemdb.xml -e  "\$a</root>" //add after last line
                                                 //!!to create the amyco.xml cat *.xml > amyco.xml && replace  <?xml version='1.0'?> with ''
                                                 //!!and add <root> at start and  </root> end of file
                                                 //!!--End of Code Snippet--!!//
                                                 console.log(id);
                                                    });
												 }); //q6
                                        }); //q5
                                    }); //q4
                        }); //q3
                });  //q2
        }); //q1

});

}

create_files(Number(230000)); //only for the last one
//for all except the last one
//for (var o=0;o<=starts.length;o++){
//	create_files(starts[o]);
//}

