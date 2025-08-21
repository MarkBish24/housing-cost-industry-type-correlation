CREATE TABLE county (
	county_id VARCHAR(5) PRIMARY KEY,
	county_name VARCHAR(50) NOT NULL
);

CREATE TABLE industry (
	industry_id VARCHAR(5) PRIMARY KEY,
	industry_name VARCHAR(200) NOT NULL
);

CREATE TABLE housing (
	housing_id VARCHAR(10) PRIMARY KEY,
	county_id VARCHAR(5) REFERENCES county(county_id),
	year INT,
	housing_cost NUMERIC
);

CREATE TABLE industry_workers (
	worker_id VARCHAR(10) PRIMARY KEY,
	county_id VARCHAR(5) REFERENCES county(county_id),
	industry_id VARCHAR(5) REFERENCES industry(industry_id),
	year INT,
	workers_per_mil NUMERIC(10, 0)
)