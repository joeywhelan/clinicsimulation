SELECT cc.code AS code, cc.display AS name, COUNT(*) AS cnt
FROM `<your project>.<your BQ>.MedicationRequest`
,UNNEST( medication.codeableConcept.coding ) cc
GROUP BY code, name
ORDER BY cnt DESC
LIMIT 10
