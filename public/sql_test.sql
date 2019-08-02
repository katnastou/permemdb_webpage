SELECT  PROTEIN.protein_id AS protein_id, PROTEIN.protein_names AS protein_names,
        PROTEIN.ac AS ac, PROTEIN.status AS status, 
        PROTEIN.sequence AS sequence, PROTEIN.seq_length AS seq_length, PROTEIN.fragment AS fragment, 
        PROTEIN.function AS function, PROTEIN.tissue_specificity AS tissue_specificity, 
        PROTEIN.subcellular_location AS subcellular_location, PROTEIN.gene_ontology AS gene_ontology, 
        ORGANISM.ncbi_tax_id AS ncbi_tax_id,
        SOURCE.source_type as source_type, 
        REFERENCEST.datab_id AS datab_id, 
        DBLINKS.weblink AS weblink, DBLINKS.abbreviation AS abbreviation
FROM PROTEIN
    LEFT JOIN ORGANISM 
        ON PROTEIN.organism_id=ORGANISM.organism_id
    LEFT JOIN SOURCE 
        ON PROTEIN.source_id=SOURCE.source_id
    LEFT JOIN REFERENCEST 
        ON PROTEIN.protein_id=REFERENCEST.protein_id
    LEFT JOIN DBLINKS 
        ON REFERENCEST.ref_id=DBLINKS.datab_id
WHERE PROTEIN.protein_id = 1;

--returns 7 rows in set
SELECT  PROTEIN.protein_id AS protein_id,
        REFERENCEST.datab_id AS datab_id, 
        DBLINKS.weblink AS weblink, DBLINKS.abbreviation AS abbreviation
FROM PROTEIN
    LEFT JOIN REFERENCEST 
        ON PROTEIN.protein_id=REFERENCEST.protein_id
    LEFT JOIN DBLINKS 
        ON REFERENCEST.ref_id=DBLINKS.datab_id
WHERE PROTEIN.protein_id = 1;

--returns 1 row in set
SELECT  PROTEIN.protein_id AS protein_id, PROTEIN.protein_names AS protein_names,
        PROTEIN.ac AS ac, PROTEIN.status AS status, 
        PROTEIN.sequence AS sequence, PROTEIN.seq_length AS seq_length, PROTEIN.fragment AS fragment, 
        PROTEIN.function AS function, PROTEIN.tissue_specificity AS tissue_specificity, 
        PROTEIN.subcellular_location AS subcellular_location, PROTEIN.gene_ontology AS gene_ontology, 
        ORGANISM.ncbi_tax_id AS ncbi_tax_id,
        SOURCE.source_type as source_type
FROM PROTEIN
    LEFT JOIN ORGANISM 
        ON PROTEIN.organism_id=ORGANISM.organism_id
    LEFT JOIN SOURCE 
        ON PROTEIN.source_id=SOURCE.source_id
WHERE PROTEIN.protein_id = 1;
