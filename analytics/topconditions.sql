SELECT cc.code AS code, cc.display as name, COUNT(*) as cnt
FROM `<your project>.<your bq>.Condition` 
,UNNEST(code.coding) cc
GROUP BY code, name
ORDER BY cnt DESC
LIMIT 10
