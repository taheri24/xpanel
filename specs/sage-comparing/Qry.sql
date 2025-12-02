--SELECT top 5 satici_unvan,satici_vergiNo,COUNT(*)CNT   FROM [TR-EDOCS].[dbo].[PUR_INVH] WHERE irsaliyeBilgisi_irsaliyeNo <>''
--GROUP BY satici_unvan,satici_vergiNo
--ORDER BY 3 DESC 

-- Invoices
SELECT  satici_vergiNo,faturaNo,faturaTarihi,faturaTuru,faturaTipi,paraBirimi,toplamMalHizmetMiktari Toplam,odenecekTutar-toplamMalHizmetMiktari vergi,odenecekTutar 
FROM [TR-EDOCS].[dbo].[PUR_INVH]
 
--SAGE 
SELECT  PTHNUM_0,BPSNDE_0,RCPDAT_0   
FROM [TR-EDOCS].[dbo].[sagedbLIVEPRECEIPT] WHERE  BPSNDE_0=:invoiceNo;
-- LINES 
SELECT   ITMREF_0 collate Latin1_General_BIN ITMREF_0 ,ITMDES_0 collate Latin1_General_BIN ITMDES_0 ,QTYSTU_0   ,'Recipt_Sage' loc  
FROM [TR-EDOCS].[dbo].[sagedbLIVEPRECEIPTD] 
WHERE PTHNUM_0 = (SELECT PTHNUM_0   FROM [TR-EDOCS].[dbo].[sagedbLIVEPRECEIPT] WHERE BPSNDE_0=:invoiceNo)
UNION ALL 
SELECT   saticiUrunKodu,urunAdi,miktar,Recived_Invoice_Portal   
FROM [TR-EDOCS].[dbo].[PUR_INVD] 
WHERE belgeno=:invoiceNo
order by 3,4
