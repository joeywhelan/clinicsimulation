WITH patient AS (
SELECT DATE_DIFF(CURRENT_DATE(), CAST(birthDate AS DATE), YEAR) as age
FROM `<your project>.<your BQ>.Patient`
)
SELECT
CASE
  WHEN patient.age BETWEEN 0 AND 10 THEN '0-10'
  WHEN patient.age BETWEEN 11 AND 20 THEN '11-20'
  WHEN patient.age BETWEEN 21 AND 30 THEN '21-30'
  WHEN patient.age BETWEEN 31 AND 40 THEN '31-40'
  WHEN patient.age BETWEEN 41 AND 50 THEN '41-50'
  WHEN patient.age BETWEEN 51 AND 60 THEN '51-60'
  WHEN patient.age BETWEEN 61 AND 70 THEN '61-70'
  WHEN patient.age BETWEEN 71 AND 80 THEN '71-80'
  WHEN patient.age BETWEEN 81 AND 90 THEN '81-90'
  WHEN patient.age BETWEEN 91 and 100 THEN '91-100'
  ELSE 'Over 100'
END AS ageBucket, 
COUNT(*) AS cnt
FROM patient
GROUP BY ageBucket
