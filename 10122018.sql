CREATE DATABASE PERMEMDB_1_4;
USE PERMEMDB_1_4;


--## table source ##
CREATE TABLE IF NOT EXISTS SOURCE( 
source_id INT NOT NULL,
source_type VARCHAR(100) NOT NULL, 
PRIMARY KEY(source_id) );

--## table organism ##
CREATE TABLE IF NOT EXISTS ORGANISM( 
organism_id INT NOT NULL, 
name TEXT NOT NULL,
ncbi_tax_id INT NOT NULL UNIQUE, 
PRIMARY KEY(organism_id));

--## table dblinks ##
CREATE TABLE IF NOT EXISTS DBLINKS( 
datab_id INT NOT NULL,
abbreviation VARCHAR(100) NOT NULL UNIQUE,
weblink VARCHAR(500) NOT NULL, 
PRIMARY KEY(datab_id));
		
--## table protein ##
CREATE TABLE IF NOT EXISTS PROTEIN(
    protein_id INT NOT NULL,
	ac VARCHAR(20) NOT NULL UNIQUE,
	organism_id INT NOT NULL,
	protein_names TEXT NOT NULL,
	sequence LONGTEXT NOT NULL,
    seq_length INT NOT NULL,
	fragment VARCHAR(20),
    genename TEXT,
	function LONGTEXT,
	status VARCHAR(20) NOT NULL,
	tissue_specificity LONGTEXT,
    subcellular_location LONGTEXT,
	source_id INT NOT NULL,
    ref_id INT NOT NULL,
	FOREIGN KEY(organism_id) REFERENCES ORGANISM(organism_id),
	FOREIGN KEY(source_id) REFERENCES SOURCE(source_id),
    FOREIGN KEY(ref_id)  REFERENCES DBLINKS(datab_id),
    PRIMARY KEY(protein_id)) ;

--## table interaction_partner ##
CREATE TABLE IF NOT EXISTS INTERACTOR( 
int_id INT NOT NULL,
protein_id INT NOT NULL, 
interactor_id VARCHAR(20) NOT NULL,
ref_id INT NOT NULL,
PRIMARY KEY(int_id), 
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id), 
FOREIGN KEY(ref_id)  REFERENCES DBLINKS(datab_id));

--## table references ##
CREATE TABLE IF NOT EXISTS REFERENCEST( 
pr_ref_id INT NOT NULL,
protein_id INT NOT NULL, 
datab_id VARCHAR(100) NOT NULL,
ref_id INT NOT NULL,
PRIMARY KEY(pr_ref_id), 
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id),
FOREIGN KEY(ref_id) REFERENCES DBLINKS(datab_id)) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci; 


--kafe tetradio lush!!! --> ac UNIQUE
--## table source ##
CREATE TABLE IF NOT EXISTS RAFTPROT( 
raftprot_id INT NOT NULL,
uni_ac VARCHAR(20) NOT NULL,
confidence INT NOT NULL,
PRIMARY KEY(raftprot_id),
FOREIGN KEY(uni_ac) REFERENCES PROTEIN(ac));


--## table compartments ##
CREATE TABLE IF NOT EXISTS COMPARTMENTS( 
compartments_id INT NOT NULL,
uni_ac VARCHAR(20) NOT NULL,
weblink VARCHAR(1000) NOT NULL, 
PRIMARY KEY(compartments_id),
FOREIGN KEY(uni_ac) REFERENCES PROTEIN(ac));

--## table source ##
CREATE TABLE IF NOT EXISTS TM_TO_TMINT( 
tmint_id INT NOT NULL,
uniprot_ac VARCHAR(20) NOT NULL,
tm_interactor_ac VARCHAR(20) NOT NULL,
PRIMARY KEY(tmint_id),
FOREIGN KEY(uniprot_ac) REFERENCES PROTEIN(ac));

