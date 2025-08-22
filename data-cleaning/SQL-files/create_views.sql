CREATE VIEW industry_housing_view AS 
SELECT c.county_name, iw.year, i.industry_name, iw.workers_per_mil, h.housing_cost
FROM industry_workers iw
JOIN county c ON iw.county_id = c.county_id
JOIN industry i ON iw.industry_id = i.industry_id
JOIN housing h ON iw.county_id = h.county_id AND iw.year = h.year;


CREATE VIEW housing_view AS 
SELECT c.county_name, h.housing_cost, h.year
FROM housing h
JOIN county c ON h.county_id = c.county_id;


CREATE VIEW industry_workers_view AS
SELECT c.county_name, i.industry_name, iw.year, iw.workers_per_mil
FROM industry_workers iw
JOIN county c ON iw.county_id = c.county_id
JOIN industry i ON iw.industry_id = i.industry_id;
