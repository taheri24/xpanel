USE [TR-EDOCS]
GO

/****** Object:  Table [dbo].[PUR_INVH]    Script Date: 11/30/2025 9:45:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PUR_INVH](
	[faturaId] [nchar](150) NOT NULL,
	[faturaNo] [nchar](16) NOT NULL,
	[faturaTarihi] [nchar](50) NULL,
	[faturaZamani] [nchar](20) NULL,
	[faturaTipi] [nchar](20) NULL,
	[faturaTuru] [nchar](20) NULL,
	[siparisBilgisi_siparisNo] [nchar](200) NULL,
	[siparisBilgisi_siparisTarihi] [nchar](50) NULL,
	[irsaliyeBilgisi_irsaliyeNo] [nchar](200) NULL,
	[irsaliyeBilgisi_irsaliyeTarihi] [nchar](200) NULL,
	[sonOdemeTarihi] [nchar](20) NULL,
	[paraBirimi] [nchar](3) NULL,
	[toplamMalHizmetMiktari] [money] NULL,
	[toplamIskontoTutari] [money] NULL,
	[toplamArtirimTutari] [money] NULL,
	[vergiHaricToplam] [money] NULL,
	[vergiDahilTutar] [money] NULL,
	[odenecekTutar] [money] NULL,
	[faturaNot] [nchar](200) NULL,
	[satici_vergiNo] [nchar](11) NULL,
	[satici_vergiDairesi] [nchar](50) NULL,
	[satici_unvan] [nchar](200) NULL,
	[satici_ulke] [nchar](20) NULL,
	[satici_sehir] [nchar](50) NULL,
	[satici_ilce] [nchar](50) NULL,
	[satici_caddeSokak] [nchar](150) NULL,
	[satici_binaAdi] [nchar](50) NULL,
	[satici_binaNo] [nchar](50) NULL,
	[satici_postaKodu] [nchar](50) NULL,
	[satici_tel] [nchar](20) NULL,
	[satici_fax] [nchar](20) NULL,
	[satici_webSitesi] [nchar](50) NULL,
	[satici_eposta] [nchar](50) NULL,
	[vergiler_toplamVergiTutari] [money] NULL
) ON [PRIMARY]
GO