--## table source ##
CREATE TABLE IF NOT EXISTS MBPPRED_MAP( 
mbppred_map INT NOT NULL,
protein_id INT NOT NULL,
domain VARCHAR(20) NOT NULL,
domain_start INT NOT NULL,
domain_end INT NOT NULL,
domain_score FLOAT,
PRIMARY KEY(mbppred_map),
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id));

--## table pfam ##
--FIRST ALTER TABLE REFERENCEST ENGINE=InnoDB DEFAULT CHARACTER SET = utf8;
--SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE IF NOT EXISTS PFAM( 
pfam_id INT NOT NULL,
pfam_ac VARCHAR(100) NOT NULL UNIQUE,
pfam_desc VARCHAR(1000) NOT NULL, 
PRIMARY KEY(pfam_id)) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS REACTOME( 
id INT NOT NULL,
reactome_id VARCHAR(100) NOT NULL,
pathway_description LONGTEXT,
organism VARCHAR(1000) NOT NULL, 
PRIMARY KEY(id));


CREATE TABLE IF NOT EXISTS SUBLOCS(
subloc_id VARCHAR(20) NOT NULL,
description LONGTEXT,
category VARCHAR(1000) NOT NULL,
alias VARCHAR(100) NOT NULL, 
PRIMARY KEY(subloc_id));

CREATE TABLE IF NOT EXISTS PROTEIN_TO_SUBLOC(
prsbl_id INT NOT NULL,
protein_id INT NOT NULL,
subloc_id VARCHAR(20) NOT NULL,
PRIMARY KEY(prsbl_id),
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id),
FOREIGN KEY(subloc_id) REFERENCES SUBLOCS(subloc_id));

--## table references ##
CREATE TABLE IF NOT EXISTS PFAM_REFERENCES( 
pr_ref_id INT NOT NULL,
protein_id INT NOT NULL, 
datab_id VARCHAR(100) NOT NULL,
ref_id INT NOT NULL,
PRIMARY KEY(pr_ref_id), 
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id),
FOREIGN KEY(ref_id) REFERENCES DBLINKS(datab_id)) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci; 

--## table references ##
CREATE TABLE IF NOT EXISTS REACTOME_REFERENCES( 
pr_ref_id INT NOT NULL,
protein_id INT NOT NULL, 
datab_id VARCHAR(100) NOT NULL,
ref_id INT NOT NULL,
PRIMARY KEY(pr_ref_id), 
FOREIGN KEY(protein_id) REFERENCES PROTEIN(protein_id),
FOREIGN KEY(ref_id) REFERENCES DBLINKS(datab_id)) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci; 

--## Delete Data from Tables ##
--DELETE FROM MBPPRED_MAP;
--DELETE FROM TM_TO_TMINT;
--DELETE FROM RAFTPROT;
--DELETE FROM COMPARTMENTS;
--DELETE FROM REFERENCEST;
--DELETE FROM INTERACTOR;
--DELETE FROM PROTEIN;
--DELETE FROM DBLINKS;
--DELETE FROM SOURCE;
--DELETE FROM ORGANISM;
COUNT(PROTEIN.protein_id) AS PR_COUNT 
PFAM.pfam_ac AS pfam_ac, PFAM.pfam_desc AS pfam_desc

SELECT PFAM.pfam_ac, COUNT(DISTINCT PROTEIN.protein_id)
FROM PFAM
LEFT JOIN REFERENCEST ON REFERENCEST.datab_id = PFAM.pfam_ac
LEFT JOIN PROTEIN ON PROTEIN.protein_id = REFERENCEST.protein_id
GROUP BY PFAM.pfam_ac;

SELECT PFAM.pfam_ac, COUNT(DISTINCT REFERENCEST.protein_id)
FROM PFAM
LEFT JOIN REFERENCEST ON REFERENCEST.datab_id = PFAM.pfam_ac
WHERE PFAM.pfam_ac = "PF00373"
GROUP BY PFAM.pfam_ac;

